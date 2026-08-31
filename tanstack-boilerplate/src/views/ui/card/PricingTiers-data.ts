export const tiers = [
  {
    name: "Starter",
    price: 19,
    description: "Perfect for side projects and experiments.",
    cta: "Start free trial",
    popular: false,
    logos: ["Vercel", "Netlify", "Cloudflare"],
  },
  {
    name: "Professional",
    price: 49,
    description: "For growing teams that need more power.",
    cta: "Start free trial",
    popular: true,
    logos: ["Stripe", "Supabase", "PlanetScale"],
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For large organizations with custom needs.",
    cta: "Contact sales",
    popular: false,
    logos: ["AWS", "Google Cloud", "Azure"],
  },
];

export const sections = [
  {
    name: "Features",
    features: [
      { name: "Cloud storage", tiers: ["5 GB", "50 GB", "Unlimited"] },
      { name: "Team members", tiers: ["1", "Up to 10", "Unlimited"] },
      { name: "API requests", tiers: ["10k / mo", "100k / mo", "Unlimited"] },
      { name: "Integrations", tiers: ["Basic", "Advanced", "Custom"] },
    ],
  },
  {
    name: "Support",
    features: [
      { name: "Community forum", tiers: [true, true, true] },
      { name: "Email support", tiers: [true, true, true] },
      { name: "Priority chat support", tiers: [false, true, true] },
      { name: "Dedicated account manager", tiers: [false, false, true] },
      { name: "Custom SLA", tiers: [false, false, true] },
    ],
  },
  {
    name: "Security & Compliance",
    features: [
      { name: "SSL certificates", tiers: [true, true, true] },
      { name: "SOC 2 Type II", tiers: [false, true, true] },
      { name: "SSO / SAML", tiers: [false, false, true] },
      { name: "Custom data retention", tiers: [false, false, true] },
    ],
  },
];
