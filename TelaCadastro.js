import {useState} from 'react';
import styles from './Styles';
import {TextInput, StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';

export default function TelaCadastro({navigation}) {
  const [text_nome, setText_nome] = useState('');
  const [text_email, setText_email] = useState('');
  const [text_senha, setText_senha] = useState('');
  const [text_ConfirmarSenha, setText_ConfirmarSenha] = useState('');

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
