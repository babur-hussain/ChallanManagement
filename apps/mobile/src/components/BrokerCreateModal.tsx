import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, SafeAreaView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useCreateBroker } from '../hooks/api/useBrokers';
import { colors, spacing, radius } from '../lib/theme';

interface BrokerCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (broker: any) => void;
}

export function BrokerCreateModal({ visible, onClose, onCreated }: BrokerCreateModalProps) {
  const createMutation = useCreateBroker();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('');

  const resetForm = () => { setName(''); setPhone(''); setCommissionRate(''); };

  const handleSubmit = () => {
    if (!name.trim()) { Alert.alert('Validation', 'Broker name is required'); return; }
    const payload: any = {
      name: name.trim(),
      phone: phone.trim(),
      commissionRate: parseFloat(commissionRate) || 0,
      isActive: true,
    };
    createMutation.mutate(payload, {
      onSuccess: (broker: any) => {
        Alert.alert('✅ Success', `Broker "${broker.name}" created!`);
        resetForm(); onCreated?.(broker); onClose();
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Add New Broker</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={s.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>
          <View style={s.form}>
            <Text style={s.label}>Broker Name *</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="e.g. Rajesh Broker" placeholderTextColor={colors.textMuted} />
            <Text style={s.label}>Phone</Text>
            <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
            <Text style={s.label}>Commission Rate (%)</Text>
            <TextInput style={s.input} value={commissionRate} onChangeText={setCommissionRate} placeholder="0" keyboardType="numeric" placeholderTextColor={colors.textMuted} />
          </View>
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
  form: { padding: spacing.lg },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 4, marginTop: spacing.sm },
  input: { height: 44, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
});
