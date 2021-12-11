/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import { AppProvider } from './src/context/AppContext';
import { MainScreen } from './src/MainScreen';

const App = () => {
  return (
    <AppProvider>
      <MainScreen />
    </AppProvider>
  );
};

export default App;
