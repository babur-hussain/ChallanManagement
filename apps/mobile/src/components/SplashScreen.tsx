import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { colors, spacing, radius, typography } from '../lib/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const orbScaleAnim = useRef(new Animated.Value(1)).current;
    const orbOpacityAnim = useRef(new Animated.Value(0.2)).current;
    const barWidthAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous Orb Pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(orbScaleAnim, {
                    toValue: 1.4,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(orbScaleAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(orbOpacityAnim, {
                    toValue: 0.1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(orbOpacityAnim, {
                    toValue: 0.25,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Main Entrance Sequence
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 700,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            // Loader Bar
            Animated.timing(barWidthAnim, {
                toValue: width * 0.4,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false, // Cannot use native driver for width
            })
        ]).start();

        // Finish transition after animations (simulating app initial data fetch)
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(onFinish);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {/* Background glowing orb */}
            <Animated.View style={[
                styles.glowingOrb,
                {
                    opacity: orbOpacityAnim,
                    transform: [{ scale: orbScaleAnim }]
                }
            ]} />

            {/* Main Content Box */}
            <Animated.View style={[
                styles.content,
                {
                    opacity: fadeAnim,
                    transform: [
                        { scale: scaleAnim },
                        { translateY: slideUpAnim }
                    ],
                }
            ]}>

                {/* Stunning Logo Block */}
                <View style={styles.logoBlock}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🎯</Text>
                    </View>
                </View>

                {/* Typography */}
                <Text style={styles.appName}>TextilePro</Text>
                <Text style={styles.tagline}>Smart Enterprise Management</Text>

                {/* Progress Bar Container */}
                <View style={styles.progressContainer}>
                    <Animated.View style={[styles.progressBar, { width: barWidthAnim }]} />
                </View>

            </Animated.View>

            {/* Bottom Footer */}
            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                <Text style={styles.footerText}>Secure Environment • Version 1.0</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Deep Slate Dark Mode
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    glowingOrb: {
        position: 'absolute',
        width: height * 0.5,
        height: height * 0.5,
        borderRadius: height * 0.25,
        backgroundColor: colors.primary, // Brand orange glow
        top: '20%',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 100,
        elevation: 20,
    },
    content: {
        alignItems: 'center',
        zIndex: 10,
    },
    logoBlock: {
        marginBottom: spacing.xl,
        padding: spacing.md,
        borderRadius: radius.full,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 40,
    },
    appName: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: spacing.xs,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    progressContainer: {
        marginTop: 40,
        width: width * 0.5,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    footerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        letterSpacing: 1,
        fontWeight: '600',
    },
});
