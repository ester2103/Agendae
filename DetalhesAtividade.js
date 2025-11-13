import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db, firebase } from './firebaseConfig';
import styles from './Styles';

export default function DetalhesAtividade({ route, navigation }) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);

  // campos
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [dataStr, setDataStr] = useState('');
  const [horaStr, setHoraStr] = useState('');
  const [completed, setCompleted] = useState(false);
  const [tipo, setTipo] = useState('Atividade'); // <-- tipo da atividade

  // lembretes
  const [rem1Enabled, setRem1Enabled] = useState(false);
  const [rem1Type, setRem1Type] = useState('hours');
  const [rem1Value, setRem1Value] = useState(1);
  const [rem2Enabled, setRem2Enabled] = useState(false);
  const [rem2Type, setRem2Type] = useState('hours');
  const [rem2Value, setRem2Value] = useState(1);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // cores por tipo
  const colorsByTipo = {
    'Atividade': '#E4E5EA',
    'Prova': '#bff1f5',
    'Trabalho': '#d9d7ff',
  };

  // carregar dados
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      navigation.goBack();
      return;
    }

    const docRef = db.collection('users').doc(user.uid).collection('atividades').doc(id);
    const unsub = docRef.onSnapshot(
      (doc) => {
        if (!doc.exists) {
          Alert.alert('Erro', 'Atividade não encontrada');
          navigation.goBack();
          return;
        }

        const data = doc.data();
        setTitulo(data.titulo || '');
        setDescricao(data.descricao || '');
        setCompleted(!!data.completed);
        setTipo(data.tipo || 'Atividade'); // <-- pega o tipo da atividade

        if (data.dueDateTimestamp) {
          const d = data.dueDateTimestamp.toDate();
          setDueDate(d);
          setDataStr(formatDate(d));
          setHoraStr(formatTime(d));
        } else {
          setDueDate(null);
          setDataStr('');
          setHoraStr('');
        }

        if (data.lembrete1 && data.lembrete1.enabled) {
          setRem1Enabled(true);
          setRem1Type(data.lembrete1.type || 'hours');
          setRem1Value(data.lembrete1.value || 1);
        } else {
          setRem1Enabled(false);
          setRem1Type('hours');
          setRem1Value(1);
        }

        if (data.lembrete2 && data.lembrete2.enabled) {
          setRem2Enabled(true);
          setRem2Type(data.lembrete2.type || 'hours');
          setRem2Value(data.lembrete2.value || 1);
        } else {
          setRem2Enabled(false);
          setRem2Type('hours');
          setRem2Value(1);
        }

        setLoading(false);
      },
      (err) => {
        console.error(err);
        Alert.alert('Erro', 'Falha ao carregar atividade.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [id, navigation]);

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
    if (event && event.type === 'dismissed') { setShowDatePicker(false); return; }
    const newDate = selectedDate || dueDate || new Date();
    setDueDate(newDate);
    setDataStr(formatDate(newDate));
    if (Platform.OS === 'android') setShowDatePicker(false);
  };

  const onChangeTime = (event, selectedTime) => {
    if (event && event.type === 'dismissed') { setShowTimePicker(false); return; }
    const newTime = selectedTime || dueDate || new Date();
    const updated = dueDate ? new Date(dueDate) : new Date();
    updated.setHours(newTime.getHours(), newTime.getMinutes(), 0, 0);
    setDueDate(updated);
    setHoraStr(formatTime(updated));
    if (Platform.OS === 'android') setShowTimePicker(false);
  };

  const calcularReminderDate = (baseDate, type, value) => {
    if (!baseDate) return null;
    const d = new Date(baseDate);
    if (type === 'hours') d.setHours(d.getHours() - Number(value));
    else d.setDate(d.getDate() - Number(value));
    return d;
  };

  const salvar = async () => {
    const user = auth.currentUser;
    if (!user) { Alert.alert('Erro', 'Usuário não autenticado'); return; }
    if (!dueDate) { Alert.alert('Erro', 'Defina data e horário'); return; }

    let lemb1 = null;
    let lemb2 = null;

    if (rem1Enabled) {
      const r1 = calcularReminderDate(dueDate, rem1Type, rem1Value);
      if (r1 <= new Date()) { Alert.alert('Erro', 'Lembrete 1 resultaria no passado'); return; }
      lemb1 = {
        enabled: true,
        type: rem1Type,
        value: Number(rem1Value),
        reminderAt: firebase.firestore.Timestamp.fromDate(r1),
        display: rem1Type === 'hours' ? `${rem1Value} horas antes` : `${rem1Value} dias antes`
      };
    }

    if (rem2Enabled) {
      const r2 = calcularReminderDate(dueDate, rem2Type, rem2Value);
      if (r2 <= new Date()) { Alert.alert('Erro', 'Lembrete 2 resultaria no passado'); return; }
      lemb2 = {
        enabled: true,
        type: rem2Type,
        value: Number(rem2Value),
        reminderAt: firebase.firestore.Timestamp.fromDate(r2),
        display: rem2Type === 'hours' ? `${rem2Value} horas antes` : `${rem2Value} dias antes`
      };
    }

    try {
      const docRef = db.collection('users').doc(user.uid).collection('atividades').doc(id);
      await docRef.update({
        titulo,
        descricao,
        dueDateTimestamp: firebase.firestore.Timestamp.fromDate(dueDate),
        dataEntrega: formatDate(dueDate),
        horaEntrega: formatTime(dueDate),
        lembrete1: lemb1,
        lembrete2: lemb2,
        completed
      });
      Alert.alert('Sucesso', 'Atividade atualizada');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao salvar alterações.');
    }
  };

  const excluir = () => {
    Alert.alert('Confirmar', 'Deseja excluir esta atividade?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const user = auth.currentUser;
            await db.collection('users').doc(user.uid).collection('atividades').doc(id).delete();
            navigation.goBack();
          } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Falha ao excluir.');
          }
        }
      }
    ]);
  };

  const arquivar = async () => {
    try {
      const user = auth.currentUser;
      await db.collection('users').doc(user.uid).collection('atividades').doc(id).update({ archived: true });
      Alert.alert('Pronto', 'Atividade arquivada');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível arquivar');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.containerDetalhes}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}>
        {/* header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          
        </View>

        {/* card com cor por tipo */}
        <View style={[localStyles.cardDetalhe, { backgroundColor: colorsByTipo[tipo] || '#f1f1f1' }]}>
          <Text style={localStyles.titulo}>{titulo}</Text>
          <Text style={localStyles.descricao}>{descricao}</Text>

          {/* Data e hora */}
          <Text style={localStyles.infoLabel}>Data:</Text>
          <TouchableOpacity style={localStyles.pill} onPress={() => setShowDatePicker(true)}>
            <Text>{dataStr || 'Selecionar'}</Text>
          </TouchableOpacity>

          <Text style={[localStyles.infoLabel, { marginTop: 10 }]}>Horário:</Text>
          <TouchableOpacity style={localStyles.pill} onPress={() => setShowTimePicker(true)}>
            <Text>{horaStr || 'Selecionar'}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onChangeDate}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
              onChange={onChangeTime}
            />
          )}

          {/* Lembretes */}
          <View style={{ marginTop: 16 }}>
            <Text style={localStyles.infoLabel}>Lembrete:</Text>
            <TouchableOpacity onPress={() => setRem1Enabled(!rem1Enabled)}>
              <Text>{rem1Enabled ? 'Ativado' : 'Desativado'}</Text>
            </TouchableOpacity>
            {rem1Enabled && (
              <>
                <Picker selectedValue={rem1Type} onValueChange={setRem1Type}>
                  <Picker.Item label="Horas antes" value="hours" />
                  <Picker.Item label="Dias antes" value="days" />
                </Picker>
                <Picker selectedValue={rem1Value} onValueChange={setRem1Value}>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (
                    <Picker.Item key={n} label={`${n} ${rem1Type === 'hours' ? 'hora(s)' : 'dia(s)'}`} value={n} />
                  ))}
                </Picker>
              </>
            )}
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={localStyles.infoLabel}>Lembrete 2:</Text>
            <TouchableOpacity onPress={() => setRem2Enabled(!rem2Enabled)}>
              <Text>{rem2Enabled ? 'Ativado' : 'Desativado'}</Text>
            </TouchableOpacity>
            {rem2Enabled && (
              <>
                <Picker selectedValue={rem2Type} onValueChange={setRem2Type}>
                  <Picker.Item label="Horas antes" value="hours" />
                  <Picker.Item label="Dias antes" value="days" />
                </Picker>
                <Picker selectedValue={rem2Value} onValueChange={setRem2Value}>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (
                    <Picker.Item key={n} label={`${n} ${rem2Type === 'hours' ? 'hora(s)' : 'dia(s)'}`} value={n} />
                  ))}
                </Picker>
              </>
            )}
          </View>

          {/* Botões */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity style={localStyles.btnExcluir} onPress={excluir}>
              <Text style={{ color: '#d23', fontWeight: '700' }}>Excluir</Text>
            </TouchableOpacity>
          
            <TouchableOpacity style={localStyles.btnSalvar} onPress={salvar}>
              <Text style={{ color: '#00347E', fontWeight: '700' }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  cardDetalhe: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 12,
    marginVertical: 12,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16
  },
  descricao: {
    fontSize: 16,
    marginBottom: 20
  },
  infoLabel: {
    fontWeight: '700',
    marginBottom: 6
  },
  pill: {
    backgroundColor: '#e9e9ee',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  btnExcluir: {
    borderWidth: 1,
    borderColor: '#d23',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  btnSalvar: {
    backgroundColor: '#e1f2f7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: '#00347E',
    borderWidth: 1
  }
});
