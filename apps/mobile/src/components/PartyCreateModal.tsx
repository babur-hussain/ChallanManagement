import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, SafeAreaView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useCreateParty } from '../hooks/api/useParties';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
  'Chandigarh', 'Jammu & Kashmir', 'Ladakh',
];

const PARTY_TYPES = [
  { value: 'BUYER', label: 'Buyer (Customer)' },
  { value: 'BROKER', label: 'Broker' },
  { value: 'BOTH', label: 'Both' },
];

interface PartyCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (party: any) => void;
}

function generateShortCode(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 6);
}

export function PartyCreateModal({ visible, onClose, onCreated }: PartyCreateModalProps) {
  const createMutation = useCreateParty();

  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [partyType, setPartyType] = useState('BUYER');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('Surat');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('');
  const [creditDays, setCreditDays] = useState('30');
  const [creditLimit, setCreditLimit] = useState('0');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [balanceType, setBalanceType] = useState('DR');
  const [showStatePicker, setShowStatePicker] = useState(false);

  // Auto-generate short code
  useEffect(() => {
    if (name.trim().length > 1 && !shortCode) {
      setShortCode(generateShortCode(name));
    }
  }, [name]);

  // Sync WhatsApp
  useEffect(() => {
    if (sameAsPhone) setWhatsapp(phone);
  }, [phone, sameAsPhone]);

  const resetForm = () => {
    setName(''); setShortCode(''); setPartyType('BUYER');
    setPhone(''); setWhatsapp(''); setSameAsPhone(true);
    setGstin(''); setPanNumber('');
    setLine1(''); setCity('Surat'); setState('Gujarat'); setPincode('');
    setCreditDays('30'); setCreditLimit('0');
    setOpeningBalance('0'); setBalanceType('DR');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Party name is required');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation', 'Phone number is required');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Validation', 'City is required');
      return;
    }

    const payload: any = {
      name: name.trim(),
      shortCode: shortCode.trim().toUpperCase() || generateShortCode(name),
      partyType,
      phone: phone.trim(),
      whatsapp: sameAsPhone ? phone.trim() : whatsapp.trim(),
      email: '',
      address: {
        line1: line1.trim(),
        city: city.trim(),
        state,
        pincode: pincode.trim(),
      },
      gstin: gstin.trim().toUpperCase(),
      panNumber: panNumber.trim().toUpperCase(),
      creditDays: parseInt(creditDays) || 30,
      creditLimit: parseFloat(creditLimit) || 0,
      openingBalance: parseFloat(openingBalance) || 0,
      balanceType,
      isActive: true,
    };

    createMutation.mutate(payload, {
      onSuccess: (party: any) => {
        Alert.alert('✅ Success', `Party "${party.name}" created!`);
        resetForm();
        onCreated?.(party);
        onClose();
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Party</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            {/* Basic Details */}
            <Text style={styles.sectionHeader}>Basic Details</Text>

            <Text style={styles.label}>Business/Party Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Shree Krishna Textiles" placeholderTextColor={colors.textMuted} />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Short Code</Text>
                <TextInput style={styles.input} value={shortCode} onChangeText={setShortCode} placeholder="e.g. SKT" autoCapitalize="characters" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Type *</Text>
                <View style={styles.segmentRow}>
                  {PARTY_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.segment, partyType === t.value && styles.segmentActive]}
                      onPress={() => setPartyType(t.value)}
                    >
                      <Text style={[styles.segmentText, partyType === t.value && styles.segmentTextActive]}>
                        {t.value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.label}>Phone *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>WhatsApp</Text>
                <TextInput style={[styles.input, sameAsPhone && styles.inputDisabled]} value={whatsapp} onChangeText={setWhatsapp} editable={!sameAsPhone} keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
              </View>
              <TouchableOpacity style={styles.checkRow} onPress={() => setSameAsPhone(!sameAsPhone)}>
                <View style={[styles.checkbox, sameAsPhone && styles.checkboxChecked]}>
                  {sameAsPhone && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkLabel}>Same as phone</Text>
              </TouchableOpacity>
            </View>

            {/* Tax & Address */}
            <Text style={styles.sectionHeader}>Tax & Address</Text>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>GSTIN</Text>
                <TextInput style={styles.input} value={gstin} onChangeText={setGstin} placeholder="22AAAAA0000A1Z5" autoCapitalize="characters" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>PAN</Text>
                <TextInput style={styles.input} value={panNumber} onChangeText={setPanNumber} placeholder="ABCDE1234F" autoCapitalize="characters" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <Text style={styles.label}>Address Line 1</Text>
            <TextInput style={styles.input} value={line1} onChangeText={setLine1} placeholder="Shop No, Building, Street" placeholderTextColor={colors.textMuted} />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>City *</Text>
                <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Surat" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Pincode</Text>
                <TextInput style={styles.input} value={pincode} onChangeText={setPincode} placeholder="395002" keyboardType="numeric" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <Text style={styles.label}>State *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowStatePicker(true)}>
              <Text style={{ fontSize: 15, color: colors.textPrimary }}>{state || 'Select state...'}</Text>
            </TouchableOpacity>

            {/* Financial */}
            <Text style={styles.sectionHeader}>Financial Settings</Text>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Opening Balance</Text>
                <TextInput style={styles.input} value={openingBalance} onChangeText={setOpeningBalance} keyboardType="numeric" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Balance Type</Text>
                <View style={styles.segmentRow}>
                  {['DR', 'CR'].map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.segment, balanceType === t && styles.segmentActive]}
                      onPress={() => setBalanceType(t)}
                    >
                      <Text style={[styles.segmentText, balanceType === t && styles.segmentTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Credit Days</Text>
                <TextInput style={styles.input} value={creditDays} onChangeText={setCreditDays} keyboardType="numeric" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Credit Limit (₹)</Text>
                <TextInput style={styles.input} value={creditLimit} onChangeText={setCreditLimit} keyboardType="numeric" placeholder="0 = No limit" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* State Picker Modal */}
      <Modal visible={showStatePicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowStatePicker(false)}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select State</Text>
            <TouchableOpacity onPress={() => setShowStatePicker(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {INDIAN_STATES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.stateItem, state === s && styles.stateItemActive]}
                onPress={() => { setState(s); setShowStatePicker(false); }}
              >
                <Text style={[styles.stateText, state === s && styles.stateTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: colors.textPrimary },
  cancelText: { fontSize: 15, color: colors.textSecondary },
  saveText: { fontSize: 15, color: colors.primary, fontWeight: 'bold' },
  closeBtn: { fontSize: 20, color: colors.textMuted, fontWeight: 'bold' },
  form: { flex: 1, padding: spacing.lg },
  sectionHeader: {
    fontSize: 13, fontWeight: 'bold', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: spacing.lg, marginBottom: spacing.sm,
    paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4, marginTop: spacing.sm },
  input: {
    height: 44, backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, fontSize: 15, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border, justifyContent: 'center',
  },
  inputDisabled: { backgroundColor: colors.surfaceAlt, opacity: 0.6 },
  row: { flexDirection: 'row', gap: spacing.sm },
  halfCol: { flex: 1 },
  segmentRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  segment: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: '#fff' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 24, paddingLeft: spacing.sm },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  checkLabel: { fontSize: 11, color: colors.textMuted },
  stateItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingHorizontal: spacing.lg },
  stateItemActive: { backgroundColor: colors.primaryLight },
  stateText: { fontSize: 15, color: colors.textPrimary },
  stateTextActive: { color: colors.primary, fontWeight: 'bold' },
});
