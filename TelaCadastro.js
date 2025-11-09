import React, { useState } from 'react';
import { TextInput, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import styles from './Styles';
import { auth } from './firebaseConfig';

export default function TelaCadastro({ navigation }) {
  const [textNome, setTextNome] = useState('');
  const [textEmail, setTextEmail] = useState('');
  const [textSenha, setTextSenha] = useState('');
  const [textConfirmarSenha, setTextConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const salvarUsuario = async () => {
    const nome = textNome.trim();
    const email = textEmail.trim().toLowerCase();
    const senha = textSenha;
    const confirmar = textConfirmarSenha;

    if (!nome || !email || !senha || !confirmar) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (senha !== confirmar) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
      if (userCredential.user && userCredential.user.updateProfile) {
        await userCredential.user.updateProfile({ displayName: nome });
      }
      Alert.alert('Sucesso', `Conta criada: ${userCredential.user.email}`);
      navigation.navigate('Login');
    } catch (error) {
      let msg = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') msg = 'Email já cadastrado';
      else if (error.code === 'auth/invalid-email') msg = 'Email inválido';
      else if (error.code === 'auth/weak-password') msg = 'Senha muito fraca';
      Alert.alert('Falha no cadastro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.imagem} source={require('./assets/agendae.png')} />
      <View style={styles.linha} />
      <View style={styles.containerinput}>
        <Text style={styles.texto_padrao}> Nome </Text>
        <TextInput
          style={styles.input}
          value={textNome}
          onChangeText={setTextNome}
          placeholder="Seu nome"
          autoCapitalize="words"
        />
        <Text style={styles.texto_padrao}> E-mail </Text>
        <TextInput
          style={styles.input}
          value={textEmail}
          onChangeText={setTextEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="seu@exemplo.com"
        />
        <Text style={styles.texto_padrao}> Senha </Text>
        <TextInput
          style={styles.input}
          value={textSenha}
          onChangeText={setTextSenha}
          secureTextEntry
          placeholder="Senha"
        />
        <Text style={styles.texto_padrao}> Confirme sua senha </Text>
        <TextInput
          style={styles.input}
          value={textConfirmarSenha}
          onChangeText={setTextConfirmarSenha}
          secureTextEntry
          placeholder="Repita a senha"
        />
      </View>

      <View style={styles.botao_cadastrar}>
        <TouchableOpacity
          style={styles.botao_cadastrar}
          onPress={salvarUsuario}
          disabled={loading}
        >
          {loading ? <ActivityIndicator /> : <Text style={styles.texto_botao}> Cadastrar </Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.botao_entrar}>
        <TouchableOpacity style={styles.botao_entrar} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.texto_entrar}> Já possui uma conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
