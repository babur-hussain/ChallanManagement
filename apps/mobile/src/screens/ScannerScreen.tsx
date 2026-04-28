import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, RefreshCcw, Check, UploadCloud } from 'lucide-react-native';

// Mock Document Scanner Screen
export const ScannerScreen = () => {
    const [photo, setPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [queue, setQueue] = useState<any[]>([]);

    const handleCapture = () => {
        // Simulated camera capture & auto-crop
        setPhoto('https://via.placeholder.com/600x800.png?text=Scanned+Document');
    };

    const handleUpload = () => {
        setLoading(true);
        setTimeout(() => {
            setQueue([...queue, { id: Date.now(), status: 'UPLOADED' }]);
            setPhoto(null);
            setLoading(false);
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Document Scanner</Text>

            {!photo ? (
                <View style={styles.cameraFrame}>
                    <Text style={styles.cameraText}>Align Document in Frame</Text>
                    <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                        <View style={styles.captureBtnInner} />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.previewFrame}>
                    <Image source={{ uri: photo }} style={styles.previewImage} />
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => setPhoto(null)}>
                            <RefreshCcw color="#fff" size={24} />
                            <Text style={styles.actionText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={handleUpload} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <UploadCloud color="#fff" size={24} />}
                            <Text style={styles.actionText}>Upload</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {queue.length > 0 && (
                <View style={styles.queueContainer}>
                    <Text style={styles.queueTitle}>Upload Queue ({queue.length})</Text>
                    {queue.map(q => (
                        <View key={q.id} style={styles.queueItem}>
                            <Text style={styles.queueText}>Document {q.id}</Text>
                            <Check color="#16a34a" size={20} />
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    cameraFrame: { flex: 1, backgroundColor: '#000', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    cameraText: { color: 'rgba(255,255,255,0.7)', position: 'absolute', top: 40 },
    captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', position: 'absolute', bottom: 40, justifyContent: 'center', alignItems: 'center' },
    captureBtnInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
    previewFrame: { flex: 1 },
    previewImage: { flex: 1, borderRadius: 16, marginBottom: 20 },
    actions: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: { flex: 1, backgroundColor: '#475569', padding: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
    primaryBtn: { backgroundColor: '#2563eb' },
    actionText: { color: '#fff', fontWeight: '600', marginTop: 4 },
    queueContainer: { marginTop: 20, backgroundColor: '#fff', padding: 15, borderRadius: 12 },
    queueTitle: { fontWeight: '600', marginBottom: 10 },
    queueItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    queueText: { fontSize: 14, color: '#334155' }
});
