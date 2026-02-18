import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import staticMaterials from '@/data/material_data.json';

export interface Material {
  noMaterial: string;
  namaMaterial: string;
  satuan: string;
  kategori: string;
}

export function useMaterials() {
  const [firestoreMaterials, setFirestoreMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to Firestore 'materials' collection in realtime
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'materials'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          noMaterial: doc.data().noMaterial || '',
          namaMaterial: doc.data().namaMaterial || '',
          satuan: doc.data().satuan || 'BH',
          kategori: doc.data().kategori || 'Material Umum',
        })) as Material[];
        setFirestoreMaterials(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to materials collection:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Merge JSON + Firestore, deduplicate by noMaterial
  const combinedMaterials = useMemo(() => {
    const map = new Map<string, Material>();
    // Static first
    (staticMaterials as Material[]).forEach((m) => map.set(m.noMaterial, m));
    // Firestore overrides / adds
    firestoreMaterials.forEach((m) => map.set(m.noMaterial, m));
    return Array.from(map.values());
  }, [firestoreMaterials]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(combinedMaterials.map((m) => m.kategori));
    return Array.from(cats).sort();
  }, [combinedMaterials]);

  // Save new material to Firestore 'materials' collection
  const addMaterial = async (material: Material) => {
    await addDoc(collection(db, 'materials'), {
      ...material,
      createdAt: Timestamp.now(),
    });
  };

  return { materials: combinedMaterials, categories, loading, addMaterial };
}
