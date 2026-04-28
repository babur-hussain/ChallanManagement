import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

export function MyDeliveriesScreen() {

  const handleMarkDelivered = (challanId: string) => {
    Alert.alert(
      "Confirm Delivery",
      "Are you sure you want to mark this challan as delivered?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => console.log(`Marking ${challanId} as delivered. Syncing to remote...`) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Deliveries Today</Text>
      
      <ScrollView>
        {[1,2,3].map(i => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.partyName}>Omkar Trading Co.</Text>
              <Text style={styles.challanNo}>CHN-{1000 + i}</Text>
            </View>
            <Text style={styles.address}>Ring Road, Surat, Gujarat</Text>
            <View style={styles.details}>
              <Text style={styles.detailText}>Total Meters: 1,450.5m</Text>
              <Text style={styles.detailText}>4 Bags</Text>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => handleMarkDelivered('123')}>
                <Text style={styles.primaryBtnText}>Mark Delivered</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, elevation: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  partyName: { fontSize: 18, fontWeight: 'bold' },
  challanNo: { fontSize: 14, color: '#f97316', fontWeight: 'bold' },
  address: { fontSize: 14, color: '#4b5563', marginBottom: 12 },
  details: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 },
  detailText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  outlineBtn: { width: '48%', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  outlineBtnText: { color: '#374151', fontWeight: 'bold' },
  primaryBtn: { width: '48%', padding: 12, borderRadius: 6, backgroundColor: '#10b981', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: 'bold' },
});
