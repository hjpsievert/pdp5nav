import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Dimensions,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements';

export default class aRegProvider extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aRegProvider componentDidMount');
  }

  componentWillUnmount() {
    console.log('aRegProvider did unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('pDrugSearch _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  render() {
    const { adjust } = this.state;
    const { navigation } = this.props;
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{
          flexDirection: 'column', paddingHorizontal: 15, flex: 1
        }}
        >
          <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
            <Text style={{ paddingBottom: 3 }}>{'Your account has been created, an email will be sent to the address you provded to complete validation. Following email verification, you have to activate the EZPartD app to get access to all features.'}</Text>
            <Text style={{ paddingBottom: 3 }}>{'You can provide a mobile phone number to receive your activation code or you can choose to use your verified email address.'}</Text>
          </View>

          <View style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 3,
            backgroundColor: 'rgb(183, 211, 255)',
            borderBottomWidth: 1,
            borderBottomColor: 'black',
            borderTopWidth: 1,
            borderTopColor: 'black'
          }}
          >
            <TouchableHighlight
              underlayColor={'#ccc'}
              onPress={() => navigation.navigate('aRegFinish', {
                provider: 'Email'
              })}
            >
              <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                <Icon
                  name={'email-outline'}
                  type={'material-community'}
                  color={'black'}
                  size={25}
                  containerStyle={{
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}
                />
                <Text
                  style={[styles.topTabText, { color: 'black' }]}
                >
                  {'USE EMAIL'}
                </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={'#ccc'}
              onPress={() => navigation.navigate('aRegPhone')}
            >
              <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 5 }}>
                <Icon
                  name={'phone-classic'}
                  type={'material-community'}
                  color={'black'}
                  size={25}
                  containerStyle={{
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}
                />
                <Text
                  style={styles.topTabText}
                >
                  {'USE PHONE'}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    )
  }
}

aRegProvider.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});