import React from 'react';
import {
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { Dimensions, Platform } from 'react-native'; import { Icon } from 'react-native-elements';
import TabStack from './TabStack';
import AccountStack from './SideMenu/smAccountStack';
import ContactUs from './SideMenu/smContactUs';
import DataStack from './SideMenu/smDataStack';
import Settings from './SideMenu/smSettings';
import SystemInfo from './SideMenu/smSystemInfo';

const Drawer = createDrawerNavigator();
export default function TopDrawer() {
  console.log('Top Drawer');
  return (
    <Drawer.Navigator
      initialRouteName={'Top'}
      drawerType={'back'}
      edgeWidth={Platform.OS === 'web' ? 5 : 25}
      minSwipeDistance={Platform.OS === 'web' ? Dimensions.get('window').width : Dimensions.get('window').width / 2}
      drawerStyle={{
        backgroundColor: '#c6cbef',
        width: Platform.OS === 'web' ? Dimensions.get('window').width / 2 : 240,
      }}
    >
      <Drawer.Screen
        name="Top"
        component={TabStack}
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