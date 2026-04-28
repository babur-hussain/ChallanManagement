import mongoose from 'mongoose';
import { Challan } from '../models/Challan.js';
import { Invoice } from '../models/Invoice.js';
import { StockSummary } from '../models/StockSummary.js';
import { Party } from '../models/Party.js';
// We'll calculate real-time by pushing agg logic onto Mongo. Note: in hyper scale caching via Redis is advised.

export class AnalyticsService {
  static async getDashboard(businessId: string | mongoose.Types.ObjectId) {
    const bId = typeof businessId === 'string' ? new mongoose.Types.ObjectId(businessId) : businessId;
    
    const now = new Date();
    
    // Today Boundaries
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfToday = new Date(endOfToday);
    startOfToday.setHours(0,0,0,0);
    
    // Yesterday Boundaries
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(endOfToday);
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);

    // This Month Boundaries
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Last Month Boundaries
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    
    // Last 6 Months Boundary
    const startOf6MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    // Last 12 Months Boundary
    const startOf12MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // 1. Concurrent Dashboard Aggregations (Massive speedup using Promise.all)
    const [
      challanStatsToday,
      challanStatsYesterday,
      invoiceStatsThisMonth,
      invoiceStatsLastMonth,
      outstandingStats,
      paymentsThisMonth,
      lowStockCount,
      activePartiesThisMonthCount,
      
      topPartiesData,
      qualityMixData,
      dailyStatsThisWeek,
      
      recentChallans,
      recentInvoices,
      
      invoicePaymentHistory // Used for 6 month Rev/Coll chart
    ] = await Promise.all([
      // Challans Today
      Challan.aggregate([
        { $match: { businessId: bId, date: { $gte: startOfToday, $lte: endOfToday }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, count: { $sum: 1 }, meters: { $sum: '$totalMeters' }, amount: { $sum: '$totalAmount' } } }
      ]),
      // Challans Yesterday
      Challan.aggregate([
        { $match: { businessId: bId, date: { $gte: startOfYesterday, $lte: endOfYesterday }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, meters: { $sum: '$totalMeters' } } }
      ]),
      // Revenue this month 
      Invoice.aggregate([
        { $match: { businessId: bId, invoiceDate: { $gte: startOfMonth, $lte: endOfToday }, status: 'ACTIVE' } },
        { $group: { _id: null, amount: { $sum: '$finalAmount' } } }
      ]),
      // Revenue last month
      Invoice.aggregate([
        { $match: { businessId: bId, invoiceDate: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: 'ACTIVE' } },
        { $group: { _id: null, amount: { $sum: '$finalAmount' } } }
      ]),
      // Total Outstanding (All time unpaid/partial)
      Invoice.aggregate([
        { $match: { businessId: bId, paymentStatus: { $ne: 'PAID' }, status: 'ACTIVE' } },
        { $group: { _id: null, amount: { $sum: '$balanceDue' } } }
      ]),
      // Collections this month
      Invoice.aggregate([
        { $match: { businessId: bId, status: 'ACTIVE', 'payments.date': { $gte: startOfMonth, $lte: endOfToday } } },
        { $unwind: '$payments' },
        { $match: { 'payments.date': { $gte: startOfMonth, $lte: endOfToday } } },
        { $group: { _id: null, collected: { $sum: '$payments.amount' } } }
      ]),
      // Low Stock
      StockSummary.countDocuments({ businessId: bId, isLowStock: true }),
      // Active Parties This Month (Parties with a challan)
      Challan.distinct('partyId', { businessId: bId, date: { $gte: startOfMonth, $lte: endOfToday }, status: { $ne: 'CANCELLED'} }),

      // CHART 3: Top Parties (Current Month)
      Challan.aggregate([
        { $match: { businessId: bId, date: { $gte: startOfMonth, $lte: endOfToday }, status: { $ne: 'CANCELLED' } } },
        { $group: { _id: '$partyId', meters: { $sum: '$totalMeters' }, amount: { $sum: '$totalAmount' } } },
        { $sort: { meters: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'parties', localField: '_id', foreignField: '_id', as: 'party' } },
        { $unwind: '$party' },
        { $project: { _id: 0, partyId: '$_id', name: '$party.name', shortCode: '$party.shortCode', meters: 1, amount: 1 } }
      ]),

      // CHART 4: Quality Mix
      Challan.aggregate([
        { $match: { businessId: bId, date: { $gte: startOfMonth, $lte: endOfToday }, status: { $ne: 'CANCELLED' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.itemName', meters: { $sum: '$items.totalMeters' } } },
        { $sort: { meters: -1 } },
        { $limit: 15 } // Top 15 qualities
      ]),

      // CHART 5: Daily Activity (Last 7 Days)
      Challan.aggregate([
        { $match: { businessId: bId, date: { $gte: new Date(now.getTime() - 7*24*60*60*1000) } } },
        { $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            challansCreated: { $sum: { $cond: [{ $ne: ['$status', 'CANCELLED'] }, 1, 0] } },
            challansDelivered: { $sum: { $cond: [{ $in: ['$status', ['DELIVERED', 'BILLED']] }, 1, 0] } }
        }},
        { $sort: { _id: 1 } }
      ]),

      // FEEDS
      Challan.find({ businessId: bId }).sort({ createdAt: -1 }).limit(10).populate('partyId', 'name').lean(),
      Invoice.find({ businessId: bId }).sort({ createdAt: -1 }).limit(5).lean(),
      
      // History for Charts 1 & 2
      Invoice.aggregate([
        { $match: { businessId: bId, invoiceDate: { $gte: startOf6MonthsAgo }, status: 'ACTIVE' } },
        { $group: { 
            _id: { 
              month: { $month: "$invoiceDate" }, 
              year: { $year: "$invoiceDate" } 
            }, 
            invoiced: { $sum: '$finalAmount' },
            collectedHere: { $sum: '$totalPaid' } // approximation for simplicity instead of nested unwind
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Format KPIs
    const kpi = {
      todayChallansCount: challanStatsToday[0]?.count || 0,
      todayChallansMeters: challanStatsToday[0]?.meters || 0,
      todayChallansAmount: challanStatsToday[0]?.amount || 0,
      yesterdayChallansMeters: challanStatsYesterday[0]?.meters || 0,
      
      thisMonthRevenue: invoiceStatsThisMonth[0]?.amount || 0,
      lastMonthRevenue: invoiceStatsLastMonth[0]?.amount || 0,
      
      totalOutstanding: outstandingStats[0]?.amount || 0,
      monthlyRevenueForOutstandingThreshold: invoiceStatsThisMonth[0]?.amount || 0,
      
      collectionsThisMonth: paymentsThisMonth[0]?.collected || 0,
      collectionRate: invoiceStatsThisMonth[0]?.amount > 0 ? ((paymentsThisMonth[0]?.collected || 0) / invoiceStatsThisMonth[0].amount) * 100 : 0,
      
      lowStockItemsCount: lowStockCount,
      activePartiesThisMonth: activePartiesThisMonthCount.length
    };

    // Format Quality Mix Check
    const totalMixMeters = qualityMixData.reduce((acc, curr) => acc + curr.meters, 0);
    const qualityMixChart = qualityMixData.map((d: any) => ({
      name: d._id,
      meters: Math.round(d.meters),
      percentage: totalMixMeters > 0 ? Math.round((d.meters / totalMixMeters) * 100) : 0
    }));

    // Format Rev/Collections Chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueCollectionsChart = invoicePaymentHistory.map((d: any) => ({
      month: `${monthNames[d._id.month - 1]} ${String(d._id.year).substr(2,2)}`,
      invoiced: d.invoiced,
      collected: d.collectedHere
    }));

    // Outstanding Aging - Real computation
    // 0-30, 31-60, 61-90, 90+
    const unpaidInvs = await Invoice.find({ businessId: bId, paymentStatus: { $ne: 'PAID' }, status: 'ACTIVE' }, 'dueDate balanceDue').lean();
    
    let bucket30 = 0, bucket60 = 0, bucket90 = 0, bucket90Plus = 0;
    const nowTime = new Date().getTime();
    unpaidInvs.forEach((inv: any) => {
      const dueTime = new Date(inv.dueDate).getTime();
      const diffDays = Math.floor((nowTime - dueTime) / (1000 * 3600 * 24));
      
      if (diffDays <= 30) bucket30 += inv.balanceDue;
      else if (diffDays <= 60) bucket60 += inv.balanceDue;
      else if (diffDays <= 90) bucket90 += inv.balanceDue;
      else bucket90Plus += inv.balanceDue;
    });

    const outstandingAging = [
      { bucket: 'Current/0-30', amount: bucket30 },
      { bucket: '31-60 Days Overdue', amount: bucket60 },
      { bucket: '61-90 Days Overdue', amount: bucket90 },
      { bucket: '90+ Days Overdue', amount: bucket90Plus }
    ];

    // Combine recent feeds
    const recentFeed = [
      ...recentChallans.map((c: any) => ({
        id: c._id,
        type: 'CHALLAN_' + c.status,
        description: `Challan ${c.challanNumber} ${c.status === 'DELIVERED' ? 'delivered' : 'generated'}`,
        partyName: c.partyId?.name || 'Unknown',
        amountInfo: `${c.totalMeters.toFixed(2)}m`,
        timestamp: c.createdAt
      })),
      ...recentInvoices.map((inv: any) => ({
        id: inv._id,
        type: 'INVOICE',
        description: `Invoice ${inv.invoiceNumber} generated`,
        partyName: inv.partySnapshot.name,
        amountInfo: `₹${inv.finalAmount}`,
        timestamp: inv.createdAt
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);

    return {
      ...kpi,
      metersDispatchedChart: [], // stub for now, would aggregate challans similarly 
      revenueCollectionsChart,
      topPartiesChart: topPartiesData,
      qualityMixChart,
      dailyActivityChart: dailyStatsThisWeek,
      outstandingAging,
      recentFeed
    };
  }
}
