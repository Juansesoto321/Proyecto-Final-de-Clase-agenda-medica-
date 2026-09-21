import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import MyAppointmentsScreen from '../screens/patient/MyAppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export default function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen name="Agendar" component={BookAppointmentScreen} options={{ title: 'Agendar cita' }} />
      <Tab.Screen name="Mis citas" component={MyAppointmentsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
