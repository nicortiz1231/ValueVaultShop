import {useState, type FormEvent} from 'react';
import {Link} from 'react-router';
import {support} from '~/lib/store-config';

export function meta() {
  return [
    {title: 'Order Look Up | Value Vault'},
    {
      name: 'description',
      content:
        'Check your Value Vault order and shipment information, view recent orders, and get help with delivery.',
    },
  ];
}

const steps = [
  {
    number: '01',
    title: 'Order confirmed',
    text: 'After checkout, we send an order confirmation to the email address used for your purchase.',
  },
  {
    number: '02',
    title: 'Order shipped',
    text: 'When your package leaves our facility, you will receive a shipping confirmation with tracking information.',
  },
  {
    number: '03',
    title: 'Track delivery',
    text: 'Use the tracking link in your shipping email to follow your package as it makes its way to you.',
  },
];

export default function OrderLookupPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTrackingHelp, setShowTrackingHelp] = useState(false);

  function handleTrackingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trackingNumber.trim()) {
      return;
    }

    setShowTrackingHelp(true);
  }

  return (
    <main className="bg-white text-ink">
      <section className="border-b border-line">
        <div className="mx-auto max-w-[820px] px-5 py-16 text-center sm:px-8 sm:py-20">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Shipment & order status
          </p>

          <h1 className="display text-4xl text-ink sm:text-5xl">
            Order Look Up
          </h1>

          <p className="mx-auto mt-5 max-w-[600px] text-[15px] leading-7 text-ink-muted sm:text-[16px]">
            Looking for your order? Enter your tracking number below, sign in
            to view your order history, or use the tracking link included in
            your shipping confirmation email.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[940px] px-5 py-16 sm:px-8 md:py-24">
        <div className="border border-line px-6 py-10 sm:px-10 sm:py-12 md:px-14">
          <div className="mx-auto max-w-[650px] text-center">
            <h2 className="display text-2xl text-ink sm:text-3xl">
              Track your package
            </h2>

            <p className="mx-auto mt-3 max-w-[510px] text-[14px] leading-6 text-ink-muted sm:text-[15px]">
              Your tracking number can be found in the shipping confirmation
              email we sent when your order shipped.
            </p>
          </div>

          <form
            onSubmit={handleTrackingSubmit}
            className="mx-auto mt-9 max-w-[620px]"
          >
            <label
              htmlFor="tracking-number"
              className="mb-2 block text-[12px] font-medium text-ink"
            >
              Tracking Number
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="tracking-number"
                name="trackingNumber"
                type="text"
                autoComplete="off"
                value={trackingNumber}
                onChange={(event) => {
                  setTrackingNumber(event.target.value);
                  setShowTrackingHelp(false);
                }}
                placeholder="Enter your tracking number"
                className="min-h-12 flex-1 border border-line-strong bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink"
              />

              <button
                type="submit"
                className="min-h-12 shrink-0 bg-ink px-8 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-85"
              >
                Track Order
              </button>
            </div>
          </form>

          {showTrackingHelp && (
            <div className="mx-auto mt-6 max-w-[620px] border border-line bg-surface p-5">
              <p className="text-[14px] font-medium text-ink">
                Have your shipping confirmation email?
              </p>

              <p className="mt-2 text-[13px] leading-6 text-ink-muted">
                Open the tracking link included in your shipping confirmation
                for the latest carrier updates for{' '}
                <strong className="font-medium text-ink">
                  {trackingNumber}
                </strong>
                .
              </p>

              <p className="mt-3 text-[13px] leading-6 text-ink-muted">
                If you cannot find your shipping email,{' '}
                <a
                  href={`mailto:${support.email}?subject=${encodeURIComponent(
                    `Tracking help - ${trackingNumber}`,
                  )}`}
                  className="text-ink underline underline-offset-4"
                >
                  contact our support team
                </a>
                .
              </p>
            </div>
          )}

          <div className="mx-auto mt-10 flex max-w-[620px] items-center gap-4">
            <div className="h-px flex-1 bg-line" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Or
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-[16px] font-semibold text-ink">
              Already have an account?
            </h3>

            <p className="mx-auto mt-2 max-w-[480px] text-[14px] leading-6 text-ink-muted">
              Sign in to see your Value Vault order history and available
              order details.
            </p>

            <Link
              to="/account/orders"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-ink px-7 text-[12px] font-semibold uppercase tracking-[0.09em] text-ink transition-colors hover:bg-ink hover:text-white"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 md:py-24">
          <div className="mb-12 text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              What happens next
            </p>

            <h2 className="display text-3xl text-ink sm:text-4xl">
              From checkout to your door
            </h2>
          </div>

          <div className="grid border-t border-line md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={[
                  'py-9 md:px-9 md:py-11',
                  index < steps.length - 1
                    ? 'border-b border-line md:border-b-0 md:border-r'
                    : '',
                ].join(' ')}
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-ink-soft">
                  {step.number}
                </span>

                <h3 className="mt-5 text-[17px] font-semibold text-ink">
                  {step.title}
                </h3>

                <p className="mt-3 text-[14px] leading-7 text-ink-muted">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-5 py-20 text-center sm:px-8 md:py-24">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Need some help?
        </p>

        <h2 className="display text-3xl text-ink sm:text-4xl">
          Can&apos;t find your order?
        </h2>

        <p className="mx-auto mt-5 max-w-[570px] text-[15px] leading-7 text-ink-muted">
          If your tracking information hasn&apos;t updated or you can&apos;t
          locate your confirmation email, our customer care team can help.
          Include your order number and the email address used at checkout.
        </p>

        <Link
          to="/pages/contact"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-8 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-85"
        >
          Contact Us
        </Link>
      </section>
    </main>
  );
}