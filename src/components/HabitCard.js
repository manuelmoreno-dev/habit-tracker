import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Flame, Activity, Brain, Dumbbell, Briefcase, Sparkles, BookOpen, Trash2, Edit2, Shield, AlertTriangle, Plus, Minus } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { HabitsContext } from '../context/HabitsContext';
import { isHabitCompletedOnDate, calculateHabitStreak } from '../utils/dateHelpers';

export default function HabitCard({ habit, dateStr, onToggle, onEdit, onDelete, showActions = false }) {
  const { customCategories, updateQuantitativeProgress, theme, bgTheme } = useContext(HabitsContext);
  
  // Calcular completado usando la lógica matemática de tipos de hábitos
  const isCompleted = isHabitCompletedOnDate(habit, dateStr);
  const { current: streak } = calculateHabitStreak(habit);

  // Obtener racha del habit individual
  const currentProgress = habit.progress?.[dateStr] || 0;
  const target = habit.targetValue || 1;
  
  // Calcular incremento/decremento automático para hábitos cuantitativos
  const getStepValue = (targetVal) => {
    if (targetVal <= 10) return 1;
    if (targetVal <= 50) return 5;
    if (targetVal <= 100) return 10;
    if (targetVal <= 500) return 50;
    return 250; // Para cosas grandes (ej. 2000 ml de agua)
  };

  const step = getStepValue(target);

  const handleDecrease = () => {
    updateQuantitativeProgress(habit.id, dateStr, Math.max(0, currentProgress - step));
  };

  const handleIncrease = () => {
    updateQuantitativeProgress(habit.id, dateStr, currentProgress + step);
  };

  // Obtener icono según categoría (predefinida o personalizada)
  const getCategoryIcon = (categoryName, color) => {
    const size = 20;
    // Buscar si es categoría personalizada
    const customCat = customCategories.find(c => c.name === categoryName);
    const iconName = customCat ? customCat.icon : '';

    switch (categoryName) {
      case 'Salud':
        return <Activity size={size} color={color} />;
      case 'Mente':
        return <Brain size={size} color={color} />;
      case 'Ejercicio':
        return <Dumbbell size={size} color={color} />;
      case 'Trabajo':
        return <Briefcase size={size} color={color} />;
      default:
        if (iconName === 'BookOpen') return <BookOpen size={size} color={color} />;
        if (iconName === 'Activity') return <Activity size={size} color={color} />;
        if (iconName === 'Brain') return <Brain size={size} color={color} />;
        if (iconName === 'Dumbbell') return <Dumbbell size={size} color={color} />;
        return <Sparkles size={size} color={color} />;
    }
  };

  // Obtener estilos de categoría (predefinida o personalizada)
  const customCat = customCategories.find(c => c.name === habit.category);
  const catStyle = customCat || colors.categories[habit.category] || colors.categories.Otros;

  // Lógica de color de borde según estado
  let statusBorderColor = colors.border;
  if (isCompleted) {
    statusBorderColor = colors.success + '40';
  } else if (habit.type === 'negative' && habit.history?.[dateStr] === true) {
    statusBorderColor = colors.danger + '40'; // Rojo si rompió el hábito negativo
  }

  return (
    <View 
      style={[
        styles.card, 
        { backgroundColor: bgTheme.cardBg, borderColor: statusBorderColor },
        isCompleted && styles.completedCard,
        habit.type === 'negative' && habit.history?.[dateStr] === true && styles.brokenCard
      ]}
    >
      <View style={styles.leftContainer}>
        {/* Icono de Categoría */}
        <View style={[styles.iconContainer, { backgroundColor: bgTheme.isDark ? (catStyle.darkBg || catStyle.color + '15') : (catStyle.bg || catStyle.color + '15') }]}>
          {getCategoryIcon(habit.category, catStyle.color)}
        </View>
        
        {/* Info del Hábito */}
        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: isCompleted && habit.type !== 'negative' ? bgTheme.textMuted : bgTheme.textPrimary }, isCompleted && habit.type !== 'negative' && styles.completedText]}>
            {habit.name}
          </Text>
          
          {habit.description ? (
            <Text style={[styles.description, { color: isCompleted && habit.type !== 'negative' ? bgTheme.textMuted : bgTheme.textSecondary }, isCompleted && habit.type !== 'negative' && styles.completedDescText]} numberOfLines={1}>
              {habit.description}
            </Text>
          ) : null}

          {/* Detalles especiales por Tipo de Hábito */}
          <View style={styles.badgeRow}>
            {/* Meta para cuantitativo */}
            {habit.type === 'quantitative' && (
              <View style={[styles.metaBadge, { backgroundColor: bgTheme.cardBgSecondary, borderColor: bgTheme.border }]}>
                <Text style={[styles.metaBadgeText, { color: bgTheme.textSecondary }]}>
                  Meta: {target} {habit.unit}
                </Text>
              </View>
            )}

            {/* Etiqueta de Evitar para Negativos */}
            {habit.type === 'negative' && (
              <View style={[styles.metaBadge, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '20' }]}>
                <Text style={[styles.metaBadgeText, { color: bgTheme.isDark ? colors.dangerLight : colors.danger }]}>
                  Evitar
                </Text>
              </View>
            )}

            {/* Racha del hábito individual */}
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={12} color={colors.warning} fill={colors.warning} />
                <Text style={styles.streakText}>{streak} {streak === 1 ? 'día' : 'días'}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Controles de Acción (Edición / Eliminación) */}
      {showActions ? (
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={() => onEdit(habit)} style={[styles.actionButton, { backgroundColor: bgTheme.cardBgSecondary }]} activeOpacity={0.6}>
            <Edit2 size={18} color={bgTheme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(habit.id)} style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.danger + '15' }]} activeOpacity={0.6}>
            <Trash2 size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      ) : (
        // Controles de Completado según Tipo de Hábito
        <View>
          {habit.type === 'quantitative' ? (
            // Controles de Hábitos Cuantitativos
            <View style={[styles.qtyContainer, { backgroundColor: bgTheme.cardBgSecondary, borderColor: bgTheme.border }]}>
              <TouchableOpacity 
                onPress={handleDecrease} 
                style={[styles.qtyButton, { backgroundColor: bgTheme.cardBg }]} 
                activeOpacity={0.7}
              >
                <Minus size={14} color={bgTheme.textSecondary} strokeWidth={3} />
              </TouchableOpacity>
              
              <View style={styles.qtyTextWrapper}>
                <Text style={[styles.qtyValueText, { color: isCompleted ? colors.success : bgTheme.textPrimary }]}>
                  {currentProgress}
                </Text>
                <Text style={[styles.qtyUnitText, { color: bgTheme.textSecondary }]}>
                  /{target} {habit.unit}
                </Text>
              </View>
              
              <TouchableOpacity 
                onPress={handleIncrease} 
                style={[styles.qtyButton, { backgroundColor: theme.primary }]} 
                activeOpacity={0.7}
              >
                <Plus size={14} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ) : habit.type === 'negative' ? (
            // Checkbox de Hábitos Negativos (Lógica Invertida)
            <TouchableOpacity
              onPress={() => onToggle(habit.id)}
              style={[
                styles.checkbox,
                { borderColor: bgTheme.textSecondary },
                isCompleted ? styles.checkedNegativeBox : styles.brokenNegativeBox
              ]}
              activeOpacity={0.7}
            >
              {isCompleted ? (
                <Shield size={18} color="#FFFFFF" />
              ) : (
                <AlertTriangle size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ) : (
            // Checkbox de Hábito Positivo Estándar
            <TouchableOpacity
              onPress={() => onToggle(habit.id)}
              style={[
                styles.checkbox,
                { borderColor: bgTheme.textSecondary },
                isCompleted && [styles.checkedBox, { backgroundColor: theme.primary, borderColor: theme.primary }]
              ]}
              activeOpacity={0.7}
            >
              {isCompleted && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  completedCard: {
    opacity: 0.9,
    backgroundColor: colors.cardBg,
  },
  brokenCard: {
    backgroundColor: colors.cardBg,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  completedDescText: {
    color: colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaBadge: {
    backgroundColor: colors.cardBgSecondary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 2,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1F10',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.warningLight,
    marginLeft: 3,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkedNegativeBox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  brokenNegativeBox: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyTextWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  qtyValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  qtyUnitText: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.cardBgSecondary,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: colors.danger + '20',
  }
});
