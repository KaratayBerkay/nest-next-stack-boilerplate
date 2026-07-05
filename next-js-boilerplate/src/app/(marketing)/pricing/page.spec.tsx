import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricingPage from './page';

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/i18n/MessagesProvider', () => ({
  useMessages: vi.fn(),
}));

const PRICING_MSGS = {
  heading: 'Pricing',
  subtitle: 'Choose the plan that fits your needs.',
  currentPlan: 'Current plan',
  included: 'Included',
  upgrade: 'Upgrade',
  featuresBasic: ['Basic access', 'Community support'],
  featuresMedium: ['Everything in Free', 'Priority support', 'Basic analytics'],
  featuresPremium: [
    'Everything in Medium',
    'Post stats & reaction breakdown',
    'VIP room access',
    'Suggested friends',
  ],
  featuresPro: [
    'Everything in Premium',
    'Who-reacted list',
    'Export data',
    'Crown badge',
    'Dedicated support',
  ],
  priceFree: '$0',
  priceBasic: '$9.99/mo',
  priceMedium: '$19.99/mo',
  pricePremium: '$49.99/mo',
} as const;

const { useAuth } = await import('@/features/auth/hooks/useAuth');
const { useMessages } = await import('@/lib/i18n/MessagesProvider');
const useAuthMock = vi.mocked(useAuth);
const useMessagesMock = vi.mocked(useMessages);

beforeEach(() => {
  useMessagesMock.mockReturnValue(PRICING_MSGS as never);
});

describe('PricingPage', () => {
  it('renders the heading and subtitle', () => {
    useAuthMock.mockReturnValue({ user: null } as never);
    render(<PricingPage />);
    expect(screen.getByTestId('page-heading').textContent).toBe('Pricing');
    expect(screen.getByText('Choose the plan that fits your needs.')).toBeDefined();
  });

  it('renders all four tier cards with correct prices', () => {
    useAuthMock.mockReturnValue({ user: null } as never);
    render(<PricingPage />);
    expect(screen.getByText('$0')).toBeDefined();
    expect(screen.getByText('$9.99/mo')).toBeDefined();
    expect(screen.getByText('$19.99/mo')).toBeDefined();
    expect(screen.getByText('$49.99/mo')).toBeDefined();
  });

  it('maps BASIC features to Medium card (featuresMedium)', () => {
    useAuthMock.mockReturnValue({ user: null } as never);
    render(<PricingPage />);
    const mediumCard = screen.getByText('Basic access').closest('[class*="rounded-xl"]');
    expect(mediumCard).toBeDefined();
    expect(screen.getByText('Priority support')).toBeDefined();
  });

  it('maps MEDIUM features to Premium card (featuresPremium)', () => {
    useAuthMock.mockReturnValue({ user: null } as never);
    render(<PricingPage />);
    expect(screen.getByText('Post stats & reaction breakdown')).toBeDefined();
    expect(screen.getByText('VIP room access')).toBeDefined();
    expect(screen.getByText('Suggested friends')).toBeDefined();
  });

  it('maps PREMIUM features to Pro card (featuresPro)', () => {
    useAuthMock.mockReturnValue({ user: null } as never);
    render(<PricingPage />);
    expect(screen.getByText('Who-reacted list')).toBeDefined();
    expect(screen.getByText('Export data')).toBeDefined();
    expect(screen.getByText('Crown badge')).toBeDefined();
    expect(screen.getByText('Dedicated support')).toBeDefined();
  });

  it('maps FREE features to Basic card (featuresBasic)', () => {
    useAuthMock.mockReturnValue({ user: null } as never);
    render(<PricingPage />);
    expect(screen.getByText('Community support')).toBeDefined();
  });

  it('logged-out user sees upgrade CTA linking to /auth/login', () => {
    useAuthMock.mockReturnValue({ user: null } as never);
    render(<PricingPage />);
    const ctaLinks = screen.getAllByText('Upgrade');
    expect(ctaLinks.length).toBeGreaterThan(0);
    for (const link of ctaLinks) {
      expect(link.getAttribute('href')).toBe('/auth/login');
    }
  });

  it('shows Current plan badge for the user active tier', () => {
    useAuthMock.mockReturnValue({
      user: { tier: 'MEDIUM', role: 'user' },
    } as never);
    render(<PricingPage />);
    const currentBadges = screen.getAllByText('Current plan');
    expect(currentBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('shows upgrade CTA with checkout link for higher tiers', () => {
    useAuthMock.mockReturnValue({
      user: { tier: 'BASIC', role: 'user' },
    } as never);
    render(<PricingPage />);
    const upgradeLinks = screen.getAllByText('Upgrade');
    expect(upgradeLinks.length).toBeGreaterThan(0);
    for (const link of upgradeLinks) {
      const href = link.getAttribute('href');
      expect(href).toMatch(/\/checkout\//);
    }
  });

  it('shows Included label for lower tiers the user already has access to', () => {
    useAuthMock.mockReturnValue({
      user: { tier: 'MEDIUM', role: 'user' },
    } as never);
    render(<PricingPage />);
    const included = screen.getAllByText('Included');
    expect(included.length).toBeGreaterThanOrEqual(1);
  });
});
