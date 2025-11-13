import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './Styles';
import { auth, db, firebase } from './firebaseConfig';

export default function TelaAtividades({ navigation }) {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(-1);

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
      .orderBy('createdAt', 'desc');

    const unsub = colRef.onSnapshot(
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAtividades(list);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao carregar atividades:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const toggleCompleted = async (task) => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = db
      .collection('users')
      .doc(user.uid)
      .collection('atividades')
      .doc(task.id);

    const newValue = !task.completed;

    // otimista
    setAtividades((prev) =>
      prev.map((p) => (p.id === task.id ? { ...p, completed: newValue } : p))
    );

    try {
      await docRef.update({
        completed: newValue,
        completedAt: newValue ? firebase.firestore.FieldValue.serverTimestamp() : null,
      });
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      setAtividades((prev) =>
        prev.map((p) => (p.id === task.id ? { ...p, completed: task.completed } : p))
      );
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return '';
    const d = timestamp.toDate();
    return `${d.getDate().toString().padStart(2, '0')}/${
      (d.getMonth() + 1).toString().padStart(2, '0')
    } ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleMenuPress = (index) => {
    setExpandedIndex((current) => (current === index ? -1 : index));
  };

  const renderTaskCard = (task) => {
  const completed = !!task.completed;

  // cores por tipo
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

      <TouchableOpacity
        style={localStyles.cardBody}
        onPress={() => navigation.navigate('DetalhesAtividade', { id: task.id })}
      >
        <Text
          numberOfLines={1}
          style={[localStyles.cardTitle, { color: textColor, textDecorationLine: completed ? 'line-through' : 'none' }]}
        >
          {task.titulo}
        </Text>
        <Text style={[localStyles.cardTime, { color: textColor }]}>
          {formatTime(task.dueDateTimestamp)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  const blocos = [
    { titulo: 'Provas', tipo: 'Prova' },
    { titulo: 'Trabalhos', tipo: 'Trabalho' },
    { titulo: 'Atividades', tipo: 'Atividade' },
    { titulo: 'Arquivadas', tipo: 'Arquivadas' }, // bloco extra
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.tituloMeuPerfil}>Minhas atividades</Text>
      <View style={styles.linha}></View>
      <ScrollView>
        <View style={styles.menuWrapper}>
          {blocos.map((bloco, index) => {
            let tasksForBloco = [];

            if (bloco.tipo === 'Arquivadas') {
              // concluídas
              tasksForBloco = atividades.filter((task) => task.completed === true);
            } else {
              tasksForBloco = atividades.filter(
                (task) => (task.tipo || '').trim() === bloco.tipo && task.completed !== true
              );
            }

            return (
              <View key={index} style={{ marginBottom: 20 }}>
                <TouchableOpacity
                  style={styles.menuButton}
                  activeOpacity={0.7}
                  onPress={() => handleMenuPress(index)}
                >
                  <Text style={styles.menuButtonText}>
                    {bloco.titulo} ({tasksForBloco.length})
                  </Text>
                  <MaterialCommunityIcons
                    name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                    size={28}
                    color="#E0E0E0"
                  />
                </TouchableOpacity>

                {expandedIndex === index && (
                  <View style={localStyles.contentContainer}>
                    {tasksForBloco.length > 0 ? (
                      tasksForBloco.map((task) => renderTaskCard(task))
                    ) : (
                      <Text style={localStyles.noTasksText}>
                        Nenhuma {bloco.titulo.toLowerCase()} encontrada.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Botão flutuante: vai para TelaCadastrarAtividade */}
      <View style={[styles.containerBotaoAtividade, localStyles.floatingButton]}>
        <TouchableOpacity
          style={styles.botaoAtividade}
          onPress={() => navigation.navigate('CadastrarAtividade')}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Navegação inferior */}
      <View style={[styles.containerBotoesNavegacao, { zIndex: 10, backgroundColor: '#001c44' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('MenuPrincipal')}>
          <MaterialCommunityIcons name="home" size={30} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Atividades')}>
          <MaterialCommunityIcons name="file-document-outline" size={30} color="#ffffff" />
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

// --- estilos locais ---
const localStyles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    padding: 20,
  },
  noTasksText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardTime: {
    fontSize: 14,
    marginTop: 4,
  },
});
