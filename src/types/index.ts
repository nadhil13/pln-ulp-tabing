// User Roles
export type UserRole = 'staff' | 'verifikator' | 'admin_gudang';

// Item Status
export type ItemStatus = 'pending' | 'approved' | 'rejected';

// Item Condition
export type KondisiBarang = 'andal' | 'limbah';

// Item Type (Jenis Barang)
export type JenisBarang = 'tiang' | 'kwh_meter' | 'kabel' | 'material_umum';

// User interface
export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  active: boolean;
  photoURL?: string;
}

// Base Inventory Item interface
export interface BaseInventoryItem {
  id: string;
  jenisBarang: JenisBarang;
  kondisi: KondisiBarang;
  imageUrl?: string;
  imageUrls?: string[];
  status: ItemStatus;
  createdBy: string;
  createdByName?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  rejectionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tiang specific fields
export interface TiangItem extends BaseInventoryItem {
  jenisBarang: 'tiang';
  volume: number;
  idTiang: string;
  tinggi: number;
  material: string;
  lokasi: string;
}

// KWH Meter specific fields
export interface KwhMeterItem extends BaseInventoryItem {
  jenisBarang: 'kwh_meter';
  merek: string;
  nomorSegel: string;
  idMeter: string;
  jumlah: number;
  lokasi: string;
}

// Kabel specific fields
export interface KabelItem extends BaseInventoryItem {
  jenisBarang: 'kabel';
  description: string;
  length: number;
  lokasi: string;
}

// Universal Material item (new schema)
export interface MaterialUmumItem extends BaseInventoryItem {
  jenisBarang: 'material_umum';
  namaMaterial: string;
  noMaterial?: string;
  satuanMaterial?: string;
  kategoriMaterial?: string;
  serialNumber?: string;
  jumlah: number;
  lokasi: string;
  catatan?: string;
}

// Union type for all inventory items
export type InventoryItem = TiangItem | KwhMeterItem | KabelItem | MaterialUmumItem;

// Legacy item interface for backward compatibility
export interface LegacyInventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  imageUrl?: string;
  status: ItemStatus;
  createdBy: string;
  createdByName?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  rejectionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Jenis Barang options
export const JENIS_BARANG_OPTIONS: { value: JenisBarang; label: string }[] = [
  { value: 'tiang', label: 'Tiang' },
  { value: 'kwh_meter', label: 'KWH Meter' },
  { value: 'kabel', label: 'Kabel' },
  { value: 'material_umum', label: 'Material Umum' },
];

// Material options for Tiang
export const TIANG_MATERIALS = [
  'Beton',
  'Besi',
  'Kayu',
  'Galvanis',
] as const;

// Location options (Rak Gudang)
export const LOCATIONS = [
  'Rak 1',
  'Rak 2',
  'Rak 3',
  'Rak 4',
  'Rak 5',
  'Rak 6',
  'Rak 7',
] as const;

// Role labels in Indonesian
export const ROLE_LABELS: Record<UserRole, string> = {
  staff: 'Staff',
  verifikator: 'Verifikator',
  admin_gudang: 'Admin Gudang',
};

// Status labels in Indonesian
export const STATUS_LABELS: Record<ItemStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

// Kondisi labels
export const KONDISI_LABELS: Record<KondisiBarang, string> = {
  andal: 'Material Bekas Handal',
  limbah: 'Material Limbah',
};

// Jenis Barang labels
export const JENIS_BARANG_LABELS: Record<JenisBarang, string> = {
  tiang: 'Tiang',
  kwh_meter: 'KWH Meter',
  kabel: 'Kabel',
  material_umum: 'Material Umum',
};

// Legacy categories (kept for backward compatibility)
export const CATEGORIES = [
  'Alat Listrik',
  'Kabel & Konduktor',
  'Trafo',
  'Meter & Pengukuran',
  'Tiang & Aksesoris',
  'Material Jaringan',
  'Perlengkapan K3',
  'Peralatan Kantor',
  'Lainnya',
] as const;
