import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Zap, Shield, EyeOff, BarChart2, Sliders, Lock } from 'lucide-react-native';
import { HabitsContext } from '../context/HabitsContext';
import { colors } from '../theme/colors';
import StreakBadge from '../components/StreakBadge';
import MonthlyCalendar from '../components/MonthlyCalendar';
import { calculateHabitStreak, isHabitCompletedOnDate, getTodayDateString, formatDateString } from '../utils/dateHelpers';

export default function StatsScreen() {
  const { habits, globalStreak, theme, checkAchievements, bgTheme } = useContext(HabitsContext);

  const todayStr = getTodayDateString();

  // Calcular estadísticas generales históricas por categoría
  const getGeneralStats = () => {
    let totalCompletions = 0;
    const categoryStats = {
      Salud: 0,
      Mente: 0,
      Ejercicio: 0,
      Trabajo: 0,
      Otros: 0,
    };

    habits.forEach(habit => {
      const startDate = new Date(habit.createdAt + 'T00:00:00');
      const endDate = new Date(todayStr + 'T00:00:00');
      
      let checkDate = new Date(startDate);
      while (checkDate <= endDate) {
        const dateStr = formatDateString(checkDate);
        if (isHabitCompletedOnDate(habit, dateStr)) {
          totalCompletions++;
          if (categoryStats[habit.category] !== undefined) {
            categoryStats[habit.category]++;
          } else {
            categoryStats.Otros++;
          }
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }
    });

    return {
      totalCompletions,
      categoryStats
    };
  };

  // Calcular tendencia de completado por día de la semana (Lunes a Domingo)
  const getWeeklyTrend = () => {
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weekdayCounts = { 
      0: { comp: 0, tot: 0 }, 
      1: { comp: 0, tot: 0 }, 
      2: { comp: 0, tot: 0 }, 
      3: { comp: 0, tot: 0 }, 
      4: { comp: 0, tot: 0 }, 
      5: { comp: 0, tot: 0 }, 
      6: { comp: 0, tot: 0 } 
    };
    
    habits.forEach(habit => {
      const startDate = new Date(habit.createdAt + 'T00:00:00');
      const endDate = new Date(todayStr + 'T00:00:00');
      
      let checkDate = new Date(startDate);
      while (checkDate <= endDate) {
        const dateStr = formatDateString(checkDate);
        const dayOfWeek = checkDate.getDay();
        
        let isScheduled = false;
        if (habit.frequency === 'daily') {
          isScheduled = true;
        } else if (habit.frequency === 'specific_days') {
          isScheduled = habit.specificDays && habit.specificDays.includes(dayOfWeek);
        }
        
        if (isScheduled) {
          weekdayCounts[dayOfWeek].tot++;
          if (isHabitCompletedOnDate(habit, dateStr)) {
            weekdayCounts[dayOfWeek].comp++;
          }
        }
        
        checkDate.setDate(checkDate.getDate() + 1);
      }
    });

    const orderedDays = [1, 2, 3, 4, 5, 6, 0]; // Lun a Dom
    return orderedDays.map(dayNum => {
      const { comp, tot } = weekdayCounts[dayNum];
      const percentage = tot > 0 ? Math.round((comp / tot) * 100) : 0;
      return {
        dayLabel: weekdays[dayNum],
        percentage,
        completed: comp,
        total: tot
      };
    });
  };

  // Mapear iconos para el tablero de logros
  const getAchievementIcon = (iconName, unlocked, color) => {
    const size = 24;
    if (!unlocked) return <Lock size={size} color={colors.textMuted} />;
    
    switch (iconName) {
      case 'Award':
        return <Award size={size} color={color} />;
      case 'Zap':
        return <Zap size={size} color={color} />;
      case 'Shield':
        return <Shield size={size} color={color} />;
      case 'EyeOff':
        return <EyeOff size={size} color={color} />;
      case 'BarChart2':
        return <BarChart2 size={size} color={color} />;
      case 'Sliders':
        return <Sliders size={size} color={color} />;
      default:
        return <Award size={size} color={color} />;
    }
  };

  const stats = getGeneralStats();
  const weeklyTrend = getWeeklyTrend();
  const achievements = checkAchievements();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgTheme.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={[styles.subtitleText, { color: bgTheme.textSecondary }]}>Analítica</Text>
        <Text style={[styles.titleText, { color: bgTheme.textPrimary }]}>Progreso y Estadísticas</Text>

        {/* Sección de Rachas */}
        <View style={styles.streaksRow}>
          <StreakBadge 
            streak={globalStreak.current} 
            label="Racha Actual" 
          />
          <StreakBadge 
            streak={globalStreak.max} 
            label="Mejor Racha" 
            isMax={true} 
          />
        </View>

        {/* Sección del Calendario Mensual/Anual */}
        <Text style={[styles.sectionTitle, { color: bgTheme.textPrimary }]}>Historial de Hábitos</Text>
        <MonthlyCalendar habits={habits} />

        {/* Sección del Gráfico de Tendencias Semanales (Opción 5) */}
        <Text style={[styles.sectionTitle, { color: bgTheme.textPrimary }]}>Cumplimiento por Día de la Semana</Text>
        <View style={[styles.trendCard, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
          <View style={styles.chartContainer}>
            {weeklyTrend.map((dayData, index) => {
              const barHeight = `${Math.max(4, dayData.percentage)}%`;
              let barColor = theme.primary;
              
              if (dayData.percentage >= 80) barColor = colors.success;
              else if (dayData.percentage === 0) barColor = colors.border;
              else if (dayData.percentage < 40) barColor = colors.danger + 'AA';

              return (
                <View key={index} style={styles.chartColumn}>
                  <Text style={[styles.chartValueText, { color: bgTheme.textSecondary }]}>{dayData.percentage}%</Text>
                  <View style={[styles.barTrack, { backgroundColor: bgTheme.cardBgSecondary }]}>
                    <View style={[styles.barFill, { height: barHeight, backgroundColor: barColor }]} />
                  </View>
                  <Text style={[styles.chartLabelText, { color: bgTheme.textSecondary }]}>{dayData.dayLabel}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.chartDescription, { color: bgTheme.textSecondary }]}>
            Muestra el porcentaje histórico de éxito de tus hábitos programados según el día de la semana.
          </Text>
        </View>

        {/* Tablero de Logros y Recompensas (Opción 1) */}
        <Text style={[styles.sectionTitle, { color: bgTheme.textPrimary }]}>Logros y Medallas</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((ach) => (
            <View 
              key={ach.id} 
              style={[
                styles.achievementCard, 
                ach.unlocked 
                  ? { borderColor: theme.primary, backgroundColor: theme.primary + '05' } 
                  : [styles.lockedCard, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]
              ]}
            >
              <View style={[
                styles.achIconContainer, 
                ach.unlocked ? { backgroundColor: theme.primary + '15' } : { backgroundColor: bgTheme.cardBgSecondary }
              ]}>
                {getAchievementIcon(ach.icon, ach.unlocked, theme.primaryLight)}
              </View>
              <View style={styles.achInfo}>
                <Text style={[styles.achTitle, { color: bgTheme.textPrimary }, !ach.unlocked && { color: bgTheme.textMuted }]}>
                  {ach.title}
                </Text>
                <Text style={[styles.achDescription, { color: bgTheme.textSecondary }]}>{ach.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Desglose por Categorías */}
        <Text style={[styles.sectionTitle, { color: bgTheme.textPrimary }]}>Completados por Categoría</Text>
        <View style={[styles.categoryCard, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
          {Object.keys(stats.categoryStats).map(cat => {
            const count = stats.categoryStats[cat];
            const catColors = colors.categories[cat] || colors.categories.Otros;
            const habitsInCat = habits.filter(h => h.category === cat).length;

            return (
              <View key={cat} style={[styles.categoryRow, { borderBottomColor: bgTheme.border }]}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.colorDot, { backgroundColor: catColors.color }]} />
                  <Text style={[styles.categoryName, { color: bgTheme.textPrimary }]}>{cat}</Text>
                  <Text style={[styles.categoryHabitCount, { color: bgTheme.textSecondary }]}>({habitsInCat} {habitsInCat === 1 ? 'hábito' : 'hábitos'})</Text>
                </View>
                <View style={styles.categoryValueContainer}>
                  <Text style={[styles.categoryValue, { color: catColors.color }]}>
                    {count}
                  </Text>
                  <Text style={[styles.categoryCompletedText, { color: bgTheme.textSecondary }]}> veces</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Sección de Estadísticas por Hábito (Individuales) */}
        <Text style={[styles.sectionTitle, { color: bgTheme.textPrimary }]}>Estadísticas por Hábito</Text>
        <View style={[styles.habitsListCard, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
          {habits.length === 0 ? (
            <Text style={[styles.noHabitsText, { color: bgTheme.textSecondary }]}>Crea hábitos para ver su analítica individual.</Text>
          ) : (
            habits.map((habit, index) => {
              const { current: currentStreak, max: maxStreak } = calculateHabitStreak(habit);
              
              // Calcular total completado de forma precisa
              let totalCompletions = 0;
              const startDate = new Date(habit.createdAt + 'T00:00:00');
              const endDate = new Date(todayStr + 'T00:00:00');
              let checkDate = new Date(startDate);
              while (checkDate <= endDate) {
                const dateStr = formatDateString(checkDate);
                if (isHabitCompletedOnDate(habit, dateStr)) {
                  totalCompletions++;
                }
                checkDate.setDate(checkDate.getDate() + 1);
              }

              const catColors = colors.categories[habit.category] || colors.categories.Otros;
              const isLast = index === habits.length - 1;

              return (
                <View key={habit.id} style={[styles.habitStatRow, { borderBottomColor: bgTheme.border }, isLast && { borderBottomWidth: 0 }]}>
                               <View style={styles.habitStatHeader}>
                    <View style={[styles.colorDot, { backgroundColor: catColors.color }]} />
                    <Text style={[styles.habitStatName, { color: bgTheme.textPrimary }]}>{habit.name}</Text>
                    <Text style={[styles.habitStatCategory, { color: bgTheme.textSecondary }]}>({habit.category})</Text>
                  </View>
                  
                  {/* Detalles de racha y total */}
                  <View style={[styles.habitStatMetrics, { backgroundColor: bgTheme.cardBgSecondary }]}>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: bgTheme.textSecondary }]}>Completado</Text>
                      <Text style={[styles.metricValue, { color: bgTheme.textPrimary }]}>
                        {totalCompletions} {totalCompletions === 1 ? 'vez' : 'veces'}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: bgTheme.textSecondary }]}>Racha Act.</Text>
                      <Text style={[styles.metricValue, { color: colors.warning }]}>
                        🔥 {currentStreak} d
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: bgTheme.textSecondary }]}>Racha Max.</Text>
                      <Text style={[styles.metricValue, { color: '#FBBF24' }]}>
                        🏆 {maxStreak} d
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
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
    marginBottom: 20,
  },
  streaksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -6,
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 24,
  },
  categoryCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 6,
  },
  categoryHabitCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  categoryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryCompletedText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  habitsListCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noHabitsText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  habitStatRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
  },
  habitStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  habitStatName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 6,
  },
  habitStatCategory: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  habitStatMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBgSecondary,
    padding: 12,
    borderRadius: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // Estilos del Gráfico de Tendencias
  trendCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
    marginBottom: 14,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartValueText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  barTrack: {
    height: 110,
    width: 14,
    backgroundColor: colors.cardBgSecondary,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  chartLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
  chartDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Estilos de los Logros
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'column',
  },
  lockedCard: {
    opacity: 0.5,
  },
  achIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  achInfo: {
    alignItems: 'center',
  },
  achTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  achDescription: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
});
