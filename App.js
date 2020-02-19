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
      WindowWidth: Dimensions.get('window').width,
      WindowHeight: Dimensions.get('window').height,
      screenOrientation: 'PORTRAIT',
      LayoutDirty: false
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    ScreenOrientation.addOrientationChangeListener(this._myListener);
  }

  shouldComponentUpdate() {
    const { LayoutDirty } = this.state;
    //console.log('Should Update ', LayoutDirty);
    if (LayoutDirty) {
      this.setState({
        LayoutDirty: false
      });
      return true;
    }
    else return false;
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this._handleDimChange);
    ScreenOrientation.removeOrientationChangeListeners();
  }

  _myListener = ({ orientationInfo }) => {
    console.log('_myListener info = ', orientationInfo.orientation);
    this.setState({
      screenOrientation: orientationInfo.orientation,
      LayoutDirty: true
    });
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
    const { WindowWidth, WindowHeight, screenOrientation } = this.state;
    console.log('App render Orientation = ', screenOrientation);

    return (
      <Provider store={store}>
        <NavigationContainer>
          <View style={{ width: WindowWidth, height: WindowHeight, backgroundColor: '#fff' }}>
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
