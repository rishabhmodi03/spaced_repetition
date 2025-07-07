import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons

import HomeScreen from './screens/HomeScreen';
import TopicsListScreen from './screens/TopicsListScreen';
import AddTopicScreen from './screens/AddTopicScreen';
import CalendarScreen from './screens/CalendarScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Topics') {
              iconName = focused ? 'list-circle' : 'list-circle-outline';
            } else if (route.name === 'Add Topic') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: 'tomato', // Example header background color
          },
          headerTintColor: '#fff', // Example header text color
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // headerShown: true, // Already default
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }}/>
        <Tab.Screen name="Topics" component={TopicsListScreen} options={{ title: 'My Topics' }}/>
        <Tab.Screen name="Add Topic" component={AddTopicScreen} options={{ title: 'New Topic' }}/>
        <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Revision Calendar' }}/>
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Note: The StyleSheet from the original App.js is no longer needed here
// as the content is now managed by the screens and navigator.
