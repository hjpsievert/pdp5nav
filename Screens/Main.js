import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './pHome';
import Drugs from './pDrugs';
import Plans from './pPlans';

export default function Main() {

  let Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      showIcon={true}
      labelStyle={{
        fontSize: 10,
        paddingTop: Platform.OS === 'ios' ? 0 : -5,
      }}
      tabStyle={{
        paddingTop: Platform.OS === 'ios' ? 0 : -5,
      }}
      style={{
        backgroundColor: 'white',
        height: 48,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerTitle: "My Home",
          headerRight: () => (
            <Button
              onPress={() => alert('This is a button!')}
              title="Info"
              color="#000"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Drugs"
        component={Drugs}
        screenOptions={({ route }) => ({
          tabBarIcon:  ({ focused, color, size }) => {
            return <Icon
              name={'pill'}
              type={'material-community'}
              size={Platform.OS === 'ios' ? size + 4 : size}
              color={color}
            />}
          })}
      />
      <Tab.Screen name="Plans" component={Plans} />
    </Tab.Navigator >
  );{}

}
