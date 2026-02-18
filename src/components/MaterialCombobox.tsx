import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, Package } from 'lucide-react';
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
import { MATERIAL_DATABASE, MATERIAL_CATEGORIES, type MaterialItem } from '@/lib/constants/materials';

interface MaterialComboboxProps {
  value: string;
  onValueChange: (value: string, material?: MaterialItem) => void;
  placeholder?: string;
  disabled?: boolean;
}

function MaterialSearchList({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (val: string) => void;
}) {
  return (
    <Command className="w-full">
      <CommandInput placeholder="Ketik nama material... (contoh: MCB, Kabel, Tiang)" />
      <CommandList className="max-h-[300px]">
        <CommandEmpty>Material tidak ditemukan.</CommandEmpty>
        {MATERIAL_CATEGORIES.map((kategori) => {
          const items = MATERIAL_DATABASE.filter((m) => m.kategori === kategori);
          if (items.length === 0) return null;
          return (
            <CommandGroup key={kategori} heading={kategori}>
              {items.map((material) => (
                <CommandItem
                  key={material.noMaterial}
                  value={material.namaMaterial}
                  onSelect={() => onSelect(material.namaMaterial)}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === material.namaMaterial ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{material.namaMaterial}</p>
                    <p className="text-xs text-muted-foreground">
                      {material.satuan} • {material.noMaterial.slice(-8)}
                    </p>
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

export function MaterialCombobox({
  value,
  onValueChange,
  placeholder = 'Pilih nama material...',
  disabled = false,
}: MaterialComboboxProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSelect = (selectedName: string) => {
    const material = MATERIAL_DATABASE.find((m) => m.namaMaterial === selectedName);
    onValueChange(selectedName, material);
    setOpen(false);
  };

  const displayValue = value || placeholder;

  // Mobile: use Drawer for better UX
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-auto min-h-10 text-left font-normal"
          >
            <div className="flex items-center gap-2 truncate">
              <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className={cn('truncate', !value && 'text-muted-foreground')}>
                {displayValue}
              </span>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[80vh]">
          <div className="p-2">
            <MaterialSearchList value={value} onSelect={handleSelect} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-auto min-h-10 text-left font-normal"
        >
          <div className="flex items-center gap-2 truncate">
            <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className={cn('truncate', !value && 'text-muted-foreground')}>
              {displayValue}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50" align="start">
        <MaterialSearchList value={value} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
