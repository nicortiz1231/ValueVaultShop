import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Container} from '~/components/ui/Container';
import {store, support} from '~/lib/store-config';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${data?.page.title ?? ''} | ${store.name}`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <Container width="narrow" className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {page.title}
      </h1>
      <div
        className="rich-text mt-7"
        dangerouslySetInnerHTML={{__html: page.body}}
      />

      {/* Anyone deep enough to read About or Contact is weighing whether to
          trust the shop, so give them a way to reach a person from here. */}
      <div className="mt-12 rounded-card border border-line bg-paper p-6">
        <h2 className="text-[16px] font-semibold text-ink">Still have a question?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          Email{' '}
          <a
            href={`mailto:${support.email}`}
            className="text-sage-deep underline underline-offset-4"
          >
            {support.email}
          </a>{' '}
          and a person will get back to you {support.responseTime}.
        </p>
      </div>
    </Container>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
