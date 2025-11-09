import React, { useState } from 'react';
import { TextInput, StyleSheet, Text, View, Image, TouchableOpacity, Switch, Alert} from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import styles from './Styles';
import { auth } from './firebaseConfig'; 

export default function TelaLogin({ navigation }) {
  const [text_email, setText_email] = useState('');
  const [text_senha, setText_senha] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const handleLogin = () => {
    if (!text_email || !text_senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    auth.signInWithEmailAndPassword(text_email, text_senha)
      .then((userCredential) => {
        Alert.alert('Sucesso', `Bem-vindo, ${userCredential.user.email}`);
        navigation.navigate('MenuPrincipal');
      })
      .catch((error) => {
        let msg = 'Erro ao fazer login';
        if (error.code === 'auth/invalid-email') msg = 'Email inválido';
        else if (error.code === 'auth/user-not-found') msg = 'Usuário não encontrado';
        else if (error.code === 'auth/wrong-password') msg = 'Senha incorreta';
        Alert.alert('Falha no login', msg);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerlogin}>
        <Image style={styles.imagem} source={require('./assets/agendae.png')} />
      </View>

      <TextInput
        style={styles.input}
        value={text_email}
        placeholder="Email"
        placeholderTextColor="gray"
        onChangeText={setText_email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text_senha}
          placeholder="Senha"
          placeholderTextColor="gray"
          onChangeText={setText_senha}
          secureTextEntry={!isVisible}
        />

        <TouchableOpacity style={styles.olhinho} onPress={() => setIsVisible(!isVisible)}>
          <MaterialCommunityIcons
            name={isVisible ? "eye-outline" : "eye-off-outline"}
            size={25}
            color="#0006"
          />
        </TouchableOpacity>

        <Text style={styles.texto_entrar}> Manter logado? </Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>

      <Text
        style={[styles.texto_entrar, { textDecorationLine: 'underline' }]}
        onPress={() => navigation.navigate('EsqueceuSenha')}
      >
        Esqueceu a senha?
      </Text>

      <TouchableOpacity
        style={styles.botao_cadastrar}
        onPress = {handleLogin} 
      >
        <Text style={styles.texto_botao}> Entrar </Text>
      </TouchableOpacity>

      <View style={styles.linha}></View>

      <View style={styles.botao_entrar}>
        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.texto_entrar}> Não possui conta? Clique aqui </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
