import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminAppointmentsScreen from '../screens/admin/AdminAppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen
        name="Gestión de citas"
        component={AdminAppointmentsScreen}
        options={{ title: 'Gestión de citas' }}
      />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
