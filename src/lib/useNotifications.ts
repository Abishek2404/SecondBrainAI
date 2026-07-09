import { useState, useEffect } from 'react';

export function useNotifications() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('study-reminders-enabled') !== 'false';
  });

  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'default'
  );

  const toggleNotifications = async (val: boolean) => {
    if (val) {
      if ('Notification' in window && Notification.permission !== 'granted') {
        const p = await Notification.requestPermission();
        setPermission(p);
        if (p !== 'granted') {
          setEnabled(false);
          localStorage.setItem('study-reminders-enabled', 'false');
          return;
        }
      }
    }
    setEnabled(val);
    localStorage.setItem('study-reminders-enabled', String(val));
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (enabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  return { enabled, toggleNotifications, permission, sendNotification };
}
