import React, { useState, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './Styles';
import { auth, db, firebase } from './firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';

import { schedulePushNotification } from './notifications.js';

export default function TelaCadastrarAtividade({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('');

  const [dataEntregaStr, setDataEntregaStr] = useState('');
  const [horaEntregaStr, setHoraEntregaStr] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [rem1Enabled, setRem1Enabled] = useState(false);
  const [rem1Type, setRem1Type] = useState('hours');
  const [rem1Value, setRem1Value] = useState(1);

  const [rem2Enabled, setRem2Enabled] = useState(false);
  const [rem2Type, setRem2Type] = useState('hours');
  const [rem2Value, setRem2Value] = useState(2);

  const [lembrete1, setlembrete1] = useState('');
  const [lembrete2, setlembrete2] = useState('');

  const [loading, setLoading] = useState(false);

  const route = useRoute();
  useEffect(() => {
    if (route.params?.selectedDate) {
      const selected = new Date(route.params.selectedDate);

      // Mantém só a data (zera horas pra evitar bugs de fuso)
      selected.setHours(0, 0, 0, 0);

      setDueDate(selected);
      setDataEntregaStr(formatDate(selected));
      setHoraEntregaStr(''); // deixa hora vazia
    }
  }, [route.params?.selectedDate]);


  const formatDate = (date) => {
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${min}`;
  };

  const onChangeDate = (event, selectedDate) => {
    // event may be undefined on some platforms; defensive check
    if (event && event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || dueDate || new Date();
    const newDue = new Date(currentDate);
    if (dueDate) newDue.setHours(dueDate.getHours(), dueDate.getMinutes(), 0, 0);
    setDueDate(newDue);
    setDataEntregaStr(formatDate(newDue));
    if (Platform.OS === 'android') setShowDatePicker(false);
  };

  const onChangeTime = (event, selectedTime) => {
    if (event && event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    const currentTime = selectedTime || dueDate || new Date();
    const newDue = dueDate ? new Date(dueDate) : new Date();
    newDue.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
    setDueDate(newDue);
    setHoraEntregaStr(formatTime(newDue));
    if (Platform.OS === 'android') setShowTimePicker(false);
  };

  const calcularReminderDate = (baseDate, type, value) => {
    if (!baseDate) return null;
    const d = new Date(baseDate);
    if (type === 'hours') d.setHours(d.getHours() - Number(value));
    else d.setDate(d.getDate() - Number(value));
    return d;
  };

  const salvarAtividade = async () => {
    // validações básicas
    const tituloTrim = titulo.trim();
    const descricaoTrim = descricao.trim();

    if (!tituloTrim || !descricaoTrim || !tipo || !dueDate) {
      Alert.alert('Atenção', 'Preencha todos os campos (incluindo data e horário).');
      return;
    }

    setLoading(true);
    try {
      const now = new Date();

      let lembrete1Obj = null;
      let lembrete2Obj = null;

      let notificationId1 = null;
      let notificationId2 = null;

      if (rem1Enabled) {
        const r1 = calcularReminderDate(dueDate, rem1Type, rem1Value);
        if (!r1) { /* ... */ setLoading(false); return; }
        if (r1 <= now) { /* ... */ setLoading(false); return; }
        
        // ** AGENDAR NOTIFICAÇÃO 1 **
        notificationId1 = await schedulePushNotification(
          `Lembrete: ${tituloTrim}`, // Título
          descricaoTrim,           // Corpo
          r1                         // Data (o seu objeto Date)
        );

        lembrete1Obj = {
          enabled: true,
          type: rem1Type,
          value: Number(rem1Value),
          reminderAt: firebase.firestore.Timestamp.fromDate(r1),
          display: rem1Type === 'hours' ? `${rem1Value} hora(s) antes` : `${rem1Value} dia(s) antes`,
          notificationId: notificationId1, // ** GUARDAR O ID! **
        };
      }

      if (rem2Enabled) {
        const r2 = calcularReminderDate(dueDate, rem2Type, rem2Value);
        if (!r2) { /* ... */ setLoading(false); return; }
        if (r2 <= now) { /* ... */ setLoading(false); return; }
        
        // ** AGENDAR NOTIFICAÇÃO 2 **
        notificationId2 = await schedulePushNotification(
          `Lembrete: ${tituloTrim}`, // Título
          descricaoTrim,           // Corpo
          r2                         // Data
        );

        lembrete2Obj = {
          enabled: true,
          type: rem2Type,
          value: Number(rem2Value),
          reminderAt: firebase.firestore.Timestamp.fromDate(r2),
          display: rem2Type === 'hours' ? `${rem2Value} hora(s) antes` : `${rem2Value} dia(s) antes`,
          notificationId: notificationId2, // ** GUARDAR O ID! **
        };
      }

      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado. Faça login antes.');
        setLoading(false);
        return;
      }

      const novaAtividade = {
        titulo: tituloTrim,
        descricao: descricaoTrim,
        tipo,
        data: new Date().toISOString(),
        dataEntrega: dataEntregaStr,
        horaEntrega: horaEntregaStr,
        dueDateTimestamp: firebase.firestore.Timestamp.fromDate(dueDate),
        lembrete1: lembrete1Obj,
        lembrete2: lembrete2Obj,
        lembrete1Text: lembrete1,
        lembrete2Text: lembrete2,
        completed: false,
        completedAt: null,
        createdBy: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      const colRef = db.collection('users').doc(user.uid).collection('atividades');
      await colRef.add(novaAtividade);

      // reset campos
      setTitulo('');
      setDescricao('');
      setTipo('');
      setDataEntregaStr('');
      setHoraEntregaStr('');
      setDueDate(null);
      setRem1Enabled(false); setRem1Type('hours'); setRem1Value(1);
      setRem2Enabled(false); setRem2Type('hours'); setRem2Value(2);
      setlembrete1(''); setlembrete2('');

      Alert.alert('Sucesso', 'Atividade salva com sucesso.');
    } catch (error) {
      console.error('[salvarAtividade] ', error);
      Alert.alert('Erro', 'Erro ao salvar atividade. Veja console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={estilos.containerNovaAtividade}>

      <ScrollView contentContainerStyle={estilos.scrollContainer}>
        <View style={estilos.cardCinza}>
          <View style={estilos.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#004AAD" />
            </TouchableOpacity>
            <Text style={estilos.headerTitle}>Nova Atividade</Text>
            <TouchableOpacity
              style={estilos.botaoSalvar}
              onPress={salvarAtividade}
              disabled={loading}
              accessibilityRole="button"
            >
              {loading ? <ActivityIndicator /> : <Text style={estilos.textoBotaoSalvar}>Salvar</Text>}
            </TouchableOpacity>
          </View>

          <View style={estilos.cardBranco}>
            <TextInput
              placeholder="Título"
              placeholderTextColor="#666"
              style={estilos.input}
              value={titulo}
              onChangeText={setTitulo}
            />

            <TextInput
              placeholder="Descrição"
              placeholderTextColor="#666"
              style={[estilos.input, estilos.descricao]}
              multiline
              value={descricao}
              onChangeText={setDescricao}
            />

            <View style={estilos.radioContainer}>
              {['Atividade','Trabalho', 'Prova'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={estilos.radioItem}
                  onPress={() => setTipo(item)}
                >
                  <MaterialCommunityIcons
                    name={tipo === item ? 'circle-slice-8' : 'circle-outline'}
                    size={20}
                    color="#00347E"
                  />
                  <Text style={estilos.radioLabel}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={estilos.cardBranco}>
            <View style={estilos.linhaInfo}>
              <Text style={estilos.label}>Data:</Text>

              <TouchableOpacity style={[estilos.info, { justifyContent: 'center' }]} onPress={() => setShowDatePicker(true)}>
                <Text>{dataEntregaStr || 'Selecione a data'}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  onChange={onChangeDate}
                />
              )}
            </View>

            <View style={estilos.linhaInfo}>
              <Text style={estilos.label}>Horário:</Text>

              <TouchableOpacity style={[estilos.info, { justifyContent: 'center' }]} onPress={() => setShowTimePicker(true)}>
                <Text>{horaEntregaStr || 'Selecione o horário'}</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                  onChange={onChangeTime}
                />
              )}
            </View>

            {/* Lembrete 1 */}
            <View style={[estilos.cardBranco, { padding: 10, marginTop: 10 }]}>
              <View style={estilos.linhaInfo}>
                <Text style={estilos.label}>Lembrete 1:</Text>
                <TouchableOpacity onPress={() => setRem1Enabled(!rem1Enabled)}>
                  <Text>{rem1Enabled ? 'Ativado' : 'Desativado'}</Text>
                </TouchableOpacity>
              </View>

              {rem1Enabled && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ marginBottom: 6 }}>Tipo:</Text>
                  <Picker selectedValue={rem1Type} onValueChange={(v) => setRem1Type(v)}>
                    <Picker.Item label="Horas antes" value="hours" />
                    <Picker.Item label="Dias antes" value="days" />
                  </Picker>

                  <Text style={{ marginTop: 8, marginBottom: 6 }}>Quantos {rem1Type === 'hours' ? 'horas' : 'dias'} antes?</Text>
                  <Picker selectedValue={rem1Value} onValueChange={(v) => setRem1Value(Number(v))}>
                    {rem1Type === 'hours'
                      ? Array.from({ length: 23 }, (_, i) => i + 1).map((n) => <Picker.Item key={n} label={`${n} hora(s)`} value={n} />)
                      : Array.from({ length: 30 }, (_, i) => i + 1).map((n) => <Picker.Item key={n} label={`${n} dia(s)`} value={n} />)}
                  </Picker>
                </View>
              )}
            </View>

            {/* Lembrete 2 */}
            <View style={[estilos.cardBranco, { padding: 10, marginTop: 10 }]}>
              <View style={estilos.linhaInfo}>
                <Text style={estilos.label}>Lembrete 2:</Text>
                <TouchableOpacity onPress={() => setRem2Enabled(!rem2Enabled)}>
                  <Text>{rem2Enabled ? 'Ativado' : 'Desativado'}</Text>
                </TouchableOpacity>
              </View>

              {rem2Enabled && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ marginBottom: 6 }}>Tipo:</Text>
                  <Picker selectedValue={rem2Type} onValueChange={(v) => setRem2Type(v)}>
                    <Picker.Item label="Horas antes" value="hours" />
                    <Picker.Item label="Dias antes" value="days" />
                  </Picker>

                  <Text style={{ marginTop: 8, marginBottom: 6 }}>Quantos {rem2Type === 'hours' ? 'horas' : 'dias'} antes?</Text>
                  <Picker selectedValue={rem2Value} onValueChange={(v) => setRem2Value(Number(v))}>
                    {rem2Type === 'hours'
                      ? Array.from({ length: 23 }, (_, i) => i + 1).map((n) => <Picker.Item key={n} label={`${n} hora(s)`} value={n} />)
                      : Array.from({ length: 30 }, (_, i) => i + 1).map((n) => <Picker.Item key={n} label={`${n} dia(s)`} value={n} />)}
                  </Picker>
                </View>
              )}
            </View>

          </View>

          <TouchableOpacity onPress={() => {/* adicionar mídia handler */}}>
            <Text style={estilos.linkMidia}>Adicionar mídia</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.containerBotoesNavegacao}>
        <TouchableOpacity onPress={() => navigation.navigate('MenuPrincipal')}>
          <MaterialCommunityIcons name="home" size={30} color="#999999" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('CriarAtividade')}>
          <MaterialCommunityIcons name="file-document-outline" size={30} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity>
          <MaterialCommunityIcons name="calendar-month" size={30} color="#999999" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('MeuPerfil')}>
          <MaterialCommunityIcons name="account" size={30} color="#999999" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ... estilos (mantenha os mesmos que você colocou antes) ... */
const estilos = StyleSheet.create({
  /* seu objeto de estilos (mantive igual ao original) */
  containerNovaAtividade: { flex: 1, backgroundColor: '#001c44', alignItems: 'stretch', paddingTop: 25 },
  header: { flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { color: '#004AAD', fontSize: 20, fontWeight: 'bold' },
  scrollContainer: { alignItems: 'center', paddingBottom: 120 },
  cardCinza: { width: '90%', backgroundColor: '#E4E5EA', borderRadius: 15, padding: 15 },
  cardBranco: { backgroundColor: '#F7F7F7', borderRadius: 15, padding: 15, marginTop: 15 },
  linhaInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  label: { color: '#333', fontWeight: 'bold' },
  info: { color: '#555', backgroundColor: '#E0E0E0', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, minWidth: 140, textAlign: 'center' },
  input: { /* se quiser mesclar com styles.input use ...styles.input */ padding: 10, backgroundColor: '#fff', borderRadius: 6 },
  descricao: { height: 80, textAlignVertical: 'top' },
  botaoSalvar: { backgroundColor: '#00347E', width: 80, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  textoBotaoSalvar: { fontSize: 15, color: 'white', fontWeight: '400' },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  radioLabel: { marginLeft: 8, color: '#333', fontSize: 15 },
  linkMidia: { textAlign: 'center', color: '#004AAD', fontWeight: 'bold', marginTop: 10 },
});
