import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { PokerSession } from './index';

export type RootStackParamList = {
  MainTabs: undefined;
  SessionDetail: { session: PokerSession };
};

export type MainTabParamList = {
  Home: undefined;
  'New Session': undefined;
  Calendar: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>; 