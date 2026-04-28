import { Router } from 'express';
import mongoose from 'mongoose';
import { ReportService } from '../services/report.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { Invoice } from '../models/Invoice.js';
import { Party } from '../models/Party.js';
import { AiOrchestrator } from '../services/ai/AiOrchestrator.service.js';

const router = Router();
router.use(authenticate, tenantIsolation);

router.get('/party-statement', async (req, res) => {
  try {
    const { partyId, fromDate, toDate } = req.query;
    if (!partyId) throw new Error('Party ID required');

    let from, to;
    if (fromDate) from = new Date(fromDate as string);
    if (toDate) to = new Date(toDate as string);

    const workbook = await ReportService.getPartyStatementExcel(req.businessId!, partyId as string, from, to);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Statement_${partyId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/outstanding', async (req, res) => {
  try {
    const workbook = await ReportService.getOutstandingExcel(req.businessId!);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Outstanding_Report.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ═══════════════════════════════════════════════
// Outstanding JSON API (for mobile screens)
// ═══════════════════════════════════════════════
router.get('/outstanding-json', async (req, res) => {
  try {
    const partyId = req.query.partyId as string | undefined;

    // Build filter — include all non-cancelled invoices
    const invoiceFilter: any = {
      businessId: req.businessId,
      status: { $nin: ['CANCELLED'] },
    };
    if (partyId) {
      try { invoiceFilter.partyId = new mongoose.Types.ObjectId(partyId); } catch { invoiceFilter.partyId = partyId; }
    }

    const invoices = await Invoice.find(invoiceFilter).sort({ invoiceDate: -1 }).lean() as any[];

    // Get all parties referenced
    const partyIds = [...new Set(invoices.map((i: any) => String(i.partyId)))];
    const parties = await Party.find({ _id: { $in: partyIds } }).lean() as any[];
    const partyMap = new Map(parties.map((p: any) => [String(p._id), p]));

    const now = new Date();

    // Group by party
    const partyBuckets: Record<string, any> = {};

    for (const inv of invoices) {
      const pid = String(inv.partyId);
      if (!partyBuckets[pid]) {
        const party = partyMap.get(pid) as any;
        partyBuckets[pid] = {
          partyId: pid,
          partyName: inv.partySnapshot?.name || party?.name || 'Unknown',
          shortCode: party?.shortCode || '',
          city: party?.address?.city || inv.partySnapshot?.address?.city || '',
          totalOutstanding: 0,
          invoiceCount: 0,
          current: 0,
          days30_60: 0,
          days60_90: 0,
          days90Plus: 0,
          invoices: [],
        };
      }

      const bucket = partyBuckets[pid];
      const due = inv.balanceDue || 0;
      const daysDiff = Math.floor((now.getTime() - new Date(inv.dueDate || inv.invoiceDate).getTime()) / (1000 * 60 * 60 * 24));

      bucket.totalOutstanding += due;
      bucket.invoiceCount += 1;

      if (daysDiff <= 30) bucket.current += due;
      else if (daysDiff <= 60) bucket.days30_60 += due;
      else if (daysDiff <= 90) bucket.days60_90 += due;
      else bucket.days90Plus += due;

      bucket.invoices.push({
        invoiceId: String(inv._id),
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        totalAmount: inv.totalAmount,
        balanceDue: due,
        daysOverdue: Math.max(0, daysDiff),
        items: (inv.items || []).slice(0, 3).map((it: any) => ({
          itemName: it.itemName,
          quantity: it.quantity,
          amount: it.amount || (it.quantity || 0) * (it.ratePerUnit || 0),
        })),
      });
    }

    const partyList = Object.values(partyBuckets).sort((a: any, b: any) => b.totalOutstanding - a.totalOutstanding);

    const summary = {
      totalOutstanding: partyList.reduce((s: number, p: any) => s + p.totalOutstanding, 0),
      totalParties: partyList.length,
      totalInvoices: invoices.length,
      current: partyList.reduce((s: number, p: any) => s + p.current, 0),
      days30_60: partyList.reduce((s: number, p: any) => s + p.days30_60, 0),
      days60_90: partyList.reduce((s: number, p: any) => s + p.days60_90, 0),
      days90Plus: partyList.reduce((s: number, p: any) => s + p.days90Plus, 0),
    };

    res.json({ success: true, data: { summary, parties: partyList } });
  } catch (error: any) {
    console.error('[OUTSTANDING JSON ERROR]', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ════════════════════════════════════════════════════════════
// AI-Powered Insights — fires immediately on page open
// Uses OpenRouter Gemma 4 with a deep financial analyst prompt
// ════════════════════════════════════════════════════════════
router.post('/outstanding-ai-insights', async (req, res) => {
  try {
    const { summary, topParties } = req.body;

    const fmt = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;
    const pct = (part: number, total: number) => total > 0 ? `${((part / total) * 100).toFixed(1)}%` : '0%';

    const totalOutstanding = summary?.totalOutstanding || 0;
    const current = summary?.current || 0;
    const d3060 = summary?.days30_60 || 0;
    const d6090 = summary?.days60_90 || 0;
    const d90p = summary?.days90Plus || 0;

    const systemPrompt = `You are a senior financial analyst and credit risk advisor for TextilePro, a B2B textile business management platform used by fabric traders, weavers, and garment manufacturers in India.

Your job is to analyze accounts receivable (outstanding invoice data) and deliver sharp, actionable credit risk insights.

RULES:
- Return ONLY a valid JSON array — no markdown, no explanation text outside the array
- Provide EXACTLY 4 insight objects
- Each object must have this exact structure:
  { "icon": "<single emoji>", "title": "<6 words max>", "body": "<2-3 sentences with specific numbers and actionable advice>", "severity": "<high|medium|low>" }
- severity: "high" = urgent action needed, "medium" = monitor closely, "low" = informational
- Use rupee amounts with commas as provided. Reference specific party names and amounts where relevant.
- Insights must cover: (1) overall cash flow risk, (2) aging/overdue analysis, (3) top debtor priority, (4) collection strategy recommendation`;

    const partyLines = (topParties || [])
      .slice(0, 8)
      .map((p: any, i: number) => `  ${i + 1}. ${p.partyName} (${p.city || 'N/A'}): Outstanding ${fmt(p.totalOutstanding)} across ${p.invoiceCount} invoice(s), oldest ${p.daysOverdue || 0} days overdue`)
      .join('\n');

    const userQuery = `=== OUTSTANDING RECEIVABLES REPORT ===

BUSINESS SUMMARY:
- Total Outstanding: ${fmt(totalOutstanding)}
- Parties with Outstanding: ${summary?.totalParties || 0}
- Total Open Invoices: ${summary?.totalInvoices || 0}

AGING BREAKDOWN:
- Current (0–30 days): ${fmt(current)} [${pct(current, totalOutstanding)} of total]
- Overdue 31–60 days:  ${fmt(d3060)} [${pct(d3060, totalOutstanding)} of total]
- Overdue 61–90 days:  ${fmt(d6090)} [${pct(d6090, totalOutstanding)} of total]
- Overdue 90+ days:    ${fmt(d90p)} [${pct(d90p, totalOutstanding)} of total — HIGH RISK]

TOP DEBTORS:
${partyLines || '  No party data available'}

Today's Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

Analyze the above data and return exactly 4 insights as a JSON array.`;

    console.log('[AI INSIGHTS] Sending request to OpenRouter...');
    const raw = await AiOrchestrator.execute(
      { systemString: systemPrompt, userQuery, temperature: 0.3 },
      'google/gemma-4-31b-it:free'
    );
    console.log('[AI INSIGHTS] Raw response:', raw?.substring(0, 200));

    let insights;
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      insights = [{ icon: '📊', title: 'Analysis Complete', body: raw?.substring(0, 300) || 'Analysis received.', severity: 'medium' }];
    }

    res.json({ success: true, data: { insights } });
  } catch (error: any) {
    console.error('[AI INSIGHTS ERROR]', error);
    res.json({
      success: true,
      data: {
        insights: [
          { icon: '⚠️', title: 'AI Temporarily Unavailable', body: 'Could not reach the AI service. Check your OpenRouter API key and try again.', severity: 'low' }
        ]
      }
    });
  }
});

export default router;
