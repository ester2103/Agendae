import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Platform
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { auth, db, firebase } from './firebaseConfig';
import styles from "./Styles";
import stylesGlobal from './Styles';

export default function DetalhesAtividade({ route, navigation }) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);

  // campos editáveis
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [dataStr, setDataStr] = useState('');
  const [horaStr, setHoraStr] = useState('');
  const [completed, setCompleted] = useState(false);

  // lembretes (mesma estrutura do criar)
  const [rem1Enabled, setRem1Enabled] = useState(false);
  const [rem1Type, setRem1Type] = useState('hours');
  const [rem1Value, setRem1Value] = useState(1);

  const [rem2Enabled, setRem2Enabled] = useState(false);
  const [rem2Type, setRem2Type] = useState('hours');
  const [rem2Value, setRem2Value] = useState(0);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { Alert.alert('Erro', 'Usuário não autenticado'); navigation.goBack(); return; }

    const docRef = db.collection('users').doc(user.uid).collection('atividades').doc(id);
    const unsub = docRef.onSnapshot(doc => {
      if (!doc.exists) { Alert.alert('Erro', 'Atividade não encontrada'); navigation.goBack(); return; }
      const data = doc.data();

      setTitulo(data.titulo || '');
      setDescricao(data.descricao || '');
      setCompleted(!!data.completed);

      if (data.dueDateTimestamp) {
        const d = data.dueDateTimestamp.toDate();
        setDueDate(d);
        setDataStr(formatDate(d));
        setHoraStr(formatTime(d));
      } else {
        setDueDate(null); setDataStr(''); setHoraStr('');
      }

      // preencher lembretes se existirem
      if (data.lembrete1 && data.lembrete1.enabled) {
        setRem1Enabled(true);
        setRem1Type(data.lembrete1.type || 'hours');
        setRem1Value(data.lembrete1.value || 1);
      } else {
        setRem1Enabled(false);
        setRem1Type('hours'); setRem1Value(1);
      }

      if (data.lembrete2 && data.lembrete2.enabled) {
        setRem2Enabled(true);
        setRem2Type(data.lembrete2.type || 'hours');
        setRem2Value(data.lembrete2.value || 1);
      } else {
        setRem2Enabled(false); setRem2Type('hours'); setRem2Value(1);
      }

      setLoading(false);
    }, err => {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar a atividade');
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

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
    const d = selectedDate || dueDate || new Date();
    const newDue = new Date(d);
    if (dueDate) {
      newDue.setHours(dueDate.getHours(), dueDate.getMinutes(), 0, 0);
    }
    setDueDate(newDue);
    setDataStr(formatDate(newDue));
    if (Platform.OS === 'android') setShowDatePicker(false);
  };

  const onChangeTime = (event, selectedTime) => {
    if (event && event.type === 'dismissed') { setShowTimePicker(false); return; }
    const t = selectedTime || dueDate || new Date();
    const newDue = dueDate ? new Date(dueDate) : new Date();
    newDue.setHours(t.getHours(), t.getMinutes(), 0, 0);
    setDueDate(newDue);
    setHoraStr(formatTime(newDue));
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

    // montar objetos de lembrete
    let lemb1 = null, lemb2 = null;
    if (rem1Enabled) {
      const r1 = calcularReminderDate(dueDate, rem1Type, rem1Value);
      if (r1 <= new Date()) { Alert.alert('Erro', 'Lembrete 1 resultaria no passado'); return; }
      lemb1 = { enabled: true, type: rem1Type, value: Number(rem1Value), reminderAt: firebase.firestore.Timestamp.fromDate(r1), display: rem1Type === 'hours' ? `${rem1Value} horas antes` : `${rem1Value} dias antes` };
    }
    if (rem2Enabled) {
      const r2 = calcularReminderDate(dueDate, rem2Type, rem2Value);
      if (r2 <= new Date()) { Alert.alert('Erro', 'Lembrete 2 resultaria no passado'); return; }
      lemb2 = { enabled: true, type: rem2Type, value: Number(rem2Value), reminderAt: firebase.firestore.Timestamp.fromDate(r2), display: rem2Type === 'hours' ? `${rem2Value} horas antes` : `${rem2Value} dias antes` };
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
        completed: completed,
        // não atualizamos createdAt
      });
      Alert.alert('Sucesso', 'Atividade atualizada');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    }
  };

  const excluir = () => {
    Alert.alert('Confirmar', 'Deseja excluir esta atividade?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          const user = auth.currentUser;
          await db.collection('users').doc(user.uid).collection('atividades').doc(id).delete();
          navigation.goBack();
        } catch (err) {
          console.error(err);
          Alert.alert('Erro', 'Não foi possível excluir');
        }
      } }
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

  if (loading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Carregando...</Text></View>;

  return (
    <View style={stylesGlobal.containerNovaAtividade}>
      <ScrollView contentContainerStyle={styles.containerMeuPerfil}>
        {/* header com seta voltar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setCompleted(!completed)}>
            <MaterialCommunityIcons name={completed ? 'check-circle' : 'circle-outline'} size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={localStyles.cardDetalhe}>
          <Text style={localStyles.titulo}>{titulo}</Text>
          <Text style={localStyles.descricao}>{descricao}</Text>

          <View style={localStyles.infoBox}>
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
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                onChange={onChangeTime}
              />
            )}

            {/* Lembrete 1 */}
            <View style={{ marginTop: 12 }}>
              <Text style={localStyles.infoLabel}>Lembrete:</Text>
              <TouchableOpacity onPress={() => setRem1Enabled(!rem1Enabled)} style={{ marginVertical: 6 }}>
                <Text>{rem1Enabled ? 'Ativado' : 'Desativado'}</Text>
              </TouchableOpacity>

              {rem1Enabled && (
                <>
                  <Picker selectedValue={rem1Type} onValueChange={v => setRem1Type(v)}>
                    <Picker.Item label="Horas antes" value="hours" />
                    <Picker.Item label="Dias antes" value="days" />
                  </Picker>
                  <Picker selectedValue={rem1Value} onValueChange={v => setRem1Value(v)}>
                    {rem1Type === 'hours'
                      ? Array.from({length:23}, (_,i)=>i+1).map(n => <Picker.Item key={n} label={`${n} hora(s)`} value={n} />)
                      : Array.from({length:30}, (_,i)=>i+1).map(n => <Picker.Item key={n} label={`${n} dia(s)`} value={n} />)
                    }
                  </Picker>
                </>
              )}
            </View>

            {/* Lembrete 2 */}
            <View style={{ marginTop: 12 }}>
              <Text style={localStyles.infoLabel}>Lembrete 2:</Text>
              <TouchableOpacity onPress={() => setRem2Enabled(!rem2Enabled)} style={{ marginVertical: 6 }}>
                <Text>{rem2Enabled ? 'Ativado' : 'Desativado'}</Text>
              </TouchableOpacity>

              {rem2Enabled && (
                <>
                  <Picker selectedValue={rem2Type} onValueChange={v => setRem2Type(v)}>
                    <Picker.Item label="Horas antes" value="hours" />
                    <Picker.Item label="Dias antes" value="days" />
                  </Picker>
                  <Picker selectedValue={rem2Value} onValueChange={v => setRem2Value(v)}>
                    {rem2Type === 'hours'
                      ? Array.from({length:23}, (_,i)=>i+1).map(n => <Picker.Item key={n} label={`${n} hora(s)`} value={n} />)
                      : Array.from({length:30}, (_,i)=>i+1).map(n => <Picker.Item key={n} label={`${n} dia(s)`} value={n} />)
                    }
                  </Picker>
                </>
              )}
            </View>
          </View>

          {/* botões excluir / arquivar / salvar */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <TouchableOpacity style={localStyles.btnExcluir} onPress={excluir}>
              <Text style={{ color: '#d23', fontWeight: '700' }}>Excluir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={localStyles.btnSalvar} onPress={arquivar}>
              <Text style={{ color: '#00347E', fontWeight: '700' }}>Arquivar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={localStyles.btnSalvar} onPress={salvar}>
              <Text style={{ color: '#00347E', fontWeight: '700' }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  cardDetalhe: {
    backgroundColor: '#bff1f5',
    borderRadius: 14,
    padding: 14,
  },
  titulo: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  descricao: { fontSize: 14, marginBottom: 12 },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12
  },
  infoLabel: { fontWeight: '700', marginBottom: 6 },
  pill: {
    backgroundColor: '#e9e9ee', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start'
  },
  btnExcluir: {
    borderWidth: 1, borderColor: '#d23', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10
  },
  btnSalvar: {
    backgroundColor: '#e1f2f7', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, borderColor: '#00347E', borderWidth: 1
  }
});
