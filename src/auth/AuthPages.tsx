import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import InternalLink from "../components/ui/InternalLink";
import type { AppSupabaseClient } from "../data/supabase-client";
import type { Navigate } from "../navigation";
import {
  getBusinessApplication,
  listCustomerAccessRequests,
  signInWithEmailLink,
  signInWithEmailPassword,
  signInWithGoogle,
  signOut,
  signUpWithEmailPassword,
  submitBusinessApplication,
  submitCustomerAccessRequest,
  updateCustomerAccessRequest,
  type BusinessApplication,
  type CustomerAccessRequest,
  type LoginMode,
} from "./auth-service";

type AuthPageProps = {
  client: AppSupabaseClient | null;
  configured: boolean;
  error: string | null;
  navigate: Navigate;
  user: User | null;
};

const inputClass =
  "min-h-11 w-full rounded-control border border-line bg-surface px-3 text-label text-ink";

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-canvas px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <a
          className="inline-flex items-center gap-1 text-title font-bold tracking-[-0.06em] text-ink no-underline"
          href="/"
        >
          TELOS<span className="text-primary">.</span>
        </a>
        {children}
      </div>
    </main>
  );
}

export function LoginChoicePage({
  demoAvailable,
  navigate,
}: Pick<AuthPageProps, "navigate"> & { demoAvailable: boolean }) {
  return (
    <AuthFrame>
      <section className="mx-auto mt-14 max-w-3xl text-center sm:mt-20">
        <Badge tone="primary">One journey, two spaces</Badge>
        <h1 className="mt-5 text-[32px] font-semibold tracking-[-0.045em] text-ink sm:text-[40px]">
          Welcome to TELOS
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-label leading-6 text-muted">
          Choose how you want to continue. Businesses manage their client journey; customers follow
          the progress shared with them.
        </p>
        <div className="mt-9 grid gap-4 text-left sm:grid-cols-2">
          <RoleCard
            description="Manage leads, follow-ups, clients, and projects for your service business."
            href="/business/login"
            icon="briefcase"
            navigate={navigate}
            title="Business or freelancer"
          />
          <RoleCard
            description="Open a project portal or request access from a business you work with."
            href="/customer/login"
            icon="users"
            navigate={navigate}
            title="Customer"
          />
        </div>
        {demoAvailable && (
          <p className="mt-8 text-caption text-muted">
            Looking at the local prototype?{" "}
            <a className="font-semibold text-primary hover:underline" href="/">
              Return to the demo
            </a>
          </p>
        )}
      </section>
    </AuthFrame>
  );
}

function RoleCard({
  description,
  href,
  icon,
  navigate,
  title,
}: {
  description: string;
  href: string;
  icon: "briefcase" | "users";
  navigate: Navigate;
  title: string;
}) {
  return (
    <InternalLink
      className="group rounded-panel border border-line bg-surface p-5 text-left no-underline shadow-panel transition-colors hover:border-primary/40 sm:p-6"
      href={href}
      navigate={navigate}
    >
      <span className="inline-flex size-11 items-center justify-center rounded-control bg-primary-soft text-primary">
        <Icon className="size-5" name={icon} />
      </span>
      <h2 className="mt-5 text-title font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-label leading-6 text-muted">{description}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-label font-semibold text-primary">
        Continue
        <Icon
          className="size-4 transition-transform group-hover:translate-x-0.5"
          name="arrow-right"
        />
      </span>
    </InternalLink>
  );
}

