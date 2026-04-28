import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DeliveryChallanTemplate } from './apps/web/src/pages/challan/DeliveryChallanTemplate.tsx';

const mockChallan = {
  challanNumber: 'DC-123',
  items: [
    {
      description: 'Test Item',
      totalMeters: 10,
      ratePerMeter: 100,
      discount: 0,
      discountType: 'PERCENTAGE',
      taxRate: 18,
    }
  ]
};

try {
  const html = renderToStaticMarkup(
    <DeliveryChallanTemplate challan={mockChallan} />
  );
  console.log(html.includes('IGST (18%)') || html.includes('CGST (9%)') ? 'Tax shown correctly' : 'Tax NOT shown!');
  console.log('Grand Total HTML snippet:', html.substring(html.indexOf('Grand Total:'), html.indexOf('Grand Total:') + 200));
} catch(e) {
  console.error("Error:", e);
}
