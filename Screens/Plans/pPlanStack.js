import React from 'react'
import {
  View,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import pPlans from './pPlans';
import pBreakdown from './pBreakdown';

const Stack = createStackNavigator();

function pPlanStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="pPlans"
        component={pPlans}
        options={({ navigation, route }) => ({
          title: 'My Plans',
          headerTitle: "Plans Header",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('HomeScreen')}
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
                onPress={() => navigation.navigate('pBreakdown')}
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
        })} />

      <Stack.Screen
        name="pBreakdown"
        component={pBreakdown}
        options={({ navigation, route }) => ({
          title: 'Plan Breakdown',
          headerTitle: "Plan Breakdown",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.navigate('PlanScreen')}
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

export default pPlanStack;
