import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InventoryItem, ItemStatus, JenisBarang } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface UseInventoryOptions {
  status?: ItemStatus | ItemStatus[];
  createdBy?: string;
  jenisBarang?: JenisBarang;
}

export function useInventory(options: UseInventoryOptions = {}) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAuth();

  useEffect(() => {
    // Always use real Firestore - no demo mode
    if (!userData) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query - ordered by createdAt descending
      const q = query(
        collection(db, 'items'),
        orderBy('createdAt', 'desc')
      );

      // Real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          let itemsData = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as DocumentData;
            return {
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as InventoryItem;
          });

          // Apply filters client-side to avoid composite index requirements
          if (options.status) {
            if (Array.isArray(options.status)) {
              itemsData = itemsData.filter(item => options.status?.includes(item.status));
            } else {
              itemsData = itemsData.filter(item => item.status === options.status);
            }
          }

          if (options.createdBy) {
            itemsData = itemsData.filter(item => item.createdBy === options.createdBy);
          }

          if (options.jenisBarang) {
            itemsData = itemsData.filter(item => item.jenisBarang === options.jenisBarang);
          }

          setItems(itemsData);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore error:', err);
          setError('Gagal memuat data. Silakan refresh halaman.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Query setup error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  }, [options.status, options.createdBy, options.jenisBarang, userData?.uid]);

  const addItem = async (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy' | 'createdByName'>) => {
    if (!userData) throw new Error('User not authenticated');

    const newItem = {
      ...itemData,
      status: 'pending' as ItemStatus,
      createdBy: userData.uid,
      createdByName: userData.name,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'items'), newItem);
    return docRef.id;
  };

  const updateItemStatus = async (
    itemId: string, 
    status: ItemStatus, 
    rejectionNote?: string
  ) => {
    if (!userData) throw new Error('User not authenticated');

    const updateData: Record<string, any> = {
      status,
      verifiedBy: userData.uid,
      verifiedByName: userData.name,
      updatedAt: Timestamp.now(),
    };

    if (status === 'rejected' && rejectionNote) {
      updateData.rejectionNote = rejectionNote;
    }

    await updateDoc(doc(db, 'items', itemId), updateData);
  };

  const updateItem = async (itemId: string, data: Partial<InventoryItem>) => {
    if (!userData) throw new Error('User not authenticated');

    await updateDoc(doc(db, 'items', itemId), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  };

  const deleteItem = async (itemId: string) => {
    if (!userData) throw new Error('User not authenticated');
    await deleteDoc(doc(db, 'items', itemId));
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItemStatus,
    updateItem,
    deleteItem,
  };
}

// Hook for staff to get their own items
export function useMyItems() {
  const { userData } = useAuth();
  return useInventory({ createdBy: userData?.uid });
}

// Hook for verifikator to get pending items
export function usePendingItems() {
  return useInventory({ status: 'pending' });
}

// Hook for admin to get all items
export function useAllItems() {
  return useInventory();
}
