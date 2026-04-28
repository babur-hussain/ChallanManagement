import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Search, MapPin, Star } from 'lucide-react-native';

const mockListings = [
    { id: '1', title: 'Premium Georgette', supplier: 'Surat Textiles', location: 'Surat', price: '₹120', rating: 4.8 },
    { id: '2', title: 'Silk Cotton Blend', supplier: 'Raj Traders', location: 'Ahmedabad', price: 'Ask', rating: 4.5 },
];

export const MarketplaceScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>B2B Marketplace</Text>
                <TouchableOpacity style={styles.searchBtn}>
                    <Search color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={mockListings}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.banner}></View>
                        <View style={styles.info}>
                            <Text style={styles.itemName}>{item.title}</Text>
                            <Text style={styles.supplierText}>{item.supplier}</Text>
                            <View style={styles.row}>
                                <Text style={styles.meta}><MapPin size={12} color="#64748b" /> {item.location}</Text>
                                <Text style={styles.meta}><Star size={12} color="#f59e0b" /> {item.rating}</Text>
                            </View>
                            <View style={styles.footerRow}>
                                <Text style={styles.price}>{item.price}</Text>
                                <TouchableOpacity style={styles.inquireBtn}>
                                    <Text style={styles.inquireText}>Inquire</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#2563eb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    searchBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },
    list: { padding: 15 },
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, overflow: 'hidden' },
    banner: { height: 120, backgroundColor: '#e2e8f0' },
    info: { padding: 15 },
    itemName: { fontSize: 16, fontWeight: '600' },
    supplierText: { color: '#64748b', fontSize: 14, marginVertical: 4 },
    row: { flexDirection: 'row', gap: 15, marginBottom: 10 },
    meta: { fontSize: 12, color: '#64748b', flexDirection: 'row', alignItems: 'center' },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#f1f5f9' },
    price: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
    inquireBtn: { backgroundColor: '#2563eb', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
    inquireText: { color: '#fff', fontWeight: '500' }
});
