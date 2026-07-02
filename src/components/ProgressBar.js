import React, { useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { HabitsContext } from '../context/HabitsContext';

export default function ProgressBar({ progress, label }) {
  const { theme, bgTheme } = useContext(HabitsContext);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {label && <Text style={[styles.label, { color: bgTheme.textSecondary }]}>{label}</Text>}
        <Text style={[styles.percentage, { color: bgTheme.textPrimary }]}>{percentage}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: bgTheme.cardBgSecondary }]}>
        <Animated.View 
          style={[
            styles.fill, 
            { 
              width: widthInterpolate,
              backgroundColor: progress === 1 ? colors.success : theme.primary 
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  track: {
    height: 8,
    width: '100%',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
