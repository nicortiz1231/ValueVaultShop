import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className = '',
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => {
        const busy = fetcher.state !== 'idle';
        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              onClick={onClick}
              disabled={disabled ?? busy}
              className={[
                'inline-flex h-13 w-full items-center justify-center gap-2 rounded-pill',
                'bg-brand px-7 text-base font-semibold text-bg shadow-card transition-all',
                'hover:bg-brand-deep hover:shadow-lift active:scale-[0.98]',
                'disabled:cursor-not-allowed disabled:bg-ink-soft disabled:text-ink-muted disabled:shadow-none',
                className,
              ].join(' ')}
            >
              {busy ? 'Adding…' : children}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}
