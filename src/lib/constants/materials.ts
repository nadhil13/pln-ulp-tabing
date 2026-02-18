// Database Material PLN ULP Tabing - Kota Padang
// Data diambil dari Excel NAMA_MATERIAL.xlsx (Gudang Rayon Tabing)
// Setiap item memiliki No Material, Nama Material, Satuan dari SAP PLN

export interface MaterialItem {
  noMaterial: string;
  namaMaterial: string;
  satuan: string;
  kategori: string;
}

// Kategori material untuk grouping di combobox
export const MATERIAL_CATEGORIES = [
  'Segel & Aksesoris Meter',
  'Kabel & Konduktor',
  'MCB 1 Phase',
  'MCB 3 Phase',
  'MCCB & Proteksi',
  'KWh Meter',
  'Box APP & Panel',
  'Battery & Charger',
  'Kapasitor',
  'Clamp & Connector',
  'Isolator',
  'Tiang & Aksesoris',
  'Trafo & Aksesoris',
  'Fuse & Cut Out',
  'Arrester & Proteksi',
  'Alat Kerja & K3',
  'Material Umum',
] as const;

export type MaterialCategory = typeof MATERIAL_CATEGORIES[number];

// Database material lengkap dari Excel PLN
export const MATERIAL_DATABASE: MaterialItem[] = [
  // === Segel & Aksesoris Meter ===
  { noMaterial: '000000000002200016', namaMaterial: 'Segel Putar Plastic', satuan: 'BH', kategori: 'Segel & Aksesoris Meter' },
  { noMaterial: '000000000002200001', namaMaterial: 'Kawat Segel', satuan: 'KG', kategori: 'Segel & Aksesoris Meter' },
  { noMaterial: '000000000002200002', namaMaterial: 'Timah Segel', satuan: 'KG', kategori: 'Segel & Aksesoris Meter' },

  // === Kabel & Konduktor ===
  { noMaterial: '000000000003120313', namaMaterial: 'Service Entrance Cable (SEC) 6-16mm2', satuan: 'BH', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110025', namaMaterial: 'Kabel Twisted NFA2X 2x10mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110026', namaMaterial: 'Kabel Twisted NFA2X 2x16mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110027', namaMaterial: 'Kabel Twisted NFA2X 4x16mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110028', namaMaterial: 'Kabel Twisted NFA2X 4x25mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110029', namaMaterial: 'Kabel Twisted NFA2X 4x35mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110030', namaMaterial: 'Kabel Twisted NFA2X 4x50mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110031', namaMaterial: 'Kabel Twisted NFA2X 4x70mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110514', namaMaterial: 'Kabel NYY 1x70mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110059', namaMaterial: 'Kabel NYY 1x120mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110060', namaMaterial: 'Kabel NYY 1x150mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110061', namaMaterial: 'Kabel NYY 1x240mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110063', namaMaterial: 'Kabel NYY 1x50mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110065', namaMaterial: 'Kabel NYY 1x95mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110050', namaMaterial: 'Kabel NYFGBY 4x10mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110053', namaMaterial: 'Kabel NYFGBY 4x16mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110054', namaMaterial: 'Kabel NYFGBY 4x25mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110055', namaMaterial: 'Kabel NYFGBY 4x35mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110057', namaMaterial: 'Kabel NYFGBY 4x70mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110085', namaMaterial: 'Kabel NYFGBY 3x95+1x50mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110230', namaMaterial: 'Kabel NYFGBY 4x185mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110229', namaMaterial: 'Kabel NYFGBY 4x240mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110228', namaMaterial: 'Kabel NYFGBY 4x300mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110294', namaMaterial: 'Kabel XLPE AL 1x150mm2 20kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110296', namaMaterial: 'Kabel XLPE AL 3x120mm2 20kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110297', namaMaterial: 'Kabel XLPE AL 3x150mm2 20kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110298', namaMaterial: 'Kabel XLPE AL 3x240mm2 20kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110303', namaMaterial: 'Kabel XLPE CU 1x150mm2 20kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110304', namaMaterial: 'Kabel XLPE CU 3x120mm2 20kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110221', namaMaterial: 'Kabel NYM 3x4mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110244', namaMaterial: 'Kabel NYAF 1x35mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003110272', namaMaterial: 'Kabel NYAF 1x150mm2 0.6/1kV', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000004160008', namaMaterial: 'Kabel Kontrol NYA 1x2.5mm2', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000004160009', namaMaterial: 'Kabel Kontrol NYA 1x4mm2', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000004160014', namaMaterial: 'Kabel Kontrol NYAF 1x2.5mm2', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000004160015', namaMaterial: 'Kabel Kontrol NYAF 1x4mm2', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003120610', namaMaterial: 'Kabel BC Ground 50mm', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003060195', namaMaterial: 'Binding Wire Aluminium 10mm2', satuan: 'M', kategori: 'Kabel & Konduktor' },
  { noMaterial: '000000000003060192', namaMaterial: 'Binding Wire Aluminium 2mm2', satuan: 'M', kategori: 'Kabel & Konduktor' },

  // === MCB 1 Phase ===
  { noMaterial: '000000000003250046', namaMaterial: 'MCB 1 Phase 2A 230/400V', satuan: 'BH', kategori: 'MCB 1 Phase' },
  { noMaterial: '000000000003250048', namaMaterial: 'MCB 1 Phase 4A 230/400V', satuan: 'BH', kategori: 'MCB 1 Phase' },
  { noMaterial: '000000000003250050', namaMaterial: 'MCB 1 Phase 6A 230/400V', satuan: 'BH', kategori: 'MCB 1 Phase' },
  { noMaterial: '000000000003250052', namaMaterial: 'MCB 1 Phase 10A 230/400V', satuan: 'BH', kategori: 'MCB 1 Phase' },
  { noMaterial: '000000000003250054', namaMaterial: 'MCB 1 Phase 16A 230/400V', satuan: 'BH', kategori: 'MCB 1 Phase' },
  { noMaterial: '000000000003250056', namaMaterial: 'MCB 1 Phase 20A 230/400V', satuan: 'BH', kategori: 'MCB 1 Phase' },
  { noMaterial: '000000000003250058', namaMaterial: 'MCB 1 Phase 25A 230/400V', satuan: 'BH', kategori: 'MCB 1 Phase' },
  { noMaterial: '000000000003250060', namaMaterial: 'MCB 1 Phase 35A 230/400V', satuan: 'BH', kategori: 'MCB 1 Phase' },
  { noMaterial: '000000000003250062', namaMaterial: 'MCB 1 Phase 50A 230/400V', satuan: 'BH', kategori: 'MCB 1 Phase' },

  // === MCB 3 Phase ===
  { noMaterial: '000000000003250097', namaMaterial: 'MCB 3 Phase 10A 230/400V', satuan: 'BH', kategori: 'MCB 3 Phase' },
  { noMaterial: '000000000003250099', namaMaterial: 'MCB 3 Phase 16A 230/400V', satuan: 'BH', kategori: 'MCB 3 Phase' },
  { noMaterial: '000000000003250101', namaMaterial: 'MCB 3 Phase 20A 230/400V', satuan: 'BH', kategori: 'MCB 3 Phase' },
  { noMaterial: '000000000003250103', namaMaterial: 'MCB 3 Phase 25A 230/400V', satuan: 'BH', kategori: 'MCB 3 Phase' },
  { noMaterial: '000000000003250105', namaMaterial: 'MCB 3 Phase 35A 230/400V', satuan: 'BH', kategori: 'MCB 3 Phase' },
  { noMaterial: '000000000003250107', namaMaterial: 'MCB 3 Phase 50A 230/400V', satuan: 'BH', kategori: 'MCB 3 Phase' },
  { noMaterial: '000000000003250109', namaMaterial: 'MCB 3 Phase 63A 230/400V', satuan: 'BH', kategori: 'MCB 3 Phase' },
  { noMaterial: '000000000003250111', namaMaterial: 'MCB 3 Phase 80A 230/400V', satuan: 'BH', kategori: 'MCB 3 Phase' },
  { noMaterial: '000000000003250113', namaMaterial: 'MCB 3 Phase 100A 230/400V', satuan: 'BH', kategori: 'MCB 3 Phase' },

  // === MCCB & Proteksi ===
  { noMaterial: '000000000003250200', namaMaterial: 'MCCB 3 Phase 50A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250201', namaMaterial: 'MCCB 3 Phase 63A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250202', namaMaterial: 'MCCB 3 Phase 80A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250203', namaMaterial: 'MCCB 3 Phase 100A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250204', namaMaterial: 'MCCB 3 Phase 125A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250205', namaMaterial: 'MCCB 3 Phase 160A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250206', namaMaterial: 'MCCB 3 Phase 200A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250207', namaMaterial: 'MCCB 3 Phase 225A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250208', namaMaterial: 'MCCB 3 Phase 250A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250209', namaMaterial: 'MCCB 3 Phase 300A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250210', namaMaterial: 'NH Fuse 100A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250211', namaMaterial: 'NH Fuse 160A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250212', namaMaterial: 'NH Fuse 200A', satuan: 'BH', kategori: 'MCCB & Proteksi' },
  { noMaterial: '000000000003250213', namaMaterial: 'NH Fuse 250A', satuan: 'BH', kategori: 'MCCB & Proteksi' },

  // === KWh Meter ===
  { noMaterial: '000000000002190224', namaMaterial: 'KWh Meter 1 Phase Prabayar 5-60A', satuan: 'BH', kategori: 'KWh Meter' },
  { noMaterial: '000000000002190218', namaMaterial: 'KWh Meter 3 Phase 5-80A', satuan: 'BH', kategori: 'KWh Meter' },
  { noMaterial: '000000000002190220', namaMaterial: 'KWh Meter 1 Phase Pascabayar', satuan: 'BH', kategori: 'KWh Meter' },
  { noMaterial: '000000000002190225', namaMaterial: 'KWh Meter 3 Phase Prabayar', satuan: 'BH', kategori: 'KWh Meter' },

  // === Box APP & Panel ===
  { noMaterial: '000000000004120016', namaMaterial: 'Box KWh Meter ST Plate 2mm 600x400x300mm', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004120002', namaMaterial: 'Box APP I NCBL ST Plate 1.4mm', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004120027', namaMaterial: 'Box APP I ST Plate 2mm', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004120049', namaMaterial: 'Box APP III ST Plate 2mm', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004120055', namaMaterial: 'Box APP VI TM ST Plate 2mm', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004120054', namaMaterial: 'Box APP VI TR ST Plate 2mm', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004120082', namaMaterial: 'Box MCB Plastic 2mm', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130011', namaMaterial: 'Cover MCB 1 Phase', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130012', namaMaterial: 'Cover MCB 3 Phase', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130020', namaMaterial: 'Panel APP 40x30x20cm', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130026', namaMaterial: 'Panel APP 45x35x25cm', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130001', namaMaterial: 'Tutup Kotak APP I', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130002', namaMaterial: 'Tutup Kotak APP II', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130003', namaMaterial: 'Tutup Kotak APP III', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130008', namaMaterial: 'Tutup Transparan I', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130009', namaMaterial: 'Tutup Transparan II', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130010', namaMaterial: 'Tutup Transparan III', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130016', namaMaterial: 'Deksel OAK I', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130017', namaMaterial: 'Deksel OAK III', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130014', namaMaterial: 'Terminal Press OAK I', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004130015', namaMaterial: 'Terminal Press OAK III', satuan: 'BH', kategori: 'Box APP & Panel' },
  { noMaterial: '000000000004120093', namaMaterial: 'Box KWh Meter Prabayar ST Plate 1.2mm', satuan: 'BH', kategori: 'Box APP & Panel' },

  // === Battery & Charger ===
  { noMaterial: '000000000004010018', namaMaterial: 'Battery Acid 12V 17Ah', satuan: 'CEL', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004010019', namaMaterial: 'Battery Acid 12V 7Ah', satuan: 'CEL', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004010014', namaMaterial: 'Battery Accu 12V 100Ah', satuan: 'BH', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004010092', namaMaterial: 'Battery Accu 12V 150Ah', satuan: 'BH', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004010058', namaMaterial: 'Battery Accu 12V 200Ah', satuan: 'BH', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004010093', namaMaterial: 'Battery Dry 12V 17Ah', satuan: 'BH', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004010017', namaMaterial: 'Battery Lead Acid 12V 60Ah', satuan: 'BH', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004020010', namaMaterial: 'Auto Battery Charger 12VDC 10A', satuan: 'U', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004020004', namaMaterial: 'Battery Connector', satuan: 'BH', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004020002', namaMaterial: 'Klem Accu', satuan: 'BH', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004030005', namaMaterial: 'Charger 220VAC 12VDC 30A', satuan: 'U', kategori: 'Battery & Charger' },
  { noMaterial: '000000000004030001', namaMaterial: 'Charger 220VAC 48VDC 30A', satuan: 'U', kategori: 'Battery & Charger' },

  // === Kapasitor ===
  { noMaterial: '000000000002130011', namaMaterial: 'Kapasitor 20kV 1P 100KVAR', satuan: 'BH', kategori: 'Kapasitor' },
  { noMaterial: '000000000002130012', namaMaterial: 'Kapasitor 20kV 1P 200KVAR', satuan: 'BH', kategori: 'Kapasitor' },
  { noMaterial: '000000000002130013', namaMaterial: 'Kapasitor 20kV 1P 300KVAR', satuan: 'BH', kategori: 'Kapasitor' },
  { noMaterial: '000000000002130014', namaMaterial: 'Kapasitor 20kV 1P 400KVAR', satuan: 'BH', kategori: 'Kapasitor' },
  { noMaterial: '000000000002130016', namaMaterial: 'Kapasitor 20kV 3P 400KVAR', satuan: 'BH', kategori: 'Kapasitor' },

  // === Clamp & Connector ===
  { noMaterial: '000000000002230021', namaMaterial: 'Clamp PG AL 120mm2 2Bolt', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000002230022', namaMaterial: 'Clamp PG AL 150-185mm2 3Bolt', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000002230024', namaMaterial: 'Clamp PG AL 185mm2 3Bolt', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000002230025', namaMaterial: 'Clamp PG AL 240mm2 2Bolt', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000002230029', namaMaterial: 'Clamp PG AL 50mm2 2Bolt', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000002230031', namaMaterial: 'Clamp PG AL 70mm2 2Bolt', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000002230034', namaMaterial: 'Clamp PG AL-CU 150-240mm2 3Bolt', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000002230040', namaMaterial: 'Clamp PG CU 25mm2 2Bolt', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000002230042', namaMaterial: 'Clamp PG CU 50mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003060116', namaMaterial: 'Compression Terminal Lug 35mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003060117', namaMaterial: 'Compression Terminal Lug 50mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003060118', namaMaterial: 'Compression Terminal Lug 70mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003060119', namaMaterial: 'Compression Terminal Lug 150mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003060120', namaMaterial: 'Compression Terminal Lug 240mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003060261', namaMaterial: 'Joint AL 10mm2 Insulated', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003060263', namaMaterial: 'Joint AL 16mm2 Compression', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003120007', namaMaterial: 'Cable Shoe AL 150mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003120009', namaMaterial: 'Cable Shoe AL 240mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003120017', namaMaterial: 'Cable Shoe CU 50mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000003120018', namaMaterial: 'Cable Shoe CU 95mm2', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000004170051', namaMaterial: 'Cable Tie 10cm', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000004170052', namaMaterial: 'Cable Tie 15cm', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000004170053', namaMaterial: 'Cable Tie 20cm', satuan: 'BH', kategori: 'Clamp & Connector' },
  { noMaterial: '000000000004170054', namaMaterial: 'Cable Tie 25cm', satuan: 'BH', kategori: 'Clamp & Connector' },

  // === Isolator ===
  { noMaterial: '000000000002160001', namaMaterial: 'Isolator Tumpu (Pin Insulator) 20kV', satuan: 'BH', kategori: 'Isolator' },
  { noMaterial: '000000000002160002', namaMaterial: 'Isolator Tarik (Suspension) 20kV', satuan: 'BH', kategori: 'Isolator' },
  { noMaterial: '000000000002160003', namaMaterial: 'Isolator Pos (Post Insulator) 20kV', satuan: 'BH', kategori: 'Isolator' },
  { noMaterial: '000000000002160004', namaMaterial: 'Isolator Gantung (Disc/String) 20kV', satuan: 'BH', kategori: 'Isolator' },

  // === Tiang & Aksesoris ===
  { noMaterial: '000000000001010001', namaMaterial: 'Tiang Besi 7 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001010002', namaMaterial: 'Tiang Besi 9 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001010003', namaMaterial: 'Tiang Besi 11 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001010004', namaMaterial: 'Tiang Besi 12 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001020001', namaMaterial: 'Tiang Beton 7 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001020002', namaMaterial: 'Tiang Beton 9 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001020003', namaMaterial: 'Tiang Beton 11 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001020004', namaMaterial: 'Tiang Beton 12 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001030001', namaMaterial: 'Tiang Kayu 7 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001030002', namaMaterial: 'Tiang Kayu 9 Meter', satuan: 'BTG', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001050001', namaMaterial: 'Cross Arm Baja 1200mm', satuan: 'BH', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001050002', namaMaterial: 'Cross Arm Baja 1500mm', satuan: 'BH', kategori: 'Tiang & Aksesoris' },
  { noMaterial: '000000000001050003', namaMaterial: 'Cross Arm Baja 1800mm', satuan: 'BH', kategori: 'Tiang & Aksesoris' },

  // === Trafo & Aksesoris ===
  { noMaterial: '000000000002010001', namaMaterial: 'Trafo Distribusi 25 KVA', satuan: 'U', kategori: 'Trafo & Aksesoris' },
  { noMaterial: '000000000002010002', namaMaterial: 'Trafo Distribusi 50 KVA', satuan: 'U', kategori: 'Trafo & Aksesoris' },
  { noMaterial: '000000000002010003', namaMaterial: 'Trafo Distribusi 100 KVA', satuan: 'U', kategori: 'Trafo & Aksesoris' },
  { noMaterial: '000000000002010004', namaMaterial: 'Trafo Distribusi 160 KVA', satuan: 'U', kategori: 'Trafo & Aksesoris' },
  { noMaterial: '000000000002010005', namaMaterial: 'Trafo Distribusi 200 KVA', satuan: 'U', kategori: 'Trafo & Aksesoris' },
  { noMaterial: '000000000002010006', namaMaterial: 'Trafo Distribusi 250 KVA', satuan: 'U', kategori: 'Trafo & Aksesoris' },
  { noMaterial: '000000000002010007', namaMaterial: 'Trafo Distribusi 400 KVA', satuan: 'U', kategori: 'Trafo & Aksesoris' },
  { noMaterial: '000000000002020001', namaMaterial: 'Minyak Trafo', satuan: 'LTR', kategori: 'Trafo & Aksesoris' },
  { noMaterial: '000000000002020002', namaMaterial: 'Silica Gel', satuan: 'KG', kategori: 'Trafo & Aksesoris' },

  // === Fuse & Cut Out ===
  { noMaterial: '000000000003190002', namaMaterial: 'Cut Out Fuse 20kV 6-100A', satuan: 'BH', kategori: 'Fuse & Cut Out' },
  { noMaterial: '000000000003190003', namaMaterial: 'Fuse Link 2A', satuan: 'BH', kategori: 'Fuse & Cut Out' },
  { noMaterial: '000000000003190004', namaMaterial: 'Fuse Link 3A', satuan: 'BH', kategori: 'Fuse & Cut Out' },
  { noMaterial: '000000000003190005', namaMaterial: 'Fuse Link 5A', satuan: 'BH', kategori: 'Fuse & Cut Out' },
  { noMaterial: '000000000003190006', namaMaterial: 'Fuse Link 6A', satuan: 'BH', kategori: 'Fuse & Cut Out' },
  { noMaterial: '000000000003190007', namaMaterial: 'Fuse Link 8A', satuan: 'BH', kategori: 'Fuse & Cut Out' },
  { noMaterial: '000000000003190008', namaMaterial: 'Fuse Link 10A', satuan: 'BH', kategori: 'Fuse & Cut Out' },
  { noMaterial: '000000000003190009', namaMaterial: 'Fuse Link 15A', satuan: 'BH', kategori: 'Fuse & Cut Out' },
  { noMaterial: '000000000003190010', namaMaterial: 'Fuse Link 20A', satuan: 'BH', kategori: 'Fuse & Cut Out' },
  { noMaterial: '000000000003190011', namaMaterial: 'Fuse Link 25A', satuan: 'BH', kategori: 'Fuse & Cut Out' },

  // === Arrester & Proteksi ===
  { noMaterial: '000000000002150001', namaMaterial: 'Lightning Arrester 20kV 10kA', satuan: 'BH', kategori: 'Arrester & Proteksi' },
  { noMaterial: '000000000002150002', namaMaterial: 'Lightning Arrester 20kV 5kA', satuan: 'BH', kategori: 'Arrester & Proteksi' },

  // === Alat Kerja & K3 ===
  { noMaterial: '000000000007010001', namaMaterial: 'Majun / Kain Lap', satuan: 'KG', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010002', namaMaterial: 'Kuas', satuan: 'BH', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010003', namaMaterial: 'Batu Gerinda Potong', satuan: 'BH', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010004', namaMaterial: 'Kawat Las', satuan: 'KG', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010005', namaMaterial: 'Mata Bor', satuan: 'BH', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010006', namaMaterial: 'Sarung Tangan Kain', satuan: 'PSG', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010007', namaMaterial: 'Sarung Tangan Kulit', satuan: 'PSG', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010008', namaMaterial: 'Helm Safety', satuan: 'BH', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010009', namaMaterial: 'Sabuk Pengaman (Safety Belt)', satuan: 'BH', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010010', namaMaterial: 'Sepatu Safety', satuan: 'PSG', kategori: 'Alat Kerja & K3' },
  { noMaterial: '000000000007010182', namaMaterial: 'Tali Polypropelene', satuan: 'BH', kategori: 'Alat Kerja & K3' },

  // === Material Umum ===
  { noMaterial: '000000000008010001', namaMaterial: 'Cat', satuan: 'KLG', kategori: 'Material Umum' },
  { noMaterial: '000000000008010002', namaMaterial: 'Thinner', satuan: 'LTR', kategori: 'Material Umum' },
  { noMaterial: '000000000008010003', namaMaterial: 'Alkohol', satuan: 'LTR', kategori: 'Material Umum' },
  { noMaterial: '000000000008010004', namaMaterial: 'CRC (Contact Cleaner)', satuan: 'KLG', kategori: 'Material Umum' },
  { noMaterial: '000000000008010005', namaMaterial: 'WD-40', satuan: 'KLG', kategori: 'Material Umum' },
  { noMaterial: '000000000008010006', namaMaterial: 'Tali Atu (Tie Wire)', satuan: 'KG', kategori: 'Material Umum' },
  { noMaterial: '000000000008010007', namaMaterial: 'Isolasi Kertas', satuan: 'ROL', kategori: 'Material Umum' },
  { noMaterial: '000000000008010008', namaMaterial: 'Lem Gasket / Tribon', satuan: 'TBE', kategori: 'Material Umum' },
  { noMaterial: '000000000008010009', namaMaterial: 'Isolasi PVC (Tape)', satuan: 'ROL', kategori: 'Material Umum' },
  { noMaterial: '000000000008010010', namaMaterial: 'Pipa PVC 2 inch', satuan: 'BTG', kategori: 'Material Umum' },
  { noMaterial: '000000000008010011', namaMaterial: 'Pipa PVC 3 inch', satuan: 'BTG', kategori: 'Material Umum' },
  { noMaterial: '000000000008010012', namaMaterial: 'Baut Mur 16mm', satuan: 'BH', kategori: 'Material Umum' },
  { noMaterial: '000000000008010013', namaMaterial: 'Baut Mur 12mm', satuan: 'BH', kategori: 'Material Umum' },
  { noMaterial: '000000000008010014', namaMaterial: 'Klem Tiang', satuan: 'BH', kategori: 'Material Umum' },
  { noMaterial: '000000000008010015', namaMaterial: 'Bracket Tiang', satuan: 'BH', kategori: 'Material Umum' },
];

// Flat list of material names for quick search
export const MATERIAL_LIST: string[] = MATERIAL_DATABASE.map(m => m.namaMaterial);

// Get material by name
export const getMaterialByName = (name: string): MaterialItem | undefined => {
  return MATERIAL_DATABASE.find(m => m.namaMaterial === name);
};

// Search materials by query
export const searchMaterials = (query: string): MaterialItem[] => {
  const q = query.toLowerCase();
  return MATERIAL_DATABASE.filter(m =>
    m.namaMaterial.toLowerCase().includes(q) ||
    m.noMaterial.includes(q) ||
    m.kategori.toLowerCase().includes(q)
  );
};

// Get materials by category
export const getMaterialsByCategory = (kategori: string): MaterialItem[] => {
  return MATERIAL_DATABASE.filter(m => m.kategori === kategori);
};
