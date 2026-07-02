import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Trophy } from 'lucide-react-native';
import { colors } from '../theme/colors';

import { HabitsContext } from '../context/HabitsContext';

export default function StreakBadge({ streak, label, isMax = false }) {
  const { bgTheme } = React.useContext(HabitsContext);
  const iconColor = isMax ? '#FBBF24' : colors.warning;
  const Icon = isMax ? Trophy : Flame;

  // Estilos adaptables según si el tema de fondo es oscuro o claro
  let badgeStyle = {};
  if (bgTheme.isDark) {
    badgeStyle = isMax 
      ? { backgroundColor: '#1B1E10', borderColor: '#4D4010' }
      : { backgroundColor: '#1E1B10', borderColor: '#78350F' };
  } else {
    badgeStyle = isMax
      ? { backgroundColor: '#FEF9C3', borderColor: '#FEF08A' }
      : { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' };
  }

  const textColor = bgTheme.isDark ? '#94A3B8' : (isMax ? '#854D0E' : '#9A3412');
  const numColor = bgTheme.isDark ? '#F8FAFC' : (isMax ? '#A16207' : '#EA580C');

  return (
    <View style={[styles.badge, badgeStyle]}>
      <View style={[styles.iconContainer, { backgroundColor: isMax ? '#FEF3C740' : '#FFF3E040' }]}>
        <Icon size={24} color={iconColor} fill={isMax ? 'none' : iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.number, { color: numColor }]}>{streak}</Text>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 6,
  },
  currentBadge: {
    backgroundColor: '#1E1B10', // Fondo marrón oscuro para fuego
    borderColor: '#78350F',
  },
  maxBadge: {
    backgroundColor: '#1B1E10', // Fondo verdoso/dorado oscuro para trofeo
    borderColor: '#4D4010',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  number: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
