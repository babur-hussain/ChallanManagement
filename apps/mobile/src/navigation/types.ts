// ═══════════════════════════════════════════════════════════════
// Navigation Type Definitions
// ═══════════════════════════════════════════════════════════════

export type RootStackParamList = {
    Auth: undefined;
    App: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type AccountingStackParamList = {
    VoucherList: undefined;
    CreateVoucher: undefined;
    AdvancedReceipt: undefined;
};

export type AppTabParamList = {
    Home: undefined;
    Transactions: undefined;
    Accounting: undefined;
    More: undefined;
};

export type HomeStackParamList = {
    Dashboard: undefined;
    Settings: undefined;
    Profile: undefined;
    InvoiceDetail: { id: string };
    ChallanDetail: { id: string };
    ChallanCreate: undefined;
    InvoiceCreate: undefined;
    AdvancedReceipt: undefined;
    LedgerManagement: undefined;
    PurchaseCreate: undefined;
    InvoiceList: undefined;
    ChallanList: undefined;
    QuotationList: undefined;
    CreateVoucher: undefined;
    PartyList: undefined;
    PartyDetail: { id: string };
    ItemList: undefined;
    Purchases: undefined;
};

export type TransactionsStackParamList = {
    // Challans
    ChallanList: undefined;
    ChallanDetail: { id: string };
    ChallanCreate: undefined;
    ChallanEdit: { id: string };

    // Invoices
    InvoiceList: undefined;
    InvoiceDetail: { id: string };
    InvoiceCreate: undefined;
    InvoiceEdit: { id: string };

    // Quotations
    QuotationList: undefined;
    QuotationDetail: { id: string };
    QuotationCreate: undefined;

    // Collections
    CollectionsDashboard: undefined;
    OutstandingTable: undefined;
    PartyRecoveryDetail: { partyId: string };
};

export type CRMStackParamList = {
    LeadList: undefined;
    LeadDetail: { id: string };
    Tasks: undefined;
    Visits: undefined;
    Leaderboard: undefined;
};

export type MoreStackParamList = {
    MoreMenu: undefined;

    // Master Data
    PartyList: undefined;
    PartyDetail: { id: string };
    ItemList: undefined;
    BrokerList: undefined;
    WarehouseList: undefined;

    // Inventory
    InventoryHub: undefined;
    Inventory: undefined;
    PurchaseCreate: undefined;
    StockSummary: undefined;
    Purchases: undefined;
    Dispatches: undefined;
    Transfers: undefined;
    Adjustments: undefined;

    // WhatsApp
    WhatsAppInbox: undefined;
    WhatsAppTemplates: undefined;
    WhatsAppCampaigns: undefined;

    // Finance
    FinanceDashboard: undefined;
    LedgerManagement: { partyId?: string } | undefined;
    VoucherList: undefined;
    CreateVoucher: undefined;
    InvoiceDetail: { id: string };
    InvoiceEdit: { id: string };
    InvoiceList: { partyId?: string } | undefined;
    ChallanList: { partyId?: string } | undefined;
    ChallanDetail: { id: string };
    OutstandingTable: { partyId?: string } | undefined;
    Collections: undefined;
    Expenses: undefined;
    ExpenseCreate: undefined;
    BankAccounts: undefined;

    // Enterprise
    OwnerApprovals: undefined;
    EmployeeSelfService: undefined;
    Branches: undefined;
    AuditLogs: undefined;

    // Marketplace
    MarketplaceHub: undefined;
    MyListings: undefined;
    InquiriesInbox: undefined;

    // AI
    FounderCopilot: undefined;
    AiCommandCenter: undefined;

    // Scanner
    Scanner: undefined;

    // Admin / Partner
    SuperAdmin: undefined;
    PartnerDashboard: undefined;

    // Settings
    SettingsPage: undefined;
    LocalizationSettings: undefined;
};
