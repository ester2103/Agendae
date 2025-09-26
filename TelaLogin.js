import {TextInput, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {useState} from 'react';
import styles from './Styles';

export default function TelaLogin({navigation}) {
  const [text_email, setText_email] = useState('');
  const [text_senha, setText_senha] = useState('');

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
