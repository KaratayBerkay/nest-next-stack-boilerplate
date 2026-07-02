// Fallback for unmatched slot states. When a navigation matches `children` but
// not this slot, Next renders `default.tsx` instead of 404ing. Null is a valid,
// graceful fallback for this demo.
export default function AnalyticsDefault() {
  return null;
}
