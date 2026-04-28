import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LiquidGlassView, LiquidGlassContainerView } from '@callstack/liquid-glass';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, spacing, radius, typography } from '../lib/theme';
import { useAuthStore } from '../stores/authStore';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { ChallanListScreen } from '../screens/ChallanListScreen';
import { ChallanDetailScreen } from '../screens/ChallanDetailScreen';
import { CreateChallanScreen } from '../screens/CreateChallanScreen';
import { MyDeliveriesScreen } from '../screens/MyDeliveriesScreen';
import { PartyListScreen } from '../screens/PartyListScreen';
import { PartyDetailScreen } from '../screens/PartyDetailScreen';
import { ItemListScreen } from '../screens/ItemListScreen';
import { InvoiceListScreen } from '../screens/InvoiceListScreen';
import { InvoiceDetailScreen } from '../screens/InvoiceDetailScreen';
import { CreateInvoiceScreen } from '../screens/CreateInvoiceScreen';
import { EditInvoiceScreen } from '../screens/EditInvoiceScreen';
import { QuotationListScreen } from '../screens/QuotationListScreen';
import { LeadListScreen } from '../screens/LeadListScreen';
import { CollectionsScreen } from '../screens/CollectionsScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { FinanceScreen } from '../screens/FinanceScreen';
import { FounderCopilotScreen } from '../screens/FounderCopilotScreen';
import { OwnerApprovalsScreen } from '../screens/OwnerApprovalsScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { SuperAdminScreen } from '../screens/SuperAdminScreen';
import { PartnerDashboardScreen } from '../screens/PartnerDashboardScreen';
import { EmployeeSelfServiceScreen } from '../screens/EmployeeSelfServiceScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WhatsAppInboxScreen } from '../screens/WhatsAppInboxScreen';
import { EditChallanScreen } from '../screens/EditChallanScreen';
import { WarehouseListScreen } from '../screens/WarehouseListScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { CreateExpenseScreen } from '../screens/CreateExpenseScreen';
import { BankAccountsScreen } from '../screens/BankAccountsScreen';
import { WhatsAppTemplatesScreen } from '../screens/WhatsAppTemplatesScreen';
import { WhatsAppCampaignsScreen } from '../screens/WhatsAppCampaignsScreen';
import { PurchaseCreateScreen } from '../screens/PurchaseCreateScreen';
import { StockTransferScreen } from '../screens/StockTransferScreen';
import { LedgerManagementScreen } from '../screens/LedgerManagementScreen';
import { OutstandingReportScreen } from '../screens/OutstandingReportScreen';
import { VoucherListScreen } from '../screens/VoucherListScreen';
import { CreateVoucherScreen } from '../screens/CreateVoucherScreen';

// Inventory Sub-screens
import { StockSummaryScreen } from '../screens/StockSummaryScreen';
import { PurchasesScreen } from '../screens/PurchasesScreen';
import { DispatchesScreen } from '../screens/DispatchesScreen';
import { TransfersScreen } from '../screens/TransfersScreen';
import { AdjustmentsScreen } from '../screens/AdjustmentsScreen';

import type {
    AppTabParamList,
    HomeStackParamList,
    TransactionsStackParamList,
    CRMStackParamList,
    MoreStackParamList,
} from './types';

