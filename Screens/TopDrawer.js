import React from 'react';
import {
  createDrawerNavigator
} from '@react-navigation/drawer';
import { Icon } from 'react-native-elements';
import AccountStack from './SideMenu/AccountStack';
import HomeScreen from './Plans/Home';

const Drawer = createDrawerNavigator();
function TopDrawer() {

  return (
    <Drawer.Navigator
      drawerStyle={{
        backgroundColor: '#c6cbef',
        width: 250,
      }}
    >
      <Drawer.Screen
        name="Top"
        component={HomeScreen}
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
export default TopDrawer;