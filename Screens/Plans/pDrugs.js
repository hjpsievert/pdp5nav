import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { Icon } from 'react-native-elements';
import pSearch from '../Plans/pSearch';
import pSelect from '../Plans/pSelect';
import pPick from '../Plans/pPick';
import { createStackNavigator } from '@react-navigation/stack';

function DrugScreen() {

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Drugs Main</Text>
    </View>)
}

const Stack = createStackNavigator();

function Drugs() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DrugScreen"
        component={DrugScreen}
        options={({ navigation, route }) => ({
          title: 'My Drugs',
          headerTitle: "Drugs Header",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerRight: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('pSearch')}
              >
                <View style={[styles.touch, { justifyContent: 'right' }]}>
                  <Icon
                    name={'ios-arrow-forward'}
                    type={'ionicon'}
                    color={'white'}
                    size={24}
                    style={{ padding: 5 }}
                  />
                </View>
              </TouchableHighlight>
            </View>
          ),
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('HomeScreen')}
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
        })} />

      <Stack.Screen
        name="pSearch"
        component={pSearch}
        options={({ navigation, route }) => ({
          title: 'Search Drugs',
          headerTitle: "Drug Search",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerRight: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('pPick')}
              >
                <View style={[styles.touch, { justifyContent: 'right' }]}>
                  <Icon
                    name={'ios-arrow-forward'}
                    type={'ionicon'}
                    color={'white'}
                    size={24}
                    style={{ padding: 5 }}
                  />
                </View>
              </TouchableHighlight>
            </View>
          ),
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('DrugScreen')}
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
        })} />

      <Stack.Screen
        name="pSelect"
        component={pSelect}
        options={({ navigation, route }) => ({
          title: 'Select Drugs',
          headerTitle: "Drug Selection",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('DrugScreen')}
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
        })} />

      <Stack.Screen
        name="pPick"
        component={pPick}
        options={({ navigation, route }) => ({
          title: 'Pick Base Drugs',
          headerTitle: "Drug Picker",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('DrugScreen')}
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
          headerRight: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('pSelect')}
              >
                <View style={[styles.touch, { justifyContent: 'right' }]}>
                  <Icon
                    name={'ios-arrow-forward'}
                    type={'ionicon'}
                    color={'white'}
                    size={24}
                    style={{ padding: 5 }}
                  />
                </View>
              </TouchableHighlight>
            </View>
          ),
        })} />

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

export default Drugs;

