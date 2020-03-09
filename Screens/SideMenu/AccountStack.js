import React from 'react'
import {
  View,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import aRegCreate from '../Account/aRegCreate';
import aLogin from '../Account/aLogin';
import aAccount from '../Account/aAccount';

const Stack = createStackNavigator();

function AccountStack() {
  return (
    <Stack.Navigator initialRouteName="aAccount">
      <Stack.Screen
        name="aAccount"
        component={aAccount}
        options={({ navigation }) => ({
          title: 'Account Management',
          headerTitle: 'Account Management',
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('Top')}
              >
                <View style={[styles.touch, { justifyContent: 'left' }]}>
                  <Icon
                    name={'ios-arrow-back'}
                    type={'ionicon'}
                    color={'white'}
                    size={24}
                    style={{ padding: 5 }}
                  />
                </View>
              </TouchableHighlight>
            </View>
          ),
        })}
      />

      <Stack.Screen
        name="aRegCreate"
        component={aRegCreate}
        options={({ navigation }) => ({
          title: 'Register',
          headerTitle: 'Register',
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('aAccount')}
              >
                <View style={[styles.touch, { justifyContent: 'left' }]}>
                  <Icon
                    name={'ios-arrow-back'}
                    type={'ionicon'}
                    color={'white'}
                    size={24}
                    style={{ padding: 5 }}
                  />
                </View>
              </TouchableHighlight>
            </View>
          ),
        })}
      />

      <Stack.Screen
        name="aLogin"
        component={aLogin}
        options={({ navigation }) => ({
          title: 'Login',
          headerTitle: 'Login',
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('aAccount')}
              >
                <View style={[styles.touch, { justifyContent: 'left' }]}>
                  <Icon
                    name={'ios-arrow-back'}
                    type={'ionicon'}
                    color={'white'}
                    size={24}
                    style={{ padding: 5 }}
                  />
                </View>
              </TouchableHighlight>
            </View>
          ),
        })}
      />

    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touch: {
    width: 30,
    flexDirection: 'row',
  }
});

export default AccountStack;

