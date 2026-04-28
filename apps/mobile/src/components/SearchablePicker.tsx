import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, FlatList, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export interface PickerItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchablePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: PickerItem) => void;
  onAddNew?: () => void;
  items: PickerItem[];
  title: string;
  searchPlaceholder?: string;
  addNewLabel?: string;
}

export function SearchablePicker({
  visible,
  onClose,
  onSelect,
  onAddNew,
  items,
  title,
  searchPlaceholder = 'Search...',
  addNewLabel = '+ Add New',
}: SearchablePickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.sublabel && i.sublabel.toLowerCase().includes(q))
    );
  }, [items, search]);

  const handleSelect = (item: PickerItem) => {
    onSelect(item);
    setSearch('');
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
              returnKeyType="search"
            />
          </View>

          {/* Add New Button */}
          {onAddNew && (
            <TouchableOpacity
              style={styles.addNewBtn}
              onPress={() => {
                setSearch('');
                onAddNew();
              }}
            >
              <Text style={styles.addNewText}>{addNewLabel}</Text>
            </TouchableOpacity>
          )}

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem} onPress={() => handleSelect(item)}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                {item.sublabel ? <Text style={styles.itemSublabel}>{item.sublabel}</Text> : null}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  closeBtn: { fontSize: 20, color: colors.textMuted, fontWeight: 'bold', padding: spacing.xs },
  searchContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.surface },
  searchInput: {
    height: 44, backgroundColor: colors.surfaceAlt, borderRadius: radius.md,
    paddingHorizontal: spacing.md, fontSize: 15, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },
  addNewBtn: {
    marginHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.xs,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: colors.primaryLight, borderRadius: radius.md,
    alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed',
  },
  addNewText: { color: colors.primary, fontWeight: 'bold', fontSize: 15 },
  listItem: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  itemLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  itemSublabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { paddingVertical: spacing['3xl'], alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textMuted },
});
