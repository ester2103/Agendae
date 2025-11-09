import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import styles from './Styles';
import { MaterialCommunityIcons } from 'react-native-vector-icons' ;
import CalendarPicker from 'react-native-calendar-picker';

export default function Calendario({ navigation }) {
  const [selectedStartDate, setSelectedStartDate] = useState(null);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // zera horas para comparações seguras
    setSelectedStartDate(today);
  }, []);

  const startDate = selectedStartDate
    ? new Date(selectedStartDate).toLocaleDateString('pt-BR')
    : '';

  return (
    <View style={styles.container}>
      <Text style={localStyles.tituloCalendario}>Calendario</Text>
      <View style={styles.linha} />
      <View style={styles.containerCalendario}>
        <StatusBar style="light" />
        <CalendarPicker
          months={[
            'Janeiro', 'Fevereiro', 'Março', 'Abril',
            'Maio', 'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ]}
          weekdays={['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']}
          startFromMonday={true}

          selectedStartDate={selectedStartDate}
          onDateChange={setSelectedStartDate}

          todayBackgroundColor="transparent"
          selectedDayColor="#67B8FA"
          selectedDayTextColor="#272727"
          textStyle={{ color: '#272727', fontSize: 17 }}
          selectMonthTitle="Selecione o mês"
          selectYearTitle="Selecione o ano"

          monthTitleStyle={{ 
            color: 'black', 
            fontWeight: 'bold', 
            fontSize: 20, 
            marginRight: 30,
            letterSpacing: 1, }}

          yearTitleStyle={{ 
            color: 'black', 
            fontSize: 20 }}

          previousTitle="<" 
          nextTitle=">" 
          
          previousTitleStyle={{ color: '#2592F8', fontSize: 25 }} 
          nextTitleStyle={{ color: '#2592F8', fontSize: 25 }}

          customDatesStyles={[
            {
              date: new Date(), // hoje (sem horas)
              style: { borderWidth: 2, borderColor: '#67B8FA', borderRadius: 50 },
              textStyle: { color: '#272727' },
            },
          ]}
        />

        <Text style={styles.dateText}>
          {startDate ? `Data selecionada: ${startDate}` : 'Selecione uma data'}
        </Text>
      </View>


      <View style={[styles.containerBotaoAtividade, localStyles.floatingButton]}>
        <TouchableOpacity
          style={styles.botaoAtividade}
          onPress={() => navigation.navigate('CadastrarAtividade', { selectedDate: selectedStartDate })}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      </View>


      <View style={styles.linha} />

      <View style={styles.containerBotoesNavegacao}>
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
  
    </View>
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
    marginTop: 0,
    width: 60,
    padding: 20,
  },
});
