import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Quote, RotateCw, Sparkles } from 'lucide-react-native';
import { HabitsContext } from '../context/HabitsContext';
import { colors } from '../theme/colors';
import { getTodayDateString, getMonthNameStr, isHabitCompletedOnDate, getWeekDays } from '../utils/dateHelpers';
import CalendarStrip from '../components/CalendarStrip';
import ProgressBar from '../components/ProgressBar';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';

const MOTIVATIONAL_QUOTES = [
  { text: "No somos lo que hacemos una vez, sino lo que hacemos repetidamente. La excelencia es un hábito.", author: "Aristóteles" },
  { text: "Los hábitos son el interés compuesto de la superación personal.", author: "James Clear" },
  { text: "El secreto de tu futuro está escondido en tu rutina diaria.", author: "Mike Murdock" },
  { text: "La motivación te pone en marcha; el hábito te mantiene avanzando.", author: "Jim Ryun" },
  { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier" },
  { text: "La disciplina es el puente entre metas y logros.", author: "Jim Rohn" },
  { text: "Tus hábitos definirán tu futuro. Elige construir con sabiduría hoy.", author: "Anónimo" },
  { text: "Es más fácil prevenir los malos hábitos que romperlos.", author: "Benjamin Franklin" },
  { text: "Comienza donde estás. Usa lo que tienes. Haz lo que puedas.", author: "Arthur Ashe" },
  { text: "El éxito no se logra sólo con cualidades especiales. Es sobre todo un trabajo de constancia.", author: "Victor Hugo" },
  { text: "La perseverancia no es una carrera larga, son muchas carreras cortas una tras otra.", author: "Walter Elliot" },
  { text: "No tienes que ser grande para empezar, pero tienes que empezar para ser grande.", author: "Zig Ziglar" },
  { text: "La fuerza no proviene de la capacidad física, sino de una voluntad indomable.", author: "Mahatma Gandhi" },
  { text: "La mejor manera de predecir el futuro es crearlo.", author: "Peter Drucker" },
  { text: "Haz de cada día tu obra maestra.", author: "John Wooden" },
  { text: "La disciplina es la mejor aliada para realizar los anhelos más profundos de tu corazón.", author: "Anónimo" },
  { text: "Haz hoy lo que otros no quieren hacer, y mañana podrás lograr lo que otros no pueden.", author: "Jerry Rice" },
  { text: "La excelencia no es un acto de un día, sino un estilo de vida constante.", author: "Anónimo" },
];

export default function HomeScreen({ navigation }) {
  const { habits, toggleHabit, theme, bgTheme } = useContext(HabitsContext);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const todayStr = getTodayDateString();

  // Estado para la frase motivacional (soporta recarga manual)
  const [quoteIndex, setQuoteIndex] = useState(new Date().getDate() % MOTIVATIONAL_QUOTES.length);
  const todayQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  // Estado para filtros interactivos del dashboard
  const [activeFilter, setActiveFilter] = useState('all');

  const handleReloadQuote = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    } while (nextIndex === quoteIndex && MOTIVATIONAL_QUOTES.length > 1);
    setQuoteIndex(nextIndex);
  };

  // Formatear cabecera del día
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = getMonthNameStr(date.getMonth());
    
    return `${dayName}, ${dayNum} de ${monthName}`;
  };

  // Filtrar hábitos activos para el día seleccionado
  const getActiveHabitsForDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    return habits.filter(habit => {
      // Si el hábito se creó después de la fecha seleccionada, no lo mostramos
      if (habit.createdAt > dateStr) return false;
      
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'specific_days') {
        return habit.specificDays.includes(dayOfWeek);
      }
      return false;
    });
  };

  const activeHabits = getActiveHabitsForDate(selectedDate);
  const completedHabits = activeHabits.filter(h => isHabitCompletedOnDate(h, selectedDate));
  
  // Calcular progreso (0 a 1)
  const progress = activeHabits.length > 0 ? completedHabits.length / activeHabits.length : 0;

  // Filtrar hábitos según la píldora seleccionada
  const filteredHabits = activeHabits.filter(habit => {
    if (activeFilter === 'all') return true;
    return habit.type === activeFilter;
  });

  // Calcular el progreso de cada día de la semana actual para la tira semanal
  const getDayProgressMap = () => {
    const weekDays = getWeekDays(selectedDate);
    const progressMap = {};
    
    weekDays.forEach(day => {
      const habitsForDay = getActiveHabitsForDate(day.dateString);
      const total = habitsForDay.length;
      if (total === 0) {
        progressMap[day.dateString] = 0;
      } else {
        // Si algún hábito negativo fue roto ese día, el día es un fracaso completo
        const anyNegativeBroken = habitsForDay.some(
          h => h.type === 'negative' && h.history?.[day.dateString] === true
        );
        if (anyNegativeBroken) {
          progressMap[day.dateString] = 0;
        } else {
          const completed = habitsForDay.filter(h => isHabitCompletedOnDate(h, day.dateString)).length;
          progressMap[day.dateString] = completed / total;
        }
      }
    });
    
    return progressMap;
  };

  const dayProgressMap = getDayProgressMap();

  const FILTER_OPTIONS = [
    { value: 'all', label: 'Todos', icon: '✨' },
    { value: 'positive', label: 'Desarrollar', icon: '➕' },
    { value: 'negative', label: 'Evitar', icon: '🛡️' },
    { value: 'quantitative', label: 'Medir', icon: '🔢' }
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgTheme.background }]}>
      <View style={[styles.container, { backgroundColor: bgTheme.background }]}>
        {/* Cabecera Principal */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateText, { color: bgTheme.textSecondary }]}>{formatDateHeader(selectedDate)}</Text>
            <Text style={[styles.titleText, { color: bgTheme.textPrimary }]}>Hoy</Text>
          </View>
        </View>

        {/* Tarjeta de Frase Motivacional (Glassmorphic con recarga) */}
        <View style={[
          styles.quoteCard, 
          { 
            backgroundColor: bgTheme.isDark ? (theme.primary + '12') : (theme.primary + '0B'), 
            borderColor: theme.primary + '20', 
            borderWidth: 1.5 
          }
        ]}>
          <Quote size={18} color={theme.primaryLight} style={styles.quoteIcon} />
          <View style={styles.quoteTextContainer}>
            <Text style={[styles.quoteText, { color: bgTheme.textPrimary }]}>“{todayQuote.text}”</Text>
            <Text style={[styles.quoteAuthor, { color: bgTheme.textSecondary }]}>— {todayQuote.author}</Text>
          </View>
          <TouchableOpacity onPress={handleReloadQuote} style={styles.quoteReloadButton} activeOpacity={0.6}>
            <RotateCw size={14} color={bgTheme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Tira de Calendario Semanal */}
        <CalendarStrip 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
          dayProgressMap={dayProgressMap}
        />

        {/* Progreso del día */}
        {activeHabits.length > 0 && (
          <View style={[styles.progressContainer, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
            <ProgressBar 
              progress={progress} 
              label="Completado de hoy" 
            />
          </View>
        )}

        {/* Banner de Celebración 100% */}
        {progress === 1 && activeHabits.length > 0 && (
          <View style={[styles.celebrationCard, { borderColor: colors.success, backgroundColor: colors.success + '10' }]}>
            <Sparkles size={20} color={colors.success} style={styles.celebrationIcon} />
            <View style={styles.celebrationTextContainer}>
              <Text style={[styles.celebrationTitle, { color: colors.success }]}>¡Rutina Completada! ✨</Text>
              <Text style={[styles.celebrationText, { color: bgTheme.textPrimary }]}>
                Has alcanzado el 100% de tus hábitos programados hoy. ¡Gran disciplina!
              </Text>
            </View>
          </View>
        )}

        {/* Barra de Filtros Interactivos */}
        {activeHabits.length > 0 && (
          <View style={styles.filtersWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              {FILTER_OPTIONS.map(opt => {
                const isSelected = activeFilter === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.filterPill,
                      { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border },
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setActiveFilter(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.filterPillText, 
                      { color: bgTheme.textSecondary },
                      isSelected && { color: '#FFFFFF', fontWeight: '700' }
                    ]}>
                      {opt.icon}  {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Lista de hábitos */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeHabits.length === 0 ? (
            <EmptyState
              message={
                habits.length === 0 
                  ? 'Comienza creando tu primer hábito para empezar tu camino.' 
                  : 'No tienes hábitos programados para este día de la semana.'
              }
              onAction={() => navigation.navigate('Crear Hábito')}
              actionLabel="Crear Hábito"
            />
          ) : (
            filteredHabits.length === 0 ? (
              <EmptyState
                message="No hay hábitos que coincidan con este filtro hoy."
              />
            ) : (
              filteredHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  dateStr={selectedDate}
                  onToggle={() => toggleHabit(habit.id, selectedDate)}
                />
              ))
            )
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
    paddingTop: 24, // Bajar la fecha y cabecera para que no quede tan pegada arriba
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  quoteIcon: {
    marginRight: 10,
    marginTop: 1,
    opacity: 0.8,
  },
  quoteTextContainer: {
    flex: 1,
  },
  quoteText: {
    fontSize: 12.5,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'right',
  },
  progressContainer: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 170, // Espacio extra para que no se oculte con el FAB o Tab Bar
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
  quoteReloadButton: {
    padding: 6,
    borderRadius: 8,
    marginLeft: 6,
    alignSelf: 'center',
  },
  filtersWrapper: {
    marginBottom: 8,
  },
  filtersContainer: {
    marginVertical: 4,
    maxHeight: 44,
  },
  filtersContent: {
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  celebrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  celebrationIcon: {
    marginRight: 12,
  },
  celebrationTextContainer: {
    flex: 1,
  },
  celebrationTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  celebrationText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
});
