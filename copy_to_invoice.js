const fs = require('fs');

let content = fs.readFileSync('apps/mobile/src/screens/CreateChallanScreen.tsx', 'utf8');

// Replacements
content = content.replace(/CreateChallanScreen/g, 'CreateInvoiceScreen');
content = content.replace(/useCreateChallan/g, 'useCreateInvoice');
content = content.replace(/useChallanPreview/g, 'useInvoicePreview');
content = content.replace(/useChallans/g, 'useInvoices');
content = content.replace(/useUnbilledChallans/g, 'useInvoices'); // We might not have this, we can remove later

// Strings
content = content.replace(/'New Challan'/g, "'New Invoice'");
content = content.replace(/Create Challan/g, "Create Invoice");
content = content.replace(/Challan created/g, "Invoice created");
content = content.replace(/Failed to create challan/g, "Failed to create invoice");
content = content.replace(/Challan/g, "Invoice");
content = content.replace(/challan/g, "invoice");
content = content.replace(/CHALLAN/g, "INVOICE");

// Some specific fix-ups
content = content.replace(/invoiceNumber:/g, "invoiceNumber:");

fs.writeFileSync('apps/mobile/src/screens/CreateInvoiceScreen.tsx', content);
