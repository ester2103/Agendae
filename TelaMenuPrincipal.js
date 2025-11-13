import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet, Alert
} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from "./Styles";
import { auth, db, firebase } from './firebaseConfig'; 

export default function Principal({ navigation }) {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ---------- helpers ----------
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
  const endOfDay   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
  const addDays    = (d,n)=> { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const inRange = (ts, start, end) => {
    if (!ts) return false;
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d >= start && d <= end;
  };
  const formatTime = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return `${hh}:${mm}`;
  };
  const sortByTime = (arr) => arr.slice().sort((x,y)=>{
    const tx = x.dueDateTimestamp ? (x.dueDateTimestamp.toDate ? x.dueDateTimestamp.toDate().getTime() : new Date(x.dueDateTimestamp).getTime()) : 0;
    const ty = y.dueDateTimestamp ? (y.dueDateTimestamp.toDate ? y.dueDateTimestamp.toDate().getTime() : new Date(y.dueDateTimestamp).getTime()) : 0;
    return tx - ty;
  });

  // ---------- ranges ----------
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd   = endOfDay(now);
  const tomorrowStart = startOfDay(addDays(now, 1));
  const tomorrowEnd   = endOfDay(addDays(now, 1));
  const nextWeekStart = startOfDay(addDays(now, 2));
  const nextWeekEnd   = endOfDay(addDays(now, 8));

  // ---------- groups ----------
  const tasksToday     = atividades.filter(a => a.dueDateTimestamp && inRange(a.dueDateTimestamp, todayStart, todayEnd));
  const tasksTomorrow  = atividades.filter(a => a.dueDateTimestamp && inRange(a.dueDateTimestamp, tomorrowStart, tomorrowEnd));
  const tasksNextWeek  = atividades.filter(a => a.dueDateTimestamp && inRange(a.dueDateTimestamp, nextWeekStart, nextWeekEnd));

  // ---------- cores por tipo ----------
  const colorsByTipo = {
    'Atividade': '#E4E5EA',
    'Prova': '#bff1f5',
    'Trabalho': '#d9d7ff',
  };

  // ---------- ações ----------
  const toggleCompleted = async (task) => {
    const user = auth.currentUser;
    if (!user) { Alert.alert('Erro','Usuário não autenticado'); return; }

    const docRef = db.collection('users').doc(user.uid).collection('atividades').doc(task.id);
    const newValue = !task.completed;

    setAtividades(prev => prev.map(p => p.id === task.id ? { ...p, completed: newValue } : p));

    try {
      await docRef.update({
        completed: newValue,
        completedAt: newValue ? firebase.firestore.FieldValue.serverTimestamp() : null
      });
    } catch (err) {
      console.error('Erro ao atualizar completed:', err);
      setAtividades(prev => prev.map(p => p.id === task.id ? { ...p, completed: task.completed } : p));
      Alert.alert('Erro','Não foi possível atualizar o status.');
    }
  };

  // ---------- UI ----------
  const renderTaskCard = (task) => {
    const completed = !!task.completed;
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
          <Text style={[localStyles.cardTime, { color: textColor }]}>
            {task.dueDateTimestamp ? formatTime(task.dueDateTimestamp) : 'Sem horário'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSection = (title, data) => (
    <>
      <Text style={styles.tituloDataPrincipal}>{title}</Text>
      {loading ? (
        <ActivityIndicator />
      ) : sortByTime(data).length === 0 ? (
        <Text style={{ color: '#fff', marginBottom: 12 }}>Nenhuma atividade</Text>
      ) : (
        sortByTime(data).map(t => renderTaskCard(t))
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.containerMeuPerfil}>
      <View style={styles.containerlogoprincipal}>
        <Image style={styles.imagem} source={require('./assets/agendae.png')} />
      </View>
      <View style={styles.linha} />

      {/* Scroll único */}
      <ScrollView style={{ flex: 1, paddingBottom: 160, paddingHorizontal: 25 }}>
        {renderSection('Para hoje', tasksToday)}
        {renderSection('Para amanhã', tasksTomorrow)}
        {tasksNextWeek.length > 0 && renderSection('Para esta semana', tasksNextWeek)}
      </ScrollView>

      {/* Botão flutuante */}
      <View style={[styles.containerBotaoAtividade, localStyles.floatingButton]}>
        <TouchableOpacity style={styles.botaoAtividade} onPress={() => navigation.navigate('CadastrarAtividade')}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Barra inferior fixa */}
      <View style={[styles.containerBotoesNavegacao, { zIndex: 10, backgroundColor: '#001c44' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('MenuPrincipal')}>
          <MaterialCommunityIcons name="home" size={30} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Atividades')}>
          <MaterialCommunityIcons name="file-document-outline" size={30} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
          <MaterialCommunityIcons name="calendar-month" size={30} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MeuPerfil')}>
          <MaterialCommunityIcons name="account" size={30} color="#999999" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
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
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    padding: 20,
  },
  circle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginRight: 12
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardTime: { fontSize: 14, marginTop: 6 }
});
