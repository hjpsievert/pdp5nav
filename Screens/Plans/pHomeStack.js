import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform,
  Dimensions,
  Button
} from 'react-native';
import { Icon } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import pHome from './pHome';

const Stack = createStackNavigator();

function pHomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="pHome"
        component={pHome}
        options={({ navigation, route }) => ({
          title: 'My Home',
          headerTitle: "Home Header",
          headerStyle: { backgroundColor: '#405ce8' },
          headerTitleStyle: { fontWeight: 'normal' },
          headerTintColor: 'white',
          headerRight: () => (
            <View style={styles.innerContainer}>
              <TouchableHighlight
                onPress={() => navigation.openDrawer()}
              >
                <View style={[styles.touch, { justifyContent: 'flex-end' }]}>
                  <Icon
                    name={'ios-menu'}
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
  },
  AppContainer: {
    width: 375,
    height: 667,
    backgroundColor: '#fff',
  },
  WebContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 105,
    backgroundColor: '#fff',
  }
});

export default pHomeStack;

