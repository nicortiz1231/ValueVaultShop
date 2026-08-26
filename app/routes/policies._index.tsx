import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/policies._index';
import type {PoliciesQuery, PolicyItemFragment} from 'storefrontapi.generated';
import {Container} from '~/components/ui/Container';
import {ArrowIcon} from '~/components/Icons';
import {store} from '~/lib/store-config';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `Policies | ${store.name}`},
    {
      name: 'description',
      content: `Shipping, refund, privacy and terms for ${store.name}.`,
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <Container width="narrow" className="py-12 sm:py-16">
      <h1 className="display text-3xl text-ink sm:text-4xl">
        Policies
      </h1>
      <p className="mt-3.5 text-base leading-relaxed text-ink-muted">
        The terms we hold ourselves to, in full.
      </p>

      <ul className="mt-8 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        {policies.map((policy) => (
          <li key={policy.id}>
            <Link
              to={`/policies/${policy.handle}`}
              prefetch="intent"
              className="flex items-center justify-between gap-4 px-5 py-4 text-[15px] font-medium text-ink transition-colors hover:bg-surface"
            >
              {policy.title}
              <ArrowIcon className="h-[18px] w-[18px] text-brand" />
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
