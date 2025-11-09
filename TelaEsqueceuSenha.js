import React, { useState } from 'react';
import {  View,  Text,  TextInput,  TouchableOpacity,  Alert,  Image } from 'react-native';
import { firebase } from './firebaseConfig';
import styles from './Styles';


export default function TelaEsqueceuSenha({ navigation }) {
  const [email, setEmail] = useState('');

  const handleEnviar = () => {
    if (!email) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }

    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert(
          'Sucesso',
          `Enviamos um link de redefinição de senha para ${email}`
        );
      })
      .catch((error) => {
        let msg = 'Erro ao enviar link';
        if (error.code === 'auth/invalid-email') msg = 'Email inválido';
        else if (error.code === 'auth/user-not-found') msg = 'Usuário não encontrado';
        Alert.alert('Falha', msg);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerlogin}>
        <Image
          source={require('./assets/agendae.png')}
          style={styles.imagem}
        />
      </View>

      <View style={styles.container_texto}>
        <Text style={styles.texto_esqueceuSenha}>
          Um link será enviado para o seu email para você ter acesso à sua conta novamente.
        </Text>
      </View>

      <TextInput
        style={styles.input}
        value={email}
        placeholder="Email"
        placeholderTextColor="gray"
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.botao_cadastrar}>
        <TouchableOpacity onPress={handleEnviar}>
          <Text style={styles.texto_botao}>Enviar link</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linha} />

      <View style={styles.botao_entrar}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.texto_entrar}>Voltar ao login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
