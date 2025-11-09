import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

/**
 * Configura o comportamento das notificações quando a app está aberta.
 * Deve ser chamado no seu ficheiro principal (App.js).
 */
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Pede permissões e agenda uma notificação local.
 * @param {string} title - O título da notificação.
 * @param {string} body - O corpo (descrição) da notificação.
 * @param {Date} date - O objeto Date de quando a notificação deve disparar.
 * @returns {Promise<string|null>} O ID da notificação agendada, ou null se falhar.
 */
export async function schedulePushNotification(title, body, date) {
  // 1. Verificar permissões existentes
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // 2. Se não tiver permissão, pedir ao utilizador
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // 3. Se o utilizador não deu permissão, sair da função
  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permissão Necessária',
      'Por favor, ative as permissões de notificação nas configurações para receber lembretes.'
    );
    return null;
  }

  // 4. (Opcional, mas recomendado para Android) Definir um canal de notificação
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // 5. Agendar a notificação
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: { screen: 'atividades' }, // Dados extra (opcional)
        sound: 'default', // Toca o som padrão
      },
      trigger: { date: date }, // O objeto Date que você calculou
    });
    
    console.log('Notificação agendada com ID:', notificationId);
    return notificationId; // Retorna o ID

  } catch (e) {
    console.error('Erro ao agendar notificação:', e);
    Alert.alert('Erro', 'Não foi possível agendar o lembrete.');
    return null;
  }
}

/**
 * Cancela uma notificação agendada.
 * @param {string} notificationId - O ID da notificação a cancelar.
 */
export async function cancelNotification(notificationId) {
  if (!notificationId) return;
  
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notificação cancelada:', notificationId);
  } catch (e) {
    console.error('Erro ao cancelar notificação:', e);
  }
}
