import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SessionsProvider } from './src/context/SessionsContext';
import HomeScreen from './src/screens/HomeScreen';
import NewSessionScreen from './src/screens/NewSessionScreen';
import SessionDetailScreen from './src/screens/SessionDetailScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import { RootStackParamList, MainTabParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="New Session" component={NewSessionScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <SessionsProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="SessionDetail" 
            component={SessionDetailScreen} 
            options={{ title: 'Session Details' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionsProvider>
  );
};

export default App;
