import React, { useContext, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Calendar, BarChart2, List } from 'lucide-react-native';

// Importar Context y Theme
import { HabitsProvider, HabitsContext } from './src/context/HabitsContext';
import { colors } from './src/theme/colors';
import { requestNotificationPermissions } from './src/utils/notificationHelpers';

// Importar Pantallas
import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import AddHabitScreen from './src/screens/AddHabitScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Navegación en pestañas flotantes
function TabNavigator() {
  const { theme, bgTheme } = useContext(HabitsContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          height: 60,
          borderRadius: 20,
          backgroundColor: bgTheme.cardBg,
          paddingBottom: 8,
          paddingTop: 10,
          borderWidth: 1,
          borderColor: bgTheme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: theme.primaryLight,
        tabBarInactiveTintColor: bgTheme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Hoy"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Analítica"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <BarChart2 size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Mis Hábitos"
        component={HabitsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <List size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Contenido principal de la aplicación con acceso al contexto
function AppContent() {
  const { bgTheme } = useContext(HabitsContext);

  return (
    <View style={[styles.container, { backgroundColor: bgTheme.background }]}>
      <StatusBar style={bgTheme.isDark ? "light" : "dark"} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: bgTheme.background }
          }}
        >
          {/* Las pestañas principales de la app */}
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          
          {/* Pantalla para agregar/editar hábito (se muestra como modal) */}
          <Stack.Screen 
            name="Crear Hábito" 
            component={AddHabitScreen} 
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

// Navegación Principal (Wrapper del Provider)
export default function App() {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <HabitsProvider>
      <AppContent />
    </HabitsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
