"use client";

import { Badge, BadgeCount } from "@/components/ui/Badge";
import type { BadgeCountDirection } from "@/types/ui/BadgeCount-types";

const bellIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const chatIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const mailIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const groupIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const positions: { dir: BadgeCountDirection; label: string }[] = [
  { dir: "right-top", label: "Right top" },
  { dir: "left-top", label: "Left top" },
  { dir: "right-bottom", label: "Right bottom" },
  { dir: "left-bottom", label: "Left bottom" },
  { dir: "middle-top", label: "Middle top" },
  { dir: "middle-bottom", label: "Middle bottom" },
];

export function NotificationPatternsTab() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Notification Bell</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {positions.map(({ dir, label }) => (
            <div key={dir} className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
              <BadgeCount direction={dir} count={3} rule="negative">
                {bellIcon}
              </BadgeCount>
              <span className="text-muted text-xs">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Toast Notifications</h3>
        <div className="flex flex-col gap-4">
          <div className="surface flex items-start gap-4 rounded-lg border p-5 shadow-sm">
            <span className="mt-1">
              <Badge variant="success" size="sm">New</Badge>
            </span>
            <div className="flex-1">
              <p className="text-base font-medium">Payment received</p>
              <p className="text-muted text-sm">$249.00 from Acme Corp</p>
            </div>
            <span className="text-muted text-sm">2m ago</span>
          </div>
          <div className="surface flex items-start gap-4 rounded-lg border p-5 shadow-sm">
            <span className="mt-1">
              <Badge variant="warning" size="sm">Pending</Badge>
            </span>
            <div className="flex-1">
              <p className="text-base font-medium">Invoice due soon</p>
              <p className="text-muted text-sm">Invoice #1042 due in 3 days</p>
            </div>
            <span className="text-muted text-sm">1h ago</span>
          </div>
          <div className="surface flex items-start gap-4 rounded-lg border p-5 shadow-sm">
            <span className="mt-1">
              <Badge variant="error" size="sm">Failed</Badge>
            </span>
            <div className="flex-1">
              <p className="text-base font-medium">Subscription renewal failed</p>
              <p className="text-muted text-sm">Please update your payment method</p>
            </div>
            <span className="text-muted text-sm">3h ago</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Message Notifications</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
            <BadgeCount direction="right-top" count={5} rule="negative">
              {chatIcon}
            </BadgeCount>
            <span className="text-muted text-xs">Chat</span>
          </div>
          <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
            <BadgeCount direction="left-top" count={12} rule="negative">
              {mailIcon}
            </BadgeCount>
            <span className="text-muted text-xs">Mail</span>
          </div>
          <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
            <BadgeCount direction="right-bottom" count={3} rule="negative">
              {groupIcon}
            </BadgeCount>
            <span className="text-muted text-xs">Groups</span>
          </div>
          <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
            <BadgeCount direction="middle-top" count={99} max={99} rule="negative">
              {bellIcon}
            </BadgeCount>
            <span className="text-muted text-xs">Overflow 99+</span>
          </div>
          <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
            <BadgeCount direction="right-top" count={0} rule="negative" showZero>
              {bellIcon}
            </BadgeCount>
            <span className="text-muted text-xs">Zero count</span>
          </div>
          <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
            <BadgeCount direction="right-top" count={0} rule="negative" dot>
              {bellIcon}
            </BadgeCount>
            <span className="text-muted text-xs">Dot only</span>
          </div>
        </div>
      </section>
    </div>
  );
}
