import { describe, it, expect } from 'vitest';
import { getTierView } from './tier-view';
import type { ComponentType } from 'react';

const FreeView: ComponentType = () => null;
const BasicView: ComponentType = () => null;
const MediumView: ComponentType = () => null;
const PremiumView: ComponentType = () => null;

const views = {
  FREE: FreeView,
  BASIC: BasicView,
  MEDIUM: MediumView,
  PREMIUM: PremiumView,
};

describe('getTierView', () => {
  it('resolves FREE to FreeView', () => {
    expect(getTierView('FREE', views)).toBe(FreeView);
  });

  it('resolves BASIC to BasicView', () => {
    expect(getTierView('BASIC', views)).toBe(BasicView);
  });

  it('resolves MEDIUM to MediumView', () => {
    expect(getTierView('MEDIUM', views)).toBe(MediumView);
  });

  it('resolves PREMIUM to PremiumView', () => {
    expect(getTierView('PREMIUM', views)).toBe(PremiumView);
  });

  it('falls back to FREE for null', () => {
    expect(getTierView(null, views)).toBe(FreeView);
  });

  it('falls back to FREE for undefined', () => {
    expect(getTierView(undefined, views)).toBe(FreeView);
  });

  it('falls back to FREE for unknown tier string', () => {
    expect(getTierView('UNKNOWN', views)).toBe(FreeView);
  });
});