// ═══════════════════════════════════════════════════════════════
// Tab Icon Component (text-based until we install an icon library)
// ═══════════════════════════════════════════════════════════════

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
    const icons: Record<string, string> = {
        Home: '🏠',
        Transactions: '📋',
        Accounting: '📒',
        More: '⚙️',
    };
    return (
        <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>{icons[label] || '📦'}</Text>
            <Text
                numberOfLines={1}
                style={{
                    fontSize: 10,
                    fontWeight: focused ? 'bold' : '400',
                    color: focused ? colors.primary : colors.textMuted,
                    marginTop: 2,
                    textAlign: 'center',
                    width: '100%'
                }}
            >
                {label}
            </Text>
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════
// Home Stack
// ═══════════════════════════════════════════════════════════════

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackScreen() {
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontWeight: '700' },
            }}
        >
            <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="ChallanDetail" component={ChallanDetailScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="ChallanCreate" component={CreateChallanScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="InvoiceCreate" component={CreateInvoiceScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="AdvancedReceipt" component={AdvancedReceiptScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="LedgerManagement" component={LedgerManagementScreen} options={{ title: 'Ledger Management' }} />
            <HomeStack.Screen name="PurchaseCreate" component={PurchaseCreateScreen} options={{ title: 'Create Purchase' }} />
            <HomeStack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: 'Invoices' }} />
            <HomeStack.Screen name="ChallanList" component={ChallanListScreen} options={{ title: 'Challans' }} />
            <HomeStack.Screen name="QuotationList" component={QuotationListScreen} options={{ title: 'Quotations' }} />
            <HomeStack.Screen name="CreateVoucher" component={CreateVoucherScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="PartyList" component={PartyListScreen} options={{ title: 'Parties' }} />
            <HomeStack.Screen name="PartyDetail" component={PartyDetailScreen} options={{ title: 'Party Details' }} />
            <HomeStack.Screen name="ItemList" component={ItemListScreen} options={{ title: 'Items' }} />
            <HomeStack.Screen name="Purchases" component={PurchasesScreen} options={{ title: 'Purchases' }} />
        </HomeStack.Navigator>
    );
}

// ═══════════════════════════════════════════════════════════════
// Transactions Stack
// ═══════════════════════════════════════════════════════════════

const TransactionsStack = createNativeStackNavigator<TransactionsStackParamList>();

function TransactionsStackScreen() {
    return (
        <TransactionsStack.Navigator
            screenOptions={{
                headerTransparent: true,
                headerBlurEffect: 'regular',
                headerLargeTitle: true,
                headerLargeTitleShadowVisible: false,
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontWeight: '700' },
            }}
        >
            <TransactionsStack.Screen
                name="ChallanList"
                component={ChallanListScreen}
                options={{ title: 'Challans' }}
            />
            <TransactionsStack.Screen
                name="ChallanDetail"
                component={ChallanDetailScreen}
                options={{ headerShown: false }}
            />
            <TransactionsStack.Screen
                name="ChallanCreate"
                component={CreateChallanScreen}
                options={{ title: 'New Challan', headerShown: false }}
            />
            <TransactionsStack.Screen
                name="InvoiceList" component={InvoiceListScreen}
                options={{ title: 'Invoices' }}
            />
            <TransactionsStack.Screen
                name="InvoiceDetail"
                component={InvoiceDetailScreen}
                options={{ headerShown: false }}
            />
            <TransactionsStack.Screen
                name="InvoiceCreate"
                component={CreateInvoiceScreen}
                options={{ title: 'New Invoice', headerShown: false }}
            />
            <TransactionsStack.Screen
                name="InvoiceEdit"
                component={EditInvoiceScreen}
                options={{ title: 'Edit Invoice', headerShown: false }}
            />
            <TransactionsStack.Screen
                name="QuotationList" component={QuotationListScreen}
                options={{ title: 'Quotations' }}
            />
        </TransactionsStack.Navigator>
    );
}

import { AdvancedReceiptScreen } from '../screens/AdvancedReceiptScreen';

// ═══════════════════════════════════════════════════════════════
// Accounting / Vouchers Stack
// ═══════════════════════════════════════════════════════════════

const AccountingStack = createNativeStackNavigator<any>();

function AccountingStackScreen() {
    return (
        <AccountingStack.Navigator
            screenOptions={{
                headerTransparent: true,
                headerBlurEffect: 'regular',
                headerLargeTitle: true,
                headerLargeTitleShadowVisible: false,
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontWeight: '700' },
            }}
        >
            <AccountingStack.Screen
                name="VoucherList"
                component={VoucherListScreen}
                options={{ title: 'Daybook' }}
            />
            <AccountingStack.Screen
                name="CreateVoucher"
                component={CreateVoucherScreen}
                options={{ title: 'New Voucher', headerShown: false }}
            />
            <AccountingStack.Screen
                name="AdvancedReceipt"
                component={AdvancedReceiptScreen}
                options={{ title: 'Receive Payment', headerShown: false }}
            />
        </AccountingStack.Navigator>
    );
}

// ═══════════════════════════════════════════════════════════════
// More Stack (all other modules)
// ═══════════════════════════════════════════════════════════════

