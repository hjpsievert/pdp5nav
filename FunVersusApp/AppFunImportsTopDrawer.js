import React from 'react';
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import TopDrawer from './Screens/TopDrawer';

import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings([
  'VirtualizedLists should never be nested', // TODO: Remove when fixed
  'Require cycles are allowed, but can result in uninitialized values',
])

export default function App() {
  return (

    <NavigationContainer>
      <StatusBar
        barStyle='light-content'
      />
      <TopDrawer />
    </NavigationContainer>

  );
}
