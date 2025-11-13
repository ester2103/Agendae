import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';
import { auth, db, firebase } from './firebaseConfig'; 
import styles from './Styles';

export default function App({ navigation }) {
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedStartDate(today);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setAtividades([]);
      setLoading(false);
      return;
    }

    const colRef = db
      .collection('users')
      .doc(user.uid)
      .collection('atividades')
      .orderBy('dueDateTimestamp', 'asc');

    const unsub = colRef.onSnapshot(
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAtividades(list);
        setLoading(false);
      },
      err => {
        console.error('Erro ao carregar atividades:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const atividadesDoDia = selectedStartDate
    ? atividades.filter(a => a.dueDateTimestamp && isSameDay(a.dueDateTimestamp.toDate(), selectedStartDate))
    : [];

  const toggleCompleted = async (task) => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = db.collection('users').doc(user.uid).collection('atividades').doc(task.id);
    const newValue = !task.completed;

    setAtividades(prev => prev.map(p => p.id === task.id ? { ...p, completed: newValue } : p));

    try {
      await docRef.update({
        completed: newValue,
        completedAt: newValue ? firebase.firestore.FieldValue.serverTimestamp() : null
      });
    } catch (err) {
      console.error(err);
      setAtividades(prev => prev.map(p => p.id === task.id ? { ...p, completed: task.completed } : p));
    }
  };

  const renderTaskCard = (task) => {
  const completed = !!task.completed;
  const colorsByTipo = {
    'Atividade': '#E4E5EA',
    'Prova': '#bff1f5',
    'Trabalho': '#d9d7ff',
  };
  const bgColor = colorsByTipo[task.tipo] || '#f1f1f1';
  const bg = completed ? '#2f5b86' : bgColor;
  const textColor = completed ? '#e6e6e6' : '#002';

  return (
    <View key={task.id} style={[localStyles.card, { backgroundColor: bg }]}>
      <TouchableOpacity style={localStyles.circle} onPress={() => toggleCompleted(task)}>
        <MaterialCommunityIcons
          name={completed ? 'check-circle' : 'circle-outline'}
          size={26}
          color="#fff"
        />
      </TouchableOpacity>

      <TouchableOpacity style={localStyles.cardBody} onPress={() => navigation.navigate('DetalhesAtividade', { id: task.id })}>
        <Text numberOfLines={1} style={[localStyles.cardTitle, { color: textColor, textDecorationLine: completed ? 'line-through' : 'none' }]}>
          {task.titulo}
        </Text>
        <Text style={[localStyles.cardTime, { color: textColor }]}>{formatTime(task.dueDateTimestamp)}</Text>
      </TouchableOpacity>
    </View>
  );
};


  return (
    <SafeAreaView style={styles.containerMeuPerfil}>
      <StatusBar style="light" />

      <Text style={localStyles.tituloCalendario}>Calendário</Text>
      <View style={styles.linha} />

      <View style={styles.containerCalendario}>
        <CalendarPicker
          months={[
            'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
            'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
          ]}
          weekdays={['Seg','Ter','Qua','Qui','Sex','Sáb', 'Dom']}
          startFromMonday={true}
          selectedStartDate={selectedStartDate}
          onDateChange={setSelectedStartDate}
          todayBackgroundColor="transparent"
          selectedDayColor="#67B8FA"
          selectedDayTextColor="#272727"
          textStyle={{ color: '#272727', fontSize: 17 }}
          selectMonthTitle="Selecione o mês  "
          selectYearTitle="Selecione o ano"
          
          monthTitleStyle={{ color: 'black', fontWeight: 'bold', fontSize: 20, marginRight: 30 }}
          yearTitleStyle={{ color: 'black', fontSize: 20 }}
          previousTitle="<" 
          nextTitle=">" 
          previousTitleStyle={{ color: '#2592F8', fontSize: 25 }} 
          nextTitleStyle={{ color: '#2592F8', fontSize: 25 }}
          customDatesStyles={[
            { date: new Date(), style: { borderWidth: 2, borderColor: '#67B8FA', borderRadius: 50 }, textStyle: { color: '#272727' } },
          ]}
        />
      </View>

      <View style={styles.linha} />
      
      <Text style={localStyles.tituloDia}>
          {selectedStartDate
            ? selectedStartDate.toDateString() === new Date().toDateString()
              ? "Para hoje"
              : `Dia ${selectedStartDate.getDate()}`
            : "Selecione uma data"}
        </Text>

      <ScrollView contentContainerStyle={localStyles.containerAtividades} style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : atividadesDoDia.length === 0 ? (
          <Text style={localStyles.semAtividades}>Nenhuma atividade cadastrada</Text>
        ) : (
          atividadesDoDia.map(task => renderTaskCard(task))
        )}
      </ScrollView>

      <View style={[styles.containerBotaoAtividade, localStyles.floatingButton]}>
        <TouchableOpacity style={styles.botaoAtividade} onPress={() => navigation.navigate('CadastrarAtividade', { selectedDate: selectedStartDate })}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.containerBotoesNavegacao, { zIndex: 10, backgroundColor: '#001c44' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('MenuPrincipal')}>
          <MaterialCommunityIcons name="home" size={30} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Atividades')}>
          <MaterialCommunityIcons name="file-document-outline" size={30} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
          <MaterialCommunityIcons name="calendar-month" size={30} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MeuPerfil')}>
          <MaterialCommunityIcons name="account" size={30} color="#999999" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  tituloCalendario: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 12,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    padding: 20,
  },
  containerAtividades: {
    padding: 10,
    paddingHorizontal: 23,
    alignItems: 'flex-start',
  },
  tituloDia: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFFFFF',
    alignItems: 'flex-start',
    paddingLeft: 25,
  },
  semAtividades: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#AAAAAA',
    textAlign: 'left',
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  circle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginRight: 12
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardTime: { fontSize: 14, marginTop: 6 },
});
