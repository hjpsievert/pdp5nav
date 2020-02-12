import React from 'react';
import { StyleSheet, View, StatusBar, Platform, PixelRatio, Dimensions } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import Main from './Screens/Main';
import AccountManagement from './Screens/smAccountManagement';
import ContactUs from './Screens/smContactUs';
import DataManager from './Screens/smDataManager';
import Settings from './Screens/smSettings';
import SystemInfo from './Screens/smSystemInfo';
import { render } from 'react-dom';

import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings([
  'VirtualizedLists should never be nested', // TODO: Remove when fixed
  'Require cycles are allowed, but can result in uninitialized values',
])

const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerStyle={{
        backgroundColor: '#c6cbef',
        width: 240,
      }}
    >
      <Drawer.Screen
        name="Main"
        component={Main}
      />
      <Drawer.Screen name="AccountManagement" component={AccountManagement} />
      <Drawer.Screen name="ContactUs" component={ContactUs} />
      <Drawer.Screen name="DataManager" component={DataManager} />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="SystemInfo" component={SystemInfo} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (

    <NavigationContainer>
      <StatusBar
        barStyle='light-content'
      />
      <MyDrawer />
    </NavigationContainer>

  );
}
