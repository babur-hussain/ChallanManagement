import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

// Layouts
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MarketingLayout } from '@/layouts/MarketingLayout';

// Public SEO Marketing
import { LandingPage } from '@/pages/public/LandingPage';
import { PricingPage } from '@/pages/public/PricingPage';
import { LegalPage } from '@/pages/public/LegalPages';

// Guards
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// App Pages
import { UpgradePage } from '@/pages/UpgradePage';

// Master Data Pages
import { ItemListPage } from '@/pages/master/item/ItemListPage';
import { PartyListPage } from '@/pages/master/party/PartyListPage';
import { PartyDetailPage } from '@/pages/master/party/PartyDetailPage';
import { BrokerListPage } from '@/pages/master/broker/BrokerListPage';
import { CategoryListPage } from '@/pages/master/category/CategoryListPage';
import { MasterHub } from '@/pages/master/hub/MasterHub';

// CRM Module
import { LeadsListPage } from '@/pages/crm/leads/LeadsListPage';
import { LeadsKanbanPage } from '@/pages/crm/leads/LeadsKanbanPage';
import { LeadDetailPage } from '@/pages/crm/leads/LeadDetailPage';
import { TasksPage } from '@/pages/crm/TasksPage';
import { VisitsPage } from '@/pages/crm/VisitsPage';
import { LeaderboardsPage } from '@/pages/crm/LeaderboardsPage';

// Challan Module
import { ChallanListPage } from '@/pages/challan/ChallanListPage';
import { ChallanDetailPage } from '@/pages/challan/ChallanDetailPage';
import { ChallanPrintPage } from '@/pages/challan/ChallanPrintPage';
import { ChallanCreatePage } from '@/pages/challan/ChallanCreatePage';
import { ChallanEditPage } from '@/pages/challan/ChallanEditPage';

// Invoice Module
import { InvoiceListPage } from '@/pages/invoice/InvoiceListPage';
import { InvoiceCreatePage } from '@/pages/invoice/InvoiceCreatePage';
import { InvoiceDetailPage } from '@/pages/invoice/InvoiceDetailPage';
import { InvoicePrintPage } from '@/pages/invoice/InvoicePrintPage';

// Quotation Module
import { QuotationListPage } from '@/pages/quotation/QuotationListPage';
import { QuotationCreatePage } from '@/pages/quotation/QuotationCreatePage';
import { QuotationDetailPage } from '@/pages/quotation/QuotationDetailPage';

// Billing & GST
import { BillingDashboardPage } from '@/pages/billing/BillingDashboardPage';

// Collections Module
import { CollectionsDashboardPage } from '@/pages/collections/CollectionsDashboardPage';
import { OutstandingTablePage } from '@/pages/collections/OutstandingTablePage';
import { PartyRecoveryDetailPage } from '@/pages/collections/PartyRecoveryDetailPage';

// WhatsApp Module
import { InboxPage } from '@/pages/whatsapp/InboxPage';
import { TemplatesPage } from '@/pages/whatsapp/TemplatesPage';
import { CampaignsPage } from '@/pages/whatsapp/CampaignsPage';

// Inventory Module
import { InventoryHub } from '@/pages/inventory/InventoryHub';
import { PurchaseCreatePage } from '@/pages/inventory/PurchaseCreatePage';

// Marketplace Module
import { MarketplaceHub } from '@/pages/marketplace/MarketplaceHub';
import { BrowseListings } from '@/pages/marketplace/BrowseListings';
import { MyProfile } from '@/pages/marketplace/MyProfile';
import { MyListings } from '@/pages/marketplace/MyListings';
import { InquiriesInbox } from '@/pages/marketplace/InquiriesInbox';

// Finance Module
import { FinanceDashboard } from '@/pages/finance/FinanceDashboard';
import { AccountsPage } from '@/pages/finance/AccountsPage';
import { ExpensesPage } from '@/pages/finance/ExpensesPage';
import { ManagementReports } from '@/pages/finance/ManagementReports';

// Enterprise & HRMS Module
import { CorporateDashboard } from '@/pages/enterprise/CorporateDashboard';
import { BranchesManager } from '@/pages/enterprise/BranchesManager';
import { HrmsHub } from '@/pages/enterprise/HrmsHub';
import { ApprovalsInbox } from '@/pages/enterprise/ApprovalsInbox';
import { AuditLogsPage } from '@/pages/enterprise/AuditLogsPage';

