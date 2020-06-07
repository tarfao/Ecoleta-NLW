/**para iniciar o projeto precisa ser insatala globalmente expo-cli 
 * e executar o comando, expo init projeto....
*/
import React from 'react';
import Home from './src/pages/Home'
import { StatusBar } from 'react-native';

export default function App() {
  return (
    <>{/**fragment */}
    <StatusBar barStyle='dark-content' backgroundColor='transparent' translucent/>
    <Home />
    </>
  );
}
