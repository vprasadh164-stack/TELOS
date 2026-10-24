export type ServiceId = "plumbing" | "electrical" | "web-design";

export type Provider = {
  id: string;
  name: string;
  kind: "Freelancer" | "Company";
  service: ServiceId;
  rating: number;
  reviews: number;
  location: string;
  headline: string;
  pricing: string;
  portfolio: string[];
};

export const services: { id: ServiceId; name: string; blurb: string }[] = [
  { id: "plumbing", name: "Plumbing", blurb: "Leaks, fittings, bathroom and kitchen plumbing" },
  { id: "electrical", name: "Electrical", blurb: "Wiring, repairs, lighting and installations" },
  { id: "web-design", name: "Website building", blurb: "Freelancers and studios who build websites" },
];

// Sample listings for previewing the experience. Real businesses will replace these.
export const providers: Provider[] = [
  {
    id: "p1",
    name: "Ravi Kumar Plumbing",
    kind: "Freelancer",
    service: "plumbing",
    rating: 4.8,
    reviews: 126,
    location: "Within 15 km",
    headline: "Leak repair, pipe fitting and bathroom installs.",
    pricing: "Visit from ₹399 · jobs quoted after inspection",
    portfolio: ["Bathroom re-pipe, 2BHK", "Kitchen sink and RO fitting", "Overhead tank line repair"],
  },
  {
    id: "p2",
    name: "BlueFlow Services",
    kind: "Company",
    service: "plumbing",
    rating: 4.6,
    reviews: 340,
    location: "City-wide",
    headline: "Team of certified plumbers with 30-day work warranty.",
    pricing: "From ₹499 per visit · fixed-price packages",
    portfolio: [],
  },
  {
    id: "e1",
    name: "Anita Electricals",
    kind: "Freelancer",
    service: "electrical",
    rating: 4.9,
    reviews: 88,
    location: "Within 10 km",
    headline: "Home wiring, switchboards and fan/light installation.",
    pricing: "₹349 inspection · ₹150 per point installed",
    portfolio: ["Full flat rewiring", "Modular switchboard upgrade"],
  },
  {
    id: "e2",
    name: "VoltEdge Contractors",
    kind: "Company",
    service: "electrical",
    rating: 4.5,
    reviews: 212,
    location: "City-wide",
    headline: "Residential and small-office electrical work.",
    pricing: "Quoted per project · free site visit",
    portfolio: ["Office lighting retrofit", "Inverter and backup wiring"],
  },
  {
    id: "w1",
    name: "Meera Shah",
    kind: "Freelancer",
    service: "web-design",
    rating: 4.9,
    reviews: 64,
    location: "Remote",
    headline: "Fast, clean websites for small businesses and creators.",
    pricing: "Landing page from ₹12,000 · 5-page site from ₹30,000",
    portfolio: ["Cafe landing page", "Photographer portfolio", "Clinic booking site"],
  },
  {
    id: "w2",
    name: "Pixel & Pine Studio",
    kind: "Company",
    service: "web-design",
    rating: 4.7,
    reviews: 41,
    location: "Remote",
    headline: "Design and development team for business sites and web apps.",
    pricing: "Projects from ₹60,000 · monthly retainers available",
    portfolio: ["E-commerce store", "SaaS marketing site"],
  },
  {
    id: "w3",
    name: "Karthik Dev",
    kind: "Freelancer",
    service: "web-design",
    rating: 4.4,
    reviews: 19,
    location: "Remote",
    headline: "WordPress and Shopify builds, quick turnaround.",
    pricing: "From ₹8,000 per site",
    portfolio: [],
  },
];

export const selectedServiceKey = "telos:selected-service";

export function isServiceId(value: string | null): value is ServiceId {
  return services.some((item) => item.id === value);
}
