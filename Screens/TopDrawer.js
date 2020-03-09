import React from 'react';
import {
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { Icon } from 'react-native-elements';
import MainTab from './MainTabs';
import AccountStack from './SideMenu/AccountStack';

const Drawer = createDrawerNavigator();
export default function TopDrawer() {
  return (
    <Drawer.Navigator
      drawerStyle={{
        backgroundColor: '#c6cbef',
        width: 250,
      }}
    >
      <Drawer.Screen
        name="Top"
        component={MainTab}
        options={() => ({
          drawerIcon: ({ color, size }) => {
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
          drawerIcon: ({ color, size }) => {
            return (
              <Icon name={'account-details'} type={'material-community'} size={size} color={color} />
            )
          }
        })}
      />
    </Drawer.Navigator>
  );
}