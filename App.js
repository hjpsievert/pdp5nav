import React from 'react';
import { StatusBar, View, Platform, Dimensions } from 'react-native'
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

export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      windowWidth: Dimensions.get('window').width,
      windowHeight: Dimensions.get('window').height,
      screenOrientation: 'PORTRAIT',
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    // console.log('App _handleDimChange event, new width = ', window.width);
    this.setState({
      windowWidth: window.width,
      windowHeight: window.height,
    })
  }

  render() {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL_BUT_UPSIDE_DOWN);
    }
    const { windowWidth, windowHeight} = this.state;
    // console.log('App render dim = ', windowWidth, 'x', windowHeight);

    return (
      <Provider store={store}>
        <NavigationContainer>
          <View style={{ width: windowWidth, height: windowHeight, backgroundColor: '#fff' }}>
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
