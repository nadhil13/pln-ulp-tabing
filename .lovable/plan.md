

# Mobile-First Responsiveness Refactor Plan

## Summary
Refactor 4 key areas for bulletproof mobile responsiveness, fix remaining layout overflow issues, and polish the UI consistency across all screen sizes.

---

## 1. InputBarang.tsx - Layout & Upload Polish

**Current State:** Multi-image logic already works correctly with `Array.from(e.target.files)`. Layout uses `grid-cols-1 md:grid-cols-2`.

**Fixes Needed:**
- Add `overflow-hidden` and `break-words` to the material info badges to prevent long material names from overflowing on mobile
- Ensure the new material Collapsible section inputs have `w-full` on all fields
- Adjust the Kategori Select inside new material section: remove `h-12 text-base` on mobile (too tall for small screens), use responsive sizing
- Add `max-w-full` to image preview container to prevent grid blowout on very small screens (320px)

**No logic changes needed** - the multi-image upload with `Array.from`, `URL.createObjectURL`, and array state management is already correctly implemented.

---

## 2. Dashboard Sub-Components (AdminDashboard, StaffDashboard, VerifikatorDashboard)

**Current State:** All 3 dashboards already use responsive grids and mobile card views.

**Fixes Needed:**
- **AdminDashboard.tsx**: Change container padding from `p-0 md:p-2` to `p-0` (remove unnecessary desktop padding since AppLayout handles it). Ensure Welcome Card buttons don't overflow on narrow screens by adding `min-w-0` to button container.
- **StaffDashboard.tsx**: Stats grid uses `grid-cols-1 sm:grid-cols-3` which is correct. No major changes needed.
- **VerifikatorDashboard.tsx**: Stats grid uses `grid-cols-2 md:grid-cols-4` - correct. No major changes needed.
- **Global**: Ensure all `text-3xl` headings are `text-2xl md:text-3xl` (already done in most places).

---

## 3. UserManagement.tsx - Mobile Card Enhancement

**Current State:** Already has desktop Table + mobile Card view with Edit/Toggle/Reset buttons.

**Fixes Needed:**
- Add user avatar initials circle to mobile cards for visual identity (colored circle with first letter of name)
- Mobile card action buttons: change from `grid-cols-3` to `grid-cols-1 sm:grid-cols-3` for very narrow screens (360px), since 3 buttons crammed at 360px can be tight
- Stats cards: change from `grid-cols-1 sm:grid-cols-3` to `grid-cols-3` (stats are small enough for 3-col even on mobile)
- Add `p-4 md:p-6` responsive padding to the filter Card

---

## 4. Reports.tsx - Chart Symmetry & Filter Layout

**Current State:** Filters use `flex-col sm:flex-row`, stats use responsive grid. Approval rate uses inline SVG circle.

**Fixes Needed:**
- Charts row: add `grid-cols-1` explicitly before `md:grid-cols-2` (currently missing `grid-cols-1`)
- Approval Rate card: center the SVG properly using `flex items-center justify-center` with a minimum height `min-h-[300px]` to match the category chart height
- SVG viewBox fix: The SVG uses fixed `w-32 h-32 md:w-40 md:h-40` but the circle coordinates assume `cx=64 cy=64` which only works for 128px. Add responsive viewBox to scale properly.
- Export buttons section: ensure `grid-cols-1 sm:grid-cols-3` (already correct)
- Category chart: add `max-w-[150px] sm:max-w-[180px]` for truncated category names on mobile

---

## Technical Details

### Files to Modify:
1. `src/pages/InputBarang.tsx` - Minor overflow fixes on badges and collapsible inputs
2. `src/components/dashboard/AdminDashboard.tsx` - Button container overflow fix
3. `src/pages/UserManagement.tsx` - Avatar initials on mobile cards, button layout tweak
4. `src/pages/Reports.tsx` - Chart grid fix, SVG centering, category name truncation

### No New Dependencies Required

### Estimated Changes:
- ~15-20 lines changed per file (CSS class adjustments only)
- No logic or state management changes
- No breaking changes to existing functionality

