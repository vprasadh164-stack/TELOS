import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { services, type ServiceId } from "../data/providers";
import type { AppSupabaseClient } from "../data/supabase-client";
import {
  answerRequest,
  getMyProfile,
  listMyRequests,
  saveMyProfile,
  type ServiceRequest,
} from "../data/marketplace-service";
import type { Navigate } from "../navigation";
import ChatThread from "./ChatThread";

const fieldClass =
  "mt-1 min-h-10 w-full rounded-control border border-line bg-surface px-3 text-label text-ink";

function BusinessMarketplacePage({
  client,
  navigate,
  user,
}: {
  client: AppSupabaseClient;
  navigate: Navigate;
  user: User;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"Freelancer" | "Company">("Freelancer");
  const [service, setService] = useState<ServiceId>("web-design");
  const [headline, setHeadline] = useState("");
  const [pricing, setPricing] = useState("");
  const [location, setLocation] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState("");
  const [published, setPublished] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const rows = await listMyRequests(client);
      setRequests(rows.filter((row) => row.provider_id === user.id));
    } catch {
      // Tables may not exist yet.
    }
  }, [client, user.id]);

  useEffect(() => {
    void getMyProfile(client, user.id)
      .then(({ profile, contact }) => {
        if (profile) {
          const saved = profile as unknown as Record<string, unknown>;
          setName(String(saved.name ?? ""));
          setKind(saved.kind === "Company" ? "Company" : "Freelancer");
          setService(saved.service as ServiceId);
          setHeadline(String(saved.headline ?? ""));
          setPricing(String(saved.pricing ?? ""));
          setLocation(String(saved.location ?? ""));
          setPortfolio(Array.isArray(saved.portfolio) ? (saved.portfolio as string[]).join("\n") : "");
          setPublished(Boolean(saved.published));
        }
        if (contact) {
          setEmail(contact.email);
          setPhone(contact.phone ?? "");
        }
      })
      .catch(() => undefined);
    const first = window.setTimeout(() => void loadRequests(), 0);
    const timer = window.setInterval(() => void loadRequests(), 10000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [client, user.id, loadRequests]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    try {
      await saveMyProfile(
        client,
        user.id,
        {
          name: name.trim(),
          kind,
          service,
          headline: headline.trim(),
          pricing: pricing.trim(),
          location: location.trim(),
          portfolio: portfolio
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          published,
        },
        { email: email.trim(), phone: phone.trim() },
      );
      setStatus("Saved. Customers can now find your listing.");
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Could not save your profile.");
    }
  }

  async function answer(id: string, next: "accepted" | "declined") {
    try {
      await answerRequest(client, id, next);
      await loadRequests();
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Could not update the request.");
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-title font-bold tracking-[-0.06em] text-ink">
            TELOS<span className="text-primary">.</span>
          </span>
          <Button onClick={() => navigate("/")} variant="quiet">
            Open workspace
          </Button>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2">
        <section>
          <h1 className="text-page-title font-semibold tracking-[-0.04em] text-ink">
            Your marketplace listing
          </h1>
          <form className="mt-4 space-y-3" onSubmit={save}>
            <label className="block text-label font-semibold text-ink">
              Business or freelancer name
              <input className={fieldClass} onChange={(e) => setName(e.target.value)} required value={name} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-label font-semibold text-ink">
                Type
                <select className={fieldClass} onChange={(e) => setKind(e.target.value as typeof kind)} value={kind}>
                  <option>Freelancer</option>
                  <option>Company</option>
                </select>
              </label>
              <label className="block text-label font-semibold text-ink">
                Service
                <select className={fieldClass} onChange={(e) => setService(e.target.value as ServiceId)} value={service}>
                  {services.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-label font-semibold text-ink">
              Headline
              <input className={fieldClass} maxLength={240} onChange={(e) => setHeadline(e.target.value)} value={headline} />
            </label>
            <label className="block text-label font-semibold text-ink">
              Pricing
              <input className={fieldClass} maxLength={240} onChange={(e) => setPricing(e.target.value)} placeholder="e.g. From ₹999 per visit" value={pricing} />
            </label>
            <label className="block text-label font-semibold text-ink">
              Location
              <input className={fieldClass} maxLength={120} onChange={(e) => setLocation(e.target.value)} value={location} />
            </label>
            <label className="block text-label font-semibold text-ink">
              Portfolio (one item per line)
              <textarea className={`${fieldClass} py-2`} onChange={(e) => setPortfolio(e.target.value)} rows={4} value={portfolio} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-label font-semibold text-ink">
                Contact email (shared after you accept)
                <input className={fieldClass} onChange={(e) => setEmail(e.target.value)} required type="email" value={email} />
              </label>
              <label className="block text-label font-semibold text-ink">
                Phone
                <input className={fieldClass} onChange={(e) => setPhone(e.target.value)} value={phone} />
              </label>
            </div>
            <label className="flex items-center gap-2 text-label text-ink">
              <input checked={published} onChange={(e) => setPublished(e.target.checked)} type="checkbox" />
              Show my listing to customers
            </label>
            <Button type="submit">Save listing</Button>
            {status && (
              <p className="text-caption text-muted" role="status">
                {status}
              </p>
            )}
          </form>
        </section>

        <section>
          <h2 className="text-page-title font-semibold tracking-[-0.04em] text-ink">Requests</h2>
          {requests.length === 0 ? (
            <Card className="mt-4 p-5 text-label text-muted">No customer requests yet.</Card>
          ) : (
            <ul className="mt-4 space-y-3">
              {requests.map((request) => (
                <li key={request.id}>
                  <Card className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-label font-semibold text-ink">
                        {request.customer_name || request.customer_email}
                      </p>
                      <Badge>{request.status}</Badge>
                    </div>
                    <p className="mt-1 text-caption text-muted">{request.customer_email}</p>
                    {request.message && <p className="mt-2 text-label text-ink">{request.message}</p>}
                    {request.status === "pending" && (
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => void answer(request.id, "accepted")}>Accept</Button>
                        <Button onClick={() => void answer(request.id, "declined")} variant="secondary">
                          Decline
                        </Button>
                      </div>
                    )}
                    {request.status === "accepted" && (
                      <>
                        <Button
                          className="mt-3"
                          onClick={() => setChatId(chatId === request.id ? null : request.id)}
                          variant="secondary"
                        >
                          {chatId === request.id ? "Hide chat" : "Open chat"}
                        </Button>
                        {chatId === request.id && (
                          <ChatThread client={client} requestId={request.id} userId={user.id} />
                        )}
                      </>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default BusinessMarketplacePage;

