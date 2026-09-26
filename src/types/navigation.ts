import type { Room } from './room';
import type { Booking } from './booking';

export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  RoomDiscovery: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  RoomDetail: { room: Room };
  QRPassModal: { booking: Booking };
};
