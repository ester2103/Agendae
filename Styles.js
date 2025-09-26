import {StyleSheet} from 'react-native';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#001c44",
  },

  containerlogo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#001c44",
    width: 150,
    height: 150,
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
    width: 360,
    height: 1,
    marginVertical: 30
  },

  input: {
    width: 306,
    height: 47,
    backgroundColor:'#E4E5EA',
    borderRadius: 15,
    marginBottom: 20,
    paddingLeft: 10
  },

  texto_padrao: {
    marginBottom: 10,
    fontSize: 18,
    color: '#C0C1C6',
    fontWeight: 600,
    //fontFamily: Sarala
  },

  botao_cadastrar: {
    marginTop: 25,
    backgroundColor: '#00347E',
    width: 306,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    marginBottom: 10
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
  
});

export default styles;
