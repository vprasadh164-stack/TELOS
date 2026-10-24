import { useState, type FormEvent } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";

export type NewLeadInput = {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  estimatedValue?: number;
};

const serviceCategories = [
  "Renovation",
  "Web design",
  "Landscaping",
  "Painting",
  "Cleaning",
  "Photography",
  "Plumbing & electrical",
  "Marketing",
  "Other",
];

const inputClass = "min-h-10 w-full rounded-control border border-line bg-surface px-3 text-label";

function storageKey(scope: string) {
  return `telos:onboarding:${scope}`;
}

function readStored(scope: string) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(scope)) ?? "{}") as {
      category?: string;
      dismissed?: boolean;
    };
  } catch {
    return {};
  }
}

function writeStored(scope: string, value: { category?: string; dismissed?: boolean }) {
  try {
    localStorage.setItem(storageKey(scope), JSON.stringify({ ...readStored(scope), ...value }));
  } catch {
    // Onboarding preferences are optional; ignore storage failures.
  }
}

function OnboardingWizard({
  businessName,
  onAddLead,
  scope,
}: {
  businessName: string;
  onAddLead: (input: NewLeadInput) => void;
  scope: string;
}) {
  const [dismissed, setDismissed] = useState(() => Boolean(readStored(scope).dismissed));
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState(() => readStored(scope).category ?? "");
  const [error, setError] = useState("");

  if (dismissed) return null;

  function chooseCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!category) {
      setError("Choose the service you offer.");
      return;
    }
    writeStored(scope, { category });
    setError("");
    setStep(2);
  }

  function addFirstLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) {
      setError("Enter your first lead's name.");
      return;
    }
    onAddLead({
      name,
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      source: category,
    });
    writeStored(scope, { dismissed: true });
    setDismissed(true);
  }

  function skip() {
    writeStored(scope, { dismissed: true });
    setDismissed(true);
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption font-semibold uppercase tracking-[0.09em] text-primary">
            Step {step} of 2 · Set up {businessName}
          </p>
          <h2 className="mt-2 text-title font-semibold text-ink">
            {step === 1 ? "What service do you offer?" : "Add your first lead"}
          </h2>
          <p className="mt-1 max-w-xl text-label leading-6 text-muted">
            {step === 1
              ? "This tailors your workspace. You can change it later."
              : `Who is your first ${category.toLowerCase()} customer or enquiry? You can add more from Leads.`}
          </p>
        </div>
        <Button onClick={skip} variant="quiet">
          Skip setup
        </Button>
      </div>

      {step === 1 ? (
        <form className="mt-5 space-y-4" onSubmit={chooseCategory}>
          <fieldset>
            <legend className="sr-only">Service category</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {serviceCategories.map((item) => (
                <label
                  className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-control border px-3 text-label font-medium ${
                    category === item
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-line bg-surface text-ink"
                  }`}
                  key={item}
                >
                  <input
                    checked={category === item}
                    className="accent-[var(--color-primary)]"
                    name="category"
                    onChange={() => setCategory(item)}
                    type="radio"
                    value={item}
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="text-label text-warm" role="alert">
              {error}
            </p>
          )}
          <Button type="submit">
            Continue
            <Icon className="size-4" name="arrow-right" />
          </Button>
        </form>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={addFirstLead}>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1.5 text-label font-medium text-ink">
              Name <span className="text-primary">*</span>
              <input autoFocus className={inputClass} maxLength={120} name="name" required />
            </label>
            <label className="space-y-1.5 text-label font-medium text-ink">
              Email
              <input className={inputClass} maxLength={254} name="email" type="email" />
            </label>
            <label className="space-y-1.5 text-label font-medium text-ink">
              Phone
              <input className={inputClass} maxLength={40} name="phone" type="tel" />
            </label>
          </div>
          {error && (
            <p className="text-label text-warm" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setStep(1)} variant="secondary">
              Back
            </Button>
            <Button type="submit">
              <Icon className="size-4" name="plus" />
              Add lead and finish
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default OnboardingWizard;
