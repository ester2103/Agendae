import { Card } from 'react-native-paper';
import React, { useState } from 'react';
import { Image, View, TextInput, Text, Linking, TouchableOpacity } from 'react-native';
import styles from './Styles'
import { auth } from './firebaseConfig'; 


function TelaEsqueceuSenha({navigation}) {

const [text_email, setText_email] = useState('');
const [text_senha, setText_senha] = useState('');

 const handleEnviar = () => {
    if (!email) {
      Alert.alert("Atenção", "Digite seu e-mail.");
      return;
    }

    auth.sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert(
          "Sucesso",
          `Enviamos um link de redefinição de senha para ${email}`
        );
      })
      .catch((error) => {
        let msg = "Erro ao enviar link";
        if (error.code === "auth/invalid-email") msg = "Email inválido";
        else if (error.code === "auth/user-not-found") msg = "Usuário não encontrado";
        Alert.alert("Falha", msg);
      });
  };
  

  return (
    <View style={styles.container}>

    <View style={styles.containerlogin}>
      <Image style={styles.imagem} source={require('/assets/agendae.png')}/>
    </View>

    <View style={styles.container_texto}>
      <Text style={styles.texto_esqueceuSenha}>Um link será enviado para o seu email para você ter acesso à sua conta novamente.</Text>
    </View>

        <TextInput
        style={styles.input}
        value={text_email}
        placeholder="Email"
        placeholderTextColor = 'gray'
        onChangeText={setText_email}/>

      <View style={styles.botao_cadastrar}>
        <TouchableOpacity style={styles.botao_cadastrar} onPress={() => navigation.navigate('')}>
          <Text style={styles.texto_botao}>Enviar link</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linha}></View>

      <View style={styles.botao_entrar}>
        <TouchableOpacity style={styles.botao_entrar} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.texto_entrar}>Voltar ao login</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}

export default TelaEsqueceuSenha;
