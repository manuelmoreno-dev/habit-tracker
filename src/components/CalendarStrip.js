import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getWeekDays } from '../utils/dateHelpers';
import { colors } from '../theme/colors';
import { HabitsContext } from '../context/HabitsContext';

export default function CalendarStrip({ selectedDate, onSelectDate, dayProgressMap = {} }) {
  const { theme, bgTheme } = useContext(HabitsContext);
  const weekDays = getWeekDays(selectedDate);

  return (
    <View style={[styles.container, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
      {weekDays.map((day) => {
        const isSelected = day.dateString === selectedDate;
        const progress = dayProgressMap[day.dateString];
        
        // Determinar el color del punto de progreso semanal
        let dotColor = 'transparent';
        if (progress !== undefined && progress > 0) {
          dotColor = progress >= 1 ? colors.success : (isSelected ? '#FFFFFFB0' : theme.primaryLight);
        }

        return (
          <TouchableOpacity
            key={day.dateString}
            style={[
              styles.dayButton,
              isSelected && { backgroundColor: theme.primary },
              day.isToday && !isSelected && { borderColor: theme.primary, borderWidth: 1 },
            ]}
            onPress={() => onSelectDate(day.dateString)}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.dayName, 
                { color: bgTheme.textSecondary },
                isSelected && { color: '#FFFFFF', opacity: 0.9 }, // Siempre blanco si está seleccionado
                day.isToday && !isSelected && { color: theme.primaryLight }
              ]}
            >
              {day.dayName}
            </Text>
            <Text 
              style={[
                styles.dayNumber, 
                { color: bgTheme.textPrimary },
                isSelected && { color: '#FFFFFF' }, // Siempre blanco si está seleccionado
                day.isToday && !isSelected && { color: bgTheme.textPrimary }
              ]}
            >
              {day.dayNumber}
            </Text>
            
            {/* Punto de progreso dinámico */}
            <View style={[styles.progressDot, { backgroundColor: dotColor }]} />

            {day.isToday && !isSelected && (
              <View style={[styles.todayIndicator, { backgroundColor: theme.primary }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 3,
    position: 'relative',
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
  },
  todayButton: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  selectedText: {
    color: colors.textPrimary,
    opacity: 0.9,
  },
  selectedNumberText: {
    color: colors.textPrimary,
  },
  todayText: {
    color: colors.primaryLight,
  },
  todayNumberText: {
    color: colors.textPrimary,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    position: 'absolute',
    bottom: 2,
  },
});
