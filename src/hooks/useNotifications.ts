import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  limit,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Notification, NotificationFormData } from '@/types/notification';

export function useNotifications() {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'global_notifications');
    const q = query(
      notificationsRef, 
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Notification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const notification: Notification = {
            id: docSnap.id,
            title: data.title,
            message: data.message,
            targetRole: data.targetRole,
            timestamp: data.timestamp?.toDate() || new Date(),
            createdBy: data.createdBy,
            createdByName: data.createdByName,
            readBy: data.readBy || [],
          };

          // Filter by target role
          if (
            notification.targetRole === 'all' || 
            notification.targetRole === userData.role
          ) {
            items.push(notification);
          }
        });
        setNotifications(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData]);

  const sendNotification = async (data: NotificationFormData): Promise<boolean> => {
    if (!userData) return false;

    try {
      await addDoc(collection(db, 'global_notifications'), {
        ...data,
        timestamp: Timestamp.now(),
        createdBy: userData.uid,
        createdByName: userData.name,
        readBy: [],
      });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userData?.uid) return;
    try {
      await updateDoc(doc(db, 'global_notifications', notificationId), {
        readBy: arrayUnion(userData.uid),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [userData?.uid]);

  const markAllAsRead = useCallback(async () => {
    if (!userData?.uid) return;
    const unreadNotifs = notifications.filter(n => !(n.readBy || []).includes(userData.uid));
    try {
      await Promise.all(
        unreadNotifs.map(n => 
          updateDoc(doc(db, 'global_notifications', n.id), {
            readBy: arrayUnion(userData.uid),
          })
        )
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [notifications, userData?.uid]);

  const isRead = useCallback((notificationId: string) => {
    if (!userData?.uid) return true;
    const notif = notifications.find(n => n.id === notificationId);
    return (notif?.readBy || []).includes(userData.uid);
  }, [notifications, userData?.uid]);

  const unreadCount = notifications.filter(n => !isRead(n.id)).length;

  return {
    notifications,
    loading,
    sendNotification,
    markAsRead,
    markAllAsRead,
    unreadCount,
    isRead,
  };
}
