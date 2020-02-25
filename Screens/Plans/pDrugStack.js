import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import pDrugs from './pDrugs';
import pSearch from './pSearch';
import pSelect from './pSelect';
import pPick from './pPick';

const Stack = createStackNavigator();

function pDrugStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="pDrugs"
        component={pDrugs}
        options={({ navigation, route }) => ({
          title: 'My Drugs',
          headerTitle: "Drugs Header",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerRight: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('pSearch')}
              >
                <View style={[styles.touch, { justifyContent: 'flex-end' }]}>
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
                onPress={() => navigation.navigate('pHome')}
              >
                <View style={[styles.touch, { justifyContent: 'flex-start' }]}>
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
        name="pSearch"
        component={pSearch}
        options={({ navigation, route }) => ({
          title: 'Search Drugs',
          headerTitle: "Drug Search",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerRight: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('pPick')}
              >
                <View style={[styles.touch, { justifyContent: 'flex-end' }]}>
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
                onPress={() => navigation.navigate('pDrugs')}
              >
                <View style={[styles.touch, { justifyContent: 'flex-start' }]}>
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
        name="pSelect"
        component={pSelect}
        options={({ navigation, route }) => ({
          title: 'Select Drugs',
          headerTitle: "Drug Selection",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('pDrugs')}
              >
                <View style={[styles.touch, { justifyContent: 'flex-end' }]}>
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
        name="pPick"
        component={pPick}
        options={({ navigation, route }) => ({
          title: 'Pick Base Drugs',
          headerTitle: "Drug Picker",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('pDrugs')}
              >
                <View style={[styles.touch, { justifyContent: 'flex-start' }]}>
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
                <View style={[styles.touch, { justifyContent: 'flex-end' }]}>
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

export default pDrugStack;

