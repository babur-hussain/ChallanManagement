import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, radius, typography } from '../lib/theme';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Log to crash reporting service (e.g., Crashlytics, Sentry)
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);

        // TODO: integrate with Firebase Crashlytics
        // import crashlytics from '@react-native-firebase/crashlytics';
        // crashlytics().recordError(error);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <View style={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.icon}>⚠️</Text>
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.message}>
                            The app encountered an unexpected error. Please try again.
                        </Text>

                        {__DEV__ && this.state.error && (
                            <ScrollView style={styles.errorBox}>
                                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                                {this.state.errorInfo?.componentStack && (
                                    <Text style={styles.stackText}>
                                        {this.state.errorInfo.componentStack.substring(0, 500)}
                                    </Text>
                                )}
                            </ScrollView>
                        )}

                        <TouchableOpacity style={styles.retryBtn} onPress={this.handleReset}>
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: colors.background, padding: spacing.xl,
    },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.lg,
        padding: spacing['2xl'], alignItems: 'center', width: '100%',
        maxWidth: 400,
    },
    icon: { fontSize: 48, marginBottom: spacing.lg },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.sm },
    message: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    errorBox: {
        marginTop: spacing.lg, backgroundColor: '#fef2f2',
        borderRadius: radius.md, padding: spacing.md, maxHeight: 150, width: '100%',
    },
    errorText: { fontSize: 12, color: colors.error, fontFamily: 'monospace' },
    stackText: { fontSize: 10, color: colors.textMuted, marginTop: spacing.sm, fontFamily: 'monospace' },
    retryBtn: {
        marginTop: spacing.xl, backgroundColor: colors.primary,
        paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md,
        borderRadius: radius.md,
    },
    retryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
