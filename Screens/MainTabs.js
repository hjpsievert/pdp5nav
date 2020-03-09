import React from 'react';
import {
  View,
  Platform
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Plans/pHome';
import Drugs from './Plans/pDrugs';
import Plans from './Plans/pPlans';

export default function MainTab() {

  let Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      showIcon={true}
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
        component={Home}
        options={() => ({
          tabBarIcon: ({ color, size }) => {
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
        component={Drugs}
        options={() => ({
          tabBarIcon: ({ color, size }) => {
            return (
              <View style={{ width: 24, height: 24, margin: 5 }}>
                <Icon
                  name={'pill'}
                  type={'material-community'}
                  size={Platform.OS === 'ios' ? size + 4 : size}
                  color={color}
                />
              </View>)
          }
        })}
      />
      <Tab.Screen
        name="Plans"
        component={Plans}
        options={() => ({
          tabBarIcon: ({ color, size }) => {
            return (
              <View style={{ width: 24, height: 24, margin: 5 }}>
                <Icon
                  name={'assessment'}
                  type={'material'}
                  size={Platform.OS === 'ios' ? size + 4 : size}
                  color={color}
                />
              </View>)
          }
        })}
      />
    </Tab.Navigator >
  ); { }

}
