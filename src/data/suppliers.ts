export const suppliers = [
  { id: 1, name: 'Cellnet', color: 'rgba(59, 130, 246, 0.7)' }, // Blue
  { id: 2, name: 'Likewize Acc', color: 'rgba(147, 51, 234, 0.7)' }, // Purple
  { id: 3, name: 'Pacificomm', color: 'rgba(236, 72, 153, 0.7)' }, // Pink
  { id: 4, name: 'Studiotech', color: 'rgba(245, 158, 11, 0.7)' }, // Amber
  { id: 5, name: 'Likewize Device', color: 'rgba(34, 197, 94, 0.7)' } // Green
] as const;

export const isDeviceSupplier = (supplierId: number): boolean => {
  return supplierId === 5;
};

export const getSupplierName = (supplierId: number): string => {
  return suppliers.find(s => s.id === supplierId)?.name || `Supplier ${supplierId}`;
};

export const getSupplierColor = (supplierId: number): string => {
  return suppliers.find(s => s.id === supplierId)?.color || 'rgba(156, 163, 175, 0.7)';
};