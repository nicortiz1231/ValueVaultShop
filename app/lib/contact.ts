import {store, support} from './store-config';

/**
 * The contact form's shared logic, kept out of the route so the validation
 * that runs on the server is literally the same code the UI reasons about.
 *
 * The reference site's form is Shopify Liquid's built-in `form_type=contact`,
 * which posts to the online store and is delivered by Shopify. A Hydrogen
 * storefront has no equivalent: the Storefront API exposes no contact
 * mutation, and the online store's /contact endpoint rejects a server-side
 * POST (it answers 403 without a first-party browser session), so proxying to
 * it is not an option.
 *
 * So delivery is pluggable instead. Set CONTACT_FORM_ENDPOINT to any URL that
 * accepts a JSON POST -- Shopify Forms' webhook, Formspree, Web3Forms, a
 * Cloudflare Worker of your own -- and submissions are delivered server-side.
 * Until that is set, the form does NOT pretend to have sent anything: it hands
 * the shopper a pre-filled mail-client link instead, so the message still
 * reaches the same inbox and nothing is silently swallowed.
 */

export type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  comment: string;
};

export type ContactFieldError = keyof ContactFormValues;

export type ContactFormErrors = Partial<Record<ContactFieldError, string>>;

/** Matches the reference form: email is the only required field. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Generous, but enough to stop a bot pasting a novel into the inbox. */
const MAX_COMMENT = 5000;

export const CONTACT_HONEYPOT = 'company';

export function readContactForm(formData: FormData): ContactFormValues {
  const read = (key: string) => String(formData.get(key) ?? '').trim();

  return {
    name: read('name'),
    email: read('email'),
    phone: read('phone'),
    comment: read('comment'),
  };
}

export function validateContactForm(
  values: ContactFormValues,
): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.email) {
    errors.email = 'Enter your email so we can reply.';
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'That email address does not look right.';
  }

  if (!values.comment) {
    errors.comment = 'Tell us what you need help with.';
  } else if (values.comment.length > MAX_COMMENT) {
    errors.comment = `Please keep it under ${MAX_COMMENT.toLocaleString()} characters.`;
  }

  return errors;
}

/**
 * A pre-filled mail-client link — the fallback path, and the one that works
 * with no third-party service wired up at all.
 */
export function contactMailtoHref(values: Partial<ContactFormValues> = {}) {
  const body = [
    values.name ? `Name: ${values.name}` : null,
    values.email ? `Email: ${values.email}` : null,
    values.phone ? `Phone: ${values.phone}` : null,
    '',
    values.comment ?? '',
  ]
    .filter((line) => line !== null)
    .join('\n')
    .trim();

  const params = new URLSearchParams({
    subject: `${store.name} enquiry${values.name ? ` from ${values.name}` : ''}`,
  });
  if (body) params.set('body', body);

  return `mailto:${support.email}?${params.toString()}`;
}

export type ContactDelivery = 'sent' | 'unconfigured' | 'failed';

/**
 * Hands the message to whatever service CONTACT_FORM_ENDPOINT points at.
 *
 * Returns `unconfigured` rather than throwing when no endpoint is set, so the
 * route can fall back to the mailto path instead of showing an error for
 * something the shopper did nothing wrong to cause.
 */
export async function deliverContactMessage(
  values: ContactFormValues,
  endpoint: string | undefined,
): Promise<ContactDelivery> {
  if (!endpoint) return 'unconfigured';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Formspree and friends return their JSON API instead of an HTML
        // redirect when this is set.
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.comment,
        // Formspree conventions, harmless anywhere else.
        _replyto: values.email,
        _subject: `${store.name} contact form`,
        source: `https://${store.domain}/pages/contact`,
      }),
    });

    return response.ok ? 'sent' : 'failed';
  } catch (error) {
    console.error('Contact form delivery failed', error);
    return 'failed';
  }
}
