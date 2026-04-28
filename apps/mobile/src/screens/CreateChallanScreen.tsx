import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Switch, SafeAreaView, Dimensions
} from 'react-native';
import WebView from 'react-native-webview';
import { useCreateChallan, useNextChallanNumber, useChallanPreview } from '../hooks/api/useChallans';
import { useParties, useQuickSearchParties } from '../hooks/api/useParties';
import { useItems } from '../hooks/api/useItems';
import { useBrokers } from '../hooks/api/useBrokers';
import { useSettingsData } from '../hooks/api/useSettings';
import { OfflineSyncService } from '../services/OfflineSyncService';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';
import NetInfo from '@react-native-community/netinfo';
import { SearchablePicker, PickerItem } from '../components/SearchablePicker';
import { PartyCreateModal } from '../components/PartyCreateModal';
import { ItemCreateModal } from '../components/ItemCreateModal';
import { BrokerCreateModal } from '../components/BrokerCreateModal';

// Simple debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// A4 Aspect Ratio is 1:1.414 (Height:Width)
const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_WIDTH = SCREEN_WIDTH - (spacing.lg * 2); // Container width without margins
const PREVIEW_HEIGHT = PREVIEW_WIDTH * 1.414;

export function CreateChallanScreen({ navigation }: any) {
  const [partySearch, setPartySearch] = useState('');
  const debouncedPartySearch = useDebounce(partySearch, 300);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [showPartySearch, setShowPartySearch] = useState(true);

  // Item entry
  const [lineItems, setLineItems] = useState<any[]>([]);

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // NEW: Additional fields matching web
  const [challanDate, setChallanDate] = useState(new Date().toISOString().split('T')[0]);
  const [challanType, setChallanType] = useState('SUPPLY_ON_APPROVAL');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [paperSize, setPaperSize] = useState('A4');
  const [customerNotes, setCustomerNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [adjustmentLabel, setAdjustmentLabel] = useState('Adjustment');
  const [adjustmentAmount, setAdjustmentAmount] = useState('0');
  const [roundOff, setRoundOff] = useState('0');

  // NEW: Modal/Picker state
  const [showPartyPicker, setShowPartyPicker] = useState(false);
  const [showPartyCreate, setShowPartyCreate] = useState(false);
  const [showItemCreate, setShowItemCreate] = useState(false);
  const [showBrokerPicker, setShowBrokerPicker] = useState(false);
  const [showBrokerCreate, setShowBrokerCreate] = useState(false);
  const [activeItemPickerIndex, setActiveItemPickerIndex] = useState<number | null>(null);

  const { data: nextNumber } = useNextChallanNumber();
  const { data: searchResults } = useQuickSearchParties(debouncedPartySearch);
  const { data: itemsData } = useItems({ limit: 200 });
  const { data: partiesData } = useParties({ limit: 100 });
  const { data: brokersData } = useBrokers({ limit: 50 });
  const { data: settingsData } = useSettingsData();
  const createMutation = useCreateChallan();
  const previewMutation = useChallanPreview();

  const allItems = (itemsData as any)?.data || [];
  const allParties: any[] = (partiesData as any)?.data?.data || (partiesData as any)?.data || [];
  const allBrokers: any[] = (brokersData as any)?.data?.data || (brokersData as any)?.data || [];
  const challanCfg = (settingsData as any)?.challans || {};
  const showRates = challanCfg.showRates ?? true;
  const showAmount = challanCfg.showAmount ?? true;

  // Pre-fill defaults from settings
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);
  useEffect(() => {
    if (settingsData && !defaultsLoaded) {
      const cfg = (settingsData as any)?.challans;
      if (cfg?.defaultRemarks) { setCustomerNotes(cfg.defaultRemarks); setRemarks(cfg.defaultRemarks); }
      if (cfg?.defaultTerms) setTermsAndConditions(cfg.defaultTerms);
      setDefaultsLoaded(true);
    }
  }, [settingsData, defaultsLoaded]);

  // Picker data transforms
  const partyPickerItems: PickerItem[] = useMemo(() =>
    allParties.map((p: any) => ({ id: p._id || p.id, label: p.name, sublabel: `${p.shortCode || ''} • ${p.address?.city || p.city || ''}` })),
    [allParties]);

  const itemPickerItems: PickerItem[] = useMemo(() =>
    allItems.map((i: any) => ({ id: i._id || i.id, label: i.name, sublabel: `${i.shortCode || ''} • ₹${i.defaultRate || 0}` })),
    [allItems]);

  const brokerPickerItems: PickerItem[] = useMemo(() =>
    allBrokers.map((b: any) => ({ id: b._id || b.id, label: b.name, sublabel: b.phone || '' })),
    [allBrokers]);

  const addEmptyLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        itemId: '',
        itemName: '',
        rollsText: '',
        meters: [],
        totalMeters: 0,
        ratePerMeter: 0,
        amount: 0,
        discount: 0,
        discountType: 'PERCENTAGE',
        taxRate: 0,
        taxAmount: 0,
        hsnCode: '',
        itemCode: '',
        unit: 'METERS',
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, key: string, value: any) => {
    setLineItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [key]: value };

      // Process rollsText if updated
      if (key === 'rollsText') {
        const meterStrings = String(value).split(/[\s,]+/).filter(Boolean);
        const meters = meterStrings.map(m => parseFloat(m)).filter(m => !isNaN(m));
        newItems[index].meters = meters;

        const total = meters.reduce((a, b) => a + b, 0);
        newItems[index].totalMeters = total;
        newItems[index].amount = total * (newItems[index].ratePerMeter || 0);
      }

      // Process rate
      if (key === 'ratePerMeter') {
        const rate = parseFloat(value) || 0;
        newItems[index].amount = (newItems[index].totalMeters || 0) * rate;
      }

      // Map item name to catalog item if rate or name is updated
      if (key === 'itemName') {
        const catalogItem = allItems.find((it: any) =>
          it.name?.toLowerCase() === String(value).toLowerCase() || it.shortCode?.toLowerCase() === String(value).toLowerCase() || it.code?.toLowerCase() === String(value).toLowerCase()
        );
        if (catalogItem) {
          newItems[index].itemId = catalogItem._id || catalogItem.id;
          newItems[index].itemName = catalogItem.name;
          newItems[index].itemCode = catalogItem.shortCode || catalogItem.code;
          newItems[index].hsnCode = catalogItem.hsnCode;
          newItems[index].taxRate = catalogItem.gstRate ?? 5; // Default to 5% if missing
          if (!newItems[index].ratePerMeter && catalogItem.defaultRate) {
            newItems[index].ratePerMeter = catalogItem.defaultRate;
            newItems[index].amount = (newItems[index].totalMeters || 0) * catalogItem.defaultRate;
          }
        }
      }

      return newItems;
    });
  };

  const totalEntries = lineItems.reduce((s, i) => s + (i.meters?.length || 0), 0);
  const totalMeters = lineItems.reduce((s, i) => s + (i.totalMeters || 0), 0);
  const subTotal = lineItems.reduce((s, i) => s + (i.amount || 0), 0);
  const totalDiscount = lineItems.reduce((s, i) => {
    const amt = (i.totalMeters || 0) * (i.ratePerMeter || 0);
    return s + (i.discountType === 'PERCENTAGE' ? amt * ((i.discount || 0) / 100) : (i.discount || 0));
  }, 0);
  const totalTax = lineItems.reduce((s, i) => {
    const amt = (i.totalMeters || 0) * (i.ratePerMeter || 0);
    const disc = i.discountType === 'PERCENTAGE' ? amt * ((i.discount || 0) / 100) : (i.discount || 0);
    return s + ((amt - disc) * ((i.taxRate || 0) / 100));
  }, 0);
  const grandTotal = subTotal - totalDiscount + totalTax + (parseFloat(adjustmentAmount) || 0) + (parseFloat(roundOff) || 0);

  // Handle selecting item from picker
  const handleSelectItem = (pickerItem: PickerItem, index: number) => {
    const catalogItem = allItems.find((it: any) => (it._id || it.id) === pickerItem.id);
    if (catalogItem) {
      setLineItems(prev => {
        const newItems = [...prev];
        newItems[index] = {
          ...newItems[index],
          itemId: catalogItem._id || catalogItem.id,
          itemName: catalogItem.name,
          itemCode: catalogItem.shortCode || catalogItem.code,
          hsnCode: catalogItem.hsnCode || '',
          ratePerMeter: catalogItem.defaultRate || 0,
          taxRate: catalogItem.gstRate ?? 5, // Auto-load 5% GST instead of 0
          unit: catalogItem.unit || 'METERS',
          amount: (newItems[index].totalMeters || 0) * (catalogItem.defaultRate || 0),
        };
        return newItems;
      });
    }
  };

  const buildPayload = () => {
    const validItems = lineItems.filter(li => li.itemName && li.meters && li.meters.length > 0);
    return {
      partyId: selectedParty?._id || selectedParty?.id,
      brokerId: selectedBroker?._id || selectedBroker?.id || undefined,
      date: challanDate,
      challanType,
      referenceNumber: referenceNumber.trim() || undefined,
      paperSize,
      items: validItems.map((li) => ({
        itemId: li.itemId || undefined,
        itemName: li.itemName,
        hsnCode: li.hsnCode || '',
        meters: li.meters,
        ratePerMeter: li.ratePerMeter,
        discount: li.discount || 0,
        discountType: li.discountType || 'PERCENTAGE',
        taxRate: li.taxRate || 0,
      })),
      vehicleNumber: vehicleNumber.trim() || undefined,
      remarks: remarks.trim() || undefined,
      customerNotes: customerNotes.trim() || undefined,
      termsAndConditions: termsAndConditions.trim() || undefined,
      internalNotes: internalNotes.trim() || undefined,
      adjustment: { label: adjustmentLabel, amount: parseFloat(adjustmentAmount) || 0 },
      roundOff: parseFloat(roundOff) || 0,
    };
  };

  const handleSubmit = async () => {
    if (!selectedParty) { Alert.alert('Error', 'Please select a party'); return; }
    const validItems = lineItems.filter(li => li.itemName && li.meters && li.meters.length > 0);
    if (validItems.length === 0) { Alert.alert('Error', 'Please add at least one valid item with quantities'); return; }

    const payload = buildPayload();
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      const offlineChallan = await OfflineSyncService.enqueueChallanCreation(payload as any);
      Alert.alert('📴 Saved Offline', `Challan queued as ${offlineChallan._localId}. It will sync when you're back online.`);
      navigation.goBack(); return;
    }

    createMutation.mutate(payload as any, {
      onSuccess: (challan: any) => {
        Alert.alert('✅ Success', `Challan ${challan.challanNumber} created!`, [
          { text: 'View', onPress: () => navigation.replace('ChallanDetail', { id: challan._id }) },
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to create challan');
      }
    });
  };

  const handleSaveDraft = async () => {
    if (!selectedParty) { Alert.alert('Error', 'Please select a party before saving as draft.'); return; }
    const validItems = lineItems.filter(li => li.itemName && li.meters && li.meters.length > 0);
    if (validItems.length === 0) { Alert.alert('Error', 'Please add at least one valid item.'); return; }
    const payload = buildPayload();
    createMutation.mutate(payload as any, {
      onSuccess: (challan: any) => {
        Alert.alert('✅ Draft Saved', `Challan ${challan.challanNumber} saved.`);
        navigation.goBack();
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to save draft');
      }
    });
  };

  const [htmlContent, setHtmlContent] = useState('');

  const previewPayload = useMemo(() => {
    if (!showPreview) return null;

    const validItems = lineItems.filter(i => i.itemName);

    return {
      challanNumber: nextNumber?.nextStr || 'CHN-PREVIEW',
      date: new Date().toISOString(),
      partySnapshot: selectedParty ? {
        name: selectedParty.name,
        shortCode: selectedParty.shortCode || '',
        phone: selectedParty.phone || '',
        gstin: selectedParty.gstin || '',
        address: selectedParty.address || { city: selectedParty.city },
      } : { name: '—', address: {} },
      vehicleNumber: vehicleNumber,
      remarks: remarks,
      items: validItems.map((item: any) => ({
        itemName: item.itemName || '',
        itemCode: item.itemCode || '',
        hsnCode: item.hsnCode || '',
        totalMeters: item.totalMeters || 0,
        ratePerMeter: item.ratePerMeter || 0,
        taxRate: item.taxRate || 0,
        discount: item.discount || 0,
        discountType: item.discountType || 'PERCENTAGE',
        meters: item.meters || [],
        unit: item.unit || 'METERS',
      })),
      totalRolls: totalEntries,
      totalMeters: totalMeters,
      totalAmount: grandTotal
    };
  }, [showPreview, nextNumber, lineItems, selectedParty, vehicleNumber, remarks, totalEntries, totalMeters, grandTotal]);

  const debouncedPreviewPayload = useDebounce(previewPayload, 700);

  useEffect(() => {
    if (showPreview && debouncedPreviewPayload) {
      previewMutation.mutate(debouncedPreviewPayload, {
        onSuccess: (htmlString) => {
          if (htmlString) {
            setHtmlContent(htmlString);
          } else {
            setHtmlContent('<div style="padding:20px;color:red;font-family:sans-serif;">Error: Empty response from server.</div>');
          }
        },
        onError: (err: any) => {
          setHtmlContent(`<div style="padding:20px;color:red;font-family:sans-serif;">Error fetching preview: ${err.message}</div>`);
        }
      });
    } else if (!showPreview) {
      setHtmlContent('');
    }
  }, [debouncedPreviewPayload, showPreview]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Challan</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Challan Number Bar */}
      <View style={styles.numberBar}>
        <Text style={styles.numberLabel}>Challan # </Text>
        <Text style={styles.numberValue}>{nextNumber?.nextStr || 'CHN-XXXX'}</Text>
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Party Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Name *</Text>
          {selectedParty ? (
            <View style={styles.selectedParty}>
              <View style={{ flex: 1 }}>
                <Text style={styles.partyName}>{selectedParty.name}</Text>
                <Text style={styles.partyCode}>{selectedParty.shortCode || ''} • {selectedParty.address?.city || selectedParty.city || ''}</Text>
                {selectedParty.phone && <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>📞 {selectedParty.phone}</Text>}
                {selectedParty.gstin && <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>GSTIN: {selectedParty.gstin}</Text>}
                {selectedParty.address?.line1 && <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{selectedParty.address.line1}, {selectedParty.address.city}, {selectedParty.address.state} - {selectedParty.address.pincode}</Text>}
                {(selectedParty.outstandingBalance !== undefined && selectedParty.outstandingBalance !== 0) && (
                  <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: selectedParty.outstandingBalance > 0 ? colors.error : colors.success }}>
                    Outstanding: ₹{Math.abs(selectedParty.outstandingBalance).toLocaleString('en-IN')} {selectedParty.outstandingBalance > 0 ? 'DR' : 'CR'}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => { setSelectedParty(null); }}>
                <Text style={styles.changeBtn}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={() => setShowPartyPicker(true)}>
              <Text style={{ fontSize: 15, color: colors.textMuted }}>Tap to select party...</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date, Challan Type, Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challan Details</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>Date</Text>
              <TextInput style={styles.input} value={challanDate} onChangeText={setChallanDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>Reference #</Text>
              <TextInput style={styles.input} value={referenceNumber} onChangeText={setReferenceNumber} placeholder="Optional" placeholderTextColor={colors.textMuted} />
            </View>
          </View>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>Challan Type</Text>
          <View style={{ flexDirection: 'row', gap: 4, marginBottom: spacing.sm }}>
            {[{ v: 'JOB_WORK', l: 'Job Work' }, { v: 'SUPPLY_ON_APPROVAL', l: 'Supply on Approval' }, { v: 'OTHERS', l: 'Others' }].map(t => (
              <TouchableOpacity key={t.v} style={[styles.segBtn, challanType === t.v && styles.segBtnActive]} onPress={() => setChallanType(t.v)}>
                <Text style={[styles.segBtnText, challanType === t.v && styles.segBtnTextActive]}>{t.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Broker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Broker</Text>
          {selectedBroker ? (
            <View style={[styles.selectedParty, { paddingVertical: spacing.sm }]}>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{selectedBroker.name}</Text>
              <TouchableOpacity onPress={() => setSelectedBroker(null)}><Text style={styles.changeBtn}>Remove</Text></TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={() => setShowBrokerPicker(true)}>
              <Text style={{ fontSize: 15, color: colors.textMuted }}>Tap to select broker (optional)...</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Live Preview Toggle */}
        <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Live Preview</Text>
            {previewMutation.isPending && <ActivityIndicator style={{ marginLeft: 10 }} size="small" color={colors.primary} />}
          </View>
          <Switch value={showPreview} onValueChange={setShowPreview} trackColor={{ true: colors.primary }} />
        </View>

        {/* Live Preview WebView */}
        {showPreview && (
          <View style={[styles.webviewContainer, { height: PREVIEW_HEIGHT }]}>
            {htmlContent ? (
              <WebView source={{ html: htmlContent }} style={styles.webview} scalesPageToFit={true} scrollEnabled={true} bounces={false} nestedScrollEnabled={true} originWhitelist={['*']} />
            ) : (
              <ActivityIndicator style={{ padding: 40 }} color={colors.primary} />
            )}
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items *</Text>
          {lineItems.map((li, idx) => (
            <View key={idx} style={styles.lineItemEditor}>
              <View style={styles.itemRow}>
                <TouchableOpacity style={[styles.input, { flex: 2, justifyContent: 'center' }]} onPress={() => setActiveItemPickerIndex(idx)}>
                  <Text style={{ fontSize: 14, color: li.itemName ? colors.textPrimary : colors.textMuted }}>{li.itemName || 'Tap to select item...'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeLineItem(idx)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              {li.itemName ? <Text style={{ fontSize: 10, color: colors.textMuted, paddingHorizontal: 4 }}>{li.itemCode || ''} {li.hsnCode ? `• HSN: ${li.hsnCode}` : ''}</Text> : null}
              <View style={styles.itemRow}>
                <TextInput style={[styles.input, styles.halfInput]} placeholder="Qty (e.g. 45.2 44.5)" value={li.rollsText} onChangeText={(v) => updateLineItem(idx, 'rollsText', v)} keyboardType="numeric" placeholderTextColor={colors.textMuted} />
                {showRates && <TextInput style={[styles.input, styles.halfInput]} placeholder="Rate (₹)" value={li.ratePerMeter === 0 ? '' : String(li.ratePerMeter)} onChangeText={(v) => updateLineItem(idx, 'ratePerMeter', v)} keyboardType="numeric" placeholderTextColor={colors.textMuted} />}
              </View>
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textSecondary }}>Discount</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TextInput style={[styles.input, { flex: 1, height: 36, fontSize: 13 }]} placeholder="0" value={li.discount === 0 ? '' : String(li.discount)} onChangeText={(v) => updateLineItem(idx, 'discount', parseFloat(v) || 0)} keyboardType="numeric" placeholderTextColor={colors.textMuted} />
                    <TouchableOpacity style={[styles.segBtn, { paddingHorizontal: 8, height: 36 }]} onPress={() => updateLineItem(idx, 'discountType', li.discountType === 'PERCENTAGE' ? 'FLAT' : 'PERCENTAGE')}>
                      <Text style={styles.segBtnText}>{li.discountType === 'PERCENTAGE' ? '%' : '₹'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 2 }}>GST</Text>
                  <View style={{ height: 36, justifyContent: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: 8 }}>
                    <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>{li.taxRate}%</Text>
                  </View>
                </View>
              </View>
              <View style={styles.itemTotalsRow}>
                <Text style={styles.liMeta}>{li.meters?.length || 0} Rolls • {(li.totalMeters || 0).toFixed(2)} m</Text>
                {showAmount && <Text style={styles.liAmount}>₹{(li.amount || 0).toLocaleString('en-IN')}</Text>}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={addEmptyLineItem}>
            <Text style={styles.addBtnText}>+ Add Row</Text>
          </TouchableOpacity>
        </View>

        {/* Transport & Paper Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transport & Format</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 2 }}>
              <TextInput style={styles.input} placeholder="Vehicle Number (optional)" placeholderTextColor={colors.textMuted} value={vehicleNumber} onChangeText={setVehicleNumber} autoCapitalize="characters" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {['A4', 'A5'].map(s => (
                  <TouchableOpacity key={s} style={[styles.segBtn, paperSize === s && styles.segBtnActive, { flex: 1 }]} onPress={() => setPaperSize(s)}>
                    <Text style={[styles.segBtnText, paperSize === s && styles.segBtnTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes & Terms</Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>Customer Notes</Text>
          <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Notes to display on challan" placeholderTextColor={colors.textMuted} value={customerNotes} onChangeText={setCustomerNotes} multiline />
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>Terms & Conditions</Text>
          <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Terms and conditions" placeholderTextColor={colors.textMuted} value={termsAndConditions} onChangeText={setTermsAndConditions} multiline />
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>Internal Notes (Private)</Text>
          <TextInput style={styles.input} placeholder="Private note, won't appear on PDF..." placeholderTextColor={colors.textMuted} value={internalNotes} onChangeText={setInternalNotes} />
        </View>

        {/* Summary */}
        {lineItems.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summRow}><Text style={styles.summLabel}>Total Entries / Qty</Text><Text style={styles.summValue}>{totalEntries} / {totalMeters.toFixed(2)}</Text></View>
            {showAmount && <View style={styles.summRow}><Text style={styles.summLabel}>Sub Total</Text><Text style={styles.summValue}>₹{subTotal.toLocaleString('en-IN')}</Text></View>}
            {totalDiscount > 0 && <View style={styles.summRow}><Text style={styles.summLabel}>Discount</Text><Text style={[styles.summValue, { color: colors.success }]}>-₹{totalDiscount.toFixed(2)}</Text></View>}
            {totalTax > 0 && <View style={styles.summRow}><Text style={styles.summLabel}>Tax (GST)</Text><Text style={styles.summValue}>+₹{totalTax.toFixed(2)}</Text></View>}
            <View style={styles.summRow}>
              <TextInput style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }} value={adjustmentLabel} onChangeText={setAdjustmentLabel} />
              <TextInput style={{ fontSize: 13, color: colors.textPrimary, width: 80, textAlign: 'right' }} value={adjustmentAmount} onChangeText={setAdjustmentAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={styles.summRow}>
              <Text style={styles.summLabel}>Round Off</Text>
              <TextInput style={{ fontSize: 13, color: colors.textPrimary, width: 80, textAlign: 'right' }} value={roundOff} onChangeText={setRoundOff} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
            </View>
            <View style={styles.divider} />
            <View style={styles.summRow}><Text style={styles.grandLabel}>Grand Total (₹)</Text><Text style={styles.grandValue}>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text></View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, margin: spacing.lg }}>
          <TouchableOpacity style={[styles.draftBtn, (createMutation.isPending) && styles.disabledBtn]} onPress={handleSaveDraft} disabled={createMutation.isPending}>
            <Text style={styles.draftBtnText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.submitBtn, { flex: 2 }, (createMutation.isPending || !selectedParty || lineItems.length === 0) && styles.disabledBtn]} onPress={handleSubmit} disabled={createMutation.isPending || !selectedParty || lineItems.length === 0}>
            {createMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Challan</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ═══ MODALS & PICKERS ═══ */}
      <SearchablePicker visible={showPartyPicker} onClose={() => setShowPartyPicker(false)} title="Select Party" items={partyPickerItems} searchPlaceholder="Search parties..." addNewLabel="+ Add New Party" onAddNew={() => { setShowPartyPicker(false); setShowPartyCreate(true); }} onSelect={(p) => { const party = allParties.find((x: any) => (x._id || x.id) === p.id); if (party) setSelectedParty(party); setShowPartyPicker(false); }} />
      <SearchablePicker visible={showBrokerPicker} onClose={() => setShowBrokerPicker(false)} title="Select Broker" items={brokerPickerItems} searchPlaceholder="Search brokers..." addNewLabel="+ Add New Broker" onAddNew={() => { setShowBrokerPicker(false); setShowBrokerCreate(true); }} onSelect={(b) => { const broker = allBrokers.find((x: any) => (x._id || x.id) === b.id); if (broker) setSelectedBroker(broker); setShowBrokerPicker(false); }} />
      <SearchablePicker visible={activeItemPickerIndex !== null} onClose={() => setActiveItemPickerIndex(null)} title="Select Item" items={itemPickerItems} searchPlaceholder="Search items..." addNewLabel="+ Add New Item" onAddNew={() => { setActiveItemPickerIndex(null); setShowItemCreate(true); }} onSelect={(item) => { if (activeItemPickerIndex !== null) handleSelectItem(item, activeItemPickerIndex); setActiveItemPickerIndex(null); }} />
      <PartyCreateModal visible={showPartyCreate} onClose={() => setShowPartyCreate(false)} onCreated={(p) => setSelectedParty(p)} />
      <ItemCreateModal visible={showItemCreate} onClose={() => setShowItemCreate(false)} />
      <BrokerCreateModal visible={showBrokerCreate} onClose={() => setShowBrokerCreate(false)} onCreated={(b) => setSelectedBroker(b)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  customHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight, zIndex: 10
  },
  backButton: { padding: spacing.xs, width: 40 },
  backButtonText: { fontSize: 24, color: colors.primary, fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  numberBar: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center' },
  numberLabel: { ...typography.caption, marginTop: 2 },
  numberValue: { fontSize: 15, fontWeight: 'bold', color: colors.primary },
  section: { padding: spacing.lg, paddingBottom: spacing.sm },
  sectionTitle: { ...typography.label, marginBottom: spacing.sm },
  input: {
    height: 48, backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, fontSize: 15, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  selectedParty: {
    flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.lg,
    borderRadius: radius.md, alignItems: 'flex-start', ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight,
  },
  partyName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  partyCode: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  changeBtn: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },
  segBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  segBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  segBtnTextActive: { color: '#fff' },
  lineItemEditor: {
    backgroundColor: colors.surface, padding: spacing.md,
    borderRadius: radius.md, marginBottom: spacing.md,
    ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight
  },
  itemRow: { flexDirection: 'row', gap: spacing.sm },
  halfInput: { flex: 1 },
  addBtn: { backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  addBtnText: { color: colors.primary, fontWeight: 'bold', fontSize: 15 },
  removeBtn: { height: 48, width: 44, justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: colors.error, fontSize: 18, fontWeight: 'bold' },
  itemTotalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 4 },
  liMeta: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  liAmount: { fontSize: 14, color: colors.primary, fontWeight: 'bold' },
  webviewContainer: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
    backgroundColor: '#fff',
  },
  webview: { flex: 1, backgroundColor: '#fff' },
  summaryCard: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...shadows.md, marginTop: spacing.md },
  summRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, alignItems: 'center' },
  summLabel: { fontSize: 14, color: colors.textSecondary },
  summValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  grandLabel: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  grandValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  draftBtn: {
    flex: 1, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.surface,
  },
  draftBtnText: { color: colors.primary, fontSize: 15, fontWeight: 'bold' },
  submitBtn: {
    backgroundColor: colors.primary, height: 56,
    borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
    ...shadows.md
  },
  disabledBtn: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
