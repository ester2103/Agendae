import {
  TextInput,
  StyleSheet, // Import StyleSheet to create local styles
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { useState, useEffect } from 'react';
import styles from './Styles';
import { auth, db, firebase } from './firebaseConfig';

export default function TelaAtividades({ navigation }) {
  // --- STATE ---
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(-1);

  // --- DATA FETCHING ---
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
      .orderBy('tipo', 'asc');

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

  // --- HELPER FUNCTIONS ---

  const toggleCompleted = async (task) => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = db
      .collection('users')
      .doc(user.uid)
      .collection('atividades')
      .doc(task.id);

    try {
      await docRef.update({
        completed: !task.completed,
      });
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
      return 'Sem data';
    }
    return timestamp.toDate().toLocaleDateString('pt-BR');
  };

  const handleMenuPress = (index) => {
    setExpandedIndex((currentIndex) => (currentIndex === index ? -1 : index));
  };

  // --- RENDER FUNCTIONS ---

  // *** FIXED ***
  // Changed back to 'localStyles' to match your original function
  const renderTaskCard = (task, bgColor = '#bff1f5') => {
    const completed = !!task.completed;
    const bg = completed ? '#2f5b86' : bgColor;
    const textColor = completed ? '#e6e6e6' : '#002';
    return (
      <View key={task.id} style={[localStyles.card, { backgroundColor: bg }]}>
        <TouchableOpacity
          style={localStyles.circle}
          onPress={() => toggleCompleted(task)}
        >
          <MaterialCommunityIcons
            name={task.completed ? 'check-circle' : 'circle-outline'}
            size={26}
            color={task.completed ? '#fff' : '#fff'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={localStyles.cardBody}
          onPress={() => navigation.navigate('DetalhesAtividade', { id: task.id })}
        >
          <Text
            numberOfLines={1}
            style={[
              localStyles.cardTitle,
              {
                color: textColor,
                textDecorationLine: completed ? 'line-through' : 'none',
              },
            ]}
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

  // --- MAIN RENDER ---
  return (
    <View style={styles.container}>
      <Text style={styles.tituloMeuPerfil}>Minhas atividades</Text>
      <View style={styles.linha}></View>
      <ScrollView>
        <View style={styles.menuWrapper}>
          {['Provas', 'Trabalhos', 'Atividades', 'Pendentes'].map(
            (item, index) => {
              const tasksForThisItem = atividades.filter(
                (task) => task.tipo === item
              );

              return (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.menuButton}
                    activeOpacity={0.7}
                    onPress={() => handleMenuPress(index)}
                  >
                    <Text style={styles.menuButtonText}>
                      {item} ({tasksForThisItem.length})
                    </Text>
                    <MaterialCommunityIcons
                      name={
                        expandedIndex === index ? 'chevron-up' : 'chevron-down'
                      }
                      size={28}
                      color="#E0E0E0"
                    />
                  </TouchableOpacity>

                  {expandedIndex === index && (
                    <View style={localStyles.contentContainer}>
                      {tasksForThisItem.length > 0 ? (
                        tasksForThisItem.map((task) =>
                          renderTaskCard(task, '#F0F8FF')
                        )
                      ) : (
                        <Text style={localStyles.noTasksText}>
                          Nenhuma {item.toLowerCase()} encontrada.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            }
          )}
        </View>
      </ScrollView>

      {/* --- BUTTONS --- */}

      {/* *** FIXED ***
        I've applied your 'styles.containerBotaoAtividade' and added a 
        'localStyles.floatingButton' to make it float on top.
        Your 'containerBotoesNavegacao' is already absolute, so it's perfect.
      */}
      <View style={[styles.containerBotaoAtividade, localStyles.floatingButton]}>
        <TouchableOpacity
          style={styles.botaoAtividade}
          onPress={() => navigation.navigate('CadastrarAtividade')}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.containerBotoesNavegacao}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MenuPrincipal')}
        >
          <MaterialCommunityIcons name="home" size={30} color="#999999" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Atividades')}
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            size={30}
            color="#ffffff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Calendario')}
        >
          <MaterialCommunityIcons
            name="calendar-month"
            size={30}
            color="#999999"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('MeuPerfil')}
        >
          <MaterialCommunityIcons name="account" size={30} color="#999999" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- LOCAL STYLES ---
// These styles are now defined INSIDE your file and won't
// conflict with your main Styles.js
const localStyles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
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
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginTop: 3,
  },
  floatingButton: {
    position: 'absolute', // Make it float
    bottom: 100, // Position it 100px from the bottom (just above the nav bar)
    right: 20, // Position it 20px from the right
    marginTop: 0, // Override the 'marginTop: 100' from your Styles.js
    width: 60, // Ensure the container size matches the button
    padding: 20,
  },
});
