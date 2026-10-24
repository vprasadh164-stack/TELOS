import { useMemo, useState, type FormEvent } from "react";
import Button from "../components/ui/Button";
import Icon, { type IconName } from "../components/ui/Icon";
import InternalLink from "../components/ui/InternalLink";
import type { Navigate } from "../navigation";

type ServiceCategory = {
  description: string;
  icon: IconName;
  name: string;
};

const categories: ServiceCategory[] = [
  { name: "Renovation", icon: "briefcase", description: "Kitchens, bathrooms, full remodels" },
  { name: "Web design", icon: "grid", description: "Websites, landing pages, redesigns" },
  { name: "Landscaping", icon: "sparkles", description: "Gardens, lawns, outdoor spaces" },
  { name: "Painting", icon: "tag", description: "Interior and exterior painting" },
  { name: "Cleaning", icon: "check", description: "Home, office, deep cleaning" },
  { name: "Photography", icon: "calendar", description: "Events, portraits, product shoots" },
  { name: "Plumbing & electrical", icon: "settings", description: "Repairs, fittings, upgrades" },
  { name: "Marketing", icon: "chart", description: "Branding, social, campaigns" },
];

const steps = [
  {
    title: "Tell us what you need",
    text: "Pick a service and describe your project in a few lines.",
  },
  {
    title: "Get matched with a professional",
    text: "Verified service businesses respond with their plan and timeline.",
  },
  {
    title: "Follow the work in your portal",
    text: "See milestones, updates, files, and messages in one place.",
  },
];

const trust = [
  {
    icon: "check",
    title: "Verified professionals",
    text: "Every business is reviewed before it can take on work.",
  } as const,
  {
    icon: "clock",
    title: "Clear progress",
    text: "Milestones and updates shared in your project portal.",
  } as const,
  {
    icon: "message",
    title: "One conversation",
    text: "Messages and files stay with the project, not scattered.",
  } as const,
];

function MarketplacePage({ navigate }: { navigate: Navigate }) {
  const [query, setQuery] = useState("");
  const visibleCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((item) =>
      `${item.name} ${item.description}`.toLowerCase().includes(term),
    );
  }, [query]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a className="text-title font-bold tracking-[-0.06em] text-ink no-underline" href="/">
            TELOS<span className="text-primary">.</span>
          </a>
          <nav aria-label="Account" className="flex items-center gap-2">
            <Button
              className="hidden sm:inline-flex"
              onClick={() => navigate("/business/login")}
              variant="quiet"
            >
              Become a professional
            </Button>
            <Button onClick={() => navigate("/customer/login")} variant="secondary">
              Sign in
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-canvas">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-16">
            <div>
              <h1 className="max-w-xl text-[32px] font-semibold leading-tight tracking-[-0.045em] sm:text-[44px]">
                Trusted professionals for every project
              </h1>
              <p className="mt-4 max-w-lg text-label leading-6 text-muted">
                Find a verified service business, share what you need, and follow the work from
                first message to completion.
              </p>
              <form
                className="mt-6 flex max-w-xl flex-col gap-2 rounded-panel border border-line bg-surface p-2 shadow-panel sm:flex-row"
                onSubmit={search}
                role="search"
              >
                <label className="flex min-h-11 flex-1 items-center gap-2 px-3">
                  <Icon className="size-4 text-muted" name="search" />
                  <span className="sr-only">Search services</span>
                  <input
                    className="w-full bg-transparent text-label text-ink outline-none"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="What do you need help with?"
                    type="search"
                    value={query}
                  />
                </label>
                <Button className="min-h-11 px-5" type="submit">
                  Search
                </Button>
              </form>
            </div>
            <div className="grid grid-cols-2 gap-3" aria-hidden="true">
              {categories.slice(0, 4).map((item) => (
                <div
                  className="rounded-panel border border-line bg-surface p-4 shadow-panel"
                  key={item.name}
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-control bg-primary-soft text-primary">
                    <Icon className="size-5" name={item.icon} />
                  </span>
                  <p className="mt-3 text-label font-semibold">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6" id="services">
          <h2 className="text-page-title font-semibold tracking-[-0.04em]">Browse services</h2>
          <p className="mt-2 text-label text-muted">Choose a category to request a professional.</p>
          {visibleCategories.length === 0 ? (
            <p className="mt-6 rounded-panel border border-line bg-canvas p-6 text-label text-muted">
              No services match “{query}”. Try a different word, or{" "}
              <button
                className="font-semibold text-primary hover:underline"
                onClick={() => setQuery("")}
                type="button"
              >
                clear the search
              </button>
              .
            </p>
          ) : (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {visibleCategories.map((item) => (
                <li key={item.name}>
                  <InternalLink
                    className="group flex h-full flex-col rounded-panel border border-line bg-surface p-5 no-underline shadow-panel transition-colors hover:border-primary/40"
                    href="/customer/login"
                    navigate={navigate}
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-control bg-primary-soft text-primary">
                      <Icon className="size-5" name={item.icon} />
                    </span>
                    <span className="mt-4 text-label font-semibold text-ink">{item.name}</span>
                    <span className="mt-1 text-caption leading-5 text-muted">
                      {item.description}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
                      Request this service
                      <Icon
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        name="arrow-right"
                      />
                    </span>
                  </InternalLink>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-canvas">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="text-page-title font-semibold tracking-[-0.04em]">How TELOS works</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  className="rounded-panel border border-line bg-surface p-5 shadow-panel"
                  key={step.title}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-label font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-label font-semibold">{step.title}</h3>
                  <p className="mt-1 text-label leading-6 text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <ul className="grid gap-4 md:grid-cols-3">
            {trust.map((item) => (
              <li className="flex gap-3" key={item.title}>
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-success-soft text-success">
                  <Icon className="size-5" name={item.icon} />
                </span>
                <div>
                  <h3 className="text-label font-semibold">{item.title}</h3>
                  <p className="mt-1 text-label leading-6 text-muted">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-panel bg-primary p-6 text-white sm:flex-row sm:items-center sm:p-9">
            <div>
              <h2 className="text-title font-semibold sm:text-[22px]">Run a service business?</h2>
              <p className="mt-2 max-w-lg text-label leading-6 text-white/80">
                Get discovered, manage leads and follow-ups, and keep every client project on track
                in one workspace.
              </p>
            </div>
            <Button
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate("/business/login")}
            >
              Become a professional
              <Icon className="size-4" name="arrow-right" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-caption text-muted sm:px-6">
          <span>© TELOS</span>
          <span>Verified professionals · Clear progress · One conversation</span>
        </div>
      </footer>
    </div>
  );
}

export default MarketplacePage;
