import { Platform } from 'react-native';

let Notifications = null;
let notificationsAvailable = false;

try {
  // En Expo SDK 53+, expo-notifications arroja un error fatal en Android dentro de Expo Go
  // por la eliminación de push notifications. Lo envolvemos en try-catch para evitar la caída
  // y simular su comportamiento de forma transparente.
  Notifications = require('expo-notifications');
  
  if (Notifications) {
    // Configurar cómo se comportan las notificaciones cuando la app está en primer plano
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldShowBadge: false,
      }),
    });
    notificationsAvailable = true;
  }
} catch (error) {
  console.log(
    '[Notificaciones] info: expo-notifications no es compatible en este entorno (ej. Android Expo Go SDK 53+). ' +
    'Las notificaciones se simularán para evitar la caída de la aplicación.'
  );
}

// Solicitar permisos de notificación
export async function requestNotificationPermissions() {
  if (!notificationsAvailable || !Notifications) {
    console.log('[Notificaciones] Permisos de notificación concedidos (Simulado).');
    return true; 
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }

    // Configuración especial de canal para Android (necesario para sonido y prioridad)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });
    }

    return true;
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return false;
  }
}

// Programar notificaciones para un hábito
export async function scheduleHabitNotifications(habit) {
  // Si no tiene hora de recordatorio establecida, no programamos nada
  if (!habit.reminderTime) return [];

  // Si no estamos en un entorno compatible (Expo Go SDK 53+ en Android), simular la programación
  if (!notificationsAvailable || !Notifications) {
    const fakeId = `simulated-id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(
      `[Notificaciones] SIMULADO: Programado recordatorio para "${habit.name}" a las ${habit.reminderTime} ` +
      `(Frecuencia: ${habit.frequency === 'daily' ? 'Diario' : 'Días específicos: ' + habit.specificDays.join(', ')})`
    );
    return [fakeId];
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Permisos de notificación no concedidos.');
    return [];
  }

  // Parsear la hora (HH:MM)
  const [hourStr, minuteStr] = habit.reminderTime.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const title = `⏰ Recordatorio: ${habit.name}`;
  const body = habit.description || '¡Es hora de cumplir con tu hábito de hoy!';

  // Caso 1: Frecuencia Diaria
  if (habit.frequency === 'daily') {
    try {
      const trigger = {
        hour,
        minute,
        repeats: true,
      };
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger,
      });
      return [id];
    } catch (error) {
      console.error('Error programando notificación diaria:', error);
      return [];
    }
  }

  // Caso 2: Días específicos
  if (habit.frequency === 'specific_days' && habit.specificDays && habit.specificDays.length > 0) {
    const notificationIds = [];
    
    for (const day of habit.specificDays) {
      try {
        const expoWeekday = day === 0 ? 1 : day + 1;
        
        const trigger = {
          weekday: expoWeekday,
          hour,
          minute,
          repeats: true,
        };

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
          },
          trigger,
        });
        
        notificationIds.push(id);
      } catch (error) {
        console.error(`Error programando notificación para el día ${day}:`, error);
      }
    }
    
    return notificationIds;
  }

  return [];
}

// Cancelar notificaciones específicas
export async function cancelHabitNotifications(notificationIds) {
  if (!notificationIds || notificationIds.length === 0) return;

  if (!notificationsAvailable || !Notifications) {
    console.log(`[Notificaciones] SIMULADO: Cancelando recordatorios con IDs:`, notificationIds);
    return;
  }

  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.warn(`Error al intentar cancelar la notificación ${id}:`, error);
    }
  }
}
