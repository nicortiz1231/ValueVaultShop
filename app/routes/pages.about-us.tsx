import {Link} from 'react-router';

export function meta() {
  return [
    {title: 'About Us | Value Vault'},
    {
      name: 'description',
      content:
        'Learn more about Value Vault and our mission to make everyday shopping simple, useful, and affordable.',
    },
  ];
}

const values = [
  {
    number: '01',
    title: 'Useful by design',
    text: 'We focus on products that solve everyday problems, make routines easier, or simply make your space a little better.',
  },
  {
    number: '02',
    title: 'Value that makes sense',
    text: 'A great find should feel worth it. We look for products that balance usefulness, quality, and accessible pricing.',
  },
  {
    number: '03',
    title: 'A simple experience',
    text: 'From discovering a product to receiving your order, we want shopping with Value Vault to feel clear and uncomplicated.',
  },
];

export default function AboutUsPage() {
  return (
    <main className="bg-white text-ink">
      <section className="border-b border-line">
        <div className="mx-auto max-w-[900px] px-5 py-20 text-center sm:px-8 sm:py-28">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            About Value Vault
          </p>

          <h1 className="display text-4xl leading-[1.08] text-ink sm:text-5xl md:text-6xl">
            Everyday finds,
            <br />
            thoughtfully chosen.
          </h1>

          <p className="mx-auto mt-7 max-w-[650px] text-[16px] leading-7 text-ink-muted sm:text-[17px]">
            Value Vault is built around a simple idea: useful products
            shouldn&apos;t be difficult to discover or expensive to enjoy.
            We bring together everyday essentials and clever finds for your
            home, kitchen, pets, family, and daily routine.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:gap-20 md:py-28">
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Our story
          </p>

          <h2 className="display max-w-[500px] text-3xl leading-tight text-ink sm:text-4xl">
            Making everyday shopping a little more rewarding.
          </h2>
        </div>

        <div className="space-y-6 text-[15px] leading-7 text-ink-muted sm:text-[16px]">
          <p>
            At Value Vault, we&apos;re always looking for products that can
            make everyday life easier, more comfortable, or simply more fun.
            From practical home and kitchen accessories to useful products for
            pets, kids, and the whole family, every category is selected with
            everyday living in mind.
          </p>

          <p>
            We believe the best products aren&apos;t always the most
            complicated ones. Sometimes it&apos;s a clever kitchen tool, a
            simple organization solution, or an accessory you didn&apos;t
            know you needed until it became part of your routine.
          </p>

          <p>
            Our goal is to create a shopping experience where discovering your
            next favorite find feels easy — with products that offer genuine
            usefulness and value.
          </p>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 md:py-24">
          <div className="mb-14 text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              What matters to us
            </p>

            <h2 className="display text-3xl text-ink sm:text-4xl">
              The Value Vault approach
            </h2>
          </div>

          <div className="grid border-t border-line md:grid-cols-3">
            {values.map((value, index) => (
              <div
                key={value.number}
                className={[
                  'py-10 md:px-9 md:py-12',
                  index !== values.length - 1
                    ? 'border-b border-line md:border-b-0 md:border-r'
                    : '',
                ].join(' ')}
              >
                <span className="text-[11px] font-semibold tracking-[0.18em] text-ink-soft">
                  {value.number}
                </span>

                <h3 className="mt-6 text-[18px] font-semibold text-ink">
                  {value.title}
                </h3>

                <p className="mt-4 text-[15px] leading-7 text-ink-muted">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Made for real life
            </p>

            <h2 className="display text-3xl leading-tight text-ink sm:text-4xl">
              Something useful for every corner of your day.
            </h2>
          </div>

          <div>
            <div className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-3">
              {[
                'Home',
                'Kitchen',
                'Pets',
                'Kids & Babies',
                'Everyday Essentials',
                'Best Sellers',
              ].map((category) => (
                <div
                  key={category}
                  className="flex min-h-[110px] items-center justify-center border-b border-r border-line px-4 text-center"
                >
                  <span className="text-[14px] font-medium text-ink">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto max-w-[820px] px-5 py-20 text-center sm:px-8 md:py-24">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Come discover something new
          </p>

          <h2 className="display text-3xl leading-tight text-white sm:text-4xl">
            Your next favorite find might already be here.
          </h2>

          <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-7 text-white/70">
            Explore our collection of practical products, everyday essentials,
            and clever finds selected for real life.
          </p>

          <Link
            to="/collections/all"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink transition-opacity hover:opacity-90"
          >
            Shop All
          </Link>
        </div>
      </section>
    </main>
  );
}