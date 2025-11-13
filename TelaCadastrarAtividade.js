import React, { useState, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './Styles';
import { auth, db, firebase } from './firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { schedulePushNotification } from './notifications.js';

export default function TelaCadastrarAtividade({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('');

  const [dataEntregaStr, setDataEntregaStr] = useState('');
  const [horaEntregaStr, setHoraEntregaStr] = useState('');
  const [dueDate, setDueDate] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tmpDate, setTmpDate] = useState(new Date());

  const [rem1Enabled, setRem1Enabled] = useState(false);
  const [rem1Type, setRem1Type] = useState('hours');
  const [rem1Value, setRem1Value] = useState(1);

  const [rem2Enabled, setRem2Enabled] = useState(false);
  const [rem2Type, setRem2Type] = useState('hours');
  const [rem2Value, setRem2Value] = useState(2);

  const [lembrete1, setlembrete1] = useState('');
  const [lembrete2, setlembrete2] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  // attachments: { uri, name, mimeType, type: 'image'|'file', base64? }
  const [attachments, setAttachments] = useState([]);

  const route = useRoute();

  useEffect(() => {
    if (route.params?.selectedDate) {
      const selected = new Date(route.params.selectedDate);
      selected.setHours(0, 0, 0, 0);
      setDueDate(selected);
      setDataEntregaStr(formatDate(selected));
      setHoraEntregaStr('');
    }
  }, [route.params?.selectedDate]);

  // ----------------- Helpers -----------------
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${min}`;
  };

  const uriToBlob = async (uri) => {
    // iOS-friendly para file://; ph:// geralmente não é legível por fetch
    const res = await fetch(uri);
    const blob = await res.blob();
    return blob;
  };

  const guessExtFromMime = (mime) => {
    if (!mime) return '';
    const map = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/zip': 'zip',
    };
    return map[mime] || '';
  };

  const ensureFileName = (name, mime) => {
    if (name && name.trim().length > 0) return name;
    const ext = guessExtFromMime(mime);
    return `arquivo_${Date.now()}${ext ? '.' + ext : ''}`;
  };

  const sanitizeName = (name) => {
    return encodeURIComponent(name.replace(/[\/\\]+/g, '_').trim());
  };

  // ----------------- Pickers -----------------
  // Função robusta: cobre APIs antigas/novas do expo-image-picker e usa base64 (iOS-proof)
  const pickImage = async () => {
    // 1) Permissão
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      console.warn('[image-picker] permissão negada');
      return;
    }

    // 2) Descobrir constante disponível (SDKs variam)
    const mediaImages =
      (ImagePicker.MediaType && ImagePicker.MediaType.Images) ||
      (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images) ||
      undefined;

    const pickerOptionsBase = {
      quality: 0.9,
      base64: true, // chave para iOS (evita ph://)
      exif: false,
    };

    let result;
    try {
      // Algumas versões aceitam valor único...
      result = await ImagePicker.launchImageLibraryAsync({
        ...pickerOptionsBase,
        mediaTypes: mediaImages ?? undefined,
      });
    } catch {
      // ...outras exigem array
      result = await ImagePicker.launchImageLibraryAsync({
        ...pickerOptionsBase,
        mediaTypes: mediaImages ? [mediaImages] : undefined,
      });
    }

    if (!result || result.canceled) return;

    const asset = Array.isArray(result.assets) ? result.assets[0] : null;
    if (!asset) {
      console.warn('[image-picker] nenhum asset retornado');
      return;
    }

    const mimeType = asset.mimeType || 'image/jpeg';
    const name = ensureFileName(asset.fileName, mimeType);

    setAttachments((prev) => [
      ...prev,
      {
        uri: asset.uri,
        name,
        mimeType,
        type: 'image',
        base64: asset.base64 || null, // usado no upload com putString
      },
    ]);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const file = result.assets?.[0];
    if (!file) return;

    const mimeType = file.mimeType || 'application/octet-stream';
    const name = ensureFileName(file.name, mimeType);

    setAttachments((prev) => [
      ...prev,
      { uri: file.uri, name, mimeType, type: 'file' },
    ]);
  };

  const handleAddMedia = () => {
    Alert.alert('Adicionar mídia', 'Escolha o tipo de anexo', [
      { text: 'Imagem da galeria', onPress: pickImage },
      { text: 'Documento (PDF, DOCX, etc.)', onPress: pickDocument },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // ----------------- Upload -----------------
  const uploadAllAttachments = async (uid, atividadeId) => {
    if (attachments.length === 0) return [];
    setUploading(true);

    const uploaded = [];
    const storage = firebase.storage();

    for (const item of attachments) {
      try {
        const safeName = sanitizeName(item.name || `arquivo_${Date.now()}`);
        const path = `users/${uid}/atividades/${atividadeId}/${safeName}`;
        const ref = storage.ref().child(path);
        const metadata = {
          contentType: item.mimeType || 'application/octet-stream',
          cacheControl: 'public,max-age=3600',
        };

        if (item.type === 'image' && item.base64) {
          // iOS-proof: envia direto o base64
          await ref.putString(item.base64, 'base64', metadata);
        } else {
          const blob = await uriToBlob(item.uri);
          const size = blob.size ?? 0;
          if (!size || size <= 0) {
            console.warn('[upload] Blob vazio para', item.uri);
            throw new Error('Arquivo inválido (tamanho 0).');
          }
          await ref.put(blob, metadata);
          if (typeof blob.close === 'function') {
            try { blob.close(); } catch {}
          }
        }

        const url = await ref.getDownloadURL();
        uploaded.push({
          name: safeName,
          mimeType: metadata.contentType,
          type: item.type,
          downloadURL: url,
          fullPath: path,
        });
      } catch (e) {
        console.error('[enviar anexos] Falhou:', {
          name: item?.name, mime: item?.mimeType, uri: item?.uri, error: String(e)
        });
        // Sem Alert, conforme solicitado
      }
    }

    setUploading(false);
    return uploaded;
  };

  // ----------------- Lembretes -----------------
  const calcularReminderDate = (baseDate, type, value) => {
    if (!baseDate) return null;
    const d = new Date(baseDate);
    if (type === 'hours') d.setHours(d.getHours() - Number(value));
    else d.setDate(d.getDate() - Number(value));
    return d;
  };

  // ----------------- Salvar -----------------
  const salvarAtividade = async () => {
    const tituloTrim = titulo.trim();
    const descricaoTrim = descricao.trim();

    if (!tituloTrim || !descricaoTrim || !tipo || !dueDate) {
      Alert.alert('Atenção', 'Preencha todos os campos (incluindo data e horário).');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        setLoading(false);
        return;
      }

      const now = new Date();

      let lembrete1Obj = null;
      let lembrete2Obj = null;

      if (rem1Enabled) {
        const r1 = calcularReminderDate(dueDate, rem1Type, rem1Value);
        if (!r1 || r1 <= now) {
          Alert.alert('Lembrete 1 inválido', 'Escolha um horário anterior à entrega.');
          setLoading(false);
          return;
        }
        const id1 = await schedulePushNotification(`Lembrete: ${tituloTrim}`, descricaoTrim, r1);
        lembrete1Obj = {
          enabled: true,
          type: rem1Type,
          value: Number(rem1Value),
          reminderAt: firebase.firestore.Timestamp.fromDate(r1),
          display: rem1Type === 'hours' ? `${rem1Value} hora(s) antes` : `${rem1Value} dia(s) antes`,
          notificationId: id1,
        };
      }

      if (rem2Enabled) {
        const r2 = calcularReminderDate(dueDate, rem2Type, rem2Value);
        if (!r2 || r2 <= now) {
          Alert.alert('Lembrete 2 inválido', 'Escolha um horário anterior à entrega.');
          setLoading(false);
          return;
        }
        const id2 = await schedulePushNotification(`Lembrete: ${tituloTrim}`, descricaoTrim, r2);
        lembrete2Obj = {
          enabled: true,
          type: rem2Type,
          value: Number(rem2Value),
          reminderAt: firebase.firestore.Timestamp.fromDate(r2),
          display: rem2Type === 'hours' ? `${rem2Value} hora(s) antes` : `${rem2Value} dia(s) antes`,
          notificationId: id2,
        };
      }

      // cria doc para obter ID
      const colRef = db.collection('users').doc(user.uid).collection('atividades');
      const docRef = colRef.doc();

      const baseAtividade = {
        titulo: tituloTrim,
        descricao: descricaoTrim,
        tipo,
        data: new Date().toISOString(),
        dataEntrega: dataEntregaStr,
        horaEntrega: horaEntregaStr,
        dueDateTimestamp: firebase.firestore.Timestamp.fromDate(dueDate),
        lembrete1: lembrete1Obj,
        lembrete2: lembrete2Obj,
        lembrete1Text: lembrete1,
        lembrete2Text: lembrete2,
        completed: false,
        completedAt: null,
        createdBy: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        attachments: [],
      };

      await docRef.set(baseAtividade);

      // upload anexos (sem Alert em caso de falha)
      let uploaded = [];
      try {
        uploaded = await uploadAllAttachments(user.uid, docRef.id);
      } catch (e) {
        console.error('[upload attachments]', e);
      }

      if (uploaded.length > 0) {
        await docRef.update({ attachments: uploaded });
      }

      // reset
      setTitulo('');
      setDescricao('');
      setTipo('');
      setDataEntregaStr('');
      setHoraEntregaStr('');
      setDueDate(null);
      setRem1Enabled(false); setRem1Type('hours'); setRem1Value(1);
      setRem2Enabled(false); setRem2Type('hours'); setRem2Value(2);
      setlembrete1(''); setlembrete2('');
      setAttachments([]);

      Alert.alert('Sucesso', 'Atividade salva com sucesso.');
    } catch (error) {
      console.error('[salvarAtividade]', error);
      Alert.alert('Erro', 'Erro ao salvar atividade. Veja o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Render -----------------
  const renderAttachmentItem = ({ item, index }) => (
    <View style={estilos.attachmentItem}>
      <MaterialCommunityIcons
        name={item.type === 'image' ? 'image-outline' : 'paperclip'}
        size={18}
        color="#00347E"
      />
      <Text style={estilos.attachmentText} numberOfLines={1}>
        {item.name}
      </Text>
      <TouchableOpacity
        onPress={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
        style={estilos.removeAttachmentBtn}
        accessibilityRole="button"
        accessibilityLabel={`Remover ${item.name}`}
      >
        <MaterialCommunityIcons name="close" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={estilos.containerNovaAtividade}>
      <ScrollView contentContainerStyle={estilos.scrollContainer}>
        <View style={estilos.cardCinza}>
          <View style={estilos.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#004AAD" />
            </TouchableOpacity>
            <Text style={estilos.headerTitle}>Nova Atividade</Text>
            <TouchableOpacity
              style={estilos.botaoSalvar}
              onPress={salvarAtividade}
              disabled={loading || uploading}
              accessibilityRole="button"
            >
              {loading || uploading ? <ActivityIndicator color="#fff" /> : (
                <Text style={estilos.textoBotaoSalvar}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={estilos.cardBranco}>
            <TextInput
              placeholder="Título"
              placeholderTextColor="#666"
              style={estilos.input}
              value={titulo}
              onChangeText={setTitulo}
            />

            <TextInput
              placeholder="Descrição"
              placeholderTextColor="#666"
              style={[estilos.input, estilos.descricao]}
              multiline
              value={descricao}
              onChangeText={setDescricao}
            />

            <View style={estilos.radioContainer}>
              {['Atividade','Trabalho','Prova'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={estilos.radioItem}
                  onPress={() => setTipo(item)}
                >
                  <MaterialCommunityIcons
                    name={tipo === item ? 'circle-slice-8' : 'circle-outline'}
                    size={20}
                    color="#00347E"
                  />
                  <Text style={estilos.radioLabel}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={estilos.cardBranco}>
            <View style={estilos.linhaInfo}>
              <Text style={estilos.label}>Data:</Text>
              <TouchableOpacity
                style={[estilos.info, { justifyContent: 'center' }]}
                onPress={() => {
                  setTmpDate(dueDate || new Date());
                  setShowDatePicker(true);
                }}
              >
                <Text>{dataEntregaStr || 'Selecione a data'}</Text>
              </TouchableOpacity>
            </View>

            <View style={estilos.linhaInfo}>
              <Text style={estilos.label}>Horário:</Text>
              <TouchableOpacity
                style={[estilos.info, { justifyContent: 'center' }]}
                onPress={() => {
                  setTmpDate(dueDate || new Date());
                  setShowTimePicker(true);
                }}
              >
                <Text>{horaEntregaStr || 'Selecione o horário'}</Text>
              </TouchableOpacity>
            </View>

            {/* Lembrete 1 */}
            <View style={[estilos.cardBranco, { padding: 10, marginTop: 10 }]}>
              <View style={estilos.linhaInfo}>
                <Text style={estilos.label}>Lembrete 1:</Text>
                <TouchableOpacity onPress={() => setRem1Enabled(!rem1Enabled)}>
                  <Text>{rem1Enabled ? 'Ativado' : 'Desativado'}</Text>
                </TouchableOpacity>
              </View>

              {rem1Enabled && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ marginBottom: 6 }}>Tipo:</Text>
                  <Picker selectedValue={rem1Type} onValueChange={(v) => setRem1Type(v)}>
                    <Picker.Item label="Horas antes" value="hours" />
                    <Picker.Item label="Dias antes" value="days" />
                  </Picker>

                  <Text style={{ marginTop: 8, marginBottom: 6 }}>
                    Quantos {rem1Type === 'hours' ? 'horas' : 'dias'} antes?
                  </Text>
                  <Picker selectedValue={rem1Value} onValueChange={(v) => setRem1Value(Number(v))}>
                    {rem1Type === 'hours'
                      ? Array.from({ length: 23 }, (_, i) => i + 1).map((n) => (
                          <Picker.Item key={n} label={`${n} hora(s)`} value={n} />
                        ))
                      : Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                          <Picker.Item key={n} label={`${n} dia(s)`} value={n} />
                        ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Lembrete 2 */}
            <View style={[estilos.cardBranco, { padding: 10, marginTop: 10 }]}>
              <View style={estilos.linhaInfo}>
                <Text style={estilos.label}>Lembrete 2:</Text>
                <TouchableOpacity onPress={() => setRem2Enabled(!rem2Enabled)}>
                  <Text>{rem2Enabled ? 'Ativado' : 'Desativado'}</Text>
                </TouchableOpacity>
              </View>

              {rem2Enabled && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ marginBottom: 6 }}>Tipo:</Text>
                  <Picker selectedValue={rem2Type} onValueChange={(v) => setRem2Type(v)}>
                    <Picker.Item label="Horas antes" value="hours" />
                    <Picker.Item label="Dias antes" value="days" />
                  </Picker>

                  <Text style={{ marginTop: 8, marginBottom: 6 }}>
                    Quantos {rem2Type === 'hours' ? 'horas' : 'dias'} antes?
                  </Text>
                  <Picker selectedValue={rem2Value} onValueChange={(v) => setRem2Value(Number(v))}>
                    {rem2Type === 'hours'
                      ? Array.from({ length: 23 }, (_, i) => i + 1).map((n) => (
                          <Picker.Item key={n} label={`${n} hora(s)`} value={n} />
                        ))
                      : Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                          <Picker.Item key={n} label={`${n} dia(s)`} value={n} />
                        ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Lista de anexos */}
            {attachments.length > 0 && (
              <View style={[estilos.cardBranco, { marginTop: 10 }]}>
                <Text style={[estilos.label, { marginBottom: 8 }]}>Anexos selecionados:</Text>
                <FlatList
                  data={attachments}
                  keyExtractor={(_, idx) => String(idx)}
                  renderItem={renderAttachmentItem}
                />
              </View>
            )}
          </View>

          <TouchableOpacity onPress={handleAddMedia}>
            <Text style={estilos.linkMidia}>Adicionar mídia</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer de navegação */}
      <View style={[styles.containerBotoesNavegacao, { zIndex: 10, backgroundColor: '#001c44' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('MenuPrincipal')}>
          <MaterialCommunityIcons name="home" size={30} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Atividades')}>
          <MaterialCommunityIcons name="file-document-outline" size={30} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
          <MaterialCommunityIcons name="calendar-month" size={30} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MeuPerfil')}>
          <MaterialCommunityIcons name="account" size={30} color="#999999" />
        </TouchableOpacity>
      </View>

      {/* ----------- MODAL: Data ----------- */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={estilos.modalBackdrop}>
          <View style={estilos.modalCard}>
            <Text style={estilos.modalTitle}>Selecionar data</Text>
            <DateTimePicker
              value={tmpDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={(_, selected) => {
                if (selected) setTmpDate(selected);
              }}
            />
            <View style={estilos.modalActions}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={[estilos.btn, estilos.btnGhost]}
              >
                <Text style={estilos.btnTextGhost}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const newDue = new Date(tmpDate);
                  if (dueDate) newDue.setHours(dueDate.getHours(), dueDate.getMinutes(), 0, 0);
                  setDueDate(newDue);
                  setDataEntregaStr(formatDate(newDue));
                  setShowDatePicker(false);
                }}
                style={[estilos.btn, estilos.btnPrimary]}
              >
                <Text style={estilos.btnTextPrimary}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ----------- MODAL: Horário ----------- */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={estilos.modalBackdrop}>
          <View style={estilos.modalCard}>
            <Text style={estilos.modalTitle}>Selecionar horário</Text>
            <DateTimePicker
              value={tmpDate}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
              onChange={(_, selected) => {
                if (selected) setTmpDate(selected);
              }}
            />
            <View style={estilos.modalActions}>
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={[estilos.btn, estilos.btnGhost]}
              >
                <Text style={estilos.btnTextGhost}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const base = dueDate ? new Date(dueDate) : new Date();
                  base.setHours(tmpDate.getHours(), tmpDate.getMinutes(), 0, 0);
                  setDueDate(base);
                  setHoraEntregaStr(formatTime(base));
                  setShowTimePicker(false);
                }}
                style={[estilos.btn, estilos.btnPrimary]}
              >
                <Text style={estilos.btnTextPrimary}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  containerNovaAtividade: { flex: 1, backgroundColor: '#001c44', alignItems: 'stretch', paddingTop: 25 },
  header: { flexDirection: 'row', alignItems: 'center', width: '90%', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { color: '#004AAD', fontSize: 20, fontWeight: 'bold' },
  scrollContainer: { alignItems: 'center', paddingBottom: 120 },
  cardCinza: { width: '90%', backgroundColor: '#E4E5EA', borderRadius: 15, padding: 15 },
  cardBranco: { backgroundColor: '#F7F7F7', borderRadius: 15, padding: 15, marginTop: 15 },
  linhaInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  label: { color: '#333', fontWeight: 'bold' },
  info: { color: '#555', backgroundColor: '#E0E0E0', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, minWidth: 140, textAlign: 'center' },
  input: { padding: 10, backgroundColor: '#fff', borderRadius: 6 },
  descricao: { height: 80, textAlignVertical: 'top' },
  botaoSalvar: { backgroundColor: '#00347E', paddingHorizontal: 16, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textoBotaoSalvar: { fontSize: 15, color: 'white', fontWeight: '600' },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  radioLabel: { marginLeft: 8, color: '#333', fontSize: 15 },
  linkMidia: { textAlign: 'center', color: '#004AAD', fontWeight: 'bold', marginTop: 10 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '70%' },
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#001c44' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnPrimary: { backgroundColor: '#00347E' },
  btnGhost: { backgroundColor: '#E7ECF6' },
  btnTextPrimary: { color: '#fff', fontWeight: '600' },
  btnTextGhost: { color: '#00347E', fontWeight: '600' },

  // Anexos
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9EDF5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  attachmentText: { flex: 1, marginLeft: 8, color: '#333' },
  removeAttachmentBtn: {
    marginLeft: 8,
    backgroundColor: '#c0392b',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