const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function MoreStackScreen() {
    return (
        <MoreStack.Navigator
            screenOptions={{
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontWeight: '700' },
            }}
        >
            <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ headerShown: false }} />

            {/* Master Data */}
            <MoreStack.Screen name="PartyList" component={PartyListScreen} options={{ title: 'Parties' }} />
            <MoreStack.Screen name="PartyDetail" component={PartyDetailScreen} options={{ title: 'Party Details' }} />
            <MoreStack.Screen name="ItemList" component={ItemListScreen} options={{ title: 'Items' }} />
            <MoreStack.Screen name="WarehouseList" component={WarehouseListScreen} options={{ title: 'Warehouses' }} />

            {/* Business Operations */}
            <MoreStack.Screen name="Collections" component={CollectionsScreen} options={{ title: 'Collections' }} />
            <MoreStack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory Hub' }} />

            {/* Inventory Sub-Screens */}
            <MoreStack.Screen name="StockSummary" component={StockSummaryScreen} options={{ title: 'Stock Summary' }} />
            <MoreStack.Screen name="Purchases" component={PurchasesScreen} options={{ title: 'Purchases' }} />
            <MoreStack.Screen name="Dispatches" component={DispatchesScreen} options={{ title: 'Dispatches' }} />
            <MoreStack.Screen name="Transfers" component={TransfersScreen} options={{ title: 'Transfers' }} />
            <MoreStack.Screen name="Adjustments" component={AdjustmentsScreen} options={{ title: 'Adjustments' }} />
            <MoreStack.Screen name="PurchaseCreate" component={PurchaseCreateScreen} options={{ title: 'Create Purchase' }} />
            <MoreStack.Screen name="WhatsAppInbox" component={WhatsAppInboxScreen} options={{ title: 'WhatsApp Inbox' }} />
            <MoreStack.Screen name="WhatsAppTemplates" component={WhatsAppTemplatesScreen} options={{ title: 'WhatsApp Templates' }} />
            <MoreStack.Screen name="WhatsAppCampaigns" component={WhatsAppCampaignsScreen} options={{ title: 'WhatsApp Campaigns' }} />

            {/* Finance Screens */}
            <MoreStack.Screen name="BankAccounts" component={BankAccountsScreen} options={{ title: 'Bank Accounts' }} />
            <MoreStack.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Expenses' }} />
            <MoreStack.Screen name="ExpenseCreate" component={CreateExpenseScreen} options={{ title: 'Record Expense' }} />
            <MoreStack.Screen name="LedgerManagement" component={LedgerManagementScreen} options={{ title: 'Ledger Management' }} />
            <MoreStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ headerShown: false }} />
            <MoreStack.Screen name="InvoiceEdit" component={EditInvoiceScreen} options={{ title: 'Edit Invoice', headerShown: false }} />
            <MoreStack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: 'Invoices' }} />
            <MoreStack.Screen name="ChallanList" component={ChallanListScreen} options={{ title: 'Challans' }} />
            <MoreStack.Screen name="ChallanDetail" component={ChallanDetailScreen} options={{ headerShown: false }} />
            <MoreStack.Screen name="OutstandingTable" component={OutstandingReportScreen} options={{ title: 'Outstanding Report' }} />

            {/* Voucher Screens removed from MoreStack as they are now in Bottom Tab */}

            {/* Existing screens */}
            <MoreStack.Screen name="FinanceDashboard" component={FinanceScreen} options={{ headerShown: false }} />
            <MoreStack.Screen name="FounderCopilot" component={FounderCopilotScreen} options={{ title: 'AI Copilot' }} />
            <MoreStack.Screen name="OwnerApprovals" component={OwnerApprovalsScreen} options={{ title: 'Approvals' }} />
            <MoreStack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scanner' }} />
            <MoreStack.Screen name="MarketplaceHub" component={MarketplaceScreen} options={{ title: 'Marketplace' }} />
            <MoreStack.Screen name="SuperAdmin" component={SuperAdminScreen} options={{ title: 'Super Admin' }} />
            <MoreStack.Screen name="PartnerDashboard" component={PartnerDashboardScreen} options={{ title: 'Partner Portal' }} />
            <MoreStack.Screen name="EmployeeSelfService" component={EmployeeSelfServiceScreen} options={{ title: 'Employee Portal' }} />
            <MoreStack.Screen name="SettingsPage" component={SettingsScreen} options={{ title: 'Settings' }} />
        </MoreStack.Navigator >
    );
}

