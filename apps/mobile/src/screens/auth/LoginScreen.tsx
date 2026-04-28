import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, radius, typography } from '../../lib/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginWithEmail, isLoading, error, clearError } = useAuthStore();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        try {
            await loginWithEmail(email.trim(), password);
        } catch {
            // Error handled by store
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.logo}>TextilePro</Text>
                    <Text style={styles.tagline}>India's Best Challan Management</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.title}>Welcome Back</Text>

                    {error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity onPress={clearError}>
                                <Text style={styles.dismissText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}

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
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        style={styles.forgotLink}
                    >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginBtn, isLoading && styles.disabledBtn]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginBtnText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerRow}>
                        <Text style={styles.registerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Register</Text>
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
    header: { alignItems: 'center', marginBottom: spacing['3xl'] },
    logo: { fontSize: 32, fontWeight: 'bold', color: colors.primary },
    tagline: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
    form: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing['2xl'] },
    title: { ...typography.h2, marginBottom: spacing.xl, textAlign: 'center' },
    errorBox: {
        backgroundColor: colors.errorBg,
        padding: spacing.md,
        borderRadius: radius.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    errorText: { color: colors.error, flex: 1, fontSize: 14 },
    dismissText: { color: colors.error, fontWeight: 'bold', paddingLeft: spacing.sm },
    inputGroup: { marginBottom: spacing.lg },
    label: { ...typography.label, marginBottom: spacing.xs },
    input: {
        height: 48,
        backgroundColor: colors.background,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    forgotLink: { alignSelf: 'flex-end', marginBottom: spacing.xl },
    forgotText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    loginBtn: {
        backgroundColor: colors.primary,
        height: 52,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    disabledBtn: { opacity: 0.7 },
    loginBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    registerRow: { flexDirection: 'row', justifyContent: 'center' },
    registerText: { color: colors.textSecondary, fontSize: 14 },
    registerLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
