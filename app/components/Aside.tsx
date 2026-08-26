import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import {CloseIcon} from './Icons';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * Slide-over panel used for the cart, search and mobile menu.
 *
 * @example
 * ```jsx
 * <Aside type="search" heading="Search">
 *   <input type="search" />
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') close();
        },
        {signal: abortController.signal},
      );
    }

    return () => abortController.abort();
  }, [close, expanded]);

  // Stop the page behind the drawer from scrolling while it is open.
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  return (
    <div
      aria-modal
      role="dialog"
      aria-labelledby={id}
      aria-hidden={!expanded}
      className={[
        'fixed inset-0 z-50 transition-opacity duration-300',
        expanded
          ? 'visible opacity-100'
          : 'invisible opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <button
        className="absolute inset-0 h-full w-full cursor-default bg-ink/25 backdrop-blur-[2px]"
        onClick={close}
        tabIndex={expanded ? 0 : -1}
        aria-label="Close"
      />

      <aside
        className={[
          'absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col',
          'bg-surface shadow-card transition-transform duration-300 ease-out',
          expanded ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h3 id={id} className="text-lg font-bold tracking-tight text-chalk">
            {heading}
          </h3>
          <button
            onClick={close}
            aria-label="Close"
            tabIndex={expanded ? 0 : -1}
            className="-mr-2 rounded-full p-2 text-ash transition-colors hover:bg-surface-2 hover:text-chalk"
          >
            <CloseIcon />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
