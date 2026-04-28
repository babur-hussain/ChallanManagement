import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { apiPost } from './api';
import firebase from '@react-native-firebase/app';

/**
 * Push notification service using Firebase Cloud Messaging (FCM).
 * Handles permission requests, token registration, and foreground/background handlers.
 */
export class PushNotificationService {
    private static isInitialized = false;

    /**
     * Initialize push notifications — call once from App.tsx or on login.
     */
    static async initialize(): Promise<void> {
        if (this.isInitialized) return;

        // Skip native messaging setup if Firebase native hasn't linked correctly to avoid redbox
        if (!firebase.apps.length) {
            console.warn('[Push] Native Firebase app not found, skipping push initialization.');
            return;
        }

        try {
            // Request permission
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (!enabled) {
                console.log('[Push] User denied notification permission');
                return;
            }

            // Get FCM token
            const token = await messaging().getToken();
            if (token) {
                console.log('[Push] FCM token:', token.substring(0, 20) + '...');
                await this.registerToken(token);
            }

            // Listen for token refresh
            messaging().onTokenRefresh(async (newToken) => {
                console.log('[Push] Token refreshed');
                await this.registerToken(newToken);
            });

            // Foreground message handler
            messaging().onMessage(async (remoteMessage) => {
                console.log('[Push] Foreground message:', remoteMessage.notification?.title);
                // TODO: Show in-app notification banner
            });

            // Background/quit message handler (for navigation)
            messaging().onNotificationOpenedApp((remoteMessage) => {
                console.log('[Push] Opened from background:', remoteMessage.data);
                // TODO: Navigate to relevant screen based on remoteMessage.data
            });

            // Check if app was opened from a killed state
            const initialNotification = await messaging().getInitialNotification();
            if (initialNotification) {
                console.log('[Push] Opened from quit state:', initialNotification.data);
                // TODO: Navigate after app fully loads
            }

            this.isInitialized = true;
            console.log('[Push] Initialized successfully');
        } catch (error: any) {
            console.warn('[Push] Init error:', error?.message || error);
        }
    }

    /**
     * Register FCM token with the backend.
     */
    private static async registerToken(token: string): Promise<void> {
        try {
            await apiPost('/auth/register-device', {
                fcmToken: token,
                platform: Platform.OS,
                deviceId: `${Platform.OS}-${Date.now()}`,
            });
        } catch (error) {
            console.warn('[Push] Token registration failed:', error);
        }
    }

    /**
     * Subscribe to a topic (e.g., business-level notifications).
     */
    static async subscribeTo(topic: string): Promise<void> {
        try {
            await messaging().subscribeToTopic(topic);
            console.log(`[Push] Subscribed to topic: ${topic}`);
        } catch (error) {
            console.warn('[Push] Subscribe error:', error);
        }
    }

    /**
     * Unsubscribe from a topic.
     */
    static async unsubscribeFrom(topic: string): Promise<void> {
        try {
            await messaging().unsubscribeFromTopic(topic);
        } catch (error) {
            console.warn('[Push] Unsubscribe error:', error);
        }
    }
}
