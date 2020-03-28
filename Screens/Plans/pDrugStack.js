import React from 'react'
import {
  View,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import pDrugs from './pDrugs';
import pDrugSearch from './pDrugSearch';
import pDrugSelect from './pDrugSelect';
import pDrugPick from './pDrugPick';

const Stack = createStackNavigator();

function pDrugStack() {
  // console.log('pDrugStack route = ', route);
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="pDrugs"
        component={pDrugs}
        options={({ navigation }) => ({
          title: 'My Drugs',
          headerTitle: "Your Drug List",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                underlayColor={'#ccc'}
                onPress={() => navigation.navigate('Home')}
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
        name="pDrugSearch"
        component={pDrugSearch}
        options={({ navigation }) => ({
          title: 'Find Drugs',
          headerTitle: "Find Drugs",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                underlayColor={'#ccc'}
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
        name="pDrugSelect"
        component={pDrugSelect}
        initialParams={{ doPick: false }}
        options={({ navigation, route }) => ({
          title: 'Select Drug(s)',
          headerTitle: "Select Drug(s)",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              {!route.params.doPick ?
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={() => navigation.navigate('pDrugSearch')}
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
                :
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={() => navigation.navigate('pDrugPick')}
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
              }

            </View>
          ),
        })}
      />

      <Stack.Screen
        name="pDrugPick"
        component={pDrugPick}
        initialParams={{ doPick: true }}
        options={({ navigation }) => ({
          title: 'Pick Base Drug(s)',
          headerTitle: "Pick Base Drug(s)",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                underlayColor={'#ccc'}
                onPress={() => navigation.navigate('pDrugSearch')}
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

