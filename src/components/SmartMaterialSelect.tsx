import { useState } from 'react';
import { Check, ChevronsUpDown, Package, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Material } from '@/hooks/useMaterials';

interface SmartMaterialSelectProps {
  materials: Material[];
  categories: string[];
  value: string; // noMaterial or 'NEW_ITEM_MANUAL'
  onSelect: (value: string, material?: Material) => void;
  disabled?: boolean;
}

function MaterialCommandList({
  materials,
  categories,
  value,
  onSelect,
}: {
  materials: Material[];
  categories: string[];
  value: string;
  onSelect: (val: string, material?: Material) => void;
}) {
  return (
    <Command className="w-full" filter={(value, search) => {
      // Custom filter: search by name or noMaterial
      const item = materials.find(m => m.noMaterial === value);
      if (!item) {
        // "NEW_ITEM_MANUAL" always visible
        if (value === 'NEW_ITEM_MANUAL') return 1;
        return 0;
      }
      const q = search.toLowerCase();
      if (
        item.namaMaterial.toLowerCase().includes(q) ||
        item.noMaterial.includes(q) ||
        item.kategori.toLowerCase().includes(q)
      ) return 1;
      return 0;
    }}>
      <CommandInput placeholder="Cari nama atau no. material..." />
      <CommandList className="max-h-[300px]">
        <CommandEmpty>Material tidak ditemukan.</CommandEmpty>
        {/* Sticky: Add New */}
        <CommandGroup heading="Aksi">
          <CommandItem
            value="NEW_ITEM_MANUAL"
            onSelect={() => onSelect('NEW_ITEM_MANUAL')}
            className="flex items-center gap-2 text-primary font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Material Baru (Tidak ada di list)</span>
          </CommandItem>
        </CommandGroup>
        {/* Grouped by category */}
        {categories.map((cat) => {
          const items = materials.filter((m) => m.kategori === cat);
          if (items.length === 0) return null;
          return (
            <CommandGroup key={cat} heading={cat}>
              {items.map((m) => (
                <CommandItem
                  key={m.noMaterial}
                  value={m.noMaterial}
                  onSelect={() => onSelect(m.noMaterial, m)}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === m.noMaterial ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      [{m.noMaterial.slice(-8)}] {m.namaMaterial}
                    </p>
                    <p className="text-xs text-muted-foreground">({m.satuan})</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </Command>
  );
}

export function SmartMaterialSelect({
  materials,
  categories,
  value,
  onSelect,
  disabled = false,
}: SmartMaterialSelectProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const selectedMaterial = materials.find((m) => m.noMaterial === value);
  const displayText = selectedMaterial
    ? `[${selectedMaterial.noMaterial.slice(-8)}] ${selectedMaterial.namaMaterial}`
    : value === 'NEW_ITEM_MANUAL'
      ? '+ Material Baru (Manual)'
      : 'Pilih material...';

  const handleSelect = (val: string, mat?: Material) => {
    onSelect(val, mat);
    setOpen(false);
  };

  const trigger = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      className="w-full justify-between h-12 text-left font-normal text-base"
    >
      <div className="flex items-center gap-2 truncate">
        <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={cn('truncate', !selectedMaterial && value !== 'NEW_ITEM_MANUAL' && 'text-muted-foreground')}>
          {displayText}
        </span>
      </div>
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  const list = (
    <MaterialCommandList
      materials={materials}
      categories={categories}
      value={value}
      onSelect={handleSelect}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <div className="p-2">{list}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50" align="start">
        {list}
      </PopoverContent>
    </Popover>
  );
}
