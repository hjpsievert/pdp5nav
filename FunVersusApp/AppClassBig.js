import React from 'react';
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { Icon } from 'react-native-elements';
// import MainTabs from './Screens/MainTabs';
import MainTabs from './Screens/MainTabsClass';
import AccountStack from './Screens/SideMenu/smAccountStack';
import ContactUs from './Screens/SideMenu/smContactUs';
import DataManager from './Screens/SideMenu/smDataStack';
import Settings from './Screens/SideMenu/smSettings';
import SystemInfo from './Screens/SideMenu/smSystemInfo';

import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings([
  'VirtualizedLists should never be nested', // TODO: Remove when fixed
  'Require cycles are allowed, but can result in uninitialized values',
])

export default class App extends React.Component {

  MyDrawer = () => {
    const Drawer = createDrawerNavigator();
    return (
      <Drawer.Navigator
        drawerStyle={{
          backgroundColor: '#c6cbef',
          width: 240,
        }}
      >
        <Drawer.Screen
          name="Top"
          component={MainTabs}
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
          component={AccountStack}
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
          component={DataStack}
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

  render() {
    return (

      <NavigationContainer>
        <StatusBar
          barStyle='light-content'
        />
        <this.MyDrawer />
      </NavigationContainer>
    );
  }
}