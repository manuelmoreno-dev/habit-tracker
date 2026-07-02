import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateGlobalStreak } from '../utils/dateHelpers';
import { themePresets, bgPresets } from '../theme/colors';
import { scheduleHabitNotifications, cancelHabitNotifications } from '../utils/notificationHelpers';

export const HabitsContext = createContext();

const ASYNC_STORAGE_KEY = '@habit_tracker_habits_v1';
const THEME_STORAGE_KEY = '@habit_tracker_theme_name_v1';
const BG_THEME_STORAGE_KEY = '@habit_tracker_bg_theme_name_v1';
const CUSTOM_CATEGORIES_KEY = '@habit_tracker_custom_categories_v1';

// Definición de logros del sistema
const ACHIEVEMENTS = [
  {
    id: 'ach-1',
    title: 'Primer Paso',
    description: 'Completa tu primer hábito positivo o cuantitativo.',
    icon: 'Award',
    check: (habits) => {
      return habits.some(h => {
        if (h.type === 'quantitative') {
          return Object.values(h.progress || {}).some(val => val >= h.targetValue);
        }
        if (h.type === 'positive' || !h.type) {
          return Object.values(h.history || {}).some(val => val === true);
        }
        return false;
      });
    }
  },
  {
    id: 'ach-2',
    title: 'Constancia Inicial',
    description: 'Alcanza una racha global activa de 3 días.',
    icon: 'Zap',
    check: (habits, globalStreak) => globalStreak.max >= 3
  },
  {
    id: 'ach-3',
    title: 'Semana Inquebrantable',
    description: 'Alcanza una racha global activa de 7 días.',
    icon: 'Shield',
    check: (habits, globalStreak) => globalStreak.max >= 7
  },
  {
    id: 'ach-4',
    title: 'Resistencia Pura',
    description: 'Crea tu primer hábito de evitar (hábito negativo).',
    icon: 'EyeOff',
    check: (habits) => {
      return habits.some(h => h.type === 'negative');
    }
  },
  {
    id: 'ach-5',
    title: 'Hábito de Medición',
    description: 'Completa la meta de un hábito cuantitativo por primera vez.',
    icon: 'BarChart2',
    check: (habits) => {
      return habits.some(h => h.type === 'quantitative' && Object.values(h.progress || {}).some(val => val >= h.targetValue));
    }
  },
  {
    id: 'ach-6',
    title: 'Personalizador',
    description: 'Crea tu primera categoría de hábitos personalizada.',
    icon: 'Sliders',
    check: (habits, globalStreak, customCategories) => customCategories.length > 0
  }
];

