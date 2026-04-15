import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../../store';

describe('UISlice', () => {
  beforeEach(() => {
    // Reset store state
    useStore.setState({
      toasts: [],
      activityLog: [],
    });
    vi.useRealTimers();
  });

  describe('addToast', () => {
    it('adds a toast with the default info type', () => {
      useStore.getState().addToast('Test message');

      const toasts = useStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('info');
      expect(toasts[0].id).toBeDefined();
    });

    it('adds a toast with a specified type', () => {
      useStore.getState().addToast('Success message', 'success');

      const toasts = useStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Success message');
      expect(toasts[0].type).toBe('success');
    });

    it('removes the toast after 4000ms', () => {
      vi.useFakeTimers();

      useStore.getState().addToast('Timed message');

      expect(useStore.getState().toasts).toHaveLength(1);

      // Advance timers by less than 4000ms
      vi.advanceTimersByTime(3999);
      expect(useStore.getState().toasts).toHaveLength(1);

      // Advance timers to reach 4000ms
      vi.advanceTimersByTime(1);
      expect(useStore.getState().toasts).toHaveLength(0);

      vi.useRealTimers();
    });
  });

  describe('logActivity', () => {
    it('adds a new activity to the start of the log', () => {
      // @ts-ignore - 'User' might not be an exact IconName type depending on definitions, but works for test
      useStore.getState().logActivity('First activity', 'User');

      let log = useStore.getState().activityLog;
      expect(log).toHaveLength(1);
      expect(log[0].message).toBe('First activity');
      expect(log[0].icon).toBe('User');
      expect(log[0].id).toBeDefined();
      expect(log[0].timestamp).toBeDefined();

      // @ts-ignore
      useStore.getState().logActivity('Second activity', 'Settings');

      log = useStore.getState().activityLog;
      expect(log).toHaveLength(2);
      expect(log[0].message).toBe('Second activity');
      expect(log[1].message).toBe('First activity');
    });

    it('keeps only the latest 20 activities', () => {
      // Add 25 activities
      for (let i = 0; i < 25; i++) {
        // @ts-ignore
        useStore.getState().logActivity(`Activity ${i}`, 'Activity');
      }

      const log = useStore.getState().activityLog;
      expect(log).toHaveLength(20);
      expect(log[0].message).toBe('Activity 24'); // Most recent
      expect(log[19].message).toBe('Activity 5'); // 20th most recent (indices 24 down to 5)
    });
  });

  describe('deleteActivity', () => {
    it('deletes an activity by id', () => {
      // @ts-ignore
      useStore.getState().logActivity('Activity to keep', 'Activity');
      // @ts-ignore
      useStore.getState().logActivity('Activity to delete', 'Activity');

      const log = useStore.getState().activityLog;
      expect(log).toHaveLength(2);

      const idToDelete = log[0].id; // The one added last
      const idToKeep = log[1].id;

      useStore.getState().deleteActivity(idToDelete);

      const newLog = useStore.getState().activityLog;
      expect(newLog).toHaveLength(1);
      expect(newLog[0].id).toBe(idToKeep);
      expect(newLog[0].message).toBe('Activity to keep');
    });

    it('does nothing if id is not found', () => {
      // @ts-ignore
      useStore.getState().logActivity('Activity', 'Activity');

      const log = useStore.getState().activityLog;
      expect(log).toHaveLength(1);

      useStore.getState().deleteActivity('non-existent-id');

      expect(useStore.getState().activityLog).toHaveLength(1);
    });
  });

  describe('clearActivityLog', () => {
    it('clears all activities', () => {
      // @ts-ignore
      useStore.getState().logActivity('Activity 1', 'Activity');
      // @ts-ignore
      useStore.getState().logActivity('Activity 2', 'Activity');

      expect(useStore.getState().activityLog).toHaveLength(2);

      useStore.getState().clearActivityLog();

      expect(useStore.getState().activityLog).toHaveLength(0);
    });
  });
});
