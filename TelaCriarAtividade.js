import {TextInput, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import {useState} from 'react';
import styles from './Styles';

export default function TelaCriarAtividade({navigation}) {
  const menuItems = ['Provas', 'Trabalhos', 'Atividades', 'Pendentes'];
  
  return(
    <View style ={styles.container}>
      
      <View style={styles.menuWrapper}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuButton} activeOpacity={0.7}>
            <Text style={styles.menuButtonText}>{item}</Text>
            <MaterialCommunityIcons name="chevron-down" size={28} color="#E0E0E0"/>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.containerBotoesNavegacao}>

      <TouchableOpacity>
        <MaterialCommunityIcons name="home" size={30} color="#999999"/>
      </TouchableOpacity>

      <TouchableOpacity>
        <MaterialCommunityIcons name="file-document-outline" size={30} color="#ffffff" 
        onPress={() => navigation.navigate('CriarAtividade')}/>
      </TouchableOpacity>

      <TouchableOpacity>
        <MaterialCommunityIcons name="calendar-month" size={30} color="#999999"/>
      </TouchableOpacity>

      <TouchableOpacity>
        <MaterialCommunityIcons name="account" size={30} color="#999999"
        onPress={() => navigation.navigate('MeuPerfil')}/>
      </TouchableOpacity>

      </View>

    </View>
  );
}
