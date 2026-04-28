import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export function FounderCopilotScreen() {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Good morning CEO. TextilePro Global OS is nominal. Would you like the daily revenue synthesis?' }
    ]);
    const [input, setInput] = useState('');

    const send = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput('');
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: 'Analyzing... Live MRR shows an 8% spike in the Bangladesh Garment Sector. I have dispatched 40 AI follow-ups to stalled leads in that cohort.' }]);
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Brain / Copilot</Text>

            <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
                {messages.map((m, i) => (
                    <View key={i} style={[styles.bubbleContainer, m.role === 'user' ? styles.userBubbleC : styles.aiBubbleC]}>
                        <View style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                            <Text style={[styles.text, m.role === 'user' ? styles.userText : styles.aiText]}>{m.text}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Ask for metrics, churn risks..."
                    value={input}
                    onChangeText={setInput}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={send}>
                    <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#4f46e5', color: '#fff', fontSize: 24, fontWeight: 'bold' },
    chatArea: { flex: 1, padding: 16 },
    chatContent: { gap: 16, paddingBottom: 20 },
    bubbleContainer: { flexDirection: 'row', width: '100%' },
    userBubbleC: { justifyContent: 'flex-end' },
    aiBubbleC: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', padding: 16, borderRadius: 16 },
    userBubble: { backgroundColor: '#4f46e5', borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e5e7eb' },
    text: { fontSize: 16, lineHeight: 24 },
    userText: { color: '#fff' },
    aiText: { color: '#374151' },
    inputArea: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e5e7eb' },
    input: { flex: 1, height: 48, backgroundColor: '#f3f4f6', borderRadius: 24, paddingHorizontal: 16, fontSize: 16, marginRight: 12 },
    sendBtn: { height: 48, paddingHorizontal: 24, backgroundColor: '#4f46e5', borderRadius: 24, justifyContent: 'center' },
    sendText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
