import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus, Sparkles } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { HabitsContext } from '../context/HabitsContext';

export default function EmptyState({ message = 'No tienes hábitos creados aún', onAction, actionLabel }) {
  const { theme, bgTheme } = useContext(HabitsContext);

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
        <Sparkles size={40} color={theme.primary} />
      </View>
      <Text style={[styles.message, { color: bgTheme.textSecondary }]}>{message}</Text>
      {onAction && actionLabel && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginVertical: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
