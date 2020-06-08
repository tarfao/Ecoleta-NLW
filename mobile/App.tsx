/**para iniciar o projeto precisa ser insatala globalmente expo-cli 
 * e executar o comando, expo init projeto....
*/
import React from 'react';
import Routes from './src/routes';
import { StatusBar } from 'react-native';

import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu';
import { AppLoading } from 'expo';

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Ubuntu_700Bold
});

if (!fontsLoaded) {
    return <AppLoading />
}

  return (
    <>{/**fragment */}
    <StatusBar barStyle='dark-content' backgroundColor='transparent' translucent/>
    <Routes />
    </>
  );
}
