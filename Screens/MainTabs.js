import React from 'react';
import {
  View,
  Text, Platform
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import pHomeStack from './Plans/pHomeStack';
import pDrugStack from './Plans/pDrugStack';
import pPlanStack from './Plans/pPlanStack';

export default function MainTab() {

  let Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      showIcon={true}
      // lazy={false}
      labelStyle={{
        fontSize: 10,
        fontWeight: 'bold',
        paddingTop: Platform.OS === 'ios' ? 0 : -5,
      }}
      tabStyle={{
        paddingTop: Platform.OS === 'ios' ? 0 : -5,
      }}
      style={{
        backgroundColor: 'white',
        height: 45,
      }}
    >
      <Tab.Screen
        name="Home"
        component={pHomeStack}
        options={() => ({
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <Icon
                name={'home'}
                type={'material-community'}
                size={Platform.OS === 'ios' ? size + 4 : size}
                color={color}
              />
            )
          }
        })}
      />
      <Tab.Screen
        name="Drugs"
        component={pDrugStack}
        options={() => ({
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <View style={{ width: 24, height: 24, margin: 5 }}>
                <Icon
                  name={'pill'}
                  type={'material-community'}
                  size={Platform.OS === 'ios' ? size + 4 : size}
                  color={color}
                />
                {
                  <View
                    style={{
                      // On React Native < 0.57 overflow outside of parent will not work on Android, see https://git.io/fhLJ8
                      position: 'absolute',
                      right: -6,
                      top: -3,
                      backgroundColor: 'red',
                      borderRadius: 6,
                      width: 12,
                      height: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      {8}
                    </Text>
                  </View>
                }
              </View>)
          }
        })}
      />
      <Tab.Screen
        name="Plans"
        component={pPlanStack}
        options={() => ({
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <View style={{ width: 24, height: 24, margin: 5 }}>
                <Icon
                  name={'assessment'}
                  type={'material'}
                  size={Platform.OS === 'ios' ? size + 4 : size}
                  color={color}
                />
                {
                  <View
                    style={{
                      // On React Native < 0.57 overflow outside of parent will not work on Android, see https://git.io/fhLJ8
                      position: 'absolute',
                      right: -6,
                      top: -3,
                      backgroundColor: 'red',
                      borderRadius: 6,
                      width: 12,
                      height: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      {21}
                    </Text>
                  </View>
                }
              </View>)
          }
        })}
      />
    </Tab.Navigator >
  ); 
}
