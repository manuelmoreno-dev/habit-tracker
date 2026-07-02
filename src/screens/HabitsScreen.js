import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Check } from 'lucide-react-native';
import { HabitsContext } from '../context/HabitsContext';
import { colors, themePresets, bgPresets } from '../theme/colors';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';
import { getTodayDateString } from '../utils/dateHelpers';

export default function HabitsScreen({ navigation }) {
  const { habits, deleteHabit, themeName, theme, changeTheme, bgThemeName, bgTheme, changeBgTheme } = useContext(HabitsContext);
  const today = getTodayDateString();

  const handleDeletePress = (habitId) => {
    Alert.alert(
      'Eliminar Hábito',
      '¿Estás seguro de que deseas eliminar este hábito permanentemente? Se perderá todo tu historial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => deleteHabit(habitId) 
        }
      ]
    );
  };

  const handleEditPress = (habit) => {
    // Navegar a la pantalla de agregar, pero pasando el hábito para edición
    navigation.navigate('Crear Hábito', { editHabit: habit });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgTheme.background }]}>
      <View style={[styles.container, { backgroundColor: bgTheme.background }]}>
        {/* Cabecera */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.subtitleText, { color: bgTheme.textSecondary }]}>Configuración</Text>
            <Text style={[styles.titleText, { color: bgTheme.textPrimary }]}>Mis Hábitos</Text>
          </View>
        </View>

        {/* Lista de todos los hábitos */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Selector de Tema de Color */}
          <View style={[styles.themeSelectorCard, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
            <Text style={[styles.themeLabel, { color: bgTheme.textPrimary }]}>Color de Acento del Tema</Text>
            <View style={styles.themeColorsRow}>
              {Object.keys(themePresets).map(name => {
                const preset = themePresets[name];
                const isSelected = themeName === name;
                return (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.themeCircle,
                      { backgroundColor: preset.primary },
                      isSelected && styles.selectedThemeCircle
                    ]}
                    onPress={() => changeTheme(name)}
                    activeOpacity={0.7}
                  >
                    {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3.5} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selector de Color de Fondo (Personalizable) */}
          <View style={[styles.themeSelectorCard, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
            <Text style={[styles.themeLabel, { color: bgTheme.textPrimary }]}>Color de Fondo</Text>
            <View style={styles.themeColorsRow}>
              {Object.keys(bgPresets).map(name => {
                const preset = bgPresets[name];
                const isSelected = bgThemeName === name;
                return (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.themeCircle,
                      { backgroundColor: preset.background, borderColor: isSelected ? theme.primaryLight : bgTheme.border, borderWidth: isSelected ? 2.5 : 1.5 },
                    ]}
                    onPress={() => changeBgTheme(name)}
                    activeOpacity={0.7}
                  >
                    {isSelected && <Check size={16} color={theme.primaryLight} strokeWidth={3.5} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {habits.length === 0 ? (
            <EmptyState
              message="No tienes ningún hábito configurado. Agrega uno nuevo para comenzar a organizarte."
              onAction={() => navigation.navigate('Crear Hábito')}
              actionLabel="Agregar Hábito"
            />
          ) : (
            habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                dateStr={today}
                showActions={true}
                onEdit={handleEditPress}
                onDelete={handleDeletePress}
              />
            ))
          )}
        </ScrollView>

        {/* Botón Flotante para Añadir Hábito (FAB) */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
          onPress={() => navigation.navigate('Crear Hábito')}
          activeOpacity={0.85}
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24, // Bajar la cabecera para alinear con HomeScreen
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  themeSelectorCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  themeColorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  themeCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThemeCircle: {
    borderColor: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 95, // Justo arriba de la tab bar flotante
    right: 6,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  scrollContent: {
    paddingBottom: 170, // Espacio extra para evitar solapamiento
  },
});
