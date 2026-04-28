import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, SafeAreaView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useCreateItem } from '../hooks/api/useItems';
import { colors, spacing, radius } from '../lib/theme';

const GST_RATE_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18%' },
  { value: 28, label: '28%' },
];

const UNIT_OPTIONS = [
  { value: 'METERS', label: 'Meters' },
  { value: 'KILOGRAMS', label: 'Kg' },
];

interface ItemCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (item: any) => void;
}

function generateShortCode(name: string): string {
  return name.split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('').slice(0, 6);
}

export function ItemCreateModal({ visible, onClose, onCreated }: ItemCreateModalProps) {
  const createMutation = useCreateItem();
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [defaultRate, setDefaultRate] = useState('');
  const [gstRate, setGstRate] = useState(5);
  const [unit, setUnit] = useState('METERS');
  const [width, setWidth] = useState('');
  const [composition, setComposition] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (name.trim().length > 1 && !shortCode) setShortCode(generateShortCode(name));
  }, [name]);

  const resetForm = () => {
    setName(''); setShortCode(''); setHsnCode(''); setCategory('OTHER');
    setDefaultRate(''); setGstRate(5); setUnit('METERS');
    setWidth(''); setComposition(''); setDescription('');
  };

  const handleSubmit = () => {
    if (!name.trim()) { Alert.alert('Validation', 'Item name is required'); return; }
    const payload: any = {
      name: name.trim(),
      shortCode: shortCode.trim().toUpperCase() || generateShortCode(name),
      hsnCode: hsnCode.trim(), category: category || 'OTHER',
      defaultRate: parseFloat(defaultRate) || 0, gstRate, unit,
      width: width ? parseFloat(width) : undefined,
      composition: composition.trim(), description: description.trim(),
      isActive: true, sortOrder: 0,
    };
    createMutation.mutate(payload, {
      onSuccess: (item: any) => {
        Alert.alert('✅ Success', `Item "${item.name}" created!`);
        resetForm(); onCreated?.(item); onClose();
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Add New Item</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={s.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView style={s.form} keyboardShouldPersistTaps="handled">
            <Text style={s.label}>Item Name *</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="e.g. TinTin Georgette" placeholderTextColor={colors.textMuted} />
            <View style={s.row}>
              <View style={s.half}><Text style={s.label}>Short Code</Text><TextInput style={s.input} value={shortCode} onChangeText={setShortCode} placeholder="TTG" autoCapitalize="characters" placeholderTextColor={colors.textMuted} /></View>
              <View style={s.half}><Text style={s.label}>HSN Code</Text><TextInput style={s.input} value={hsnCode} onChangeText={setHsnCode} placeholder="500710" placeholderTextColor={colors.textMuted} /></View>
            </View>
            <View style={s.row}>
              <View style={s.half}><Text style={s.label}>Default Rate (₹) *</Text><TextInput style={s.input} value={defaultRate} onChangeText={setDefaultRate} placeholder="0.00" keyboardType="numeric" placeholderTextColor={colors.textMuted} /></View>
              <View style={s.half}><Text style={s.label}>Category</Text><TextInput style={s.input} value={category} onChangeText={setCategory} placeholder="OTHER" autoCapitalize="characters" placeholderTextColor={colors.textMuted} /></View>
            </View>
            <Text style={s.label}>GST Rate *</Text>
            <View style={s.segRow}>
              {GST_RATE_OPTIONS.map(o => (
                <TouchableOpacity key={o.value} style={[s.seg, gstRate === o.value && s.segOn]} onPress={() => setGstRate(o.value)}>
                  <Text style={[s.segT, gstRate === o.value && s.segTOn]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.label}>Unit</Text>
            <View style={s.segRow}>
              {UNIT_OPTIONS.map(o => (
                <TouchableOpacity key={o.value} style={[s.seg, unit === o.value && s.segOn]} onPress={() => setUnit(o.value)}>
                  <Text style={[s.segT, unit === o.value && s.segTOn]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.row}>
              <View style={s.half}><Text style={s.label}>Width (Inches)</Text><TextInput style={s.input} value={width} onChangeText={setWidth} placeholder="44" keyboardType="numeric" placeholderTextColor={colors.textMuted} /></View>
              <View style={s.half}><Text style={s.label}>Composition</Text><TextInput style={s.input} value={composition} onChangeText={setComposition} placeholder="100% Polyester" placeholderTextColor={colors.textMuted} /></View>
            </View>
            <Text style={s.label}>Internal Notes</Text>
            <TextInput style={s.input} value={description} onChangeText={setDescription} placeholder="Optional remarks" placeholderTextColor={colors.textMuted} />
            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surface },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: colors.textPrimary },
  cancelText: { fontSize: 15, color: colors.textSecondary },
  saveText: { fontSize: 15, color: colors.primary, fontWeight: 'bold' },
  form: { flex: 1, padding: spacing.lg },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4, marginTop: spacing.sm },
  input: { height: 44, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  segRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  seg: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  segOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  segT: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  segTOn: { color: '#fff' },
});
