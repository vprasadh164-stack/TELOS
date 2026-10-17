import type { User } from "@supabase/supabase-js";
import type { AppSupabaseClient } from "../data/supabase-client";

export type LoginMode = "business" | "customer";
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface BusinessApplication {
  business_name: string;
  contact_email: string;
  description: string;
  status: VerificationStatus;
  website: string | null;
}

export interface CustomerAccessRequest {
  id: string;
  business_email: string;
  created_at: string;
  note: string;
  project_reference: string;
  status: VerificationStatus;
}

export async function signInWithGoogle(client: AppSupabaseClient, mode: LoginMode) {
  const redirectTo = new URL("/auth/callback", window.location.origin);
  redirectTo.searchParams.set("mode", mode);
  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo.toString(),
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
}

export async function signOut(client: AppSupabaseClient) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getBusinessApplication(client: AppSupabaseClient, user: User) {
  const { data, error } = await client
    .from("business_applications")
    .select("business_name, contact_email, description, status, website")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function submitBusinessApplication(
  client: AppSupabaseClient,
  user: User,
  input: { businessName: string; contactEmail: string; description: string; website: string },
) {
  const { error } = await client.from("business_applications").upsert(
    {
      owner_id: user.id,
      business_name: input.businessName.trim(),
      contact_email: input.contactEmail.trim().toLowerCase(),
      description: input.description.trim(),
      website: input.website.trim() || null,
      status: "pending",
    },
    { onConflict: "owner_id" },
  );
  if (error) throw error;
}

export async function submitCustomerAccessRequest(
  client: AppSupabaseClient,
  input: { businessEmail: string; projectReference: string; note: string },
) {
  const { error } = await client.rpc("submit_customer_access_request", {
    p_business_email: input.businessEmail.trim().toLowerCase(),
    p_project_reference: input.projectReference.trim(),
    p_note: input.note.trim(),
  });
  if (error) throw error;
}

export async function listCustomerAccessRequests(client: AppSupabaseClient) {
  const { data, error } = await client
    .from("customer_access_requests")
    .select("id, business_email, created_at, note, project_reference, status")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateCustomerAccessRequest(
  client: AppSupabaseClient,
  requestId: string,
  status: "approved" | "rejected",
) {
  const { error } = await client
    .from("customer_access_requests")
    .update({ status })
    .eq("id", requestId)
    .eq("status", "pending");
  if (error) throw error;
}
