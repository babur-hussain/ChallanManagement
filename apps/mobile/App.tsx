import React, { useEffect } from 'react';
import { StatusBar, Platform, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { deepLinkConfig } from './src/lib/deepLinking';
import { PushNotificationService } from './src/lib/pushNotifications';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Suppress known harmless warnings in dev
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed',
]);

export default function App() {
  useEffect(() => {
    // Initialize push notifications after app mounts
    PushNotificationService.initialize().catch(console.warn);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer linking={deepLinkConfig as any}>
              <StatusBar
                barStyle="light-content"
                backgroundColor="#f97316"
                translucent={Platform.OS === 'android'}
              />
              <RootNavigator />
            </NavigationContainer>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