function MoreMenuScreen({ navigation }: any) {
    const { logout } = useAuthStore();
    const user = useAuthStore((s) => s.user);
    const business = useAuthStore((s) => s.business);

    const sections = [
        {
            title: 'MASTER DATA',
            items: [
                { label: '👥 Parties', screen: 'PartyList' },
                { label: '📦 Items / Qualities', screen: 'ItemList' },
                { label: '🏭 Warehouses', screen: 'WarehouseList' },
            ],
        },
        {
            title: 'BUSINESS',
            items: [
                { label: '💰 Finance', screen: 'FinanceDashboard' },
                { label: '📘 Daybook (Vouchers)', screen: 'VoucherList' },
                { label: '📒 Ledger Statements', screen: 'LedgerManagement' },
                { label: '🏦 Bank Accounts', screen: 'BankAccounts' },
                { label: '💸 Expenses', screen: 'Expenses' },
                { label: '💳 Collections', screen: 'Collections' },
                { label: '📊 Inventory', screen: 'Inventory' },
                { label: '📸 Document Scanner', screen: 'Scanner' },
                { label: '🏪 Marketplace', screen: 'MarketplaceHub' },
                { label: '👔 Employee Portal', screen: 'EmployeeSelfService' },
            ],
        },
        {
            title: 'MANAGEMENT',
            items: [
                { label: '✅ Approvals', screen: 'OwnerApprovals' },
                { label: '🤖 AI Copilot', screen: 'FounderCopilot' },
            ],
        },
        {
            title: 'PLATFORM',
            items: [
                { label: '💬 WhatsApp Inbox', screen: 'WhatsAppInbox' },
                { label: '📜 WhatsApp Templates', screen: 'WhatsAppTemplates' },
                { label: '📣 WhatsApp Campaigns', screen: 'WhatsAppCampaigns' },
                { label: '🔧 Super Admin', screen: 'SuperAdmin' },
                { label: '🤝 Partner Portal', screen: 'PartnerDashboard' },
            ],
        },
        {
            title: 'SETTINGS',
            items: [
                { label: '⚙️ Settings', screen: 'SettingsPage' },
            ],
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                <LiquidGlassContainerView spacing={15}>
                    <LiquidGlassView effect="clear" style={{
                        paddingHorizontal: 20, paddingBottom: 15,
                        paddingTop: Platform.OS === 'ios' ? 60 : 40,
                        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                        borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.5 }}>{business?.name || 'Company Profile'}</Text>
                    </LiquidGlassView>
                </LiquidGlassContainerView>
            </View>

            <ScrollView style={menuStyles.container} contentContainerStyle={{ paddingTop: 110 }}>
                {/* User info card */}
                <View style={menuStyles.userCard}>
                    <View style={menuStyles.avatar}>
                        <Text style={menuStyles.avatarText}>
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={menuStyles.userName}>{user?.name || 'User'}</Text>
                        <Text style={menuStyles.userEmail}>{user?.email || ''}</Text>
                    </View>
                </View>

                {sections.map((section) => (
                    <View key={section.title} style={menuStyles.section}>
                        <Text style={menuStyles.sectionTitle}>{section.title}</Text>
                        {section.items.map((item) => (
                            <TouchableOpacity
                                key={item.label}
                                style={menuStyles.menuItem}
                                onPress={() => navigation.navigate(item.screen)}
                            >
                                <Text style={menuStyles.menuItemText}>{item.label}</Text>
                                <Text style={menuStyles.chevron}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                <TouchableOpacity style={menuStyles.logoutBtn} onPress={logout}>
                    <Text style={menuStyles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// ═══════════════════════════════════════════════════════════════
// Bottom Tab Navigator
// ═══════════════════════════════════════════════════════════════

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    backgroundColor: colors.surface,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStackScreen} />
            <Tab.Screen name="Transactions" component={TransactionsStackScreen} />
            <Tab.Screen name="Accounting" component={AccountingStackScreen} />
            <Tab.Screen name="More" component={MoreStackScreen} />
        </Tab.Navigator>
    );
}

// ─── Styles ──────────────────────────────────────────────────

const placeholderStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background },
    title: { ...typography.h2, marginBottom: spacing.sm },
    desc: { ...typography.bodySmall, textAlign: 'center', marginBottom: spacing.xl },
    btn: { backgroundColor: colors.primary, paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md, borderRadius: radius.md },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

const menuStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: radius.lg,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: 'center', justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    userName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    userEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    section: { marginBottom: spacing.lg },
    sectionTitle: {
        ...typography.label,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    menuItemText: { fontSize: 16, color: colors.textPrimary },
    chevron: { fontSize: 22, color: colors.textMuted },
    logoutBtn: {
        margin: spacing.lg,
        backgroundColor: colors.errorBg,
        padding: spacing.lg,
        borderRadius: radius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    logoutText: { color: colors.error, fontWeight: 'bold', fontSize: 16 },
});
