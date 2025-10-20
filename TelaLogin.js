import {TextInput, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {useState} from 'react';
import styles from './Styles';

export default function TelaLogin({navigation}) {
  const [text_email, setText_email] = useState('');
  const [text_senha, setText_senha] = useState('');

  const handleLogin = () => {
    if (!text_email || !text_senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    auth.signInWithEmailAndPassword(text_email, text_senha)
      .then((userCredential) => {
        Alert.alert('Sucesso', `Bem-vindo, ${userCredential.user.email}`);
        navigation.navigate('Home'); // redireciona para a tela inicial
      })
      .catch((error) => {
        let msg = 'Erro ao fazer login';
        if (error.code === 'auth/invalid-email') msg = 'Email inválido';
        else if (error.code === 'auth/user-not-found') msg = 'Usuário não encontrado';
        else if (error.code === 'auth/wrong-password') msg = 'Senha incorreta';
        Alert.alert('Falha no login', msg);
      });
  };

  return(
    <View style ={styles.container}>

    <View style ={styles.containerlogin}>
    <Image style ={styles.imagem} source ={require('./assets/agendae.png')} />
    </View>

    <TextInput style ={styles.input} value={text_email} placeholder="Email" 
    placeholderTextColor = "gray" onChangeText={setText_email} />

    <TextInput style ={styles.input} value={text_senha} placeholder="Senha" 
    placeholderTextColor = "gray" onChangeText={setText_senha} />

    <View style ={styles.botao_cadastrar}>

    <TouchableOpacity style ={styles.botao_cadastrar} 
    onPress={() => navigation.navigate('')}>
    <Text style ={styles.texto_botao}> Entrar </Text>
    </TouchableOpacity>

    </View>

    <View style ={styles.linha}></View>

    <View style ={styles.botao_entrar}>

    <TouchableOpacity style ={styles.botao_entrar}
    onPress={() => navigation.navigate('Cadastro')}>
    <Text style ={styles.texto_entrar}> Não possui conta? Clique aqui </Text>
    </TouchableOpacity>

    </View>

    </View>
  );
}
