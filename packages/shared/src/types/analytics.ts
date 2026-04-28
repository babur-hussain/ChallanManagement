export interface IAnalyticsDashboard {
  todayChallansCount: number;
  todayChallansMeters: number;
  todayChallansAmount: number;
  yesterdayChallansMeters: number;
  
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  
  totalOutstanding: number;
  monthlyRevenueForOutstandingThreshold: number; // to check if > 20%
  
  collectionsThisMonth: number;
  collectionRate: number; // percentage
  
  lowStockItemsCount: number;
  activePartiesThisMonth: number;
  
  metersDispatchedChart: any[]; // { month: string, [itemName]: number, others: number, total: number } []
  revenueCollectionsChart: any[]; // { month: string, invoiced: number, collected: number } []
  topPartiesChart: any[]; // { partyId, name, shortCode, meters, amount } []
  qualityMixChart: any[]; // { name, meters, percentage } []
  dailyActivityChart: any[]; // { day: string, challansCreated: number, challansDelivered: number, paymentsReceived: number } []
  outstandingAging: any[]; // { bucket: '0-30', amount: number } []
  
  recentFeed: any[]; // { id, type, description, partyName, amountInfo, timestamp } []
}
