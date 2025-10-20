import React, { useState } from "react";
import {View ,Text, TouchableOpacity ,TextInput, Alert,ScrollView,KeyboardAvoidingView,Platform,Modal,Button} from "react-native";
import styles from "./Styles";
import { MaterialCommunityIcons } from 'react-native-vector-icons' ;

export default function MeuPerfil({ initialData = {}, onSave, navigation }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialData.name ?? "Paulin bacana");
  const [email, setEmail] = useState(initialData.email ?? "paulinbacana@gmail.com");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSave = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      alert("Erro Digite o nome.");
      return;
    }
    if (!emailRegex.test(email)) {
     alert("Erro Digite um e-mail válido.");
      return;
    }

    const newData = { name: name.trim(), email: email.trim() };
    if (onSave) onSave(newData);
    console.log("Salvo:", newData);
    alert("Sucesso Informações salvas.");
    setEditing(false);
  };

  const handleCancel = () => {
    setName(initialData.name ?? name);
    setEmail(initialData.email ?? email);
    setEditing(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.containerMeuPerfil}>
    <Text style={styles.tituloMeuPerfil}>Meu Perfil</Text>
      <View style={styles.infoViewMeuPerfil}>
        <Text style={styles.tituloInfosMeuPerfil}>Nome</Text>
        {editing ? (
          <TextInput
            style={styles.inputMeuPerfil}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor="#8B93AA"
            returnKeyType="done"
          />
          ) : (
            <Text style={styles.textoInfoMeuPerfil}>{name}</Text>
          )}
        </View>

        <View style={styles.infoViewMeuPerfil}>
          <Text style={styles.tituloInfosMeuPerfil}>E-mail</Text>
          {editing ? (
            <TextInput
              style={styles.inputMeuPerfil}
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#8B93AA"
              returnKeyType="next"
            />
          ) : (
            <Text style={styles.textoInfoMeuPerfil}>{email}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.botaoMeuPerfil} >
          <Text style={styles.textoBotaoMeuPerfil}>Excluir Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoMeuPerfil} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.textoBotaoMeuPerfil}>Sair</Text>
        </TouchableOpacity>

        <View style={styles.viewBotaoMeuPerfil}>
          {editing ? (
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.botaoEditarMeuPerfil, styles.botaoSalvar]}
                onPress={handleSave}
              >
                <Text style={styles.textoBotaoEditarMeuPerfil}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoEditarMeuPerfil, styles.botaoCancelar]}
                onPress={handleCancel}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.botaoEditarMeuPerfil}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.textoBotaoEditarMeuPerfil}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.containerBotoesNavegacao}>

        <TouchableOpacity>
          <MaterialCommunityIcons name="home" size={30} color="#999999"/>
        </TouchableOpacity>

        <TouchableOpacity>
          <MaterialCommunityIcons name="file-document-outline" size={30} color="#999999" 
           onPress={() => navigation.navigate('CriarAtividade')}/>
        </TouchableOpacity>

        <TouchableOpacity>
          <MaterialCommunityIcons name="calendar-month" size={30} color="#999999"/>
        </TouchableOpacity>

        <TouchableOpacity>
          <MaterialCommunityIcons name="account" size={30} color="#ffffff"/>
        </TouchableOpacity>

        </View>

        <Modal  visible={isModalVisible}
        transparent = {true}
          onRequestClose={() => {setIsModalVisible(!isModalVisible);}}>
          <View style={styles.centeredView}>
            <View style = {styles.containerPopupMeuPerfil}>
            
            <Text style={styles.tituloSenhaMeuPerfil}> Confirme Sua Senha </Text>
            
            <TextInput
              style={styles.inputSenhaMeuPerfil}
              placeholder="Sua Senha"
              autoCapitalize="none"
              placeholderTextColor="#8B93AA"
              returnKeyType="next"
              secureTextEntry={true}
            />

            <TouchableOpacity
              style={styles.botaoEditarMeuPerfil}
              onPress={() => {setEditing(true); setIsModalVisible(!isModalVisible)}}>
              <Text style={styles.textoBotaoEditarMeuPerfil}>Confirmar</Text>
            </TouchableOpacity>

              <TouchableOpacity
              style={styles.botaoEditarMeuPerfil}
              onPress={() => setIsModalVisible(!isModalVisible)}>
              <Text style={styles.textoBotaoEditarMeuPerfil}>Fechar</Text>
            </TouchableOpacity>
          </View>
         </View>
        </Modal>

      </ScrollView>
 
  );
}
