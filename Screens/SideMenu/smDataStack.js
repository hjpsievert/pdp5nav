import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import dManager from '../Data/dManager';
import dSave from '../Data/dSave';
import dLoad from '../Data/dLoad';
import dStore from '../Data/dStore';
import dClear from '../Data/dClear';

const Stack = createStackNavigator();

function DataStack() {
  return (
    <Stack.Navigator initialRouteName="aAccount">
      <Stack.Screen
        name="dManager"
        component={dManager}
        options={({ navigation, route }) => ({
          title: 'Data Management',
          headerTitle: 'Data Management',
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
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
        name="dSave"
        component={dSave}
        options={({ navigation, route }) => ({
          title: 'Save Data',
          headerTitle: 'Save Data',
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('dManager')}
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
        name="dLoad"
        component={dLoad}
        options={({ navigation, route }) => ({
          title: 'Load Data',
          headerTitle: 'Load Data',
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('dManager')}
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
        name="dStore"
        component={dStore}
        options={({ navigation, route }) => ({
          title: 'Storage',
          headerTitle: 'Storage',
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('dManager')}
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
        name="dClear"
        component={dClear}
        options={({ navigation, route }) => ({
          title: 'Clear Data',
          headerTitle: 'Clear Data',
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('dManager')}
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
    // borderColor: 'red',
    // borderWidth: 1,
  }
});

export default DataStack;

