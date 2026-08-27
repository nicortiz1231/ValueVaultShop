import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

const pagerLink =
  'inline-flex h-11 items-center justify-center rounded-pill border border-line-strong bg-surface px-6 text-sm font-semibold text-ink transition-colors hover:bg-bg-deep';

/**
 * Wraps Shopify's <Pagination> with the storefront's own styling.
 *
 * The links are real anchors rather than buttons, so the "load more" path stays
 * crawlable and a shopper can open page two in a new tab.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{
    node: NodesType;
    index: number;
    /** Every node currently rendered, for decisions a single card cannot make
        on its own -- see ProductCard's reserved swatch row. */
    nodes: NodesType[];
  }>;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index, nodes}),
        );

        return (
          <div>
            <div className="mb-8 flex justify-center empty:mb-0">
              <PreviousLink className={pagerLink}>
                {isLoading ? 'Loading…' : 'Load previous'}
              </PreviousLink>
            </div>

            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}

            <div className="mt-10 flex justify-center empty:mt-0">
              <NextLink className={pagerLink}>
                {isLoading ? 'Loading…' : 'Load more'}
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
