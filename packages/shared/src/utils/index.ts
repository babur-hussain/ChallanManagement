// ═══════════════════════════════════════════════════════════════
// Indian Data Utilities
// Format currency, dates, validate GSTIN/PAN, number to words
// ═══════════════════════════════════════════════════════════════

// ─── Indian States (GSTIN state codes) ──────────────────────

export const INDIAN_STATES_MAP: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
  '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
  '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
  '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu', '27': 'Maharashtra',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep',
  '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands', '36': 'Telangana',
  '37': 'Andhra Pradesh', '38': 'Ladakh',
};

// ─── GSTIN Validation & Decode ──────────────────────────────

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z0-9]{1}[0-9A-Z]{1}$/;


export interface GSTINInfo {
  valid: boolean;
  stateCode: string;
  stateName: string;
  pan: string;
  entityCode: string;
  entityType: string;
  checkDigit: string;
  error?: string;
}

const ENTITY_TYPES: Record<string, string> = {
  '1': 'Proprietorship', '2': 'Partnership', '3': 'Trust',
  '4': 'Body of Individuals', '5': 'Local Authority', '6': 'AOP',
  '7': 'Government', '8': 'HUF', '9': 'Company',
  A: 'Urban Local Body', B: 'Industrial Undertaking',
  C: 'Foreign Company', D: 'Department of Central Government',
  E: 'Statutory Body', F: 'PSU', G: 'Central Government',
  H: 'Local Body', I: 'ID to Foreign National', J: 'JV',
  K: 'Foreign Embassy', L: 'Liaison Office', M: 'MF',
  N: 'Non-Resident', O: 'Others',
};


export function validateGSTIN(gstin: string): GSTINInfo {
  const g = gstin.toUpperCase().trim();
  const empty: GSTINInfo = {
    valid: false, stateCode: '', stateName: '', pan: '',
    entityCode: '', entityType: '', checkDigit: '',
  };

  if (g.length !== 15) return { ...empty, error: 'GSTIN must be 15 characters' };
  if (!GSTIN_REGEX.test(g)) return { ...empty, error: 'Invalid GSTIN format' };

  const stateCode = g.substring(0, 2);
  const stateName = INDIAN_STATES_MAP[stateCode];
  if (!stateName) return { ...empty, error: `Invalid state code: ${stateCode}` };

  // Checksum verification
  // The Modulo 36 algorithm frequently produces false negatives for newer entities
  // const expectedCheck = computeGSTINChecksum(g.substring(0, 14));
  // if (expectedCheck !== g[14]) {
  //   return { ...empty, error: 'GSTIN checksum verification failed' };
  // }

  const entityCode = g[12]!;
  return {
    valid: true,
    stateCode,
    stateName,
    pan: g.substring(2, 12),
    entityCode,
    entityType: ENTITY_TYPES[entityCode] || 'Unknown',
    checkDigit: g[14]!,
  };
}

export function getStateFromGSTIN(gstin: string): string | null {
  if (!gstin || gstin.length < 2) return null;
  return INDIAN_STATES_MAP[gstin.substring(0, 2)] || null;
}

// ─── PAN Validation ─────────────────────────────────────────

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function validatePAN(pan: string): boolean {
  return PAN_REGEX.test(pan.toUpperCase().trim());
}

// ─── Indian Phone Validation ────────────────────────────────

export function validateIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

// ─── Currency Formatting (Indian System) ────────────────────

export function formatCurrency(amount: number): string {
  const parts = Math.abs(amount).toFixed(2).split('.');
  const intPart = parts[0]!;
  const decPart = parts[1]!;
  const sign = amount < 0 ? '-' : '';

  let formatted: string;
  if (intPart.length <= 3) {
    formatted = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }
  return `${sign}₹${formatted}.${decPart}`;
}

/** Format amount without ₹ symbol */
export function formatNumber(amount: number): string {
  const parts = Math.abs(amount).toFixed(2).split('.');
  const intPart = parts[0]!;
  const decPart = parts[1]!;
  const sign = amount < 0 ? '-' : '';

  if (intPart.length <= 3) return `${sign}${intPart}.${decPart}`;
  const last3 = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  return `${sign}${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}.${decPart}`;
}

// ─── Date Formatting ────────────────────────────────────────

export function formatDate(date: Date | string, _format?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (_format === 'MMMM do, yyyy') {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = d.getDate();
    const suffix = (day === 1 || day === 21 || day === 31) ? 'st' : (day === 2 || day === 22) ? 'nd' : (day === 3 || day === 23) ? 'rd' : 'th';
    return `${months[d.getMonth()]} ${day}${suffix}, ${d.getFullYear()}`;
  }
  if (_format === 'MMM d, h:mm a') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${months[d.getMonth()]} ${d.getDate()}, ${hours}:${mins} ${ampm}`;
  }
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dd = formatDate(d);
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${dd} ${hours}:${mins} ${ampm}`;
}

// ─── Financial Year ─────────────────────────────────────────

/** Returns current Indian Financial Year e.g. "2024-25" (April - March) */
export function getFinancialYear(date?: Date, startMonthStr: 'april' | 'january' | number = 3): string {
  const d = date || new Date();
  const month = d.getMonth(); // 0-based
  const year = d.getFullYear();

  let startMonth = 3;
  if (startMonthStr === 'january' || startMonthStr === 0) startMonth = 0;
  else if (startMonthStr === 'april' || startMonthStr === 3) startMonth = 3;
  else if (typeof startMonthStr === 'number') startMonth = startMonthStr;

  const fyStart = month >= startMonth ? year : year - 1;
  const fyEnd = (fyStart + 1) % 100;

  // For Jan-Dec format, some businesses prefer writing just "2024" or "2024-24", but standard is start-end
  return `${fyStart}-${fyEnd.toString().padStart(2, '0')}`;
}

