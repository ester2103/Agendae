import {useState} from 'react';
import styles from './Styles';
import {TextInput, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';

export default function TelaCadastro({navigation}) {
  const [text_nome, setText_nome] = useState('');
  const [text_email, setText_email] = useState('');
  const [text_senha, setText_senha] = useState('');
  const [text_ConfirmarSenha, setText_ConfirmarSenha] = useState('');

  const handleCadastro = () => {
    if (!text_nome || !text_email || !text_senha || !text_ConfirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (text_senha !== text_ConfirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    auth.createUserWithEmailAndPassword(text_email, text_senha)
      .then((userCredential) => {
        Alert.alert('Sucesso', `Conta criada: ${userCredential.user.email}`);
        navigation.navigate('Login');
      })
      .catch((error) => {
        let msg = 'Erro ao criar conta';
        if (error.code === 'auth/email-already-in-use') msg = 'Email já cadastrado';
        else if (error.code === 'auth/invalid-email') msg = 'Email inválido';
        else if (error.code === 'auth/weak-password') msg = 'Senha muito fraca';
        Alert.alert('Falha no cadastro', msg);
      });
  };

  return(
    <View style ={styles.container}>
    <Image style ={styles.imagem} source={require('./assets/agendae.png')} />

    <View style ={styles.linha}></View>

    <View style ={styles.containerinput}>
    <Text style={styles.texto_padrao}> Nome </Text>
    <TextInput style={styles.input} value={text_nome} onChangeText={setText_nome} />
        
    <Text style={styles.texto_padrao}> E-mail </Text>
    <TextInput style={styles.input} value={text_email} onChangeText={setText_email} />
        
    <Text style={styles.texto_padrao}> Senha </Text>
    <TextInput style={styles.input} value={text_senha} onChangeText={setText_senha} />
        
    <Text style={styles.texto_padrao}> Confirme sua senha </Text>
    <TextInput style={styles.input} value={text_ConfirmarSenha}
    onChangeText={setText_ConfirmarSenha} />

    </View>

    <View style ={styles.botao_cadastrar}>
    <TouchableOpacity style ={styles.botao_cadastrar}>
    <Text style ={styles.texto_botao}> Cadastrar </Text>
    </TouchableOpacity>
    </View>

    <View style={styles.botao_entrar}>
    <TouchableOpacity style ={styles.botao_entrar}
    onPress={() => navigation.navigate('Login')}>
    <Text style={styles.texto_entrar}> Já possui uma conta? Entrar</Text>
    </TouchableOpacity>
    </View>

    </View>
  );
}
