import React from 'react';
import {
  View,
  Text,
  Platform,
  Dimensions
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import size from 'lodash/size';
import pHomeStack from './Plans/pHomeStack';
import pDrugStack from './Plans/pDrugStack';
import pPlanStack from './Plans/pPlanStack';

export class TabStack extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web'
    }
  }

  render() {
    let Tab = createBottomTabNavigator();
    const { drugCount, planCount } = this.props;

    return (
      <Tab.Navigator
        showIcon={true}
        lazy={false}
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
                  {drugCount > 0 &&
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
                        {drugCount}
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
                  {planCount > 0 &&
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
                        {planCount}
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
}

TabStack.propTypes = {
  drugCount: PropTypes.number.isRequired,
  planCount: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => {
  return {
    drugCount: size(state.myDrugs) ?? 0,
    planCount: size(state.myPlans) ?? 0,
  }
}

export default connect(mapStateToProps)(TabStack);
