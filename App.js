import React from 'react';
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import TopDrawer from './Screens/TopDrawer';

export default class App extends React.Component {

  render() {
    return (
      <NavigationContainer>
        <StatusBar
          barStyle='light-content'
        />
        <TopDrawer />
      </NavigationContainer>
    );
  }
}