import { describe, expect, it } from 'vitest';
import reducer, {
  addNotification,
  clearNotifications,
  dismissNotification,
} from './notificationsSlice';

describe('notificationsSlice', () => {
  it('addNotification appends a notification with sensible defaults', () => {
    const state = reducer(undefined, addNotification({ message: 'Hello' }));

    expect(state.items).toHaveLength(1);
    const notification = state.items[0];
    expect(notification.message).toBe('Hello');
    expect(notification.type).toBe('info');
    expect(notification.durationMs).toBe(4000);
    expect(notification.critical).toBe(false);
    expect(notification.id).toBeTruthy();
    expect(typeof notification.createdAt).toBe('number');
  });

  it('dismissNotification removes only the matching notification', () => {
    const state = reducer(undefined, addNotification({ message: 'first' }));
    const idToRemove = state.items[0].id;
    const next = reducer(state, dismissNotification(idToRemove));

    expect(next.items).toEqual([]);
  });

  it('clearNotifications empties the queue', () => {
    let state = reducer(undefined, addNotification({ message: 'first' }));
    state = reducer(state, addNotification({ message: 'second' }));
    expect(state.items).toHaveLength(2);

    const next = reducer(state, clearNotifications());

    expect(next.items).toEqual([]);
  });
});
