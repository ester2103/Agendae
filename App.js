import React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StyleSheet, Text, View, Image} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import styles from './Styles';
import TelaLogo from './TelaLogo';
import TelaLogin from './TelaLogin';
import TelaCadastro from './TelaCadastro';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 3000,
  fade: true,
});

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync();
  });
  return (
    <NavigationContainer>

    <Stack.Navigator initialRouteName="Home">
    <Stack.Screen name="Home" component={TelaLogo} />
    <Stack.Screen name="Login" component={TelaLogin} />
    <Stack.Screen name="Cadastro" component={TelaCadastro} />
    </Stack.Navigator>

    </NavigationContainer>
  );
}
