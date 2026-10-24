import { useEffect, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import type { AppSupabaseClient } from "../data/supabase-client";
import {
  getProviderContact,
  getProviderNames,
  listMyRequests,
  type ProviderContact,
  type ServiceRequest,
} from "../data/marketplace-service";
import ChatThread from "./ChatThread";

function RequestRow({
  client,
  name,
  request,
  userId,
}: {
  client: AppSupabaseClient;
  name: string;
  request: ServiceRequest;
  userId: string;
}) {
  const [contact, setContact] = useState<ProviderContact | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (request.status !== "accepted") return;
    void getProviderContact(client, request.provider_id)
      .then(setContact)
      .catch(() => setContact(null));
  }, [client, request.provider_id, request.status]);

  return (
    <li>
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-title font-semibold text-ink">{name}</h3>
          <Badge>
            {request.status === "pending"
              ? "Waiting for reply"
              : request.status === "accepted"
                ? "Accepted"
                : "Declined"}
          </Badge>
        </div>
        {request.status === "accepted" && (
          <div className="mt-3 text-label text-ink">
            {contact ? (
              <p>
                Contact: <a href={`mailto:${contact.email}`}>{contact.email}</a>
                {contact.phone ? ` · ${contact.phone}` : ""}
              </p>
            ) : (
              <p className="text-muted">Contact details are not available yet.</p>
            )}
            <Button className="mt-3" onClick={() => setChatOpen(!chatOpen)} variant="secondary">
              {chatOpen ? "Hide chat" : "Open chat"}
            </Button>
            {chatOpen && <ChatThread client={client} requestId={request.id} userId={userId} />}
          </div>
        )}
        {request.status === "declined" && (
          <p className="mt-3 text-label text-muted">
            This professional can&apos;t take the job right now. Try another one.
          </p>
        )}
      </Card>
    </li>
  );
}

function MyRequestsPanel({ client, userId }: { client: AppSupabaseClient; userId: string }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const rows = await listMyRequests(client);
        const mine = rows.filter((row) => row.customer_id === userId);
        const lookup = await getProviderNames(client, [...new Set(mine.map((r) => r.provider_id))]);
        if (active) {
          setRequests(mine);
          setNames(lookup);
        }
      } catch {
        // Marketplace tables may not exist yet; the panel stays empty.
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [client, userId]);

  if (requests.length === 0) return null;
  return (
    <section aria-labelledby="my-requests" className="mt-8">
      <h2 className="text-title font-semibold text-ink" id="my-requests">
        My requests
      </h2>
      <ul className="mt-3 space-y-3">
        {requests.map((request) => (
          <RequestRow
            client={client}
            key={request.id}
            name={names[request.provider_id] ?? "Professional"}
            request={request}
            userId={userId}
          />
        ))}
      </ul>
    </section>
  );
}

export default MyRequestsPanel;
