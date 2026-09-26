import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useBookingStore } from '../stores/useBookingStore';
import { useAuthBootstrap } from '../hooks/useAuthBootstrap';
import { useRealtimeBookings } from '../hooks/useRealtimeBookings';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';

export const RootNavigator: React.FC = () => {
  useAuthBootstrap();
  useRealtimeBookings();

  const session = useBookingStore((s) => s.session);
  const authLoading = useBookingStore((s) => s.authLoading);

  if (authLoading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
