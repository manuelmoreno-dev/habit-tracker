import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Sparkles, Activity, Brain, Dumbbell, BookOpen } from 'lucide-react-native';
import { HabitsContext } from '../context/HabitsContext';
import { colors } from '../theme/colors';
import CategorySelector from '../components/CategorySelector';

const DAYS = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 },
  { label: 'Jue', value: 4 },
  { label: 'Vie', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 0 },
];

const PRESET_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#EF4444', // Rojo
  '#F59E0B', // Naranja
  '#8B5CF6', // Violeta
  '#EC4899', // Rosa
];

const PRESET_ICONS = [
  { name: 'Sparkles', label: 'Estrella' },
  { name: 'Activity', label: 'Salud' },
  { name: 'Brain', label: 'Mente' },
  { name: 'Dumbbell', label: 'Ejercicio' },
  { name: 'BookOpen', label: 'Lectura' },
];

export default function AddHabitScreen({ route, navigation }) {
  const { addHabit, editHabit, theme, customCategories, addCustomCategory, bgTheme } = useContext(HabitsContext);
  
  // Detectar si estamos en modo edición
  const editModeHabit = route.params?.editHabit;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Salud');
  const [frequency, setFrequency] = useState('daily'); // daily, specific_days
  const [specificDays, setSpecificDays] = useState([1, 2, 3, 4, 5]); // Lun a Vie por defecto
  const [reminderTime, setReminderTime] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0); // 08:00 por defecto
    return d;
  });

  // Nuevos estados para tipos avanzados
  const [type, setType] = useState('positive'); // positive, negative, quantitative
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');

  // Estados para creación de categoría personalizada
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3B82F6');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');

  // Inicializar valores si estamos en modo edición
  useEffect(() => {
    if (editModeHabit) {
      setName(editModeHabit.name);
      setDescription(editModeHabit.description || '');
      setCategory(editModeHabit.category);
      setFrequency(editModeHabit.frequency);
      setSpecificDays(editModeHabit.specificDays || []);
      setReminderTime(editModeHabit.reminderTime || '');
      setType(editModeHabit.type || 'positive');
      setTargetValue(editModeHabit.targetValue ? editModeHabit.targetValue.toString() : '');
      setUnit(editModeHabit.unit || '');
      
      if (editModeHabit.reminderTime) {
        const [h, m] = editModeHabit.reminderTime.split(':');
        const d = new Date();
        d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        setPickerDate(d);
      }
    }
  }, [editModeHabit]);

  // Alternar selección de días específicos
  const toggleDay = (dayValue) => {
    if (specificDays.includes(dayValue)) {
      setSpecificDays(specificDays.filter(d => d !== dayValue));
    } else {
      setSpecificDays([...specificDays, dayValue].sort());
    }
  };

  // Manejar el cambio de hora en el Reloj
  const onValueChangeTime = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setPickerDate(selectedDate);
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      setReminderTime(`${hours}:${minutes}`);
    }
  };

  const onDismissTime = () => {
    setShowPicker(false);
  };

  // Guardar categoría personalizada
  const handleSaveCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría.');
      return;
    }
    
    const exists = customCategories.some(
      c => c.name.toLowerCase() === newCatName.trim().toLowerCase()
    ) || ['salud', 'mente', 'ejercicio', 'trabajo', 'otros'].includes(newCatName.trim().toLowerCase());
    
    if (exists) {
      Alert.alert('Error', 'Ya existe una categoría con ese nombre.');
      return;
    }

    const payload = {
      name: newCatName.trim(),
      color: newCatColor,
      darkBg: newCatColor + '15',
      icon: newCatIcon
    };

    addCustomCategory(payload);
    setCategory(payload.name); // Seleccionar automáticamente
    setShowCatModal(false);
    setNewCatName('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el hábito.');
      return;
    }

    if (frequency === 'specific_days' && specificDays.length === 0) {
      Alert.alert('Error', 'Por favor selecciona al menos un día para la frecuencia.');
      return;
    }

    if (type === 'quantitative') {
      const numTarget = parseInt(targetValue, 10);
      if (isNaN(numTarget) || numTarget <= 0) {
        Alert.alert('Error', 'Por favor ingresa una meta diaria válida (mayor a 0).');
        return;
      }
      if (!unit.trim()) {
        Alert.alert('Error', 'Por favor ingresa una unidad de medida (ej. ml, min, págs).');
        return;
      }
    }

    const habitPayload = {
      name: name.trim(),
      description: description.trim(),
      category,
      frequency,
      specificDays: frequency === 'daily' ? [] : specificDays,
      reminderTime: reminderTime,
      type,
      targetValue: type === 'quantitative' ? parseInt(targetValue, 10) : 0,
      unit: type === 'quantitative' ? unit.trim() : '',
    };

    if (editModeHabit) {
      editHabit(editModeHabit.id, habitPayload);
      Alert.alert('Éxito', 'Hábito actualizado correctamente.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() }
      ]);
    } else {
      addHabit(habitPayload);
      Alert.alert('Éxito', 'Hábito guardado correctamente.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgTheme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text style={[styles.titleText, { color: bgTheme.textPrimary }]}>
          {editModeHabit ? 'Editar Hábito' : 'Nuevo Hábito'}
        </Text>
        
        {/* Campo de Nombre */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Nombre del Hábito *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border, color: colors.textPrimary }]}
            placeholder="Ej. Leer un libro, Beber agua..."
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={40}
          />
        </View>

        {/* Campo de Descripción */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border, color: colors.textPrimary }]}
            placeholder="Ej. 15 páginas diarias del libro actual..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={100}
          />
        </View>

        {/* Selector de Tipo de Hábito */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Tipo de Hábito</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border },
                type === 'positive' && { borderColor: theme.primary, backgroundColor: theme.primary + '15' }
              ]}
              onPress={() => setType('positive')}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeButtonText, { color: bgTheme.textSecondary }, type === 'positive' && { color: theme.primaryLight }]}>
                Desarrollar (+)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border },
                type === 'negative' && { borderColor: colors.danger, backgroundColor: colors.danger + '15' }
              ]}
              onPress={() => setType('negative')}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeButtonText, { color: bgTheme.textSecondary }, type === 'negative' && { color: colors.dangerLight }]}>
                Evitar (-)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border },
                type === 'quantitative' && { borderColor: colors.success, backgroundColor: colors.success + '15' }
              ]}
              onPress={() => setType('quantitative')}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeButtonText, { color: bgTheme.textSecondary }, type === 'quantitative' && { color: colors.success }]}>
                Medir (123)
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.typeDescription, { color: bgTheme.textSecondary }]}>
            {type === 'positive' && 'Desarrollar un hábito positivo (se marca al completarlo).'}
            {type === 'negative' && 'Evitar una mala acción (se considera cumplido de inicio; marcar rompe el hábito).'}
            {type === 'quantitative' && 'Medir el progreso acumulativo diario (ej. ml de agua, minutos, páginas).'}
          </Text>
        </View>

        {/* Campos Cuantitativos (Solo si tipo es cuantitativo) */}
        {type === 'quantitative' && (
          <View style={styles.quantitativeRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Meta Diaria *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border, color: colors.textPrimary }]}
                placeholder="Ej. 2000, 30, 5"
                placeholderTextColor={colors.textMuted}
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Unidad de Medida *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border, color: colors.textPrimary }]}
                placeholder="Ej. ml, min, págs"
                placeholderTextColor={colors.textMuted}
                value={unit}
                onChangeText={setUnit}
                maxLength={10}
              />
            </View>
          </View>
        )}

        {/* Selector de Categorías (Con soporte para personalizadas) */}
        <CategorySelector 
          selectedCategory={category} 
          onSelectCategory={setCategory} 
          customCategories={customCategories}
          onAddCustomPress={() => setShowCatModal(true)}
        />

        {/* Selector de Frecuencia */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Frecuencia</Text>
          <View style={styles.frequencyRow}>
            <TouchableOpacity
              style={[
                styles.freqButton,
                { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border },
                frequency === 'daily' && { borderColor: theme.primary, backgroundColor: theme.primary + '15' }
              ]}
              onPress={() => setFrequency('daily')}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.freqButtonText,
                  { color: bgTheme.textSecondary },
                  frequency === 'daily' && { color: theme.primaryLight }
                ]}
              >
                Todos los días
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.freqButton,
                { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border },
                frequency === 'specific_days' && { borderColor: theme.primary, backgroundColor: theme.primary + '15' }
              ]}
              onPress={() => setFrequency('specific_days')}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.freqButtonText,
                  { color: bgTheme.textSecondary },
                  frequency === 'specific_days' && { color: theme.primaryLight }
                ]}
              >
                Días específicos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selector de Días de la Semana (si aplica) */}
        {frequency === 'specific_days' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Repetir los días:</Text>
            <View style={styles.daysRow}>
              {DAYS.map(day => {
                const isSelected = specificDays.includes(day.value);
                return (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayCircle,
                      { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border },
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => toggleDay(day.value)}
                    activeOpacity={0.7}
                  >
                    <Text 
                      style={[
                        styles.dayCircleText,
                        { color: bgTheme.textSecondary },
                        isSelected && styles.activeDayCircleText
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Campo de Recordatorio con Reloj */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Hora de Recordatorio (Opcional)</Text>
          <View style={styles.reminderRow}>
            <TouchableOpacity
              style={[styles.timePickerButton, { backgroundColor: bgTheme.cardBg, borderColor: theme.primary }]}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.timePickerButtonText, { color: bgTheme.textPrimary }]}>
                {reminderTime ? `⏰  ${reminderTime}` : '⏰  Establecer Hora'}
              </Text>
            </TouchableOpacity>

            {reminderTime ? (
              <TouchableOpacity
                style={styles.clearReminderButton}
                onPress={() => {
                  setReminderTime('');
                  const defaultDate = new Date();
                  defaultDate.setHours(8, 0, 0, 0);
                  setPickerDate(defaultDate);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearReminderText}>Quitar</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {showPicker && (
            <DateTimePicker
              value={pickerDate}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onValueChange={onValueChangeTime}
              onDismiss={onDismissTime}
              style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
            />
          )}
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {editModeHabit ? 'Guardar Cambios' : 'Crear Hábito'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para Crear Categoría Personalizada */}
      {showCatModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: bgTheme.cardBg, borderColor: bgTheme.border }]}>
            <Text style={[styles.modalTitle, { color: bgTheme.textPrimary }]}>Nueva Categoría</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Nombre *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: bgTheme.cardBgSecondary, borderColor: bgTheme.border, color: colors.textPrimary }]}
                placeholder="Ej. Lectura, Finanzas, Música..."
                placeholderTextColor={colors.textMuted}
                value={newCatName}
                onChangeText={setNewCatName}
                maxLength={15}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Color de Acento</Text>
              <View style={styles.colorPalette}>
                {PRESET_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      newCatColor === color && styles.selectedColorCircle
                    ]}
                    onPress={() => setNewCatColor(color)}
                    activeOpacity={0.7}
                  />
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: bgTheme.textSecondary }]}>Icono</Text>
              <View style={styles.iconPalette}>
                {PRESET_ICONS.map(icon => {
                  const isSelected = newCatIcon === icon.name;
                  return (
                    <TouchableOpacity
                      key={icon.name}
                      style={[
                        styles.iconBox,
                        { backgroundColor: bgTheme.cardBgSecondary, borderColor: bgTheme.border },
                        isSelected && { borderColor: newCatColor, backgroundColor: newCatColor + '15' }
                      ]}
                      onPress={() => setNewCatIcon(icon.name)}
                      activeOpacity={0.7}
                    >
                      {icon.name === 'Sparkles' && <Sparkles size={18} color={isSelected ? newCatColor : bgTheme.textSecondary} />}
                      {icon.name === 'Activity' && <Activity size={18} color={isSelected ? newCatColor : bgTheme.textSecondary} />}
                      {icon.name === 'Brain' && <Brain size={18} color={isSelected ? newCatColor : bgTheme.textSecondary} />}
                      {icon.name === 'Dumbbell' && <Dumbbell size={18} color={isSelected ? newCatColor : bgTheme.textSecondary} />}
                      {icon.name === 'BookOpen' && <BookOpen size={18} color={isSelected ? newCatColor : bgTheme.textSecondary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { backgroundColor: bgTheme.cardBgSecondary, borderColor: bgTheme.border }]}
                onPress={() => {
                  setShowCatModal(false);
                  setNewCatName('');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelText, { color: bgTheme.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalSaveButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveCategory}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  typeDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  quantitativeRow: {
    flexDirection: 'row',
  },
  frequencyRow: {
    flexDirection: 'row',
  },
  freqButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  freqButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeDayCircleText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timePickerButton: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  timePickerButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  clearReminderButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.danger + '15',
    borderColor: colors.danger + '30',
    borderWidth: 1,
    borderRadius: 14,
    marginLeft: 12,
  },
  clearReminderText: {
    color: colors.dangerLight,
    fontWeight: '600',
    fontSize: 14,
  },
  iosPicker: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: colors.cardBg,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  // Estilos del Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorCircle: {
    borderColor: '#FFFFFF',
  },
  iconPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.cardBgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: colors.cardBgSecondary,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
