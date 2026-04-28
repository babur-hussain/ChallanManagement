import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Share, TextInput, BackHandler, Modal, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { useParties, usePartyLedger, exportPartyLedgerPdf, useEditJournalEntry, useDeleteJournalEntry } from '../hooks/api/useParties';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function LedgerManagementScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const [selectedParty, setSelectedParty] = useState<any>(null);
    const [filterMode, setFilterMode] = useState<'ALL' | 'CUR_FY' | 'PREV_FY'>('ALL');
    const [isExporting, setIsExporting] = useState(false);

    // Edit & History Overlays
    const [editContext, setEditContext] = useState<any>(null);
    const [historyContext, setHistoryContext] = useState<any>(null);
    const deleteMutation = useDeleteJournalEntry();
    const editMutation = useEditJournalEntry();

    const [editForm, setEditForm] = useState({ date: '', narration: '', debit: '', credit: '' });

    // List state (when no party is selected)
    const [dropdownSearch, setDropdownSearch] = useState('');
    const [sortOption, setSortOption] = useState<'name' | 'balance'>('name');

    // Fetch all parties seamlessly with backend search integration
    const { data: allPartiesResp, isLoading: isLoadingParties } = useParties({
        limit: 100,
        search: dropdownSearch.trim().length >= 2 ? dropdownSearch.trim() : undefined
    });
    const allParties = (allPartiesResp as any)?.data || [];

    // Auto-select party if navigated from Party Detail
    const deepLinkedPartyId = route?.params?.partyId;
    useEffect(() => {
        if (deepLinkedPartyId && allParties.length > 0 && !selectedParty) {
            const match = allParties.find((p: any) => (p._id || p.id) === deepLinkedPartyId);
            if (match) setSelectedParty(match);
        }
    }, [deepLinkedPartyId, allParties]);

    useLayoutEffect(() => {
        if (selectedParty) {
            navigation.setOptions({
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => {
                            if (deepLinkedPartyId) {
                                navigation.goBack();
                            } else {
                                setSelectedParty(null);
                                setDropdownSearch('');
                            }
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -5, padding: 4 }}
                    >
                        <Text style={{ fontSize: 36, color: colors.primary, marginRight: 2, marginTop: -4, lineHeight: 36 }}>‹</Text>
                        <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '500' }}>Back</Text>
                    </TouchableOpacity>
                ),
                gestureEnabled: false,
            });
        } else {
            navigation.setOptions({
                headerLeft: undefined,
                gestureEnabled: true,
            });
        }
    }, [navigation, selectedParty]);

    useEffect(() => {
        const onBackPress = () => {
            if (selectedParty) {
                if (deepLinkedPartyId) {
                    navigation.goBack();
                } else {
                    setSelectedParty(null);
                    setDropdownSearch('');
                }
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandler.remove();
    }, [selectedParty, deepLinkedPartyId]);

    const getDates = () => {
        const now = new Date();
        if (filterMode === 'CUR_FY') {
            const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
            return { fromDate: new Date(startYear, 3, 1), toDate: new Date(startYear + 1, 2, 31) };
        }
        if (filterMode === 'PREV_FY') {
            const startYear = now.getMonth() >= 3 ? now.getFullYear() - 1 : now.getFullYear() - 2;
            return { fromDate: new Date(startYear, 3, 1), toDate: new Date(startYear + 1, 2, 31) };
        }
        return { fromDate: undefined, toDate: undefined };
    };

    const { fromDate, toDate } = getDates();
    const partyId = selectedParty?._id || selectedParty?.id;

    // Fetch ledger when party is selected
    const { data: ledgerResp, isLoading: isLoadingLedger } = usePartyLedger(partyId || '', fromDate, toDate);
    const ledgerData = ledgerResp?.ledger || [];

    const handleExport = async () => {
        if (!partyId) return;
        try {
            setIsExporting(true);
            const resp = await exportPartyLedgerPdf(partyId, fromDate, toDate);
            const base64 = resp.base64 || resp.data?.base64;
            if (base64) {
                await Share.share({
                    url: `data:application/pdf;base64,${base64}`,
                    title: `Ledger-${selectedParty?.name || 'Party'}`,
                    message: `Ledger Statement for ${selectedParty?.name || 'Party'}`,
                });
            } else {
                Alert.alert('Error', 'Could not generate PDF');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to export');
        } finally {
            setIsExporting(false);
        }
    };

    // Derived sorted parties (Search is now handled optimally by the backend)
    const filteredAndSortedParties = useMemo(() => {
        let result = [...allParties];

        if (sortOption === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'balance') {
            result.sort((a, b) => Math.abs(b.outstandingBalance || 0) - Math.abs(a.outstandingBalance || 0));
        }

        return result;
    }, [allParties, sortOption]);

    // ------------------------------------------------------------------------
    // RENDER: Party Selection Mode (When `!selectedParty`)
    // ------------------------------------------------------------------------
    if (!selectedParty) {
        return (
            <View style={styles.container}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Select a Party</Text>
                </View>

                <View style={styles.listSearchArea}>
                    <TextInput
                        style={styles.listSearchInput}
                        placeholder="Search by name, GSTIN, phone..."
                        value={dropdownSearch}
                        onChangeText={setDropdownSearch}
                        autoCapitalize="words"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                <View style={styles.listSortArea}>
                    <Text style={styles.sortLabel}>Sort By:</Text>
                    <TouchableOpacity
                        style={[styles.sortChip, sortOption === 'name' && styles.sortChipActive]}
                        onPress={() => setSortOption('name')}
                    >
                        <Text style={[styles.sortChipText, sortOption === 'name' && styles.sortChipTextActive]}>Name (A-Z)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortChip, sortOption === 'balance' && styles.sortChipActive]}
                        onPress={() => setSortOption('balance')}
                    >
                        <Text style={[styles.sortChipText, sortOption === 'balance' && styles.sortChipTextActive]}>Balance</Text>
                    </TouchableOpacity>
                </View>

                {isLoadingParties ? (
                    <ActivityIndicator style={{ marginTop: 30 }} size="large" color={colors.primary} />
                ) : (
                    <FlatList
                        data={filteredAndSortedParties}
                        keyExtractor={(item) => item._id || item.id}
                        contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.partyListItem}
                                onPress={() => setSelectedParty(item)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.partyListTitle}>{item.name}</Text>
                                    <Text style={styles.partyListSub}>{item.gstin ? `GSTIN: ${item.gstin}` : item.phone || 'No Phone'}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.partyListBal, (item.outstandingBalance || 0) > 0 ? { color: colors.error } : { color: colors.success }]}>
                                        ₹{Math.abs(item.outstandingBalance || 0).toLocaleString('en-IN')} {(item.outstandingBalance || 0) > 0 ? 'Dr' : 'Cr'}
                                    </Text>
                                    <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>Balance</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>No parties found.</Text>}
                    />
                )}
            </View>
        );
    }

    // ------------------------------------------------------------------------
    // RENDER: Active Ledger Mode (When `selectedParty` exists)
    // ------------------------------------------------------------------------

    const renderLedgerHeader = () => (
        <View>
            <View style={styles.selectedPartyCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{selectedParty.name}</Text>
                        {selectedParty.gstin && <Text style={styles.code}>{selectedParty.gstin}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => { setSelectedParty(null); setDropdownSearch(''); }} style={styles.clearBtn}>
                        <Text style={styles.clearBtnText}>Change</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.financeRow, { marginTop: spacing.md }]}>
                    <Text style={styles.financeLabel}>Current Balance:</Text>
                    {isLoadingLedger ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Text style={[
                            styles.financeValue,
                            (ledgerResp?.closingBalance ?? selectedParty.outstandingBalance ?? 0) > 0 ? { color: colors.error } : { color: colors.success }
                        ]}>
                            ₹{Math.abs(ledgerResp?.closingBalance ?? selectedParty.outstandingBalance ?? 0).toLocaleString('en-IN')} {(ledgerResp?.closingBalance ?? selectedParty.outstandingBalance ?? 0) > 0 ? 'Dr' : 'Cr'}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <View style={styles.filterHeader}>
                    <Text style={styles.sectionTitle}>Ledger Statement</Text>
                    <TouchableOpacity style={[styles.exportBtn, { opacity: isLoadingLedger ? 0.5 : 1 }]} onPress={handleExport} disabled={isExporting || isLoadingLedger}>
                        {isExporting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.exportBtnText}>PDF</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.filterRow}>
                    {(['ALL', 'CUR_FY', 'PREV_FY'] as const).map(mode => (
                        <TouchableOpacity
                            key={mode}
                            style={[styles.filterChip, filterMode === mode && styles.filterChipActive]}
                            onPress={() => setFilterMode(mode)}
                        >
                            <Text style={[styles.filterChipText, filterMode === mode && styles.filterChipTextActive]}>
                                {mode === 'ALL' ? 'All Time' : mode === 'CUR_FY' ? 'This FY' : 'Prev FY'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.ledgerHeaderRow}>
                    <Text style={[styles.lColDate, styles.tHead]}>Date</Text>
                    <Text style={[styles.lColRef, styles.tHead]}>Particulars</Text>
                    <Text style={[styles.lColAmt, styles.tHead]}>Balance</Text>
                </View>
            </View>
        </View>
    );

    const renderLedgerItem = ({ item }: { item: any }) => {
        const isDebit = item.debit > 0;
        const amt = isDebit ? item.debit : item.credit;

        const rowContent = (
            <View style={styles.ledgerRow}>
                <View style={styles.lColDate}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.ledgerDateText}>{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Text>
                        {item.hasEdits && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF8A00', marginLeft: 4 }} />}
                    </View>
                    <Text style={styles.ledgerTypeText}>{item.type}</Text>
                </View>
                <View style={styles.lColRef}>
                    <Text style={styles.ledgerRefText} numberOfLines={1}>{item.reference !== '-' ? item.reference : item.description}</Text>
                    <Text style={styles.ledgerAmtText}><Text style={{ color: isDebit ? colors.error : colors.success }}>{isDebit ? 'Dr ' : 'Cr '}</Text>₹{amt.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.lColAmt}>
                    <Text style={styles.ledgerRunBal}>₹{Math.abs(item.runningBalance).toLocaleString('en-IN')}</Text>
                    <Text style={styles.ledgerRunBalType}>{item.runningBalance > 0 ? 'Dr' : item.runningBalance < 0 ? 'Cr' : ''}</Text>
                </View>
            </View>
        );

        if (item.type === 'OPENING') {
            return rowContent; // Opening balances cannot be swept/edited directly from this specific ledger view
        }

        const renderRightActions = () => (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                    style={[styles.swipeBtn, { backgroundColor: colors.info }]}
                    onPress={() => {
                        setEditForm({
                            date: new Date(item.date).toISOString().split('T')[0],
                            narration: item.description,
                            debit: item.debit > 0 ? item.debit.toString() : '',
                            credit: item.credit > 0 ? item.credit.toString() : ''
                        });
                        setEditContext(item);
                    }}
                >
                    <Text style={styles.swipeBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.swipeBtn, { backgroundColor: '#64748b' }]}
                    onPress={() => setHistoryContext(item)}
                >
                    <Text style={styles.swipeBtnText}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.swipeBtn, { backgroundColor: colors.error }]}
                    onPress={() => {
                        Alert.alert('Delete Entry', 'Are you sure you want to reverse/delete this entry? This action is heavily audited.', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.sourceId) }
                        ]);
                    }}
                >
                    <Text style={styles.swipeBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        );

        return (
            <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
                {rowContent}
            </Swipeable>
        );
    }

    // ------------------------------------------------------------------------
    // RENDER: Modals
    // ------------------------------------------------------------------------
    return (
        <View style={styles.container}>
            <FlatList
                data={ledgerData}
                keyExtractor={(item, index) => item.sourceId || index.toString()}
                ListHeaderComponent={renderLedgerHeader}
                renderItem={renderLedgerItem}
                contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
                ListEmptyComponent={
                    isLoadingLedger ? <ActivityIndicator style={{ marginTop: 20 }} /> : <Text style={styles.emptyText}>No ledger entries found.</Text>
                }
            />

            {/* Edit Modal */}
            <Modal visible={!!editContext} animationType="slide" transparent>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Edit Ledger Entry</Text>
                                <Text style={styles.modalSub}>{editContext?.reference}</Text>

                                <View style={{ marginTop: spacing.md }}>
                                    <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                                    <TextInput style={styles.input} value={editForm.date} onChangeText={t => setEditForm(prev => ({ ...prev, date: t }))} />

                                    <Text style={styles.inputLabel}>Particulars / Narration</Text>
                                    <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline value={editForm.narration} onChangeText={t => setEditForm(prev => ({ ...prev, narration: t }))} />

                                    <View style={{ flexDirection: 'row', gap: spacing.md }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.inputLabel}>Debit Amount (+)</Text>
                                            <TextInput style={styles.input} keyboardType="numeric" value={editForm.debit} onChangeText={t => setEditForm(prev => ({ ...prev, debit: t, credit: '' }))} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.inputLabel}>Credit Amount (-)</Text>
                                            <TextInput style={styles.input} keyboardType="numeric" value={editForm.credit} onChangeText={t => setEditForm(prev => ({ ...prev, credit: t, debit: '' }))} />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setEditContext(null)}>
                                        <Text style={styles.modalBtnCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalBtnSave}
                                        onPress={() => {
                                            const isAmountModified =
                                                (editForm.debit ? Number(editForm.debit) : 0) !== (editContext.debit || 0) ||
                                                (editForm.credit ? Number(editForm.credit) : 0) !== (editContext.credit || 0);

                                            if (isAmountModified && editContext.linkedInvoiceId) {
                                                Alert.alert(
                                                    'Auto-Generated Entry',
                                                    'This entry is dynamically linked to an Invoice. Modifying the amount here will break tax distributions and cause data mismatches.\n\nWould you like to view/modify the original Invoice instead?',
                                                    [
                                                        { text: 'Cancel', style: 'cancel' },
                                                        {
                                                            text: 'View Invoice', style: 'default', onPress: () => {
                                                                setEditContext(null);
                                                                navigation.navigate('InvoiceDetail', { id: editContext.linkedInvoiceId });
                                                            }
                                                        },
                                                        {
                                                            text: 'Edit Invoice', style: 'default', onPress: () => {
                                                                setEditContext(null);
                                                                navigation.navigate('InvoiceEdit', { id: editContext.linkedInvoiceId });
                                                            }
                                                        }
                                                    ]
                                                );
                                                return;
                                            }

                                            editMutation.mutate({
                                                id: editContext.sourceId,
                                                data: {
                                                    partyId,
                                                    date: editForm.date,
                                                    narration: editForm.narration,
                                                    newDebit: editForm.debit ? Number(editForm.debit) : undefined,
                                                    newCredit: editForm.credit ? Number(editForm.credit) : undefined,
                                                }
                                            }, {
                                                onSuccess: () => setEditContext(null)
                                            });
                                        }}
                                    >
                                        {editMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalBtnSaveText}>Save Changes</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* History Modal */}
            <Modal visible={!!historyContext} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                            <Text style={styles.modalTitle}>Audit History</Text>
                            <TouchableOpacity onPress={() => setHistoryContext(null)} style={styles.modalCloseBtn}>
                                <Text style={styles.modalCloseBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {(!historyContext?.editHistory || historyContext.editHistory.length === 0) ? (
                            <Text style={styles.emptyText}>No edits have been made to this entry.</Text>
                        ) : (
                            <ScrollView>
                                {historyContext.editHistory.slice().reverse().map((hist: any, index: number) => (
                                    <View key={index} style={styles.historyCard}>
                                        <Text style={styles.historyAction}>
                                            {hist.action === 'SOFT_DELETE' ? 'DELETED' : 'EDITED'}
                                            <Text style={{ fontWeight: 'normal', color: colors.textMuted }}> on {new Date(hist.editedAt).toLocaleString()}</Text>
                                        </Text>
                                        {hist.action === 'EDIT' && (
                                            <View style={{ marginTop: spacing.sm }}>
                                                <Text style={styles.historyDetail}>Previous Date: {new Date(hist.previousDate).toLocaleDateString()}</Text>
                                                <Text style={styles.historyDetail}>Previous Notes: {hist.previousNarration}</Text>
                                                {hist.previousEntries && hist.previousEntries.length > 0 && (
                                                    <View style={{ marginTop: spacing.sm, backgroundColor: '#fef2f2', borderRadius: radius.sm, padding: spacing.sm }}>
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#991b1b', marginBottom: 4 }}>Previous Amounts:</Text>
                                                        {hist.previousEntries.map((entry: any, ei: number) => (
                                                            <View key={ei} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: ei < hist.previousEntries.length - 1 ? 1 : 0, borderBottomColor: '#fecaca' }}>
                                                                <Text style={{ fontSize: 12, color: '#7f1d1d', flex: 1 }}>{entry.accountId?.replace(/_/g, ' ') || 'Account'}</Text>
                                                                {entry.debit > 0 && <Text style={{ fontSize: 12, fontWeight: '700', color: '#dc2626' }}>Dr ₹{Number(entry.debit).toLocaleString('en-IN')}</Text>}
                                                                {entry.credit > 0 && <Text style={{ fontSize: 12, fontWeight: '700', color: '#16a34a' }}>Cr ₹{Number(entry.credit).toLocaleString('en-IN')}</Text>}
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    sectionHeader: { marginTop: spacing.md },
    sectionTitle: { ...typography.h4, paddingHorizontal: spacing.md, marginBottom: spacing.sm },

    // Selection View UI
    listSearchArea: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
    listSearchInput: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight, fontSize: 16 },

    listSortArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    sortLabel: { fontSize: 12, color: colors.textMuted, marginRight: spacing.sm, fontWeight: '500' },
    sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
    sortChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    sortChipText: { fontSize: 12, color: colors.textSecondary },
    sortChipTextActive: { color: colors.primaryDark, fontWeight: 'bold' },

    // Party List Item
    partyListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.surface, marginBottom: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.borderLight },
    partyListTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    partyListSub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
    partyListBal: { fontSize: 14, fontWeight: 'bold' },

    // Active Party Ledger UI
    selectedPartyCard: { backgroundColor: colors.surface, margin: spacing.md, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, ...shadows.sm },
    name: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    code: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    clearBtn: { backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
    clearBtnText: { color: colors.textSecondary, fontSize: 12, fontWeight: 'bold' },

    financeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, padding: spacing.md, borderRadius: radius.sm },
    financeLabel: { fontSize: 14, color: colors.textSecondary },
    financeValue: { fontSize: 16, fontWeight: 'bold' },

    filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: spacing.md },
    exportBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.sm },
    exportBtnText: { color: colors.surface, fontSize: 13, fontWeight: 'bold' },
    filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.md },
    filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
    filterChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    filterChipText: { fontSize: 12, color: colors.textSecondary },
    filterChipTextActive: { color: colors.primaryDark, fontWeight: 'bold' },

    emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },

    ledgerHeaderRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    tHead: { fontSize: 12, fontWeight: 'bold', color: colors.textSecondary },
    ledgerRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    lColDate: { flex: 1.2 },
    lColRef: { flex: 2.5, paddingHorizontal: spacing.xs },
    lColAmt: { flex: 1.5, alignItems: 'flex-end' },

    ledgerDateText: { fontSize: 12, fontWeight: '500', color: colors.textPrimary },
    ledgerTypeText: { fontSize: 10, color: colors.textMuted, marginTop: 2, textTransform: 'uppercase' },
    ledgerRefText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
    ledgerAmtText: { fontSize: 12, marginTop: 4, fontWeight: 'bold' },
    ledgerRunBal: { fontSize: 13, fontWeight: 'bold', color: colors.textPrimary },
    ledgerRunBalType: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

    // Swipeable Action Styles
    swipeBtn: { width: 70, justifyContent: 'center', alignItems: 'center' },
    swipeBtnText: { color: colors.surface, fontSize: 12, fontWeight: 'bold' },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
    modalContent: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.lg, ...shadows.lg },
    modalTitle: { ...typography.h3, marginBottom: 2 },
    modalSub: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
    inputLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 4, marginTop: spacing.sm },
    input: { backgroundColor: colors.background, padding: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.borderLight, fontSize: 15 },

    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.xl, gap: spacing.md },
    modalBtnCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.background },
    modalBtnCancelText: { color: colors.textSecondary, fontWeight: 'bold', fontSize: 15 },
    modalBtnSave: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.primary, minWidth: 120, alignItems: 'center' },
    modalBtnSaveText: { color: colors.surface, fontWeight: 'bold', fontSize: 15 },

    modalCloseBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.background, borderRadius: 12 },
    modalCloseBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: 'bold' },

    historyCard: { backgroundColor: colors.background, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.borderLight },
    historyAction: { fontSize: 14, fontWeight: 'bold', color: colors.error },
    historyDetail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 }
});
