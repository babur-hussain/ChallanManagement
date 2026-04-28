import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, radius, typography } from '../../lib/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const { resetPassword, isLoading } = useAuthStore();

    const handleReset = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        try {
            await resetPassword(email.trim());
            setSent(true);
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Could not send reset email');
        }
    };

    if (sent) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.successIcon}>✉️</Text>
                    <Text style={styles.successTitle}>Check Your Email</Text>
                    <Text style={styles.successDesc}>
                        We've sent a password reset link to {email}. Follow the instructions in the email.
                    </Text>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.backBtnText}>Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.desc}>
                    Enter your email and we'll send you a link to reset your password.
                </Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@business.com"
                        placeholderTextColor={colors.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.resetBtn, isLoading && styles.disabledBtn]}
                    onPress={handleReset}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetBtnText}>Send Reset Link</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
                    <Text style={styles.backLinkText}>← Back to Sign In</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.xl },
    card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing['2xl'] },
    title: { ...typography.h2, marginBottom: spacing.sm, textAlign: 'center' },
    desc: { ...typography.bodySmall, textAlign: 'center', marginBottom: spacing.xl },
    inputGroup: { marginBottom: spacing.lg },
    label: { ...typography.label, marginBottom: spacing.xs },
    input: { height: 48, backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
    resetBtn: { backgroundColor: colors.primary, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
    disabledBtn: { opacity: 0.7 },
    resetBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    backLink: { alignItems: 'center' },
    backLinkText: { color: colors.textSecondary, fontSize: 14 },
    successIcon: { fontSize: 48, textAlign: 'center', marginBottom: spacing.lg },
    successTitle: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
    successDesc: { ...typography.bodySmall, textAlign: 'center', marginBottom: spacing.xl },
    backBtn: { backgroundColor: colors.primary, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    backBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