export const HabitsProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [themeName, setThemeName] = useState('Violeta'); // Violeta por defecto
  const [bgThemeName, setBgThemeName] = useState('Azul Oscuro'); // Azul Oscuro por defecto
  const [loading, setLoading] = useState(true);

  // Cargar datos de AsyncStorage al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar hábitos
        const storedHabits = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        } else {
          // Hábitos de ejemplo
          const initialHabits = [
            {
              id: 'demo-1',
              name: 'Beber agua',
              description: 'Tomar agua para mantenerme hidratado',
              category: 'Salud',
              frequency: 'daily',
              specificDays: [],
              reminderTime: '08:00',
              type: 'quantitative',
              targetValue: 2000,
              unit: 'ml',
              notificationIds: [],
              createdAt: '2026-06-25',
              history: {},
              progress: {
                '2026-06-25': 2000,
                '2026-06-26': 1500,
                '2026-06-27': 2000,
                '2026-06-29': 2000,
                '2026-06-30': 1000,
                '2026-07-01': 2000,
              }
            },
            {
              id: 'demo-2',
              name: 'Evitar fumar',
              description: 'Resistir el deseo de fumar durante el día',
              category: 'Otros',
              frequency: 'daily',
              specificDays: [],
              reminderTime: '09:00',
              type: 'negative',
              targetValue: 0,
              unit: '',
              notificationIds: [],
              createdAt: '2026-06-28',
              history: {
                '2026-06-30': true, // Roto este día
              },
              progress: {}
            },
            {
              id: 'demo-3',
              name: 'Gimnasio',
              description: 'Rutina de fuerza de piernas y pecho',
              category: 'Ejercicio',
              frequency: 'specific_days',
              specificDays: [1, 3, 5], // Lun, Mie, Vie
              reminderTime: '18:00',
              type: 'positive',
              targetValue: 0,
              unit: '',
              notificationIds: [],
              createdAt: '2026-06-28',
              history: {
                '2026-06-29': true, // Lunes
                '2026-07-01': true, // Miércoles
              },
              progress: {}
            }
          ];
          setHabits(initialHabits);
          await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(initialHabits));
        }

        // Cargar categorías personalizadas
        const storedCustomCategories = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
        if (storedCustomCategories) {
          setCustomCategories(JSON.parse(storedCustomCategories));
        }

        // Cargar tema de color (acento)
        const storedThemeName = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedThemeName && themePresets[storedThemeName]) {
          setThemeName(storedThemeName);
        }

        // Cargar tema de fondo
        const storedBgThemeName = await AsyncStorage.getItem(BG_THEME_STORAGE_KEY);
        if (storedBgThemeName && bgPresets[storedBgThemeName]) {
          setBgThemeName(storedBgThemeName);
        } else if (storedBgThemeName === 'Noche') {
          setBgThemeName('Azul Oscuro');
        }
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Guardar hábitos
  const saveHabitsToStorage = async (updatedHabits) => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(updatedHabits));
    } catch (error) {
      console.error('Error guardando hábitos:', error);
    }
  };

  // Cambiar tema de color (acento)
  const changeTheme = async (name) => {
    if (themePresets[name]) {
      setThemeName(name);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
      } catch (error) {
        console.error('Error guardando tema:', error);
      }
    }
  };

  // Cambiar tema de fondo
  const changeBgTheme = async (name) => {
    if (bgPresets[name]) {
      setBgThemeName(name);
      try {
        await AsyncStorage.setItem(BG_THEME_STORAGE_KEY, name);
      } catch (error) {
        console.error('Error guardando tema de fondo:', error);
      }
    }
  };

  // Agregar categoría personalizada
  const addCustomCategory = async (category) => {
    const updated = [...customCategories, category];
    setCustomCategories(updated);
    try {
      await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error guardando categoría personalizada:', error);
    }
  };

  // Eliminar categoría personalizada
  const deleteCustomCategory = async (catName) => {
    const updated = customCategories.filter(cat => cat.name !== catName);
    setCustomCategories(updated);
    try {
      await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error eliminando categoría personalizada:', error);
    }
  };

  // Agregar hábito
  const addHabit = async (habitData) => {
    const newHabit = {
      id: Date.now().toString(),
      name: habitData.name,
      description: habitData.description || '',
      category: habitData.category || 'Otros',
      frequency: habitData.frequency || 'daily',
      specificDays: habitData.specificDays || [],
      reminderTime: habitData.reminderTime || '',
      type: habitData.type || 'positive',
      targetValue: habitData.targetValue || 0,
      unit: habitData.unit || '',
      createdAt: new Date().toISOString().split('T')[0],
      history: {},
      progress: {},
      notificationIds: []
    };

    if (newHabit.reminderTime) {
      const ids = await scheduleHabitNotifications(newHabit);
      newHabit.notificationIds = ids;
    }

    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    await saveHabitsToStorage(updatedHabits);
  };

  // Marcar/desmarcar o toggle
  const toggleHabit = async (habitId, dateStr) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const history = { ...habit.history };
        if (habit.type === 'negative') {
          history[dateStr] = !history[dateStr];
        } else if (habit.type === 'quantitative') {
          const progress = { ...habit.progress };
          const isCompleted = (progress[dateStr] || 0) >= habit.targetValue;
          progress[dateStr] = isCompleted ? 0 : habit.targetValue;
          return { ...habit, progress };
        } else {
          history[dateStr] = !history[dateStr];
        }
        return { ...habit, history };
      }
      return habit;
    });

    setHabits(updatedHabits);
    await saveHabitsToStorage(updatedHabits);
  };

  // Actualizar progreso cuantitativo diario
  const updateQuantitativeProgress = async (habitId, dateStr, value) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const progress = { ...habit.progress };
        progress[dateStr] = Math.max(0, value);
        return { ...habit, progress };
      }
      return habit;
    });

    setHabits(updatedHabits);
    await saveHabitsToStorage(updatedHabits);
  };

  // Editar hábito
  const editHabit = async (habitId, updatedFields) => {
    const updatedHabits = await Promise.all(habits.map(async (habit) => {
      if (habit.id === habitId) {
        if (habit.notificationIds && habit.notificationIds.length > 0) {
          await cancelHabitNotifications(habit.notificationIds);
        }

        const updatedHabit = {
          ...habit,
          ...updatedFields,
          notificationIds: []
        };

        if (updatedHabit.reminderTime) {
          const ids = await scheduleHabitNotifications(updatedHabit);
          updatedHabit.notificationIds = ids;
        }

        return updatedHabit;
      }
      return habit;
    }));

    setHabits(updatedHabits);
    await saveHabitsToStorage(updatedHabits);
  };

  // Eliminar hábito
  const deleteHabit = async (habitId) => {
    const habitToDelete = habits.find(h => h.id === habitId);
    
    if (habitToDelete && habitToDelete.notificationIds && habitToDelete.notificationIds.length > 0) {
      await cancelHabitNotifications(habitToDelete.notificationIds);
    }

    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    setHabits(updatedHabits);
    await saveHabitsToStorage(updatedHabits);
  };

  // Calcular la racha global activa
  const globalStreak = calculateGlobalStreak(habits);

  // Obtener el listado dinámico de logros evaluados
  const checkAchievements = () => {
    return ACHIEVEMENTS.map(ach => {
      const unlocked = ach.check(habits, globalStreak, customCategories);
      return {
        ...ach,
        unlocked
      };
    });
  };

  // Obtener el color del tema de acento
  const theme = themePresets[themeName] || themePresets.Violeta;

  // Obtener el tema de fondo dinámico
  const bgTheme = bgPresets[bgThemeName] || bgPresets['Azul Oscuro'];

  return (
    <HabitsContext.Provider value={{
      habits,
      customCategories,
      loading,
      addHabit,
      toggleHabit,
      editHabit,
      deleteHabit,
      addCustomCategory,
      deleteCustomCategory,
      updateQuantitativeProgress,
      globalStreak,
      themeName,
      theme,
      changeTheme,
      bgThemeName,
      bgTheme,
      changeBgTheme,
      checkAchievements
    }}>
      {children}
    </HabitsContext.Provider>
  );
};
