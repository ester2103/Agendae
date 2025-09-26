import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import styles from './Styles';

export default function TelaLogo({navigation}) {
  return(
    <View style ={styles.container}>

    <View>
    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
    <Image style ={styles.containerlogo} source ={require('./assets/logo.png')} />
    </TouchableOpacity>
    </View>

    <View style ={styles.containeragendae}>
    <Image source ={require('./assets/agendae.png')} />
    </View>
    
    </View>
  );
}
