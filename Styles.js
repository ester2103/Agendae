import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#001c44",
  },

  containerCalendario: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#ffffff",
    width: '97%',
    alignSelf: 'center',
    transform: [{ scale: 0.8 }],
  },

  containerlogo: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#001c44",
    width: 200,
    height: 200,
  },

  containeragendae: {
    padding: 40
  },

  texto: {
    fontSize: 25,
  },
  
  containerlogin: {
    justifyContent: 'top',
    alignItems: 'center',
    backgroundColor: "#001c44",
    width: 200,
    height: 200,
    padding: 100,
  },

  containerinput: {
    justifyContent: 'center',
  },

  imagem: {
    marginTop: 20,
    width: 235,
    height: 50,
    resizeMode: 'contain',
  },

  imagemLogo: {
    marginTop: 0,
    marginBottom: 0,
    width: 350,
    height: 130,
    resizeMode: 'contain',
  },
  
  linha: {
    backgroundColor: '#7F8386',
    width: '100%',
    height: 1,
    marginVertical: 30,
  },

  input: {
    width: 306,
    height: 47,
    backgroundColor:'#E4E5EA',
    borderRadius: 15,
    marginBottom: 20,
    paddingLeft: 10,
    paddingRight:  1,
  },

  containerlogoprincipal: {
    borderBottomWidth: 1,
    borderBottomColor: "#3A4B7A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  tituloDataPrincipal: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '500',
    paddingLeft: 20,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10, // opcional, para espaçamento
  },

  inputWrapper: {
    position: 'relative',
    width: 306,
    marginBottom: 15,
  },

  texto_padrao: {
    marginBottom: 10,
    fontSize: 18,
    color: '#C0C1C6',
    fontWeight: 600,
  },

  botao_cadastrar: {
    marginTop: 15,
    backgroundColor: '#00347E',
    width: 306,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginBottom: 15,
  },

  botao_entrar: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  texto_entrar:{
    fontWeight: 600,
    color: 'white',
  },

  texto_botao:{
    fontSize: 23,
    color: 'white',
    fontWeight: 400,
  },

  containerMeuPerfil: {
    flexGrow: 1,
    backgroundColor: "#001c44",
    paddingBottom: 40,
  },

  tituloMeuPerfil: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 12,
  },

  infoViewMeuPerfil: {
    borderBottomWidth: 1,
    borderBottomColor: "#3A4B7A",
    paddingVertical: 12,
    paddingLeft: 20,
  },

  tituloInfosMeuPerfil: {
    fontSize: 14,
    color: "#B0B8D1",
    marginBottom: 4,
  },

  textoInfoMeuPerfil: {
    fontSize: 16,
    color: "#FFFFFF",
  },

  inputMeuPerfil: {
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3A4B7A",
    marginTop: 4,
    marginRight: 20,
    marginBottom: 8,
  },

  botaoMeuPerfil: {
    borderBottomWidth: 1,
    borderBottomColor: "#3A4B7A",
    paddingVertical: 14,
    paddingLeft: 20,
  },

  textoBotaoMeuPerfil: {
    fontSize: 16,
    color: "#B0B8D1",
    fontWeight: "bold",
  },

  viewBotaoMeuPerfil: {
    alignItems: "center",
    marginTop: 20,
  },

  botaoEditarMeuPerfil: {
    backgroundColor: "#5E6AD5",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
    paddingHorizontal: 20,
    width: 150,
  },

  textoBotaoEditarMeuPerfil: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  rowButtons: {
    flexDirection: "row",
    gap: 12,
  },

  botaoSalvar: {
    backgroundColor: "#3CB371", 
  },

  botaoCancelar: {
    backgroundColor: "#777", 
    marginLeft: 12,
  },

  textoBotaoCancelar: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  container_texto: {
    justifyContent: 'center',
    marginVertical: 20,
    padding: 20,
  },

  texto_esqueceuSenha:{
    fontWeight: 500,
    color: 'white',
    textAlign: 'center'
  },

  olhinho: {
    position: 'absolute',
    right: 10,
    top: 11,
  },

  containerPopupMeuPerfil: {
    margin: 20,
    backgroundColor: "#06297b",
    borderRadius: 20,
    padding: 55,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputSenhaMeuPerfil: {
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3A4B7A",
    marginTop: 4,
    marginRight: 0,
    marginBottom: 8,
  },

  tituloSenhaMeuPerfil: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 20,
  },

  containerBotoesNavegacao: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  menuWrapper: {
    width: '100%',
    paddingHorizontal: 20,
  },

  menuButton: {
    flexDirection: 'row',         
    justifyContent: 'space-between', 
    alignItems: 'center',         
    borderWidth: 1,               
    borderColor: '#3A5F8A',       
    borderRadius: 5,              
    paddingVertical: 15,         
    paddingHorizontal: 20,        
    marginBottom: 15,             
  },

  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },

  containerBotaoAtividade: {
    width:"100%",
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
    marginTop: 100
  },

  botaoAtividade: {
    backgroundColor: '#00419E',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,

  },

});

export default styles;