export function LoginPage({
  client,
  configured,
  error,
  mode,
  navigate,
  user,
}: AuthPageProps & { mode: LoginMode }) {
  const business = mode === "business";
  const title = business ? "Your business, moving forward." : "Your project, in one place.";
  const heading = business ? "Sign in to your workspace" : "Sign in to your client portal";

  async function continueWithGoogle() {
    if (!client) return;
    try {
      await signInWithGoogle(client, mode);
    } catch (cause) {
      navigateError(cause);
    }
  }

  const [actionError, setActionError] = useState<string | null>(null);

  function navigateError(cause: unknown) {
    setActionError(cause instanceof Error ? cause.message : "Google sign-in could not be started.");
  }

  return (
    <AuthFrame>
      <div className="mx-auto mt-12 grid max-w-4xl overflow-hidden rounded-panel border border-line bg-surface shadow-panel sm:mt-16 md:grid-cols-[1.1fr_0.9fr]">
        <section className="flex min-h-72 flex-col justify-between bg-primary p-6 text-white sm:p-9">
          <span className="text-caption font-semibold uppercase tracking-[0.1em] text-white/75">
            {business ? "For service businesses" : "For customers"}
          </span>
          <div>
            <h1 className="max-w-sm text-[28px] font-semibold leading-tight tracking-[-0.04em] sm:text-[34px]">
              {title}
            </h1>
            <p className="mt-4 max-w-sm text-label leading-6 text-white/80">
              {business
                ? "Keep every lead, next step, and active project connected."
                : "See updates, milestones, and messages that your business shares with you."}
            </p>
          </div>
          <p className="text-caption text-white/70">A clear view of the work, for everyone.</p>
        </section>
        <section className="flex flex-col justify-center p-6 sm:p-9">
          <p className="text-caption font-semibold uppercase tracking-[0.09em] text-muted">
            {business ? "Business workspace" : "Client portal"}
          </p>
          <h2 className="mt-2 text-title font-semibold text-ink">{heading}</h2>
          <p className="mt-2 text-label leading-6 text-muted">
            Continue securely with Google or your email address.
          </p>

          {user ? (
            <div className="mt-6 rounded-control bg-canvas p-4">
              <p className="text-label font-medium text-ink">Signed in as {user.email}</p>
              <Button
                className="mt-3 w-full"
                onClick={() => navigate(business ? "/business/verify" : "/customer/access")}
              >
                Continue
                <Icon className="size-4" name="arrow-right" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                className="mt-6 w-full"
                disabled={!configured}
                onClick={() => void continueWithGoogle()}
                variant="secondary"
              >
                <GoogleMark />
                Continue with Google
              </Button>
              <div className="my-5 flex items-center gap-3 text-caption text-muted">
                <span className="h-px flex-1 bg-line" />
                or use email
                <span className="h-px flex-1 bg-line" />
              </div>
              <EmailLoginForm client={client} configured={configured} mode={mode} />
            </>
          )}

          {!configured && (
            <p className="mt-3 rounded-control bg-warm-soft px-3 py-2 text-caption leading-5 text-warm">
              Sign-in is not connected yet. Configure a Supabase project to use this securely.
            </p>
          )}
          {(error || actionError) && (
            <p className="mt-3 text-caption leading-5 text-warm" role="alert">
              {error ?? actionError}
            </p>
          )}
          <p className="mt-5 text-caption leading-5 text-muted">
            By continuing, you agree to use TELOS for the account type selected here. Your account
            can also access the other space with this same Google identity.
          </p>
          <InternalLink
            className="mt-5 inline-flex items-center gap-1 text-label font-semibold text-primary no-underline hover:underline"
            href="/login"
            navigate={navigate}
          >
            Choose another space
            <Icon className="size-4" name="arrow-right" />
          </InternalLink>
        </section>
      </div>
    </AuthFrame>
  );
}

type EmailMethod = "password" | "signup" | "link";

const emailMethods: { id: EmailMethod; label: string }[] = [
  { id: "password", label: "Sign in" },
  { id: "signup", label: "Create account" },
  { id: "link", label: "Email link" },
];

