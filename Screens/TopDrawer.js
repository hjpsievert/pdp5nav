import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
 DrawerItem
} from '@react-navigation/drawer';
import { Dimensions, Platform } from 'react-native'; import { Icon } from 'react-native-elements';
import TabStack from './TabStack';
import AccountStack from './SideMenu/smAccountStack';
import DataStack from './SideMenu/smDataStack';
import SettingsStack from './SideMenu/smSettingsStack';
import SysinfoStack from './SideMenu/smSysinfoStack';
import ContactStack from './SideMenu/smContactStack';

const Drawer = createDrawerNavigator();
export default function TopDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      initialRouteName={'Top'}
      // drawerType={ Platform.OS === 'web' ? 'permanent' : 'front'}
      drawerType={'front'}
      edgeWidth={Platform.OS === 'web' ? 0 : 25}
      minSwipeDistance={Platform.OS === 'web' ? 0 : 100}
      drawerStyle={{
        backgroundColor: '#c6cbef',
        width: Platform.OS === 'web' ? Dimensions.get('window').width / 4 : 200,
        minWidth: Platform.OS === 'web' ? 300 : 200
      }}
    >
      <Drawer.Screen
        name="Top"
        component={TabStack}
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
          unmountOnBlur: true,
          drawerIcon: ({ color, size }) => {
            return (
              <Icon name={'account-details'} type={'material-community'} size={size} color={color} />
            )
          }
        })}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsStack}
        options={() => ({
          unmountOnBlur: true,
          drawerIcon: ({ color, size }) => {
            return (
              <Icon name={'settings'} type={'material'} size={size} color={color} />
            )
          }
        })}
      />
      <Drawer.Screen
        name="Data Manager"
        component={DataStack}
        options={() => ({
          unmountOnBlur: true,
          drawerIcon: ({ color, size }) => {
            return (
              <Icon name={'database'} type={'material-community'} size={size} color={color} />
            )
          }
        })}
      />
      <Drawer.Screen
        name="Contact Us"
        component={ContactStack}
        options={() => ({
          unmountOnBlur: true,
          drawerIcon: ({ color, size }) => {
            return (
              <Icon name={'email'} type={'material'} size={size} color={color} />
            )
          }
        })}
      />

      <Drawer.Screen
        name="System Info"
        component={SysinfoStack}
        options={() => ({
          unmountOnBlur: true,
          drawerIcon: ({ color, size }) => {
            return (
              <Icon name={'devices'} type={'material'} size={size} color={color} />
            )
          }
        })}

      />
    </Drawer.Navigator>
  );
}

function CustomDrawerContent(props) {
  console.log('Drawer history ', props.state.history);
  console.log('Drawer routes ', props.state.routes);
  return (
    <DrawerContentScrollView {...props}>
      {/* <DrawerItemList {...props} /> */}
      <DrawerItem
        label="Account"
        icon={({ color, size }) => {
          return (
            <Icon name={'account-details'} type={'material-community'} size={size} color={color} />
          )
        }}
        activeTintColor='black'
        inactiveTintColor='grey'
        onPress={() => props.navigation.navigate('Account', {screen: 'aAccount'})}
      />
      <DrawerItem
        label="Data Manager"
        icon={({ color, size }) => {
          return (
            <Icon name={'database'} type={'material-community'} size={size} color={color} />
            )
        }}
        onPress={() => props.navigation.navigate('Data Manager', {screen: 'dManager'})}
      />
      <DrawerItem
        label="Settings"
        icon={({ color, size }) => {
          return (
            <Icon name={'settings'} type={'material'} size={size} color={color} />
            )
        }}
        onPress={() => props.navigation.navigate('Settings', {screen: 'settings'})}
      />
      <DrawerItem
        label="Contact Us"
        icon={({ color, size }) => {
          return (
            <Icon name={'email'} type={'material'} size={size} color={color} />
            )
        }}
        onPress={() => props.navigation.navigate('Contact Us', {screen: 'ContactUs'})}
      />
      <DrawerItem
        label="System Info"
        icon={({ color, size }) => {
          return (
            <Icon name={'devices'} type={'material'} size={size} color={color} />
            )
        }}
        onPress={() => props.navigation.navigate('System Info', {screen: 'SystemInfo'})}
      />
    </DrawerContentScrollView>
  );
}