// SaaS Monitization OS
import { SaaSDashboard } from '@/pages/saas/SaaSDashboard';
import { PartnerPortal } from '@/pages/saas/PartnerPortal';
import { WhiteLabelConfig } from '@/pages/saas/WhiteLabelConfig';
import { CustomerSuccessHub } from '@/pages/saas/CustomerSuccessHub';

// Internal Platform Operations (Founders Only)
import { OpsDashboard } from '@/pages/ops/OpsDashboard';
import { TenantManager } from '@/pages/ops/TenantManager';
import { InfrastructureHealth } from '@/pages/ops/InfrastructureHealth';
import { FeatureFlagsUI } from '@/pages/ops/FeatureFlagsUI';

// Growth OS
import { HyperGrowthDashboard } from '@/pages/ops/growth/HyperGrowthDashboard';
import { CityDominationMap } from '@/pages/ops/growth/CityDominationMap';
import { SalesPipeline } from '@/pages/ops/growth/SalesPipeline';
import { CompetitorWarRoom } from '@/pages/ops/growth/CompetitorWarRoom';

// API Ecosystem & Integrations
import { IntegrationsMarketplace } from '@/pages/integrations/IntegrationsMarketplace';
import { ApiKeysUI } from '@/pages/integrations/ApiKeysUI';
import { WebhooksUI } from '@/pages/integrations/WebhooksUI';

// Global & Regional Ops
import { GlobalExpansionDashboard } from '@/pages/ops/global/GlobalExpansionDashboard';
import { IndustryPacksUI } from '@/pages/ops/global/IndustryPacksUI';
import { LocalizationManager } from '@/pages/ops/global/LocalizationManager';
import { BusinessLocalizationSettings } from '@/pages/settings/BusinessLocalizationSettings';
import { SettingsPage } from '@/pages/settings/SettingsPage';

// AI Workforce OS 
import { AiCommandCenter } from '@/pages/ai/AiCommandCenter';
import { AiInbox } from '@/pages/ai/AiInbox';
import { PromptManager } from '@/pages/ai/PromptManager';
import { FounderCopilot } from '@/pages/ai/FounderCopilot';

// Components
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineIndicator } from '@/components/OfflineIndicator';

// Stores
import { useAuthStore } from '@/stores/authStore';

// ═══════════════════════════════════════════════════════════════
// TanStack Query Client
// ═══════════════════════════════════════════════════════════════

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ═══════════════════════════════════════════════════════════════
// App Component — Root Router
// ═══════════════════════════════════════════════════════════════

