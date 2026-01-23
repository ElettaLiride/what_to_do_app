import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Platform } from 'react-native';

import { AppProvider } from './src/context/AppContext';
import { colors, fontSize } from './src/theme/theme';

const isWeb = Platform.OS === 'web';
import {
  HomeScreen,
  TasksScreen,
  TaskDetailScreen,
  GroupsScreen,
  GroupDetailScreen,
} from './src/screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
function TabIcon({ name, focused }) {
  const icons = {
    Home: '🏠',
    Tasks: '📋',
    Groups: '📁',
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{icons[name]}</Text>
    </View>
  );
}

// Tasks Stack Navigator
function TasksStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="TasksList"
        component={TasksScreen}
        options={{ title: 'Tasks' }}
      />
      <Stack.Screen
        name="AddTask"
        component={TaskDetailScreen}
        options={{ title: 'New Task' }}
      />
    </Stack.Navigator>
  );
}

// Groups Stack Navigator
function GroupsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="GroupsList"
        component={GroupsScreen}
        options={{ title: 'Groups' }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{ title: 'Group' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  // Use simple tab bar on web, floating tab bar on native
  const tabBarStyle = isWeb
    ? {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: 8,
        paddingTop: 8,
        height: 65,
      }
    : {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: 8,
        paddingTop: 8,
        height: 65,
        position: 'absolute',
        bottom: 25,
        left: 16,
        right: 16,
        borderRadius: 20,
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '500',
        },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsStackNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator (for modals and detail screens)
function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Task' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
