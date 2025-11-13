import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import styles from './Styles';

export default function TelaLogo({ navigation }) {
  useEffect(() => {
    // Aguarda 3 segundos e vai para Login
    const timer = setTimeout(() => {
      navigation.replace('Login'); // replace evita voltar pra logo com "voltar"
    }, 3000);

    // Limpa o timer se o componente desmontar
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View>
        <Image
          style={styles.containerlogo}
          source={require('./assets/logo.png')}
        />
      </View>

      <View style={styles.containeragendae}>
        <Image
          style={styles.imagemLogo}
          source={require('./assets/agendae.png')}
        />
      </View>
    </View>
  );
}
