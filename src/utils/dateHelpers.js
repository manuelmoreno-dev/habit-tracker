// Funciones de utilidad para el manejo de fechas, generación de calendarios y cálculo de rachas

// Retorna la fecha de hoy en formato YYYY-MM-DD (hora local)
export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formatea un objeto Date a YYYY-MM-DD
export const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Retorna una lista de 7 días (Lunes a Domingo) que contiene a la fecha dada
export const getWeekDays = (referenceDateStr) => {
  const refDate = new Date(referenceDateStr + 'T00:00:00');
  const dayOfWeek = refDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  
  // Ajustar para que el primer día de la semana sea el Lunes (1), no Domingo (0)
  // Si es Domingo (0), lo tomamos como 6 (offset de Lunes)
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() + offsetToMonday);
  
  const weekDays = [];
  const daysShortNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const todayStr = getTodayDateString();
  
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateStr = formatDateString(current);
    
    weekDays.push({
      dateString: dateStr,
      dayName: daysShortNames[current.getDay()],
      dayNumber: current.getDate(),
      isToday: dateStr === todayStr,
      dateObj: current,
    });
  }
  
  return weekDays;
};

// Retorna los días de un mes completo para dibujar una cuadrícula
export const getMonthDays = (year, month) => {
  // month es indexado en 0 (0 = Enero, 11 = Diciembre)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const totalDays = lastDayOfMonth.getDate();
  let startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Lunes
  
  // Ajustar para que Lunes sea el primer día de la semana (0 = Lunes, 6 = Domingo)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  const days = [];
  
  // Días del mes anterior para rellenar el inicio de la semana
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDay = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 1, prevDay);
    days.push({
      dateString: formatDateString(prevMonthDate),
      dayNumber: prevDay,
      isCurrentMonth: false,
    });
  }
  
  // Días del mes actual
  for (let d = 1; d <= totalDays; d++) {
    const current = new Date(year, month, d);
    days.push({
      dateString: formatDateString(current),
      dayNumber: d,
      isCurrentMonth: true,
    });
  }
  
  // Días del mes siguiente para completar la cuadrícula (múltiplo de 7)
  const remaining = 42 - days.length; // 6 filas de 7 días
  for (let i = 1; i <= remaining; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    days.push({
      dateString: formatDateString(nextMonthDate),
      dayNumber: i,
      isCurrentMonth: false,
    });
  }
  
  return days;
};

// Determina si un hábito específico está completado en una fecha dada
export const isHabitCompletedOnDate = (habit, dateStr) => {
  if (!habit) return false;
  // Si el hábito se creó después de esta fecha, no cuenta
  if (habit.createdAt > dateStr) return false;
  
  // Si no toca hacer el hábito en este día de la semana (según su frecuencia)
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  if (habit.frequency === 'specific_days' && (!habit.specificDays || !habit.specificDays.includes(dayOfWeek))) {
    return false;
  }
  
  if (habit.type === 'negative') {
    // Para hábitos negativos (evitar), la ausencia de marca o false es éxito (evitado)
    // true en el historial significa que se cometió la mala acción (fallo)
    return habit.history ? habit.history[dateStr] !== true : true;
  }
  
  if (habit.type === 'quantitative') {
    const progressVal = habit.progress ? habit.progress[dateStr] || 0 : 0;
    return progressVal >= habit.targetValue;
  }
  
  // Por defecto (positivo / binario)
  return habit.history ? habit.history[dateStr] === true : false;
};

// Determina si un día del calendario fue exitoso para la rutina global del usuario
export const isGlobalDaySuccess = (habits, dateStr) => {
  if (!habits || habits.length === 0) return false;

  // Obtener hábitos programados para este día de la semana
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  
  const activeHabits = habits.filter(habit => {
    if (habit.createdAt > dateStr) return false;
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'specific_days') {
      return habit.specificDays && habit.specificDays.includes(dayOfWeek);
    }
    return false;
  });
  
  if (activeHabits.length === 0) return false; // Ningún hábito programado
  
  // Si hay algún hábito negativo roto en esta fecha, el día es un fracaso
  const anyNegativeBroken = activeHabits.some(h => h.type === 'negative' && h.history?.[dateStr] === true);
  if (anyNegativeBroken) return false;
  
  // Si todos los hábitos programados son negativos y ninguno se rompió, es éxito
  const allNegative = activeHabits.every(h => h.type === 'negative');
  if (allNegative) return true;
  
  // Si hay hábitos positivos/cuantitativos, al menos uno debe completarse
  const positiveOrQuantitativeActive = activeHabits.filter(h => h.type !== 'negative');
  const anyPositiveOrQuantitativeCompleted = positiveOrQuantitativeActive.some(h => {
    if (h.type === 'quantitative') {
      return (h.progress?.[dateStr] || 0) >= h.targetValue;
    }
    return h.history?.[dateStr] === true;
  });
  
  return anyPositiveOrQuantitativeCompleted;
};

