import { useCallback } from 'react';
import { useAppDispatch } from '../hooks';
import { addNotification } from '../features/notifications/notificationsSlice';
import type { NotificationType } from '../features/notifications/notificationsSlice';

/**
 * Convenience hook for dispatching toast notifications.
 *
 * Usage:
 *   const { addToast } = useToast();
 *   addToast("Account deleted.", "success");
 */
export function useToast() {
  const dispatch = useAppDispatch();

  const addToast = useCallback(
    (message: string, type: NotificationType = 'info', title?: string) => {
      dispatch(addNotification({ message, type, title }));
    },
    [dispatch],
  );

  return { addToast };
}
