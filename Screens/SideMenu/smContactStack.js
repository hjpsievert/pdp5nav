import React from 'react'
import {
  View,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import ContactUs from './smContactUs';

const Stack = createStackNavigator();

function ContactStack() {
  return (
    <Stack.Navigator initialRouteName="ContactUs">
      <Stack.Screen
        name="ContactUs"
        component={ContactUs}
        options={({ navigation }) => ({
          title: 'Contact Us',
          headerTitle: 'Contact Us',
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.openDrawer()} //navigate('Home')}
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

export default ContactStack;

