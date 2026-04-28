import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, radius, typography } from '../../lib/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
    const [businessName, setBusinessName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const { register, isLoading, error, clearError } = useAuthStore();

    const handleRegister = async () => {
        if (!businessName.trim() || !ownerName.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }
        try {
            await register({
                businessName: businessName.trim(),
                ownerName: ownerName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password,
            } as any);
        } catch {
            // Error handled by store
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.logo}>TextilePro</Text>
                    <Text style={styles.tagline}>Create Your Business Account</Text>
                </View>

                <View style={styles.form}>
                    {error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity onPress={clearError}>
                                <Text style={styles.dismissText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Business Name *</Text>
                        <TextInput style={styles.input} placeholder="e.g. Vinayak Textiles" placeholderTextColor={colors.textMuted} value={businessName} onChangeText={setBusinessName} editable={!isLoading} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Owner Name *</Text>
                        <TextInput style={styles.input} placeholder="Your full name" placeholderTextColor={colors.textMuted} value={ownerName} onChangeText={setOwnerName} editable={!isLoading} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput style={styles.input} placeholder="you@business.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!isLoading} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput style={styles.input} placeholder="+91 XXXXX XXXXX" placeholderTextColor={colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={!isLoading} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password *</Text>
                        <TextInput style={styles.input} placeholder="Min 8 characters" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry editable={!isLoading} />
                    </View>

                    <TouchableOpacity
                        style={[styles.registerBtn, isLoading && styles.disabledBtn]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Create Account</Text>}
                    </TouchableOpacity>

                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
    header: { alignItems: 'center', marginBottom: spacing['2xl'] },
    logo: { fontSize: 32, fontWeight: 'bold', color: colors.primary },
    tagline: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
    form: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing['2xl'] },
    errorBox: { backgroundColor: colors.errorBg, padding: spacing.md, borderRadius: radius.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, borderWidth: 1, borderColor: '#fecaca' },
    errorText: { color: colors.error, flex: 1, fontSize: 14 },
    dismissText: { color: colors.error, fontWeight: 'bold', paddingLeft: spacing.sm },
    inputGroup: { marginBottom: spacing.md },
    label: { ...typography.label, marginBottom: spacing.xs },
    input: { height: 48, backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
    registerBtn: { backgroundColor: colors.primary, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, marginTop: spacing.sm },
    disabledBtn: { opacity: 0.7 },
    registerBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    loginRow: { flexDirection: 'row', justifyContent: 'center' },
    loginText: { color: colors.textSecondary, fontSize: 14 },
    loginLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
