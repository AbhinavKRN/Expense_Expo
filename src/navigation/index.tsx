import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/Groups/HomeScreen';
import GroupDetailsScreen from '../screens/Groups/GroupDetailsScreen';
import CreateGroupScreen from '../screens/Groups/CreateGroupScreen';
import AddExpenseScreen from '../screens/Expenses/AddExpenseScreen';
import ProfileScreen from '../screens/Auth/ProfileScreen';

// Types
import { Group, Expense } from '../types';

export type RootStackParamList = {
  Main: undefined;
  CreateGroup: undefined;
  GroupDetails: { groupId: string };
  AddExpense: { groupId: string };
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'My Groups' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreateGroup" 
          component={CreateGroupScreen} 
          options={{ title: 'Create New Group' }}
        />
        <Stack.Screen 
          name="GroupDetails" 
          component={GroupDetailsScreen} 
          options={({ route }) => ({ title: 'Group Details' })}
        />
        <Stack.Screen 
          name="AddExpense" 
          component={AddExpenseScreen} 
          options={{ title: 'Add Expense' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