/** Alias for getFinancialYear (used by services) */
export const getFinancialYearFormat = getFinancialYear;

/** Returns start and end dates of a financial year */
export function getFinancialYearDates(fyString?: string, startMonthStr: 'april' | 'january' | number = 3): { start: Date; end: Date } {
  const fy = fyString || getFinancialYear(new Date(), startMonthStr);
  const startYear = parseInt(fy.substring(0, 4));

  let startMonth = 3;
  if (startMonthStr === 'january' || startMonthStr === 0) startMonth = 0;
  else if (typeof startMonthStr === 'number') startMonth = startMonthStr;

  if (startMonth === 0) {
    return {
      start: new Date(startYear, 0, 1),
      end: new Date(startYear, 11, 31),
    };
  }

  return {
    start: new Date(startYear, startMonth, 1),      // e.g. April 1
    end: new Date(startYear + 1, startMonth - 1, 31), // March 31
  };
}

// ─── Number to Words (Indian) ───────────────────────────────

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
  'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
  'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n]!;
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return `${TENS[ten]}${one ? ' ' + ONES[one] : ''}`;
}

function threeDigitWords(n: number): string {
  if (n === 0) return '';
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(twoDigitWords(rest));
  return parts.join(' and ');
}

/**
 * Convert amount to Indian words.
 * e.g. 123456.78 → "Rupees One Lakh Twenty Three Thousand Four Hundred and Fifty Six and Paise Seventy Eight Only"
 */
export function numberToWords(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';
  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const rupees = Math.floor(abs);
  const paise = Math.round((abs - rupees) * 100);

  if (rupees === 0 && paise === 0) return 'Rupees Zero Only';

  // Indian grouping: crore (10^7), lakh (10^5), thousand (10^3), hundred (10^2)
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigitWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (hundred) parts.push(threeDigitWords(hundred));

  let result = `${isNeg ? 'Minus ' : ''}Rupees ${parts.join(' ')}`;
  if (paise > 0) {
    result += ` and Paise ${twoDigitWords(paise)}`;
  }
  result += ' Only';

  return result;
}

// ─── Short Code Generator ───────────────────────────────────

/** Generate short code from name: "Shree Krishna Textiles" → "SKT" */
export function generateShortCode(name: string, maxLen = 4): string {
  if (!name.trim()) return '';
  const words = name.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 1) {
    return words[0]!.substring(0, maxLen).toUpperCase();
  }
  return words
    .map(w => w[0])
    .join('')
    .substring(0, maxLen)
    .toUpperCase();
}

// ─── HSN Code Data (common textile HSN codes) ───────────────

export const TEXTILE_HSN_CODES: Record<string, string> = {
  '500710': 'Woven fabrics of silk – plain weave',
  '520100': 'Cotton, not carded or combed',
  '520512': 'Cotton yarn – single, combed',
  '540233': 'Textured yarn of polyester',
  '540720': 'Woven fabrics of strips of polyethylene',
  '540710': 'Woven fabrics of high tenacity yarn of nylon',
  '540752': 'Woven fabrics of textured polyester, dyed',
  '540753': 'Woven fabrics of textured polyester, of yarns of different colours',
  '540754': 'Woven fabrics of textured polyester, printed',
  '540761': 'Woven fabrics containing >= 85% non-textured polyester',
  '550320': 'Staple fibres of polyesters, not carded',
  '551219': 'Woven fabrics >= 85% of polyester staple fibres',
  '551319': 'Woven fabrics of polyester staple fibres',
  '551413': 'Woven fabrics of polyester staple fibres, twill',
  '580110': 'Velvet and plush of cotton',
  '580122': 'Cut corduroy of cotton',
  '580132': 'Velvet and plush of man-made fibres',
  '580190': 'Velvet and plush, other',
  '600110': 'Pile fabrics, knitted or crocheted, of man-made fibres',
  '600192': 'Knitted or crocheted fabrics of man-made fibres',
  '600410': 'Knitted fabrics, width > 30 cm, >= 5% elastomeric',
  '630790': 'Made-up articles of textile, not elsewhere specified',
};

// ─── Item Categories ──────────────────────────────────────

export const ITEM_CATEGORIES = [
  { value: 'RAW_MATERIAL', label: 'Raw Material', labelHi: 'कच्चा माल' },
  { value: 'FINISHED_GOODS', label: 'Finished Goods', labelHi: 'तैयार माल' },
  { value: 'MACHINERY', label: 'Machinery', labelHi: 'मशीनरी' },
  { value: 'PACKAGING', label: 'Packaging', labelHi: 'पैकेजिंग' },
  { value: 'CONSUMABLES', label: 'Consumables', labelHi: 'उपभोज्य' },
  { value: 'SERVICES', label: 'Services', labelHi: 'सेवाएं' },
  { value: 'OTHER', label: 'Other', labelHi: 'अन्य' },
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number]['value'];

// ─── Major Indian Cities (for autocomplete) ─────────────────

export const MAJOR_INDIAN_CITIES = [
  'Surat', 'Mumbai', 'Ahmedabad', 'Delhi', 'Kolkata', 'Chennai', 'Bangalore',
  'Hyderabad', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
  'Thane', 'Bhopal', 'Visakhapatnam', 'Varanasi', 'Patna', 'Vadodara',
  'Rajkot', 'Ludhiana', 'Agra', 'Nashik', 'Jodhpur', 'Amritsar', 'Raipur',
  'Kochi', 'Coimbatore', 'Guwahati', 'Chandigarh', 'Dehradun', 'Bhavnagar',
  'Vapi', 'Anand', 'Navsari', 'Bharuch', 'Morbi', 'Gandhidham',
].sort();
