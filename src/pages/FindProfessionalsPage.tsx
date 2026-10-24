import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import {
  isServiceId,
  providers,
  selectedServiceKey,
  services,
  type Provider,
  type ServiceId,
} from "../data/providers";
import type { AppSupabaseClient } from "../data/supabase-client";
import { listMyRequests, listPublishedProviders, sendRequest } from "../data/marketplace-service";
import type { Navigate } from "../navigation";
import MyRequestsPanel from "./MyRequestsPanel";

const requestsKey = "telos:provider-requests";

function readRequests(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(requestsKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function initialService(): ServiceId {
  const stored = sessionStorage.getItem(selectedServiceKey);
  return isServiceId(stored) ? stored : "web-design";
}

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-label font-semibold text-ink">
      <span aria-hidden="true" className="text-warm">
        ★
      </span>
      {rating.toFixed(1)}
      <span className="font-normal text-muted">({reviews} reviews)</span>
    </span>
  );
}

function FindProfessionalsPage({
  client,
  navigate,
  user,
}: {
  client: AppSupabaseClient | null;
  navigate: Navigate;
  user: User | null;
}) {
  const [real, setReal] = useState<Provider[]>([]);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<ServiceId>(initialService);
  const [openId, setOpenId] = useState<string | null>(null);
  const [requested, setRequested] = useState<string[]>(readRequests);
  const sample = providers.filter((item) => item.service === service);
  const usingSamples = real.length === 0;
  const list = [...(usingSamples ? sample : real)].sort(
    (first, second) => second.rating - first.rating,
  );

  useEffect(() => {
    if (!client) return;
    let active = true;
    void listPublishedProviders(client, service)
      .then((rows) => active && setReal(rows))
      .catch(() => active && setReal([]));
    void listMyRequests(client)
      .then((rows) => active && setSentIds(rows.map((row) => row.provider_id)))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [client, service]);

  function chooseService(next: ServiceId) {
    sessionStorage.setItem(selectedServiceKey, next);
    setService(next);
    setOpenId(null);
  }

  async function request(provider: Provider) {
    if (client && user && !usingSamples) {
      setError(null);
      try {
        await sendRequest(client, {
          customerId: user.id,
          customerName: String(user.user_metadata?.full_name ?? ""),
          customerEmail: user.email ?? "",
          message: "",
          providerId: provider.id,
          service,
        });
        setSentIds((current) => [...current, provider.id]);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not send the request.");
      }
      return;
    }
    const next = [...new Set([...requested, provider.id])];
    setRequested(next);
    try {
      localStorage.setItem(requestsKey, JSON.stringify(next));
    } catch {
      // The request still shows as sent for this visit.
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a className="text-title font-bold tracking-[-0.06em] text-ink no-underline" href="/">
            TELOS<span className="text-primary">.</span>
          </a>
          <div className="flex items-center gap-3 text-caption text-muted">
            <span className="hidden sm:inline">{user?.email}</span>
            <Button onClick={() => navigate("/customer/access")} variant="quiet">
              My project portal
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">
          Find a professional
        </h1>
        <p className="mt-2 text-label leading-6 text-muted">
          Compare ratings, portfolios and pricing, then choose who you want to work with.
        </p>
        {usingSamples && (
          <p className="mt-3 rounded-control bg-warm-soft px-3 py-2 text-caption leading-5 text-warm">
            These are sample listings while TELOS onboards verified businesses.
          </p>
        )}
        {error && (
          <p className="mt-3 text-caption text-danger" role="alert">
            {error}
          </p>
        )}

        <div aria-label="Service" className="mt-5 flex flex-wrap gap-2" role="group">
          {services.map((item) => (
            <button
              aria-pressed={service === item.id}
              className={`min-h-10 rounded-control border px-4 text-label font-semibold ${
                service === item.id
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line bg-surface text-ink"
              }`}
              key={item.id}
              onClick={() => chooseService(item.id)}
              type="button"
            >
              {item.name}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <Card className="mt-6 p-6 text-label text-muted">
            No professionals are listed for this service yet.
          </Card>
        ) : (
          <ul className="mt-6 space-y-4">
            {list.map((provider) => {
              const open = openId === provider.id;
              const sent = usingSamples ? requested.includes(provider.id) : sentIds.includes(provider.id);
              return (
                <li key={provider.id}>
                  <Card className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-title font-semibold text-ink">{provider.name}</h2>
                          <Badge>{provider.kind}</Badge>
                        </div>
                        <p className="mt-1 text-label leading-6 text-muted">{provider.headline}</p>
                        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                          {provider.reviews > 0 ? (
                            <Stars rating={provider.rating} reviews={provider.reviews} />
                          ) : (
                            <span className="text-caption text-muted">New on TELOS</span>
                          )}
                          <span className="text-caption text-muted">{provider.location}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-caption text-muted">Pricing</p>
                        <p className="max-w-64 text-label font-semibold text-ink">
                          {provider.pricing}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        aria-expanded={open}
                        onClick={() => setOpenId(open ? null : provider.id)}
                        variant="secondary"
                      >
                        {open ? "Hide portfolio" : "View portfolio"}
                      </Button>
                      <Button disabled={sent} onClick={() => void request(provider)}>
                        {sent ? (
                          <>
                            <Icon className="size-4" name="check" />
                            Request sent
                          </>
                        ) : (
                          "Choose this professional"
                        )}
                      </Button>
                    </div>

                    {open && (
                      <div className="mt-4 border-t border-line pt-4">
                        {provider.portfolio.length === 0 ? (
                          <p className="text-label text-muted">
                            This professional hasn&apos;t added a portfolio yet.
                          </p>
                        ) : (
                          <ul className="grid gap-2 sm:grid-cols-3">
                            {provider.portfolio.map((work) => (
                              <li
                                className="rounded-control bg-canvas px-3 py-3 text-label text-ink"
                                key={work}
                              >
                                {work}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {sent && (
                      <p className="mt-4 rounded-control bg-success-soft px-3 py-2 text-caption leading-5 text-success" role="status">
                        Request sent. If {provider.name} accepts at the pricing shown, their
                        contact details or a chat will be shared with you here.
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
        {client && user && <MyRequestsPanel client={client} userId={user.id} />}
      </main>
    </div>
  );
}

export default FindProfessionalsPage;


