import React from 'react';
import { StatusBar, StyleSheet, View, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import TopDrawer from './Screens/TopDrawer';
import { Provider } from 'react-redux'
import configureStore from './Redux/Store';
import { ScreenOrientation } from 'expo';

import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings([
  'VirtualizedLists should never be nested', // TODO: Remove when fixed
  'Require cycles are allowed, but can result in uninitialized values',
  'Attempted import error'
])

export const store = configureStore()

// uses separate TopDrawer.js to import navigation
export default class App extends React.Component {

  render() {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL_BUT_UPSIDE_DOWN);
    }
    return (
      <Provider store={store}>
        <NavigationContainer>
        <View style={Platform.OS === 'web' ? styles.WebContainer : styles.AppContainer }>
          <StatusBar
            barStyle='light-content'
          />
          <TopDrawer />
          </View>
        </NavigationContainer>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  AppContainer: {
    width: 375,
    height: 667,
    backgroundColor: '#fff',
  },
  WebContainer: {
    width: 1920,
    height: 1067,
    backgroundColor: '#fff',
  }
})