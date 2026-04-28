import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { colors, spacing } from '../lib/theme';

/**
 * Persistent banner shown when the device goes offline.
 * Automatically appears/disappears with animation.
 */
export function NetworkBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [slideAnim] = useState(new Animated.Value(-50));

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const offline = !(state.isConnected && state.isInternetReachable !== false);
            setIsOffline(offline);

            Animated.timing(slideAnim, {
                toValue: offline ? 0 : -50,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });

        return () => unsubscribe();
    }, []);

    if (!isOffline) return null;

    return (
        <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.text}>📴 No internet connection — changes will sync when online</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ef4444',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        zIndex: 9999,
    },
    text: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});
