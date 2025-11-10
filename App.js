import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TelaLogo from './TelaLogo';
import TelaLogin from './TelaLogin';
import TelaCadastro from './TelaCadastro';
import TelaMeuPerfil from './TelaMeuPerfil';
import TelaEsqueceuSenha from './TelaEsqueceuSenha';
import TelaAtividades from './TelaAtividades';
import TelaCadastrarAtividade from './TelaCadastrarAtividade';
import TelaCalendario from './TelaCalendario';
import TelaMenuPrincipal from './TelaMenuPrincipal';
import DetalhesAtividade from './DetalhesAtividade'

const Stack = createStackNavigator();

export default function App() {
  
  return (
    <NavigationContainer>
    
    <Stack.Navigator 
    initialRouteName="Home"
    screenOptions={{ headerShown: false }}
    >

    <Stack.Screen name="Home" component={TelaLogo} />
    <Stack.Screen name="Login" component={TelaLogin} />
    <Stack.Screen name="Cadastro" component={TelaCadastro} />
    <Stack.Screen name="MeuPerfil"component={TelaMeuPerfil} />
    <Stack.Screen name="EsqueceuSenha" component={TelaEsqueceuSenha} />
    <Stack.Screen name="Atividades" component={TelaAtividades} />
    <Stack.Screen name="CadastrarAtividade" component={TelaCadastrarAtividade} />
    <Stack.Screen name="Calendario" component={TelaCalendario} />
    <Stack.Screen name="MenuPrincipal" component={TelaMenuPrincipal} />
    <Stack.Screen name="DetalhesAtividade" component={DetalhesAtividade} />
    
    </Stack.Navigator>

    </NavigationContainer>
  );
}
