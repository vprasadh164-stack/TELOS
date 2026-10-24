import type { AppSupabaseClient } from "./supabase-client";
import type { Provider, ServiceId } from "./providers";

// The marketplace tables are newer than the generated database types, so use a loose client.
type LooseClient = {
  from: (table: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

function db(client: AppSupabaseClient): LooseClient {
  return client as unknown as LooseClient;
}

export type RequestStatus = "pending" | "accepted" | "declined";

export type ServiceRequest = {
  id: string;
  customer_id: string;
  provider_id: string;
  service: string;
  customer_name: string;
  customer_email: string;
  message: string;
  status: RequestStatus;
  created_at: string;
};

export type ProviderContact = { owner_id: string; email: string; phone: string | null };
export type RequestMessage = {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ProviderProfileInput = {
  name: string;
  kind: "Freelancer" | "Company";
  service: ServiceId;
  headline: string;
  pricing: string;
  location: string;
  portfolio: string[];
  published: boolean;
};

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function listPublishedProviders(
  client: AppSupabaseClient,
  service: ServiceId,
): Promise<Provider[]> {
  const { data, error } = await db(client)
    .from("provider_profiles")
    .select("owner_id,name,kind,service,headline,pricing,location,portfolio")
    .eq("service", service)
    .eq("published", true);
  fail(error);
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.owner_id),
    name: String(row.name),
    kind: row.kind === "Company" ? "Company" : "Freelancer",
    service,
    rating: 0,
    reviews: 0,
    location: String(row.location ?? ""),
    headline: String(row.headline ?? ""),
    pricing: String(row.pricing ?? ""),
    portfolio: Array.isArray(row.portfolio) ? (row.portfolio as string[]) : [],
  }));
}

export async function sendRequest(
  client: AppSupabaseClient,
  input: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    message: string;
    providerId: string;
    service: ServiceId;
  },
): Promise<void> {
  const { error } = await db(client).from("service_requests").insert({
    customer_id: input.customerId,
    provider_id: input.providerId,
    service: input.service,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    message: input.message,
  });
  fail(error);
}

export async function listMyRequests(client: AppSupabaseClient): Promise<ServiceRequest[]> {
  const { data, error } = await db(client)
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
}

export async function answerRequest(
  client: AppSupabaseClient,
  id: string,
  status: "accepted" | "declined",
): Promise<void> {
  const { error } = await db(client)
    .from("service_requests")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", id);
  fail(error);
}

export async function getProviderNames(
  client: AppSupabaseClient,
  ids: string[],
): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const { data, error } = await db(client)
    .from("provider_profiles")
    .select("owner_id,name")
    .in("owner_id", ids);
  fail(error);
  return Object.fromEntries(
    (data ?? []).map((row: { owner_id: string; name: string }) => [row.owner_id, row.name]),
  );
}

export async function getProviderContact(
  client: AppSupabaseClient,
  providerId: string,
): Promise<ProviderContact | null> {
  const { data, error } = await db(client)
    .from("provider_contacts")
    .select("*")
    .eq("owner_id", providerId)
    .maybeSingle();
  fail(error);
  return data ?? null;
}

export async function listMessages(
  client: AppSupabaseClient,
  requestId: string,
): Promise<RequestMessage[]> {
  const { data, error } = await db(client)
    .from("request_messages")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  fail(error);
  return data ?? [];
}

export async function sendMessage(
  client: AppSupabaseClient,
  requestId: string,
  senderId: string,
  body: string,
): Promise<void> {
  const { error } = await db(client)
    .from("request_messages")
    .insert({ request_id: requestId, sender_id: senderId, body });
  fail(error);
}

export async function getMyProfile(
  client: AppSupabaseClient,
  ownerId: string,
): Promise<{ profile: ProviderProfileInput | null; contact: ProviderContact | null }> {
  const profile = await db(client)
    .from("provider_profiles")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  fail(profile.error);
  return { profile: profile.data ?? null, contact: await getProviderContact(client, ownerId) };
}

export async function saveMyProfile(
  client: AppSupabaseClient,
  ownerId: string,
  profile: ProviderProfileInput,
  contact: { email: string; phone: string },
): Promise<void> {
  const existing = await db(client)
    .from("provider_profiles")
    .select("owner_id")
    .eq("owner_id", ownerId)
    .maybeSingle();
  fail(existing.error);
  const saved = existing.data
    ? await db(client).from("provider_profiles").update(profile).eq("owner_id", ownerId)
    : await db(client).from("provider_profiles").insert({ ...profile, owner_id: ownerId });
  fail(saved.error);
  const contactSaved = await db(client)
    .from("provider_contacts")
    .upsert({ owner_id: ownerId, email: contact.email, phone: contact.phone || null });
  fail(contactSaved.error);
}
