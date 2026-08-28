import {
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import {Link} from 'react-router';
import {support} from '~/lib/store-config';

export function meta() {
  return [
    {title: 'Contact Us | Value Vault'},
    {
      name: 'description',
      content:
        'Contact Value Vault customer support with questions about products, orders, shipping, returns, or anything else we can help with.',
    },
  ];
}

const faqs = [
  {
    question: 'How can I check the status of my order?',
    answer:
      'Once your order ships, you will receive a shipping confirmation email containing your tracking information. You can also visit the Order Look Up page or sign in to your account to view your recent orders.',
  },
  {
    question: 'Can I change or cancel my order?',
    answer:
      'If you need to change or cancel an order, please contact us as soon as possible. We will do our best to help, but orders that have already entered processing or shipped may no longer be eligible for changes.',
  },
  {
    question: 'What if there is a problem with my order?',
    answer:
      'Contact our support team with your order number and a short description of the issue. If an item arrived damaged or incorrect, including photos can help us resolve the issue more quickly.',
  },
  {
    question: 'When will I receive a response?',
    answer:
      'Our customer support team reviews messages as quickly as possible. Response times may vary during weekends, holidays, or periods of unusually high order volume.',
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '');
    const orderNumber = String(form.get('orderNumber') || '');
    const message = String(form.get('message') || '');

    const subject = orderNumber
      ? `Value Vault Support - Order ${orderNumber}`
      : 'Value Vault Support Request';

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      orderNumber ? `Order Number: ${orderNumber}` : '',
      '',
      'Message:',
      message,
    ]
      .filter(Boolean)
      .join('\n');

    window.location.href = `mailto:${support.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setSubmitted(true);
  }

  return (
    <main className="bg-white text-ink">
      <section className="border-b border-line">
        <div className="mx-auto max-w-[820px] px-5 py-16 text-center sm:px-8 sm:py-20">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            We&apos;re here to help
          </p>

          <h1 className="display text-4xl text-ink sm:text-5xl">
            Contact Us
          </h1>

          <p className="mx-auto mt-5 max-w-[570px] text-[15px] leading-7 text-ink-muted sm:text-[16px]">
            Have a question about a product, your order, shipping, or anything
            else? Send us a message and our team will be happy to help.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-14 px-5 py-16 sm:px-8 md:grid-cols-[0.7fr_1.3fr] md:gap-20 md:py-24">
        <aside>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Customer care
          </p>

          <h2 className="mt-4 display text-2xl text-ink sm:text-3xl">
            How can we help?
          </h2>

          <p className="mt-5 max-w-[330px] text-[15px] leading-7 text-ink-muted">
            For the quickest assistance with an existing order, please include
            your order number when contacting us.
          </p>

          <div className="mt-9 border-t border-line pt-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Email
            </p>

            <a
              href={`mailto:${support.email}`}
              className="mt-2 inline-block text-[16px] text-ink underline decoration-line-strong underline-offset-4 transition-opacity hover:opacity-60"
            >
              {support.email}
            </a>
          </div>

          <div className="mt-7 border-t border-line pt-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Order help
            </p>

            <Link
              to="/apps/trackingmore"
              className="mt-2 inline-block text-[15px] text-ink underline decoration-line-strong underline-offset-4 transition-opacity hover:opacity-60"
            >
              Look up your order
            </Link>
          </div>
        </aside>

        <div>
          <form onSubmit={handleSubmit} className="max-w-none">
            <div className="grid gap-7 sm:grid-cols-2">
              <Field label="Name" required>
                <input
                  required
                  type="text"
                  name="name"
                  autoComplete="name"
                  className="w-full appearance-none rounded-none m-0 border-0 border-b border-line-strong bg-transparent px-0 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink"
                  placeholder="Your name"
                />
              </Field>

              <Field label="Email Address" required>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="w-full appearance-none rounded-none m-0 border-0 border-b border-line-strong bg-transparent px-0 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink"
                  placeholder="you@example.com"
                />
              </Field>
            </div>

            <div className="mt-7">
              <Field label="Order Number">
                <input
                  type="text"
                  name="orderNumber"
                  className="w-full appearance-none rounded-none m-0 border-0 border-b border-line-strong bg-transparent px-0 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink"
                  placeholder="Optional"
                />
              </Field>
            </div>

            <div className="mt-7">
              <Field label="Message" required>
                <textarea
                  required
                  name="message"
                  rows={6}
                  className="w-full resize-none appearance-none rounded-none m-0 border-0 border-b border-line-strong bg-transparent px-0 py-3 text-[15px] leading-7 text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink"
                  placeholder="How can we help?"
                />
              </Field>
            </div>

            <button
              type="submit"
              className="mt-8 inline-flex min-h-12 min-w-[160px] items-center justify-center rounded-full bg-ink px-8 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-85"
            >
              Send Message
            </button>

            {submitted && (
              <p className="mt-4 text-[13px] leading-6 text-ink-muted">
                Your email application should now open with your message
                prepared.
              </p>
            )}
          </form>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-[900px] px-5 py-20 sm:px-8 md:py-24">
          <div className="mb-12 text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Quick answers
            </p>

            <h2 className="display text-3xl text-ink sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="border-t border-line">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group border-b border-line"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[15px] font-medium text-ink sm:text-[16px]">
                  <span>{faq.question}</span>

                  <span
                    aria-hidden="true"
                    className="text-xl font-light transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>

                <p className="max-w-[750px] pb-6 pr-10 text-[14px] leading-7 text-ink-muted sm:text-[15px]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/pages/faqs"
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink underline decoration-line-strong underline-offset-4"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-ink">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>

      {children}
    </label>
  );
}