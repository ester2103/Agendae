import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import styles from "./Styles";
import { auth, db, firebase } from "./firebaseConfig";

export default function MeuPerfil({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // perfil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // estados iniciais (para restaurar em cancelar)
  const [initialName, setInitialName] = useState("");
  const [initialEmail, setInitialEmail] = useState("");

  // modal de confirmação de senha para edição / exclusão
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalPassword, setModalPassword] = useState("");
  const [reauthenticating, setReauthenticating] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        // se não estiver logado, redireciona
        navigation.replace("Login");
        return;
      }

      try {
        // tenta obter o doc do usuário em Firestore (coleção 'users')
        const docRef = db.collection("users").doc(user.uid);
        const doc = await docRef.get();
        if (doc.exists) {
          const data = doc.data();
          if (!mounted) return;
          setName(data.name ?? user.displayName ?? "");
          setEmail(data.email ?? user.email ?? "");
          setInitialName(data.name ?? user.displayName ?? "");
          setInitialEmail(data.email ?? user.email ?? "");
        } else {
          // se não houver doc, preenche com dados do auth
          if (!mounted) return;
          setName(user.displayName ?? "");
          setEmail(user.email ?? "");
          setInitialName(user.displayName ?? "");
          setInitialEmail(user.email ?? "");
        }
      } catch (err) {
        console.error("[loadProfile]", err);
        Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  // reautentica o usuário com o email atual e a senha fornecida
  const reauthenticate = async (password) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");

    const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
    // compat: user.reauthenticateWithCredential
    return user.reauthenticateWithCredential(credential);
  };

  // chamada ao confirmar a senha no modal -> permite edição
  const handleConfirmPasswordForEdit = async () => {
    if (!modalPassword) {
      Alert.alert("Erro", "Digite sua senha para confirmar.");
      return;
    }
    setReauthenticating(true);
    try {
      await reauthenticate(modalPassword);
      setIsModalVisible(false);
      setModalPassword("");
      setEditing(true);
      Alert.alert("Pronto", "Você pode editar suas informações.");
    } catch (err) {
      console.error("[reauth edit]", err);
      Alert.alert("Erro", "Senha incorreta. Tente novamente.");
    } finally {
      setReauthenticating(false);
    }
  };

  // salvar alterações (atualiza Firestore e Auth se necessário)
  const handleSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      Alert.alert("Erro", "Digite o nome.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Erro", "Digite um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setLoading(false);
        return;
      }

      // se o e-mail mudou, precisamos chamar updateEmail (requer login recente)
      const emailChanged = email.trim() !== initialEmail;
      const displayNameChanged = name.trim() !== initialName;

      // Atualiza Firestore primeiro
      const userDocRef = db.collection("users").doc(user.uid);
      await userDocRef.set(
        {
          name: name.trim(),
          email: email.trim(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Atualiza Auth (email e displayName) — pode lançar se reauth for necessário
      if (emailChanged) {
        try {
          await user.updateEmail(email.trim());
        } catch (err) {
          // se falhar por necessidade de reauth, informar o usuário e pedir reautenticação
          console.error("[updateEmail]", err);
          if (err.code === "auth/requires-recent-login") {
            Alert.alert(
              "Atenção",
              "Por segurança, confirme sua senha novamente para alterar o e-mail."
            );
            // abrir modal pra reauth; ao confirmar, tentamos novamente atualizar o e-mail
            setIsModalVisible(true);
            // preserva edição aberta
            setEditing(true);
            setLoading(false);
            return;
          } else {
            throw err;
          }
        }
      }

      if (displayNameChanged) {
        try {
          await user.updateProfile({ displayName: name.trim() });
        } catch (err) {
          console.warn("Falha ao atualizar displayName no Auth:", err);
          // não é crítico; já atualizamos Firestore
        }
      }

      // atualiza os "inicias" para a próxima edição
      setInitialName(name.trim());
      setInitialEmail(email.trim());

      Alert.alert("Sucesso", "Informações salvas.");
      setEditing(false);
    } catch (err) {
      console.error("[handleSave]", err);
      Alert.alert("Erro", "Não foi possível salvar as informações.");
    } finally {
      setLoading(false);
    }
  };

  // cancelar edição — restaura campos para valores iniciais
  const handleCancel = () => {
    setName(initialName);
    setEmail(initialEmail);
    setEditing(false);
  };

  // exclusão de conta (pede confirmação, reautentica e exclui)
  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir conta",
      "Tem certeza que deseja excluir sua conta? Essa ação é irreversível.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            // pede senha no modal para reauth e exclusão
            setIsModalVisible(true);
            // vamos usar a mesma modal de senha; após confirmar, chamamos fluxo de exclusão
            // armazenamos uma flag para saber que a intenção é excluir ao invés de editar
            // simplificação: guardamos a intenção em uma variável no estado
            setIntent("delete");
          },
        },
      ]
    );
  };

  // estado para indicar intenção do modal: 'edit' | 'delete' | null
  const [intent, setIntent] = useState(null);

  // Confirmar senha no modal: decide se é para permitir edição (intent==='edit') ou excluir (intent==='delete')
  const handleConfirmPassword = async () => {
    if (!modalPassword) {
      Alert.alert("Erro", "Digite sua senha para confirmar.");
      return;
    }
    setReauthenticating(true);
    try {
      await reauthenticate(modalPassword);

      // se intent === 'delete' => prosseguir com exclusão
      if (intent === "delete") {
        // excluir dados do Firestore (doc do usuário) e deletar user
        const user = auth.currentUser;
        try {
          // remove doc do usuário
          await db.collection("users").doc(user.uid).delete();
        } catch (err) {
          console.warn("[delete user doc]", err);
          // não interromper: tentaremos excluir a conta Auth mesmo se o doc falhar
        }
        try {
          await user.delete();
        } catch (err) {
          console.error("[delete user]", err);
          Alert.alert("Erro", "Não foi possível excluir a conta. Tente novamente.");
          setReauthenticating(false);
          setModalPassword("");
          setIsModalVisible(false);
          setIntent(null);
          return;
        }

        Alert.alert("Conta excluída", "Sua conta foi excluída com sucesso.");
        setIsModalVisible(false);
        setIntent(null);
        setModalPassword("");
        // redireciona para tela de login
        navigation.replace("Login");
        return;
      }

      // se intent === 'edit' ou null (pelo fluxo de edição)
      if (intent === "edit" || intent === null) {
        setIsModalVisible(false);
        setModalPassword("");
        setIntent(null);
        setEditing(true);
        Alert.alert("Autenticado", "Agora você pode editar suas informações.");
      }
    } catch (err) {
      console.error("[handleConfirmPassword]", err);
      Alert.alert("Erro", "Senha incorreta. Tente novamente.");
    } finally {
      setReauthenticating(false);
    }
  };

  // logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("Login");
    } catch (err) {
      console.error("[handleLogout]", err);
      Alert.alert("Erro", "Não foi possível sair.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.containerMeuPerfil, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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

      <TouchableOpacity
        style={styles.botaoMeuPerfil}
        onPress={() => {
          // ao excluir conta vamos abrir modal pedindo senha (intent 'delete')
          Alert.alert(
            "Excluir Conta",
            "Deseja realmente excluir sua conta? Isso apagará seus dados.",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Excluir",
                style: "destructive",
                onPress: () => {
                  setIntent("delete");
                  setIsModalVisible(true);
                },
              },
            ]
          );
        }}
      >
        <Text style={styles.textoBotaoMeuPerfil}>Excluir Conta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoMeuPerfil} onPress={handleLogout}>
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
            onPress={() => {
              // abrir modal pedindo senha com intenção 'edit'
              setIntent("edit");
              setIsModalVisible(true);
            }}
          >
            <Text style={styles.textoBotaoEditarMeuPerfil}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.containerBotoesNavegacao}>
        <TouchableOpacity onPress={() => navigation.navigate("MenuPrincipal")}>
          <MaterialCommunityIcons name="home" size={30} color="#999999" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Atividades")}>
          <MaterialCommunityIcons name="file-document-outline" size={30} color="#999999" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Calendario")}>
          <MaterialCommunityIcons name="calendar-month" size={30} color="#999999" />
        </TouchableOpacity>

        <TouchableOpacity>
          <MaterialCommunityIcons name="account" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setModalPassword("");
          setIntent(null);
        }}
        animationType="fade"
      >
        <View style={styles.centeredView}>
          <View style={styles.containerPopupMeuPerfil}>
            <Text style={styles.tituloSenhaMeuPerfil}>Confirme Sua Senha</Text>

            <TextInput
              style={styles.inputSenhaMeuPerfil}
              placeholder="Sua senha"
              autoCapitalize="none"
              placeholderTextColor="#8B93AA"
              returnKeyType="done"
              secureTextEntry={true}
              value={modalPassword}
              onChangeText={setModalPassword}
            />

            <TouchableOpacity
              style={styles.botaoEditarMeuPerfil}
              onPress={
                intent === "delete"
                  ? handleConfirmPassword // same confirm handler handles delete when intent==='delete'
                  : handleConfirmPassword
              }
              disabled={reauthenticating}
            >
              {reauthenticating ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.textoBotaoEditarMeuPerfil}>
                  {intent === "delete" ? "Confirmar exclusão" : "Confirmar"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoEditarMeuPerfil}
              onPress={() => {
                setIsModalVisible(false);
                setModalPassword("");
                setIntent(null);
              }}
              disabled={reauthenticating}
            >
              <Text style={styles.textoBotaoEditarMeuPerfil}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
