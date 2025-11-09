import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet, Alert
} from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "./Styles";
import { auth, db, firebase } from './firebaseConfig'; 

export default function Principal({ initialData = {}, navigation }) {
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

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const tasksToday = atividades.filter(a => a.dueDateTimestamp && isSameDay(a.dueDateTimestamp.toDate(), today));
  const tasksTomorrow = atividades.filter(a => a.dueDateTimestamp && isSameDay(a.dueDateTimestamp.toDate(), tomorrow));

  const sortByTime = (arr) => arr.slice().sort((x, y) => {
    const tx = x.dueDateTimestamp ? x.dueDateTimestamp.toDate().getTime() : 0;
    const ty = y.dueDateTimestamp ? y.dueDateTimestamp.toDate().getTime() : 0;
    return tx - ty;
  });

  const toggleCompleted = async (task) => {
    const user = auth.currentUser;
    if (!user) { Alert.alert('Erro', 'Usuário não autenticado'); return; }

    const docRef = db.collection('users').doc(user.uid).collection('atividades').doc(task.id);
    const newValue = !task.completed;

    // otimista
    setAtividades(prev => prev.map(p => p.id === task.id ? { ...p, completed: newValue } : p));

    try {
      await docRef.update({
        completed: newValue,
        completedAt: newValue ? firebase.firestore.FieldValue.serverTimestamp() : null
      });
    } catch (err) {
      console.error('Erro ao atualizar completed:', err);
      // reverter UI
      setAtividades(prev => prev.map(p => p.id === task.id ? { ...p, completed: task.completed } : p));
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    }
  };

const renderTaskCard = (task, bgColor = '#bff1f5') => {
  const completed = !!task.completed;
  const bg = completed ? '#2f5b86' : bgColor;
  const textColor = completed ? '#e6e6e6' : '#002';
  return (
    <View key={task.id} style={[localStyles.card, { backgroundColor: bg }]}>
      <TouchableOpacity style={localStyles.circle} onPress={() => toggleCompleted(task)}>
        <MaterialCommunityIcons
          name={task.completed ? 'check-circle' : 'circle-outline'}
          size={26}
          color={task.completed ? '#fff' : '#fff'}
        />
      </TouchableOpacity>

      {/* corpo clicável - navega para detalhes */}
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
    <ScrollView contentContainerStyle={styles.containerMeuPerfil}>
      <View style={styles.containerlogoprincipal}>
        <Image style={styles.imagem} source={require('./assets/agendae.png')} />
      </View>

      <Text style={styles.tituloDataPrincipal}> Para hoje </Text>

      <View style={{ width: '100%', paddingHorizontal: 12 }}>
        {loading ? <ActivityIndicator /> :
          (sortByTime(tasksToday).length === 0 ? (
            <Text style={{ color: '#fff', marginBottom: 12 }}>Nenhuma atividade para hoje</Text>
          ) : (
            sortByTime(tasksToday).map(t => renderTaskCard(t, '#bff1f5'))
          ))
        }
      </View>

      <Text style={styles.tituloDataPrincipal}> Para amanhã </Text>

      <View style={{ width: '100%', paddingHorizontal: 12, marginBottom: 24 }}>
        {loading ? <ActivityIndicator /> :
          (sortByTime(tasksTomorrow).length === 0 ? (
            <Text style={{ color: '#fff', marginBottom: 12 }}>Nenhuma atividade para amanhã</Text>
          ) : (
            sortByTime(tasksTomorrow).map(t => renderTaskCard(t, '#d9d7ff'))
          ))
        }
      </View>

      <View style={styles.containerBotoesNavegacao}>
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
    </ScrollView>
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
