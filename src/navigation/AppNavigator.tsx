import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import { MainTabNavigator } from './MainTabNavigator';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
    </Stack.Navigator>
  );
};
