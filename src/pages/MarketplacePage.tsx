import { useMemo, useState, type FormEvent } from "react";
import Icon, { type IconName } from "../components/ui/Icon";
import { providers, selectedServiceKey, services, type ServiceId } from "../data/providers";
import type { Navigate } from "../navigation";

type ServiceCategory = {
  description: string;
  icon: IconName;
  name: string;
  serviceId?: ServiceId;
};

const categories: ServiceCategory[] = [
  {
    name: "Plumbing",
    icon: "settings",
    description: "Leaks, fittings, bathroom and kitchen work",
    serviceId: "plumbing",
  },
  {
    name: "Electrical",
    icon: "sparkles",
    description: "Wiring, repairs, lighting, installations",
    serviceId: "electrical",
  },
  {
    name: "Website building",
    icon: "grid",
    description: "Freelancers and studios who build websites",
    serviceId: "web-design",
  },
  { name: "Renovation", icon: "briefcase", description: "Kitchens, bathrooms, full remodels" },
  { name: "Landscaping", icon: "tag", description: "Gardens, lawns, outdoor spaces" },
  { name: "Painting", icon: "tag", description: "Interior and exterior painting" },
  { name: "Cleaning", icon: "check", description: "Home, office, deep cleaning" },
  { name: "Photography", icon: "calendar", description: "Events, portraits, product shoots" },
];

const steps = [
  { title: "Pick a service", text: "Plumbing, electrical, websites and more." },
  { title: "Compare professionals", text: "Ratings, portfolios and clear pricing side by side." },
  { title: "Choose and connect", text: "Send a request. Once they accept, share contact or chat." },
];

