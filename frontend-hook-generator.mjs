import fs from 'fs';
import path from 'path';

const WEB_HOOKS_DIR = '/Users/baburhussain/ChallanManagement-main/apps/web/src/hooks/api';

const entities = [
    { name: 'Brand', varName: 'brands', routeName: 'brands', Prefix: 'Brand' },
    { name: 'Unit', varName: 'units', routeName: 'units', Prefix: 'Unit' },
    { name: 'TaxCode', varName: 'taxCodes', routeName: 'tax-codes', Prefix: 'TaxCode' },
    { name: 'Attribute', varName: 'attributes', routeName: 'attributes', Prefix: 'Attribute' },
    { name: 'Warehouse', varName: 'warehouses', routeName: 'warehouses', Prefix: 'Warehouse' }
];

entities.forEach(ent => {
    const hookContent = `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { 
  I${ent.Prefix}Filters, 
  Create${ent.Prefix}Input, 
  Update${ent.Prefix}Input 
} from '@textilepro/shared';

export function use${ent.name}s(filters?: I${ent.Prefix}Filters) {
  return useQuery({
    queryKey: ['${ent.varName}', filters],
    queryFn: async () => {
      const { data } = await api.get('/${ent.routeName}', { params: filters });
      return data;
    },
  });
}

export function useCreate${ent.Prefix}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Create${ent.Prefix}Input) => {
      const res = await api.post('/${ent.routeName}', data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('${ent.Prefix} created successfully');
      queryClient.invalidateQueries({ queryKey: ['${ent.varName}'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create ${ent.Prefix.toLowerCase()}');
    },
  });
}

export function useUpdate${ent.Prefix}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Update${ent.Prefix}Input }) => {
      const res = await api.put(\`/${ent.routeName}/\${id}\`, data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('${ent.Prefix} updated successfully');
      queryClient.invalidateQueries({ queryKey: ['${ent.varName}'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update ${ent.Prefix.toLowerCase()}');
    },
  });
}

export function useDelete${ent.Prefix}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(\`/${ent.routeName}/\${id}\`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('${ent.Prefix} state changed');
      queryClient.invalidateQueries({ queryKey: ['${ent.varName}'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update ${ent.Prefix.toLowerCase()}');
    },
  });
}
`;

    fs.writeFileSync(path.join(WEB_HOOKS_DIR, `use${ent.name}s.ts`), hookContent);
});

console.log('Frontend hooks generated.');
