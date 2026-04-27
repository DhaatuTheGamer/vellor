import { describe, it, expect } from 'vitest';
import { useStore, useDerivedData, useData } from '../../store';

describe('useData export', () => {
  it('should be the same as useStore', () => {
    expect(useData).toBe(useStore);
  });

  it('should have a derived property that is useDerivedData', () => {
    expect(useData.derived).toBe(useDerivedData);
  });
});
