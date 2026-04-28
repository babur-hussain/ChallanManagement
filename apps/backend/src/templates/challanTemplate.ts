import { IChallanDoc } from '../models/Challan.js';
import { numberToWords, formatDate } from '@textilepro/shared';

export function getChallanHtmlTemplate(challan: IChallanDoc, business: any, reportsSettings: any = {}): string {

  const formattedDate = formatDate(challan.date, 'dd/MM/yyyy');

  let itemsHtml = '';
  challan.items.forEach((item, index) => {
    // Generate small inline boxes for each roll's meter
    const rollMeters = item.meters.map(m => `<span class="roll-badge">${m.toFixed(2)}</span>`).join(', ');

    itemsHtml += `
      <tr>
        <td class="center border-r">${index + 1}</td>
        <td class="border-r"><strong>${item.itemName}</strong><br><span class="text-xxs text-gray">${item.hsnCode}</span></td>
        <td class="center border-r">${item.meters.length}</td>
        <td class="border-r roll-cell">
          <div class="roll-container">${rollMeters}</div>
        </td>
        <td class="right border-r"><strong>${item.totalMeters.toFixed(2)}</strong></td>
        <td class="right border-r">₹${item.ratePerMeter.toFixed(2)}</td>
        <td class="right fw-bold">₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  });

  // Calculate overall totals from the items themselves in case the cached ones are slightly off
  const totalRolls = challan.items.reduce((sum, item) => sum + item.meters.length, 0);

  const amountInWords = numberToWords(challan.totalAmount);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap');
    
    body {
      font-family: 'Noto Sans', sans-serif;
      margin: 0;
      padding: 0;
      font-size: 11px;
      color: #111;
      line-height: 1.4;
    }
    
    .container {
      border: 1px solid #000;
      border-radius: 4px;
      overflow: hidden;
      margin: 0 auto;
    }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .right { text-align: right; }
    .center { text-align: center; }
    .fw-bold { font-weight: 700; }
    .text-xs { font-size: 10px; }
    .text-xxs { font-size: 8px; }
    .text-gray { color: #555; }
    .uppercase { text-transform: uppercase; }
    
    .border-b { border-bottom: 1px solid #000; }
    .border-r { border-right: 1px solid #000; }
    .border-t { border-top: 1px solid #000; }
    
    .header-section {
      padding: 15px 15px 10px 15px;
      text-align: center;
    }
    
    .business-name {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0 0 5px 0;
    }
    
    .business-address {
      font-size: 10px;
      color: #333;
    }
    
    .title-banner {
      background-color: #f0f0f0;
      padding: 4px 0;
      font-weight: bold;
      font-size: 14px;
      text-transform: uppercase;
      -webkit-print-color-adjust: exact;
    }
    
    .info-grid {
      display: flex;
      width: 100%;
    }
    
    .info-col {
      width: 50%;
      padding: 10px;
      box-sizing: border-box;
    }
    
    .p-label {
      font-size: 9px;
      color: #666;
      margin-bottom: 2px;
      display: block;
    }
    
    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    
    th {
      background-color: #f8f8f8;
      -webkit-print-color-adjust: exact;
      padding: 6px 4px;
      font-weight: 600;
      text-align: left;
      font-size: 10px;
      border-bottom: 1px solid #000;
    }
    
    td {
      padding: 6px 4px;
      vertical-align: top;
      font-size: 10px;
    }
    
    th.center, td.center { text-align: center; }
    th.right, td.right { text-align: right; }
    
    .col-sr { width: 4%; }
    .col-quality { width: 22%; }
    .col-rolls { width: 6%; }
    .col-meters { width: 36%; }
    .col-total { width: 10%; }
    .col-rate { width: 10%; }
    .col-amount { width: 12%; }
    
    .roll-cell {
      padding: 4px;
    }
    
    .roll-container {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
    }
    
    .roll-badge {
      font-size: 9px;
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 2px;
      padding: 1px 3px;
      white-space: nowrap;
      -webkit-print-color-adjust: exact;
    }
    
    /* Truncate table to push footer to bottom appropriately if needed, but flex column is better */
    .table-wrapper {
      min-height: 400px;
    }
    
    .totals-row {
      background-color: #f8f8f8;
      -webkit-print-color-adjust: exact;
    }
    
    .totals-row td {
      border-top: 1px solid #000;
      font-weight: bold;
      padding: 8px 4px;
    }
    
    .footer-section {
      display: flex;
      width: 100%;
      border-top: 1px solid #000;
    }
    
    .signatures {
      width: 35%;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 80px;
    }
    
    .terms {
      width: 65%;
      padding: 10px;
      border-right: 1px solid #000;
    }

    .amount-words-container {
      padding: 8px 10px;
      border-top: 1px solid #000;
    }

    ${challan.paperSize === 'A5' ? `
    /* A5 Size Overrides */
    body { font-size: 8.5px; line-height: 1.25; }
    .business-name { font-size: 18px; margin: 0; }
    .business-address { font-size: 8px; }
    .title-banner { font-size: 11px; padding: 3px 0; }
    .p-label { font-size: 7px; }
    .info-col { padding: 6px; }
    th { font-size: 8px; padding: 4px 2px; }
    td { font-size: 8px; padding: 4px 2px; }
    .text-xs { font-size: 8px; }
    .text-xxs { font-size: 6px; }
    .roll-badge { font-size: 7.5px; padding: 0px 2px; border: 0.5px solid #e4e4e7; }
    .table-wrapper { min-height: 250px; }
    .signatures { min-height: 60px; padding: 6px; }
    .terms { padding: 6px; }
    .footer-section .terms ol { font-size: 7px; padding-left: 12px; }
    .amount-words-container { padding: 5px 8px; }
    ` : ''}
  </style>
</head>
<body>

<div class="container">
  ${reportsSettings.watermarkOnPdfs ? `<div style="position: absolute; top: 35%; left: 0; width: 100%; text-align: center; font-size: 80px; color: rgba(0,0,0,0.06); transform: rotate(-45deg); z-index: -1; pointer-events: none; whitsepace: nowrap;">${business.name}</div>` : ''}
  <!-- Header -->
  <div class="header-section">
    ${business.logo && reportsSettings.logoInReports !== false ? `<img src="${business.logo}" style="max-height: 60px; max-width: 150px; margin-bottom: 5px;" alt="Logo"/>` : ''}
    <h1 class="business-name uppercase">${business.name}</h1>
    <div class="business-address">
      ${business.address || ''}<br>
      ${business.city || ''}, ${business.state || ''} - ${business.pincode || ''}<br>
      <strong>Phone:</strong> ${business.phone} 
      ${business.gstin ? ` | <strong>GSTIN:</strong> ${business.gstin}` : ''}
    </div>
  </div>
  
  <div class="title-banner text-center border-t border-b">
    DELIVERY CHALLAN
  </div>
  
  <!-- Info Box -->
  <div class="info-grid border-b">
    <div class="info-col border-r">
      <span class="p-label">To,</span>
      <div class="fw-bold text-xs uppercase">${challan.partySnapshot.name}</div>
      <div>${challan.partySnapshot.address.line1}</div>
      <div>${challan.partySnapshot.address.city}, ${challan.partySnapshot.address.state} - ${challan.partySnapshot.address.pincode}</div>
      <div style="margin-top: 4px;"><strong>GSTIN:</strong> ${challan.partySnapshot.gstin || 'URD'}</div>
      <div><strong>Phone:</strong> ${challan.partySnapshot.phone}</div>
    </div>
    
    <div class="info-col">
      <table style="width: 100%; font-size: 10px;" cellpadding="2">
        <tr>
          <td width="40%"><strong>Challan No:</strong></td>
          <td width="60%" class="fw-bold">${challan.challanNumber}</td>
        </tr>
        <tr>
          <td><strong>Date:</strong></td>
          <td>${formattedDate}</td>
        </tr>
        <tr>
          <td><strong>Transporter:</strong></td>
          <td>${challan.transporterName || '-'}</td>
        </tr>
        <tr>
          <td><strong>Vehicle No:</strong></td>
          <td>${challan.vehicleNumber || '-'}</td>
        </tr>
        <tr>
          <td><strong>Broker:</strong></td>
          <td>${challan.brokerSnapshot?.name || '-'}</td>
        </tr>
      </table>
    </div>
  </div>
  
  <!-- Items Table -->
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th class="border-r center col-sr">Sr.</th>
          <th class="border-r col-quality">Quality / HSN</th>
          <th class="border-r center col-rolls">Rolls</th>
          <th class="border-r col-meters">Meter Details</th>
          <th class="border-r right col-total">Total Mtr</th>
          <th class="border-r right col-rate">Rate/Mtr</th>
          <th class="right col-amount">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        
        <!-- Totals Row -->
        <tr class="totals-row">
          <td colspan="2" class="border-r right"><strong>Total</strong></td>
          <td class="center border-r">${totalRolls}</td>
          <td class="border-r"></td>
          <td class="right border-r">${challan.totalMeters.toFixed(2)}</td>
          <td class="border-r"></td>
          <td class="right">${challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <!-- Remarks & Words -->
  ${challan.remarks ? `<div style="padding: 6px 10px; border-top: 1px solid #000;"><strong>Remarks:</strong> ${challan.remarks}</div>` : ''}
  
  <div class="amount-words-container">
    <strong>Amount in Words:</strong> Rupees ${amountInWords} Only
  </div>
  
  <!-- Footer Terms & Sign -->
  <div class="footer-section">
    <div class="terms">
      <span class="p-label fw-bold">Terms & Conditions:</span>
      <ol style="margin: 4px 0 0 0; padding-left: 15px; font-size: 8px; color: #444;">
        <li>Goods once sold will not be taken back.</li>
        <li>Our responsibility ceases once goods leave our premises.</li>
        <li>Subject to Surat Jurisdiction.</li>
      </ol>
      <div style="margin-top: 10px; font-size: 8px;">
        <span class="fw-bold">Receiver's Sign / Stamp:</span> ______________________
      </div>
    </div>
    <div class="signatures center">
      <div class="fw-bold text-xs">For ${business.name}</div>
      <div style="margin-top: 40px; border-top: 1px dashed #999; padding-top: 4px; font-size: 9px; color: #666;">
        Authorised Signatory
      </div>
    </div>
  </div>
  
  <div style="text-align: center; padding: 4px; font-size: 7px; color: #888; border-top: 1px solid #000;">
    This is a computer generated delivery challan. | Powered by TextilePro
  </div>

</div>

</body>
</html>
  `;
}
