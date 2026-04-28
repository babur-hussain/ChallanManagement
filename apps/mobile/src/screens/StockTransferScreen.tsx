import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function StockTransferScreen() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerTitle}>Stock Transfer</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Item / Quality</Text>
                <TextInput style={styles.input} placeholder="Search item..." />
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: spacing.sm }]}>
                    <Text style={styles.label}>From Warehouse</Text>
                    <TextInput style={styles.input} placeholder="Select source" />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: spacing.sm }]}>
                    <Text style={styles.label}>To Warehouse</Text>
                    <TextInput style={styles.input} placeholder="Select destination" />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Quantity (Meters)</Text>
                <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" />
            </View>

            <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitText}>Transfer Stock</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    headerTitle: { ...typography.h3, marginBottom: spacing.xl },
    formGroup: { marginBottom: spacing.lg },
    label: { ...typography.label, marginBottom: spacing.sm },
    input: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
    row: { flexDirection: 'row' },
    submitBtn: { backgroundColor: colors.info, padding: spacing.lg, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.xl },
    submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
