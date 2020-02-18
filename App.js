import React from 'react';
import { StatusBar, StyleSheet, View, Platform, Dimensions } from 'react-native'
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
  constructor(props, context) {
    super(props, context);
    this.state = {
      WindowWidth: Dimensions.get('window').width,
      WindowHeight: Dimensions.get('window').height,
      LayoutDirty: false
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange)
  }

  shouldComponentUpdate() {
    const { LayoutDirty } = this.state;
    console.log('Should Update ',LayoutDirty);
    return LayoutDirty;
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this._handleDimChange)
  }

  _handleDimChange = ({ window }) => {
    console.log('App _handleDimChange event, new width = ', window.width);
    this.setState({
      WindowWidth: window.width,
      WindowHeight: window.height,
      LayoutDirty: true
    })
  }

  render() {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL_BUT_UPSIDE_DOWN);
    }
    const { LayoutDirty, WindowWidth, WindowHeight } = this.state;
    console.log('App render LayoutDirty = ', LayoutDirty);

    return (
      <Provider store={store}>
        <NavigationContainer>
        <View style={Platform.OS === 'web' ? [styles.WebContainer, {width: WindowWidth, height: WindowHeight}] : styles.AppContainer}>
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#fff',
  }
})