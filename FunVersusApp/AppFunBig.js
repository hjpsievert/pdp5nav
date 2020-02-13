import React from 'react';
import { StyleSheet, View, StatusBar, Platform, PixelRatio, Dimensions } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { Icon } from 'react-native-elements';
// import MainTab from './Screens/MainTabs';
import MainTab from './Screens/MainTabClass';
import AccountManagement from './Screens/SideMenu/smAccountManagement';
import ContactUs from './Screens/SideMenu/smContactUs';
import DataManager from './Screens/SideMenu/smDataManager';
import Settings from './Screens/SideMenu/smSettings';
import SystemInfo from './Screens/SideMenu/smSystemInfo';

import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings([
  'VirtualizedLists should never be nested', // TODO: Remove when fixed
  'Require cycles are allowed, but can result in uninitialized values',
])

const Drawer = createDrawerNavigator();

function TopDrawer() {
  return (
    <Drawer.Navigator
      drawerStyle={{
        backgroundColor: '#c6cbef',
        width: 240,
      }}
    >
      <Drawer.Screen
        name="Top"
        component={MainTab}
        options={() => ({
          drawerIcon: ({ focused, color, size }) => {
            return (
              <Icon name={'home'} type={'material-community'} size={size} color={color} />
            )
          }
        })}
      />
      <Drawer.Screen
        name="Account"
        component={AccountManagement}
        options={() => ({
          drawerIcon: ({ focused, color, size }) => {
            return (
              <Icon name={'account-details'} type={'material-community'} size={size} color={color} />
            )
          }
        })}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={() => ({
          drawerIcon: ({ focused, color, size }) => {
            return (
              <Icon name={'settings'} type={'material'} size={size} color={color} />
            )
          }
        })}
      />
      <Drawer.Screen
        name="DataManager"
        component={DataManager}
        options={() => ({
          drawerIcon: ({ focused, color, size }) => {
            return (
              <Icon name={'database'} type={'material-community'} size={size} color={color} />
            )
          }
        })}
      />
      <Drawer.Screen
        name="ContactUs"
        component={ContactUs}
        options={() => ({
          drawerIcon: ({ focused, color, size }) => {
            return (
              <Icon name={'email'} type={'material'} size={size} color={color} />
            )
          }
        })}
      />

      <Drawer.Screen
        name="SystemInfo"
        component={SystemInfo}
        options={() => ({
          drawerIcon: ({ focused, color, size }) => {
            return (
              <Icon name={'devices'} type={'material'} size={size} color={color} />
            )
          }
        })}

      />
    </Drawer.Navigator>
  );
}

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
