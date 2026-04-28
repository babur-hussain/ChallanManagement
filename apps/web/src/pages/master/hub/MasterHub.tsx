import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { BrandsManager } from './components/BrandsManager';
import { UnitsManager } from './components/UnitsManager';
import { TaxCodesManager } from './components/TaxCodesManager';
import { AttributesManager } from './components/AttributesManager';
import { WarehousesManager } from './components/WarehousesManager';
import { ItemListPage } from '../item/ItemListPage';
import { CategoryListPage } from '../category/CategoryListPage';
import { useSearchParams } from 'react-router-dom';

export function MasterHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'items';

  const onTabChange = (value: string) => {
    setSearchParams(prev => {
      prev.set('tab', value);
      return prev;
    }, { replace: true });
  };

  return (
    <div className="container py-4 max-w-6xl pb-24 animate-in fade-in-50">
      <PageHeader title="Master Configuration Hub" description="Complete management for all your core application configurations." />

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-7 mb-6 bg-muted/50 p-1">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="taxcodes">Tax Codes</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>
        <Card className="p-4 bg-card shadow-sm border border-border min-h-[500px]">
          <TabsContent value="items" className="mt-0"><ItemListPage hideHeader /></TabsContent>
          <TabsContent value="categories" className="mt-0"><CategoryListPage hideHeader /></TabsContent>
          <TabsContent value="brands" className="mt-0"><BrandsManager /></TabsContent>
          <TabsContent value="units" className="mt-0"><UnitsManager /></TabsContent>
          <TabsContent value="taxcodes" className="mt-0"><TaxCodesManager /></TabsContent>
          <TabsContent value="attributes" className="mt-0"><AttributesManager /></TabsContent>
          <TabsContent value="warehouses" className="mt-0"><WarehousesManager /></TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
