import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Activity, Brain, Dumbbell, Briefcase, Sparkles, BookOpen, Plus } from 'lucide-react-native';
import { colors } from '../theme/colors';

const DEFAULT_CATEGORIES = ['Salud', 'Mente', 'Ejercicio', 'Trabajo', 'Otros'];

export default function CategorySelector({ selectedCategory, onSelectCategory, customCategories = [], onAddCustomPress }) {
  const getCategoryIcon = (categoryName, iconName, color, size = 18) => {
    const icon = iconName || '';
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
        if (icon === 'BookOpen') return <BookOpen size={size} color={color} />;
        if (icon === 'Activity') return <Activity size={size} color={color} />;
        if (icon === 'Brain') return <Brain size={size} color={color} />;
        if (icon === 'Dumbbell') return <Dumbbell size={size} color={color} />;
        return <Sparkles size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Categoría</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categorías por defecto */}
        {DEFAULT_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          const catStyle = colors.categories[cat] || colors.categories.Otros;
          const activeColor = catStyle.color;
          const activeBg = catStyle.darkBg;

          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                isSelected ? { backgroundColor: activeBg, borderColor: activeColor } : styles.inactiveChip
              ]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.7}
            >
              {getCategoryIcon(cat, null, isSelected ? activeColor : colors.textSecondary)}
              <Text 
                style={[
                  styles.chipText,
                  isSelected ? { color: activeColor, fontWeight: '700' } : styles.inactiveText
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Categorías personalizadas */}
        {customCategories.map(cat => {
          const isSelected = selectedCategory === cat.name;
          const activeColor = cat.color;
          const activeBg = cat.darkBg || cat.color + '15';

          return (
            <TouchableOpacity
              key={cat.name}
              style={[
                styles.chip,
                isSelected ? { backgroundColor: activeBg, borderColor: activeColor } : styles.inactiveChip
              ]}
              onPress={() => onSelectCategory(cat.name)}
              activeOpacity={0.7}
            >
              {getCategoryIcon(cat.name, cat.icon, isSelected ? activeColor : colors.textSecondary)}
              <Text 
                style={[
                  styles.chipText,
                  isSelected ? { color: activeColor, fontWeight: '700' } : styles.inactiveText
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Botón para añadir una nueva categoría personalizada */}
        {onAddCustomPress && (
          <TouchableOpacity
            style={[styles.chip, styles.addButtonChip]}
            onPress={onAddCustomPress}
            activeOpacity={0.7}
          >
            <Plus size={16} color={colors.textSecondary} />
            <Text style={[styles.chipText, styles.addButtonText]}>Nueva</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 10,
  },
  inactiveChip: {
    backgroundColor: colors.cardBg,
    borderColor: colors.border,
  },
  addButtonChip: {
    backgroundColor: colors.cardBgSecondary,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    marginLeft: 6,
  },
  inactiveText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  addButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