function EmailLoginForm({
  client,
  configured,
  mode,
}: {
  client: AppSupabaseClient | null;
  configured: boolean;
  mode: LoginMode;
}) {
  const [method, setMethod] = useState<EmailMethod>("password");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const usesPassword = method !== "link";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (usesPassword && method === "signup" && password.length < 8) {
      setMessage({ tone: "error", text: "Use a password with at least 8 characters." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      if (method === "password") {
        await signInWithEmailPassword(client, email, password);
      } else if (method === "signup") {
        const signedIn = await signUpWithEmailPassword(client, mode, email, password);
        if (!signedIn) {
          setMessage({
            tone: "info",
            text: "Check your inbox to confirm your email address, then sign in.",
          });
        }
      } else {
        await signInWithEmailLink(client, mode, email);
        setMessage({ tone: "info", text: "We sent you a secure sign-in link. Check your inbox." });
      }
    } catch (cause) {
      setMessage({
        tone: "error",
        text: cause instanceof Error ? cause.message : "Email sign-in failed. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={(event) => void submit(event)}>
      <div className="grid grid-cols-3 gap-1 rounded-control bg-canvas p-1" role="group">
        {emailMethods.map((item) => (
          <button
            aria-pressed={method === item.id}
            className={`min-h-9 rounded-[8px] px-2 text-caption font-semibold ${
              method === item.id ? "bg-surface text-primary shadow-panel" : "text-muted"
            }`}
            key={item.id}
            onClick={() => {
              setMethod(item.id);
              setMessage(null);
            }}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="block space-y-1.5 text-label font-medium text-ink">
        Email
        <input
          autoComplete="email"
          className={inputClass}
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </label>
      {usesPassword && (
        <label className="block space-y-1.5 text-label font-medium text-ink">
          Password
          <input
            autoComplete={method === "signup" ? "new-password" : "current-password"}
            className={inputClass}
            maxLength={128}
            minLength={method === "signup" ? 8 : undefined}
            name="password"
            required
            type="password"
          />
        </label>
      )}
      <Button className="w-full" disabled={!configured || busy} type="submit">
        {busy
          ? "Please wait…"
          : method === "password"
            ? "Sign in with email"
            : method === "signup"
              ? "Create account"
              : "Email me a sign-in link"}
      </Button>
      {message && (
        <p
          className={`text-caption leading-5 ${message.tone === "error" ? "text-warm" : "text-success"}`}
          role={message.tone === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}

function GoogleMark() {
  return (
    <span aria-hidden="true" className="text-label font-bold text-[#4285f4]">
      G
    </span>
  );
}

export function AuthCallbackPage({ error, navigate, user }: AuthPageProps) {
  useEffect(() => {
    if (!user) return;
    const mode = new URLSearchParams(window.location.search).get("mode");
    navigate(mode === "business" ? "/business/verify" : "/customer/access");
  }, [navigate, user]);

  return (
    <AuthFrame>
      <div className="mx-auto mt-20 max-w-lg">
        <Card className="p-6 sm:p-8">
          <h1 className="text-title font-semibold text-ink">
            {error ? "Sign-in could not be completed" : "Completing secure sign-in…"}
          </h1>
          {error && <p className="mt-3 text-label leading-6 text-warm">{error}</p>}
          {!user && !error && <p className="mt-3 text-label text-muted">Please wait a moment.</p>}
        </Card>
      </div>
    </AuthFrame>
  );
}

export function BusinessVerificationPage({ client, error, navigate, user }: AuthPageProps) {
  const [application, setApplication] = useState<BusinessApplication | null>(null);
  const [loading, setLoading] = useState(Boolean(client && user));
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client || !user) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setLoading(true);
      void getBusinessApplication(client, user)
        .then((result) => {
          if (active) setApplication(result);
        })
        .catch((cause: unknown) => {
          if (active)
            setFormError(
              cause instanceof Error ? cause.message : "Could not load verification status.",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });
    return () => {
      active = false;
    };
  }, [client, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !user) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const businessName = String(values.get("businessName") ?? "").trim();
    const contactEmail = String(values.get("contactEmail") ?? "").trim();
    const description = String(values.get("description") ?? "").trim();
    const website = String(values.get("website") ?? "").trim();
    if (description.length < 10) {
      setFormError("Please describe your business in at least 10 characters.");
      return;
    }
    if (website && !/^https?:\/\/\S+\.\S+/i.test(website)) {
      setFormError("Enter a complete website URL starting with https://.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await submitBusinessApplication(client, user, {
        businessName,
        contactEmail,
        description,
        website,
      });
      setApplication({
        business_name: businessName,
        contact_email: contactEmail,
        description,
        status: "pending",
        website: website || null,
      });
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : "Could not submit your business details.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function leaveAccount() {
    if (!client) return;
    try {
      await signOut(client);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Could not sign out.");
    }
  }

  if (!user) {
    return (
      <AuthFrame>
        <InfoPanel
          action={() => navigate("/business/login")}
          actionLabel="Business sign in"
          description="Sign in with Google to submit business details for review."
          title="Business sign-in required"
        />
      </AuthFrame>
    );
  }
  if (loading) {
    return (
      <AuthFrame>
        <InfoPanel description="Loading your verification status…" title="One moment" />
      </AuthFrame>
    );
  }
  if (application?.status === "approved") {
    return (
      <AuthFrame>
        <InfoPanel
          action={() => navigate("/")}
          actionLabel="Open business workspace"
          description="Your business has been verified. You can now use your workspace."
          title="Verification complete"
          tone="success"
        />
      </AuthFrame>
    );
  }
  if (application?.status === "pending") {
    return (
      <AuthFrame>
        <InfoPanel
          action={() => navigate("/business/preview")}
          actionLabel="View read-only platform preview"
          description="Your details are in review. You can browse the sample platform, but workspace actions stay locked until approval."
          title="Verification in progress"
        >
          <p className="mt-3 text-caption text-muted">
            Submitted for {application.business_name} · {application.contact_email}
          </p>
          <Button className="mt-4" onClick={() => void leaveAccount()} variant="quiet">
            Sign out
          </Button>
        </InfoPanel>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <div className="mx-auto mt-10 max-w-2xl">
        <div className="mb-5">
          <Badge tone={application?.status === "rejected" ? "warm" : "primary"}>
            Business verification
          </Badge>
          <h1 className="mt-3 text-page-title font-semibold tracking-[-0.04em] text-ink">
            Tell us about your business
          </h1>
          <p className="mt-2 text-label leading-6 text-muted">
            We review each business before enabling workspace actions. Google sign-in verifies your
            account, not your business. No document uploads are required in this step.
          </p>
        </div>
        <Card className="p-5 sm:p-7">
          {application?.status === "rejected" && (
            <p className="mb-4 rounded-control bg-warm-soft px-3 py-2 text-label text-warm">
              Your previous application was not approved. You can update the information and submit
              again.
            </p>
          )}
          <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            <label className="block space-y-1.5 text-label font-medium text-ink">
              Business or trading name <span className="text-primary">*</span>
              <input
                className={inputClass}
                defaultValue={application?.business_name ?? ""}
                maxLength={160}
                minLength={2}
                name="businessName"
                required
              />
            </label>
            <label className="block space-y-1.5 text-label font-medium text-ink">
              Business contact email <span className="text-primary">*</span>
              <input
                className={inputClass}
                defaultValue={application?.contact_email ?? user.email ?? ""}
                maxLength={254}
                name="contactEmail"
                required
                type="email"
              />
              <span className="block text-caption font-normal text-muted">
                Customers use this address to find your business when requesting project access.
              </span>
            </label>
            <label className="block space-y-1.5 text-label font-medium text-ink">
              Website (optional)
              <input
                className={inputClass}
                defaultValue={application?.website ?? ""}
                maxLength={2048}
                name="website"
                placeholder="https://yourbusiness.com"
                type="url"
              />
            </label>
            <label className="block space-y-1.5 text-label font-medium text-ink">
              What does your business do? <span className="text-primary">*</span>
              <textarea
                className={`${inputClass} min-h-28 py-3`}
                defaultValue={application?.description ?? ""}
                maxLength={1200}
                minLength={10}
                name="description"
                required
              />
            </label>
            {formError && (
              <p className="text-label text-warm" role="alert">
                {formError}
              </p>
            )}
            {error && (
              <p className="text-label text-warm" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button disabled={saving} type="submit">
                {saving ? "Submitting…" : "Submit for verification"}
              </Button>
              <Button onClick={() => void leaveAccount()} variant="secondary">
                Sign out
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AuthFrame>
  );
}

export function BusinessAccessGate({
  client,
  configured,
  error,
  navigate,
  user,
  children,
  previewOnly = false,
}: AuthPageProps & { children: ReactNode; previewOnly?: boolean }) {
  const [application, setApplication] = useState<BusinessApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !user) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setLoading(true);
      void getBusinessApplication(client, user)
        .then((result) => {
          if (active) setApplication(result);
        })
        .catch((cause: unknown) => {
          if (active)
            setApplicationError(
              cause instanceof Error ? cause.message : "Could not verify business access.",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });
    return () => {
      active = false;
    };
  }, [client, user]);

  if (!user) {
    return (
      <LoginChoicePage demoAvailable={!configured && import.meta.env.DEV} navigate={navigate} />
    );
  }
  if (loading) {
    return (
      <AuthFrame>
        <InfoPanel
          description="Checking your business approval…"
          title="Securely checking access"
        />
      </AuthFrame>
    );
  }
  if (error || applicationError) {
    return (
      <AuthFrame>
        <InfoPanel
          description={error ?? applicationError ?? "Could not check access."}
          title="Access check failed"
        />
      </AuthFrame>
    );
  }
  if (application?.status !== "approved") {
    if (previewOnly && application?.status === "pending") {
      return <BusinessPreviewPage navigate={navigate} />;
    }
    return (
      <AuthFrame>
        <InfoPanel
          action={() =>
            navigate(application?.status === "pending" ? "/business/verify" : "/business/verify")
          }
          actionLabel={
            application?.status === "pending"
              ? "Check verification status"
              : "Submit business details"
          }
          description={
            application?.status === "pending"
              ? "You can view the read-only sample workspace while we review your business. Real workspace actions are blocked until approval."
              : application?.status === "rejected"
                ? "Your business needs more review before workspace actions can be enabled."
                : "Submit basic business details for review. Workspace actions remain locked until a reviewer approves your application."
          }
          title={
            application?.status === "pending"
              ? "Business verification pending"
              : application?.status === "rejected"
                ? "Verification needs attention"
                : "Verify your business to continue"
          }
        />
      </AuthFrame>
    );
  }

  if (previewOnly) {
    return (
      <AuthFrame>
        <InfoPanel
          action={() => navigate("/")}
          actionLabel="Open verified workspace"
          description="Your business is verified. The preview is no longer needed."
          title="Verification complete"
          tone="success"
        />
      </AuthFrame>
    );
  }

  return <>{children}</>;
}

export function BusinessPreviewPage({ navigate }: Pick<AuthPageProps, "navigate">) {
  return (
    <AuthFrame>
      <div className="mx-auto mt-10 max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="warm">Read-only preview</Badge>
            <h1 className="mt-3 text-page-title font-semibold tracking-[-0.04em] text-ink">
              A workspace for the whole client journey
            </h1>
            <p className="mt-2 text-label leading-6 text-muted">
              This sample view uses demo content only. No customer information or business records
              are available while verification is pending.
            </p>
          </div>
          <Button onClick={() => navigate("/business/verify")} variant="secondary">
            Verification status
          </Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["New leads", "02"],
            ["Follow-ups", "02"],
            ["Active projects", "01"],
            ["Pipeline", "$31,700"],
          ].map(([label, value]) => (
            <Card className="p-4" key={label}>
              <p className="text-label text-muted">{label}</p>
              <p className="mt-3 text-title font-semibold text-ink">{value}</p>
            </Card>
          ))}
        </div>
        <Card className="mt-4 p-5 sm:p-6">
          <h2 className="text-title font-semibold text-ink">Workspace access is locked</h2>
          <p className="mt-2 max-w-2xl text-label leading-6 text-muted">
            You can look around this sample dashboard while the team reviews your application.
            Adding leads, sending follow-ups, and opening business records will be enabled only
            after verification is approved.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button disabled title="Available after business verification">
              Add lead
            </Button>
            <Button disabled title="Available after business verification" variant="secondary">
              Schedule follow-up
            </Button>
          </div>
        </Card>
      </div>
    </AuthFrame>
  );
}

export function CustomerAccessPage({ client, configured, error, navigate, user }: AuthPageProps) {
  const [requests, setRequests] = useState<CustomerAccessRequest[]>([]);
  const [loading, setLoading] = useState(Boolean(client && user));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!client || !user) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setLoading(true);
      void listCustomerAccessRequests(client)
        .then((result) => {
          if (active) setRequests(result);
        })
        .catch((cause: unknown) => {
          if (active)
            setFormError(
              cause instanceof Error ? cause.message : "Could not load your access requests.",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });
    return () => {
      active = false;
    };
  }, [client, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !user) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const businessEmail = String(values.get("businessEmail") ?? "").trim();
    const projectReference = String(values.get("projectReference") ?? "").trim();
    const note = String(values.get("note") ?? "").trim();
    setSaving(true);
    setFormError(null);
    setSuccess(false);
    try {
      await submitCustomerAccessRequest(client, { businessEmail, projectReference, note });
      setSuccess(true);
      form.reset();
      try {
        setRequests(await listCustomerAccessRequests(client));
      } catch {
        setFormError("Your request was sent, but its history could not be refreshed.");
      }
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Could not submit your request.");
    } finally {
      setSaving(false);
    }
  }

  async function leaveAccount() {
    if (!client) return;
    try {
      await signOut(client);
      navigate("/customer/login");
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Could not sign out.");
    }
  }

  if (!user) {
    return (
      <AuthFrame>
        <InfoPanel
          action={() => navigate("/customer/login")}
          actionLabel={configured ? "Customer sign in" : "Set up customer sign-in"}
          description={
            configured
              ? "Sign in with Google, then request access to a project."
              : "Customer access requests require a configured Supabase project and Google sign-in."
          }
          title="Customer account required"
        />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <div className="mx-auto mt-10 max-w-2xl">
        <Badge tone="primary">Customer portal</Badge>
        <h1 className="mt-3 text-page-title font-semibold tracking-[-0.04em] text-ink">
          Request access to a project
        </h1>
        <p className="mt-2 text-label leading-6 text-muted">
          Signed in as {user.email}. Enter the business contact email and project reference they
          shared with you. The business must approve your request before any project information is
          available.
        </p>
        <Card className="mt-5 p-5 sm:p-7">
          <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            <label className="block space-y-1.5 text-label font-medium text-ink">
              Business contact email
              <input
                className={inputClass}
                maxLength={254}
                name="businessEmail"
                required
                type="email"
              />
            </label>
            <label className="block space-y-1.5 text-label font-medium text-ink">
              Project reference
              <input
                className={inputClass}
                maxLength={160}
                minLength={3}
                name="projectReference"
                placeholder="The reference provided by your business"
                required
              />
            </label>
            <label className="block space-y-1.5 text-label font-medium text-ink">
              Note (optional)
              <textarea
                className={`${inputClass} min-h-24 py-3`}
                maxLength={1000}
                name="note"
                placeholder="Add context for the business"
              />
            </label>
            {formError && (
              <p className="text-label text-warm" role="alert">
                {formError}
              </p>
            )}
            {error && (
              <p className="text-label text-warm" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p
                className="rounded-control bg-success-soft px-3 py-2 text-label text-success"
                role="status"
              >
                Request sent. The business must approve it before you can see project information.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button disabled={saving} type="submit">
                {saving ? "Sending…" : "Request project access"}
              </Button>
              <Button onClick={() => void leaveAccount()} variant="secondary">
                Sign out
              </Button>
            </div>
          </form>
        </Card>

        <section aria-labelledby="request-history-title" className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-title font-semibold text-ink" id="request-history-title">
              Your requests
            </h2>
            {loading && <span className="text-caption text-muted">Loading…</span>}
          </div>
          {requests.length === 0 ? (
            <p className="mt-3 text-label text-muted">
              No access requests yet. Approved requests will appear here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {requests.map((request) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-surface p-4"
                  key={request.id}
                >
                  <div>
                    <p className="text-label font-medium text-ink">{request.project_reference}</p>
                    <p className="mt-1 text-caption text-muted">{request.business_email}</p>
                  </div>
                  <Badge
                    tone={
                      request.status === "approved"
                        ? "success"
                        : request.status === "rejected"
                          ? "warm"
                          : "neutral"
                    }
                  >
                    {request.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AuthFrame>
  );
}

export function BusinessRequestsPage({ client, navigate, user }: AuthPageProps) {
  const [requests, setRequests] = useState<CustomerAccessRequest[]>([]);
  const [loading, setLoading] = useState(Boolean(client && user));
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !user) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setLoading(true);
      void listCustomerAccessRequests(client)
        .then((result) => {
          if (active) setRequests(result);
        })
        .catch((cause: unknown) => {
          if (active)
            setError(cause instanceof Error ? cause.message : "Could not load access requests.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });
    return () => {
      active = false;
    };
  }, [client, user]);

  async function review(requestId: string, status: "approved" | "rejected") {
    if (!client) return;
    setBusyId(requestId);
    setError(null);
    try {
      await updateCustomerAccessRequest(client, requestId, status);
      setRequests((current) =>
        current.map((request) => (request.id === requestId ? { ...request, status } : request)),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this request.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AuthFrame>
      <div className="mx-auto mt-10 max-w-3xl">
        <InternalLink
          className="text-label font-semibold text-primary no-underline"
          href="/"
          navigate={navigate}
        >
          Back to workspace
        </InternalLink>
        <h1 className="mt-4 text-page-title font-semibold tracking-[-0.04em] text-ink">
          Customer access requests
        </h1>
        <p className="mt-2 text-label leading-6 text-muted">
          Approve only customers you recognize. Approval records the decision; project data access
          is granted separately when portal project permissions are connected.
        </p>
        {loading && <p className="mt-5 text-label text-muted">Loading requests…</p>}
        {error && (
          <p className="mt-5 text-label text-warm" role="alert">
            {error}
          </p>
        )}
        {!loading && requests.length === 0 && (
          <Card className="mt-5 p-6 text-label text-muted">No customer access requests yet.</Card>
        )}
        <ul className="mt-5 space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-label font-semibold text-ink">{request.project_reference}</p>
                  <p className="mt-1 text-caption text-muted">
                    {request.business_email} · {new Date(request.created_at).toLocaleDateString()}
                  </p>
                  {request.note && <p className="mt-2 text-label text-muted">{request.note}</p>}
                  <p className="mt-2 text-label text-ink">{request.status}</p>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      disabled={busyId === request.id}
                      onClick={() => void review(request.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      disabled={busyId === request.id}
                      onClick={() => void review(request.id, "rejected")}
                      variant="secondary"
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </AuthFrame>
  );
}

function InfoPanel({
  action,
  actionLabel,
  children,
  description,
  title,
  tone = "primary",
}: {
  action?: () => void;
  actionLabel?: string;
  children?: ReactNode;
  description: string;
  title: string;
  tone?: "primary" | "success";
}) {
  return (
    <div className="mx-auto mt-16 max-w-xl">
      <Card className="p-6 sm:p-8">
        <Badge tone={tone}>{tone === "success" ? "Verified" : "TELOS workspace"}</Badge>
        <h1 className="mt-4 text-title font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-label leading-6 text-muted">{description}</p>
        {children}
        {action && actionLabel && (
          <Button className="mt-5" onClick={action}>
            {actionLabel}
            <Icon className="size-4" name="arrow-right" />
          </Button>
        )}
      </Card>
    </div>
  );
}
