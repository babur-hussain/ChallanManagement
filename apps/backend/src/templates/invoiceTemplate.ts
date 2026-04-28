export function getInvoiceHtmlTemplate(invoice: any, business: any, reportsSettings: any = {}): string {

  const formatDate = (d: Date) => d.toLocaleDateString('en-GB');

  let itemsHtml = '';
  invoice.items.forEach((item: any, i: number) => {
    itemsHtml += `
      <tr>
        <td class="center border-r font-xs">${i + 1}</td>
        <td class="border-r font-medium">${item.itemName}</td>
        <td class="center border-r">${item.hsnCode}</td>
        <td class="right border-r">${item.quantity.toFixed(2)}</td>
        <td class="center border-r">${item.unit}</td>
        <td class="right border-r">₹${item.ratePerUnit.toFixed(2)}</td>
        <td class="right">₹${item.taxableAmount.toFixed(2)}</td>
      </tr>
    `;
  });

  const igstRow = invoice.supplyType === 'INTER_STATE' ? `
    <tr>
      <td colspan="6" class="border-t right font-medium p-1">IGST</div>
      <td class="border-t right p-1">₹${invoice.totalIgst.toFixed(2)}</td>
    </tr>` : `
    <tr>
      <td colspan="6" class="border-t right font-medium p-1">CGST</td>
      <td class="border-t right p-1">₹${invoice.totalCgst.toFixed(2)}</td>
    </tr>
    <tr>
      <td colspan="6" class="right font-medium p-1">SGST</td>
      <td class="right p-1">₹${invoice.totalSgst.toFixed(2)}</td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
    body { font-family: 'Roboto', sans-serif; margin: 0; padding: 0; font-size: 11px; color: #111; line-height: 1.4; }
    .container { border: 1px double #000; padding: 0; }
    .text-center { text-align: center; } .text-right { text-align: right; } .right { text-align: right; } .center { text-align: center; }
    .font-medium { font-weight: 500; } .font-bold { font-weight: 700; }
    .border-b { border-bottom: 1px solid #000; } .border-t { border-top: 1px solid #000; } .border-r { border-right: 1px solid #000; }
    .bg-light { background-color: #f7f7f7; -webkit-print-color-adjust: exact; }
    
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 4px; border-bottom: 1px solid #000; border-top: 1px solid #000; font-weight: 600; font-size: 10px; }
    td { padding: 4px; vertical-align: top; font-size: 10px; }
  </style>
</head>
<body>
<div class="container">
  ${reportsSettings.watermarkOnPdfs ? `<div style="position: absolute; top: 35%; left: 0; width: 100%; text-align: center; font-size: 80px; color: rgba(0,0,0,0.06); transform: rotate(-45deg); z-index: -1; pointer-events: none; white-space: nowrap;">${business.name}</div>` : ''}
  <div class="text-center border-b p-1 bg-light font-bold" style="font-size: 14px;">TAX INVOICE</div>
  
  <div style="display: flex; border-b: 1px solid #000;">
    <div style="width: 50%; border-right: 1px solid #000; padding: 8px;">
      ${business.logo && reportsSettings.logoInReports !== false ? `<img src="${business.logo}" style="max-height: 40px; max-width: 150px; margin-bottom: 5px;" alt="Logo"/>` : ''}
      <div style="font-size: 16px; font-weight: 700;">${invoice.businessSnapshot.name}</div>
      <div>${invoice.businessSnapshot.address}</div>
      <div>${invoice.businessSnapshot.state}</div>
      <div style="margin-top: 5px;"><strong>GSTIN:</strong> ${invoice.businessSnapshot.gstin}</div>
    </div>
    <div style="width: 50%; padding: 8px;">
      <table style="font-size: 11px;">
        <tr><td width="35%"><strong>Invoice No:</strong></td><td class="font-bold border-b">${invoice.invoiceNumber}</td></tr>
        <tr><td><strong>Invoice Date:</strong></td><td class="border-b">${formatDate(invoice.invoiceDate)}</td></tr>
        <tr><td><strong>Due Date:</strong></td><td class="border-b">${formatDate(invoice.dueDate)}</td></tr>
        <tr><td><strong>Challans:</strong></td><td>${invoice.challanNumbers.join(', ')}</td></tr>
      </table>
    </div>
  </div>

  <div style="display: flex; border-b: 1px solid #000;">
    <div style="width: 100%; padding: 8px;">
      <div style="font-size: 9px; color: #555;">Billed To:</div>
      <div class="font-bold" style="font-size: 12px;">${invoice.partySnapshot.name}</div>
      <div>${invoice.partySnapshot.address.line1}, ${invoice.partySnapshot.address.city}, ${invoice.partySnapshot.address.state} - ${invoice.partySnapshot.address.pincode}</div>
      <div style="margin-top: 4px;"><strong>GSTIN:</strong> ${invoice.partySnapshot.gstin || 'URD'} | <strong>State:</strong> ${invoice.partySnapshot.address.state}</div>
    </div>
  </div>

  <div style="min-height: 250px;">
    <table>
      <thead>
        <tr>
          <th class="center border-r" width="5%">#</th>
          <th class="border-r" width="35%">Item Description</th>
          <th class="center border-r" width="10%">HSN</th>
          <th class="right border-r" width="12%">Qty</th>
          <th class="center border-r" width="8%">Unit</th>
          <th class="right border-r" width="15%">Rate</th>
          <th class="right" width="15%">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  </div>

  <table>
    <tr>
      <td colspan="6" class="border-t right font-bold p-2">Sub Total</td>
      <td class="border-t right font-bold p-2">₹${invoice.subtotal.toFixed(2)}</td>
    </tr>
    ${igstRow}
    <tr>
      <td colspan="6" class="border-t right p-1">Round Off</td>
      <td class="border-t right p-1">₹${invoice.roundOff.toFixed(2)}</td>
    </tr>
    <tr class="bg-light border-t border-b">
      <td colspan="6" class="right font-bold" style="font-size: 14px; padding: 6px;">GRAND TOTAL</td>
      <td class="right font-bold" style="font-size: 14px; padding: 6px;">₹${invoice.finalAmount.toFixed(2)}</td>
    </tr>
  </table>

  <div style="display: flex;">
    <div style="width: 60%; padding: 8px; border-right: 1px solid #000;">
      <div style="font-size: 10px;"><strong>Amount in Words:</strong><br>Rupees ${invoice.amountInWords} Only</div>
      <div style="margin-top: 15px; font-size: 9px;">
        <strong>Terms & Conditions:</strong><br>
        ${invoice.termsAndConditions}
      </div>
    </div>
    <div style="width: 40%; text-align: center; padding: 8px; display: flex; flex-direction: column; justify-content: space-between;">
      <div class="font-bold">For ${invoice.businessSnapshot.name}</div>
      <div style="margin-top: 40px; font-size: 9px; border-top: 1px dashed #666; padding-top: 4px;">Authorized Signatory</div>
    </div>
  </div>

</div>
</body>
</html>
  `;
}