// Calcula la racha individual de un hábito
export const calculateHabitStreak = (habit) => {
  if (!habit) return { current: 0, max: 0 };
  
  const todayStr = getTodayDateString();
  const startDate = new Date(habit.createdAt + 'T00:00:00');
  const endDate = new Date(todayStr + 'T00:00:00');
  
  // Generar lista de días programados desde la creación hasta hoy
  const scheduledDates = [];
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
      scheduledDates.push(dateStr);
    }
    
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  if (scheduledDates.length === 0) {
    return { current: 0, max: 0 };
  }
  
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  // Recorrer los días cronológicamente para calcular la racha
  for (let i = 0; i < scheduledDates.length; i++) {
    const dateStr = scheduledDates[i];
    const isCompleted = isHabitCompletedOnDate(habit, dateStr);
    
    if (isCompleted) {
      tempStreak++;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    } else {
      // Si el día evaluado es HOY y no está completado aún, no rompemos la racha actual todavía.
      if (dateStr === todayStr) {
        // No rompemos tempStreak todavía para la racha actual activa
      } else {
        tempStreak = 0;
      }
    }
  }
  
  // Calcular la racha actual activa al día de hoy
  // Empezamos de atrás hacia adelante en los días programados
  let activeStreak = 0;
  let index = scheduledDates.length - 1;
  
  // Si el último día es hoy y no está completado, revisamos el día anterior
  if (scheduledDates[index] === todayStr && !isHabitCompletedOnDate(habit, todayStr)) {
    index--;
  }
  
  while (index >= 0) {
    const dateStr = scheduledDates[index];
    if (isHabitCompletedOnDate(habit, dateStr)) {
      activeStreak++;
      index--;
    } else {
      break;
    }
  }
  
  currentStreak = activeStreak;
  
  return { 
    current: currentStreak, 
    max: Math.max(currentStreak, maxStreak) 
  };
};

// Calcula la racha global (días consecutivos haciendo AL MENOS un hábito)
export const calculateGlobalStreak = (habits) => {
  if (!habits || habits.length === 0) return { current: 0, max: 0 };
  
  // Encontrar la fecha de creación más antigua
  const creationDates = habits.map(h => h.createdAt).sort();
  const earliestDateStr = creationDates[0];
  
  const todayStr = getTodayDateString();
  const startDate = new Date(earliestDateStr + 'T00:00:00');
  const endDate = new Date(todayStr + 'T00:00:00');
  
  const datesRange = [];
  let checkDate = new Date(startDate);
  while (checkDate <= endDate) {
    datesRange.push(formatDateString(checkDate));
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  for (let i = 0; i < datesRange.length; i++) {
    const dateStr = datesRange[i];
    const isSuccess = isGlobalDaySuccess(habits, dateStr);
    
    if (isSuccess) {
      tempStreak++;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    } else {
      if (dateStr === todayStr) {
        // No romper el tempStreak de hoy si no se ha completado todavía
      } else {
        tempStreak = 0;
      }
    }
  }
  
  // Racha actual activa
  let activeStreak = 0;
  let index = datesRange.length - 1;
  if (datesRange[index] === todayStr && !isGlobalDaySuccess(habits, todayStr)) {
    index--;
  }
  
  while (index >= 0) {
    const dateStr = datesRange[index];
    if (isGlobalDaySuccess(habits, dateStr)) {
      activeStreak++;
      index--;
    } else {
      break;
    }
  }
  
  currentStreak = activeStreak;
  
  return {
    current: currentStreak,
    max: Math.max(currentStreak, maxStreak)
  };
};

// Retorna el nombre largo del mes en español
export const getMonthNameStr = (monthIndex) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[monthIndex];
};
