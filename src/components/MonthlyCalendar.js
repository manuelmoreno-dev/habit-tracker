import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getMonthDays, getMonthNameStr, getTodayDateString, isHabitCompletedOnDate } from '../utils/dateHelpers';
import { colors } from '../theme/colors';
import { HabitsContext } from '../context/HabitsContext';

export default function MonthlyCalendar({ habits }) {
  const { theme, bgTheme } = useContext(HabitsContext);
  const [viewMode, setViewMode] = useState('month'); // 'month' o 'year'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 = Enero, 11 = Diciembre

  const monthDays = getMonthDays(year, month);
  const weekDaysShort = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Cambiar al mes anterior
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayDetails(null);
  };

  // Cambiar al siguiente mes
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayDetails(null);
  };

  // Obtener estadísticas de completado para un día específico
  const getDayStats = (dateStr) => {
    let completedCount = 0;
    const completedHabitsList = [];
    
    habits.forEach(habit => {
      if (isHabitCompletedOnDate(habit, dateStr)) {
        completedCount++;
        completedHabitsList.push(habit.name);
      }
    });

    return {
      completedCount,
      completedHabitsList,
    };
  };

  // Color de celda según hábitos completados (vista mensual y anual)
  const getCellBgColor = (completedCount) => {
    if (completedCount === 0) return bgTheme.cardBg;
    if (completedCount === 1) return colors.success + '40'; // Verde opacidad baja
    if (completedCount === 2) return colors.success + '80'; // Verde opacidad media
    return colors.success; // Verde esmeralda brillante
  };

  const getCellTextColor = (completedCount, isCurrentMonth) => {
    if (!isCurrentMonth) return bgTheme.textMuted;
    if (completedCount >= 3) return '#FFFFFF';
    return bgTheme.textPrimary;
  };

  const handleSelectDay = (day) => {
    const stats = getDayStats(day.dateString);
    setSelectedDayDetails({
      dateStr: day.dateString,
      dayNumber: day.dayNumber,
      completedCount: stats.completedCount,
      completedHabitsList: stats.completedHabitsList,
      isCurrentMonth: day.isCurrentMonth
    });
  };

  // Renderizar la cuadrícula de un mes pequeño para la vista anual (verá todo el mes chiquito con números y días externos)
  const renderMiniMonthGrid = (targetMonthIndex) => {
    const miniDays = getMonthDays(selectedYear, targetMonthIndex);
    const weekDaysMini = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    
    return (
      <View style={styles.miniMonthContainer}>
        {/* Cabecera de días de la semana chiquitos */}
        <View style={styles.miniWeekDaysRow}>
          {weekDaysMini.map((day, idx) => (
            <Text key={idx} style={[styles.miniWeekDayLabel, { color: bgTheme.textMuted }]}>{day}</Text>
          ))}
        </View>
        
        {/* Celdas de días */}
        <View style={styles.miniGrid}>
          {miniDays.map((day, idx) => {
            const stats = getDayStats(day.dateString);
            const cellColor = getCellBgColor(stats.completedCount);
            const textColor = getCellTextColor(stats.completedCount, day.isCurrentMonth);

            return (
              <View
                key={idx}
                style={[
                  styles.miniCell,
                  { backgroundColor: cellColor, borderColor: bgTheme.border },
                  !day.isCurrentMonth && styles.miniOutMonthCell
                ]}
              >
                <Text style={[styles.miniCellText, { color: textColor }]}>
                  {day.dayNumber}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
      {/* Selector de Vista (Pestañas Mes / Año) */}
      <View style={[styles.viewToggleContainer, { backgroundColor: bgTheme.cardBgSecondary, borderColor: bgTheme.border, borderWidth: 1 }]}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'month' && { backgroundColor: theme.primary }]}
          onPress={() => setViewMode('month')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleButtonText, { color: bgTheme.textSecondary }, viewMode === 'month' && { color: '#FFFFFF', fontWeight: '700' }]}>
            Vista Mensual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'year' && { backgroundColor: theme.primary }]}
          onPress={() => setViewMode('year')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleButtonText, { color: bgTheme.textSecondary }, viewMode === 'year' && { color: '#FFFFFF', fontWeight: '700' }]}>
            Vista Anual
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'month' ? (
        // VISTA MENSUAL (Por defecto)
        <View>
          {/* Cabecera del Mes */}
          <View style={styles.header}>
            <Text style={[styles.monthTitle, { color: bgTheme.textPrimary }]}>
              {getMonthNameStr(month)} <Text style={[styles.yearTitle, { color: bgTheme.textSecondary }]}>{year}</Text>
            </Text>
            <View style={styles.navButtons}>
              <TouchableOpacity onPress={handlePrevMonth} style={[styles.navButton, { backgroundColor: bgTheme.cardBgSecondary }]} activeOpacity={0.6}>
                <ChevronLeft size={20} color={bgTheme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNextMonth} style={[styles.navButton, { backgroundColor: bgTheme.cardBgSecondary }]} activeOpacity={0.6}>
                <ChevronRight size={20} color={bgTheme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cabecera de Días de la Semana */}
          <View style={styles.weekDaysRow}>
            {weekDaysShort.map((day, index) => (
              <Text key={index} style={[styles.weekDayLabel, { color: bgTheme.textMuted }]}>{day}</Text>
            ))}
          </View>

          {/* Cuadrícula del Calendario */}
          <View style={styles.grid}>
            {monthDays.map((day, index) => {
              const stats = getDayStats(day.dateString);
              const cellColor = getCellBgColor(stats.completedCount);
              const isSelected = selectedDayDetails && selectedDayDetails.dateStr === day.dateString;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cell,
                    { backgroundColor: cellColor, borderColor: bgTheme.border },
                    !day.isCurrentMonth && styles.outMonthCell,
                    isSelected && { borderColor: theme.primary, borderWidth: 2 }
                  ]}
                  onPress={() => handleSelectDay(day)}
                  activeOpacity={0.8}
                >
                  <Text 
                    style={[
                      styles.cellText, 
                      { color: getCellTextColor(stats.completedCount, day.isCurrentMonth) }
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Leyenda de Intensidad */}
          <View style={styles.legend}>
            <Text style={[styles.legendText, { color: bgTheme.textSecondary }]}>Menos</Text>
            <View style={[styles.legendBox, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]} />
            <View style={[styles.legendBox, { backgroundColor: colors.success + '40', borderColor: bgTheme.border }]} />
            <View style={[styles.legendBox, { backgroundColor: colors.success + '80', borderColor: bgTheme.border }]} />
            <View style={[styles.legendBox, { backgroundColor: colors.success, borderColor: bgTheme.border }]} />
            <Text style={[styles.legendText, { color: bgTheme.textSecondary }]}>Más completados</Text>
          </View>

          {/* Detalle del Día Seleccionado */}
          {selectedDayDetails && (
            <View style={[styles.detailsContainer, { borderTopColor: bgTheme.border }]}>
              <Text style={[styles.detailsHeader, { color: bgTheme.textPrimary }]}>
                Progreso del {selectedDayDetails.dateStr.split('-')[2]} de {getMonthNameStr(new Date(selectedDayDetails.dateStr + 'T00:00:00').getMonth())}:
              </Text>
              {selectedDayDetails.completedCount === 0 ? (
                <Text style={[styles.noCompletedText, { color: bgTheme.textSecondary }]}>No completaste ningún hábito este día.</Text>
              ) : (
                <View>
                  <Text style={[styles.completedCountText, { color: bgTheme.textSecondary }]}>
                    Completaste {selectedDayDetails.completedCount} {selectedDayDetails.completedCount === 1 ? 'hábito' : 'hábitos'}:
                  </Text>
                  <View style={styles.listContainer}>
                    {selectedDayDetails.completedHabitsList.map((name, i) => (
                      <View key={i} style={styles.detailItem}>
                        <View style={styles.bullet} />
                        <Text style={[styles.detailItemText, { color: bgTheme.textPrimary }]}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      ) : (
        // VISTA ANUAL (12 meses pequeños con números y diseño idéntico a vista mensual)
        <View>
          {/* Cabecera del Año */}
          <View style={styles.header}>
            <Text style={[styles.monthTitle, { color: bgTheme.textPrimary }]}>
              Año <Text style={[styles.yearTitle, { color: bgTheme.textSecondary }]}>{selectedYear}</Text>
            </Text>
            <View style={styles.navButtons}>
              <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)} style={[styles.navButton, { backgroundColor: bgTheme.cardBgSecondary }]} activeOpacity={0.6}>
                <ChevronLeft size={20} color={bgTheme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)} style={[styles.navButton, { backgroundColor: bgTheme.cardBgSecondary }]} activeOpacity={0.6}>
                <ChevronRight size={20} color={bgTheme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cuadrícula de 12 meses chiquitos */}
          <View style={styles.yearlyGrid}>
            {Array.from({ length: 12 }).map((_, mIndex) => (
              <TouchableOpacity
                key={mIndex}
                style={[styles.monthCard, { backgroundColor: bgTheme.cardBgSecondary, borderColor: bgTheme.border }]}
                onPress={() => {
                  // Cargar el mes y año en la vista mensual y cambiar de pestaña
                  setCurrentDate(new Date(selectedYear, mIndex, 1));
                  setSelectedDayDetails(null);
                  setViewMode('month');
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.monthCardName, { color: bgTheme.textPrimary }]}>{getMonthNameStr(mIndex)}</Text>
                {/* Cuadrícula pequeña de días, idéntica al diseño del mes */}
                {renderMiniMonthGrid(mIndex)}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  yearTitle: {
    fontWeight: '300',
    color: colors.textSecondary,
  },
  navButtons: {
    flexDirection: 'row',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.cardBgSecondary,
    marginLeft: 8,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayLabel: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  cell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outMonthCell: {
    opacity: 0.25,
  },
  cellText: {
    fontSize: 13,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginHorizontal: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  detailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailsHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  noCompletedText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  completedCountText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  listContainer: {
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  detailItemText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  // Estilos de la Vista Anual con meses pequeños completos (3 columnas por fila)
  yearlyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  monthCard: {
    width: '31.5%',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: 12,
    padding: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  monthCardName: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  miniMonthContainer: {
    width: '100%',
  },
  miniWeekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 2,
  },
  miniWeekDayLabel: {
    width: '11.2%',
    textAlign: 'center',
    fontSize: 6,
    fontWeight: '700',
    color: colors.textMuted,
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-around',
  },
  miniCell: {
    width: '11.2%',
    aspectRatio: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
    borderWidth: 0.2,
    borderColor: colors.border + '15',
  },
  miniOutMonthCell: {
    opacity: 0.15,
  },
  miniCellText: {
    fontSize: 5.5,
    fontWeight: '700',
  },
});