const faqs = [
  {
    q: "Is it free for customers?",
    a: "Yes. Browsing, comparing and sending requests costs nothing.",
  },
  {
    q: "When do I get the professional's contact details?",
    a: "After they accept your request at the pricing shown. Then you can message them in TELOS.",
  },
  {
    q: "Are the listings below real?",
    a: "They are sample listings while verified businesses are being onboarded.",
  },
  {
    q: "I run a service business. Can I join?",
    a: "Yes. Create a business account, get verified, then publish your listing and receive requests.",
  },
];

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-primary px-5 text-label font-semibold text-white no-underline transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const ghostButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-white/20 px-5 text-label font-semibold text-white no-underline transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function MarketplacePage({ navigate }: { navigate: Navigate }) {
  const [query, setQuery] = useState("");
  const visibleCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((item) =>
      `${item.name} ${item.description}`.toLowerCase().includes(term),
    );
  }, [query]);

  function pick(serviceId?: ServiceId) {
    if (serviceId) sessionStorage.setItem(selectedServiceKey, serviceId);
    navigate("/customer/login");
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#0b0a14] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0a14]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a className="text-title font-bold tracking-[-0.06em] text-white no-underline" href="/">
            TELOS<span className="text-[#a79cff]">.</span>
          </a>
          <nav aria-label="Main" className="hidden items-center gap-6 text-label text-white/70 md:flex">
            <a className="text-white/70 no-underline hover:text-white" href="#services">
              Services
            </a>
            <a className="text-white/70 no-underline hover:text-white" href="#professionals">
              Professionals
            </a>
            <a className="text-white/70 no-underline hover:text-white" href="#faq">
              FAQ
            </a>
            <button
              className="text-white/70 hover:text-white"
              onClick={() => navigate("/business/login")}
              type="button"
            >
              For businesses
            </button>
          </nav>
          <div className="flex items-center gap-2">
            <button
              className="min-h-10 rounded-control px-4 text-label font-semibold text-white hover:bg-white/10"
              onClick={() => navigate("/customer/login")}
              type="button"
            >
              Sign in
            </button>
            <button
              className="min-h-10 rounded-control bg-white px-4 text-label font-semibold text-[#0b0a14] hover:bg-white/90"
              onClick={() => navigate("/customer/login")}
              type="button"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[-200px] h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary/30 blur-[140px]"
          />
          <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:px-6 md:pt-24">
            <p className="mx-auto inline-flex rounded-full border border-white/15 px-3 py-1 text-caption text-white/70">
              Plumbers, electricians and website builders
            </p>
            <h1 className="mt-6 text-[36px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[56px]">
              Find trusted professionals in minutes
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-white/65">
              Compare ratings, portfolios and pricing, then choose who to work with. Share contact
              details or chat once they accept.
            </p>
            <form
              className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-panel border border-white/15 bg-white/5 p-2 sm:flex-row"
              onSubmit={search}
              role="search"
            >
              <label className="flex min-h-11 flex-1 items-center gap-2 px-3">
                <Icon className="size-4 text-white/60" name="search" />
                <span className="sr-only">Search services</span>
                <input
                  className="w-full bg-transparent text-label text-white outline-none placeholder:text-white/50"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What do you need help with?"
                  type="search"
                  value={query}
                />
              </label>
              <button className={primaryButton} type="submit">
                Search
              </button>
            </form>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button className={primaryButton} onClick={() => navigate("/customer/login")} type="button">
                Get started free
              </button>
              <button className={ghostButton} onClick={() => navigate("/business/login")} type="button">
                Become a professional
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" id="services">
          <h2 className="text-[28px] font-semibold tracking-[-0.04em]">Browse services</h2>
          <p className="mt-2 text-label text-white/60">Choose a category to request a professional.</p>
          {visibleCategories.length === 0 ? (
            <p className="mt-6 rounded-panel border border-white/10 bg-white/5 p-6 text-label text-white/70">
              No services match &ldquo;{query}&rdquo;.{" "}
              <button
                className="font-semibold text-[#a79cff] hover:underline"
                onClick={() => setQuery("")}
                type="button"
              >
                Clear the search
              </button>
            </p>
          ) : (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {visibleCategories.map((item) => (
                <li key={item.name}>
                  <button
                    className="group flex h-full w-full flex-col rounded-panel border border-white/10 bg-white/[0.04] p-5 text-left transition-colors hover:border-primary/60 hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    onClick={() => pick(item.serviceId)}
                    type="button"
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-control bg-primary/25 text-[#c7c0ff]">
                      <Icon className="size-5" name={item.icon} />
                    </span>
                    <span className="mt-4 text-label font-semibold">{item.name}</span>
                    <span className="mt-1 text-caption leading-5 text-white/60">{item.description}</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-[#a79cff]">
                      Request this service
                      <Icon
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        name="arrow-right"
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" id="professionals">
          <h2 className="text-[28px] font-semibold tracking-[-0.04em]">Popular professionals</h2>
          <p className="mt-2 text-label text-white/60">
            Sample listings while verified businesses are being onboarded.
          </p>
          <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {providers.slice(0, 6).map((provider) => (
              <li
                className="flex flex-col rounded-panel border border-white/10 bg-white/[0.04] p-5"
                key={provider.id}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-label font-semibold">{provider.name}</h3>
                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-caption text-white/70">
                    {provider.kind}
                  </span>
                </div>
                <p className="mt-1 text-caption text-[#a79cff]">
                  {services.find((item) => item.id === provider.service)?.name}
                </p>
                <p className="mt-2 text-label leading-6 text-white/65">{provider.headline}</p>
                <p className="mt-3 text-caption text-white/80">
                  <span aria-hidden="true" className="text-amber-300">
                    ★
                  </span>{" "}
                  {provider.rating.toFixed(1)} ({provider.reviews} reviews) · {provider.location}
                </p>
                <p className="mt-1 text-caption text-white/60">{provider.pricing}</p>
                <button
                  className="mt-4 self-start text-caption font-semibold text-[#a79cff] hover:underline"
                  onClick={() => pick(provider.service)}
                  type="button"
                >
                  Sign in to choose
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-[28px] font-semibold tracking-[-0.04em]">How TELOS works</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => (
              <li className="rounded-panel border border-white/10 bg-white/[0.04] p-5" key={step.title}>
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-label font-semibold">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-label font-semibold">{step.title}</h3>
                <p className="mt-1 text-label leading-6 text-white/65">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6" id="faq">
          <h2 className="text-[28px] font-semibold tracking-[-0.04em]">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-white/10 rounded-panel border border-white/10">
            {faqs.map((item) => (
              <details className="group p-5" key={item.q}>
                <summary className="cursor-pointer list-none text-label font-semibold marker:hidden">
                  {item.q}
                </summary>
                <p className="mt-2 text-label leading-6 text-white/65">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-white/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[120px]"
          />
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
            <h2 className="text-[32px] font-semibold leading-tight tracking-[-0.04em]">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-label leading-6 text-white/65">
              Create a free account to find professionals, or join as a business to receive
              requests.
            </p>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-panel border border-white/10 bg-white/[0.05] p-6">
                <h3 className="text-label font-semibold">I need a professional</h3>
                <p className="mt-1 text-caption leading-5 text-white/60">
                  Sign up or sign in with Google or email.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className={primaryButton} onClick={() => navigate("/customer/login")} type="button">
                    Sign up
                  </button>
                  <button className={ghostButton} onClick={() => navigate("/customer/login")} type="button">
                    Sign in
                  </button>
                </div>
              </div>
              <div className="rounded-panel border border-white/10 bg-white/[0.05] p-6">
                <h3 className="text-label font-semibold">I run a service business</h3>
                <p className="mt-1 text-caption leading-5 text-white/60">
                  List your services and manage requests and projects.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className={primaryButton} onClick={() => navigate("/business/login")} type="button">
                    Sign up
                  </button>
                  <button className={ghostButton} onClick={() => navigate("/business/login")} type="button">
                    Sign in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-caption text-white/50">
        © TELOS. Find trusted professionals.
      </footer>
    </div>
  );
}

export default MarketplacePage;
