import {StyleSheet, Text, View, TouchableOpacity, MaterialCommunityIcons} from 'react-native';
import styles from './Styles';
 
 export default function barraInferior () {
    <View style={styles.containerBotoesNavegacao}>
      <TouchableOpacity>
        <MaterialCommunityIcons name="home" size={30} color="#999999"
        onPress={() => navigation.navigate('MenuPrincipal')}/>
      </TouchableOpacity>

      <TouchableOpacity>
        <MaterialCommunityIcons name="file-document-outline" size={30} color="#999999" 
        onPress={() => navigation.navigate('Atividades')}/>
      </TouchableOpacity>

      <TouchableOpacity>
        <MaterialCommunityIcons name="calendar-month" size={30} color="#999999"
        onPress={() => navigation.navigate('Calendario')}/>
      </TouchableOpacity>

      <TouchableOpacity>
        <MaterialCommunityIcons name="account" size={30} color="#999999"
        onPress={() => navigation.navigate('MeuPerfil')}/>
      </TouchableOpacity>
    </View>
}