function AppContent() {
  const { refreshSession } = useAuthStore();

  // Check session on mount
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC MARKETING & SEO TIER */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/legal/privacy" element={<LegalPage title="Privacy Policy" lastUpdated="April 2026" />} />
          <Route path="/legal/terms" element={<LegalPage title="Terms of Service" lastUpdated="April 2026" />} />
        </Route>

        {/* Auth routes (public) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Full-screen print route (no sidebar/app shell) */}
        <Route path="/app/challans/:id/print" element={
          <ProtectedRoute>
            <ChallanPrintPage />
          </ProtectedRoute>
        } />
        <Route path="/app/invoices/:id/print" element={
          <ProtectedRoute>
            <InvoicePrintPage />
          </ProtectedRoute>
        } />

        {/* App routes (protected) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="upgrade" element={<UpgradePage />} />

          {/* CRM Module */}
          <Route path="crm/leads" element={<LeadsListPage />} />
          <Route path="crm/leads/kanban" element={<LeadsKanbanPage />} />
          <Route path="crm/leads/:id" element={<LeadDetailPage />} />
          <Route path="crm/tasks" element={<TasksPage />} />
          <Route path="crm/visits" element={<VisitsPage />} />
          <Route path="crm/leaderboards" element={<LeaderboardsPage />} />

          {/* Master Data */}
          <Route path="items" element={<MasterHub />} />
          <Route path="categories" element={<MasterHub />} />
          <Route path="masters" element={<MasterHub />} />
          <Route path="parties" element={<PartyListPage />} />
          <Route path="parties/:id" element={<PartyDetailPage />} />
          <Route path="brokers" element={<BrokerListPage />} />

          {/* Transactions (Core) */}
          <Route path="challans" element={<ChallanListPage />} />
          <Route path="challans/create" element={<ChallanCreatePage />} />
          <Route path="challans/:id/edit" element={<ChallanEditPage />} />
          <Route path="challans/:id" element={<ChallanDetailPage />} />

          <Route path="invoices" element={<InvoiceListPage />} />
          <Route path="invoices/create" element={<InvoiceCreatePage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />

          <Route path="quotations" element={<QuotationListPage />} />
          <Route path="quotations/create" element={<QuotationCreatePage />} />
          <Route path="quotations/:id" element={<QuotationDetailPage />} />

          <Route path="billing" element={<BillingDashboardPage />} />

          <Route path="collections" element={<CollectionsDashboardPage />} />
          <Route path="collections/outstanding" element={<OutstandingTablePage />} />
          <Route path="collections/party/:partyId" element={<PartyRecoveryDetailPage />} />

          <Route path="whatsapp" element={<InboxPage />} />
          <Route path="whatsapp/templates" element={<TemplatesPage />} />
          <Route path="whatsapp/campaigns" element={<CampaignsPage />} />

          <Route path="inventory" element={<InventoryHub />} />
          <Route path="inventory/purchase" element={<PurchaseCreatePage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Marketplace Module */}
          <Route path="marketplace" element={<MarketplaceHub />} />
          <Route path="marketplace/browse" element={<BrowseListings />} />
          <Route path="marketplace/profile" element={<MyProfile />} />
          <Route path="marketplace/my-listings" element={<MyListings />} />
          <Route path="marketplace/inquiries" element={<InquiriesInbox />} />
          <Route path="marketplace/buyers" element={<ComingSoon title="Recommended Buyers" />} />

          {/* Finance OS Module */}
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="finance/accounts" element={<AccountsPage />} />
          <Route path="finance/expenses" element={<ExpensesPage />} />
          <Route path="finance/reports" element={<ManagementReports />} />

          {/* Enterprise & HRMS Module */}
          <Route path="enterprise" element={<CorporateDashboard />} />
          <Route path="enterprise/branches" element={<BranchesManager />} />
          <Route path="enterprise/hrms" element={<HrmsHub />} />
          <Route path="enterprise/approvals" element={<ApprovalsInbox />} />
          <Route path="enterprise/audit" element={<AuditLogsPage />} />

          {/* SaaS & Platform OS */}
          <Route path="saas" element={<SaaSDashboard />} />
          <Route path="saas/partners" element={<PartnerPortal />} />
          <Route path="saas/whitelabel" element={<WhiteLabelConfig />} />
          <Route path="saas/success" element={<CustomerSuccessHub />} />

          {/* DevOps & SOC Internal */}
          <Route path="ops">
            <Route index element={<OpsDashboard />} />
            <Route path="tenants" element={<TenantManager />} />
            <Route path="infrastructure" element={<InfrastructureHealth />} />
            <Route path="feature-flags" element={<FeatureFlagsUI />} />
            <Route path="growth" element={<HyperGrowthDashboard />} />
            <Route path="growth/city-domination" element={<CityDominationMap />} />
            <Route path="growth/pipeline" element={<SalesPipeline />} />
            <Route path="growth/war-room" element={<CompetitorWarRoom />} />
            <Route path="global/expansion" element={<GlobalExpansionDashboard />} />
            <Route path="global/packs" element={<IndustryPacksUI />} />
            <Route path="global/localization" element={<LocalizationManager />} />
          </Route>

          {/* Integrations & APIs */}
          <Route path="integrations">
            <Route index element={<IntegrationsMarketplace />} />
            <Route path="api-keys" element={<ApiKeysUI />} />
            <Route path="webhooks" element={<WebhooksUI />} />
          </Route>

          <Route path="settings">
            <Route index element={<SettingsPage />} />
            <Route path="regional" element={<BusinessLocalizationSettings />} />
          </Route>

          {/* AI Workforce */}
          <Route path="ai">
            <Route index element={<AiCommandCenter />} />
            <Route path="inbox" element={<AiInbox />} />
            <Route path="prompts" element={<PromptManager />} />
            <Route path="copilot" element={<FounderCopilot />} />
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <OfflineIndicator />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: 'font-sans',
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// ─── Coming Soon Placeholder ─────────────────────────────────

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        This feature is coming soon. We're building India's best challan management system, one feature at a time.
      </p>
    </div>
  );
}

export default App;
