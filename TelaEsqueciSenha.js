import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";


import logoImage from "./assets/logo.png";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");

  const handleEnviar = () => {
    Alert.alert("Código enviado", `Enviamos um código para ${email}`);
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={logoImage}
          style={styles.logo}
          resizeMode="contain" // mantém a proporção
        />
        
      </View>

      
      <Text style={styles.subtitle}>
        Digite seu e-mail para receber o link de redefinição de senha
      </Text>

      
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Botão Enviar */}
      <TouchableOpacity style={styles.button} onPress={handleEnviar}>
        <Text style={styles.buttonText}>Enviar link</Text>
      </TouchableOpacity>

      {/* Link Voltar */}
      <TouchableOpacity>
        <Text style={styles.linkText}>Voltar para o login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001942", 
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  
  logo: {
    width: 250,  
    height: 120, 
    marginBottom: 10,
    
  },
  title: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0052CC", 
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
