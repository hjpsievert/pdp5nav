import React from 'react'
import {
  View,
  Text,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';

export class aRegCheck extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aLogin componentDidMount');
    const { userProfile, navigation } = this.props;
    const { emailVerified, } = userProfile;
    // const emailVerified = false; // for testing
    console.log('RegisterCheck will mount');
    if (!emailVerified) {
      navigation.navigate('aRegCreate');
    }
  }

  componentWillUnmount() {
    console.log('aRegCheck did unmount');
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
    const { userProfile, navigation } = this.props;
    const { appVerified, emailVerified, provider, newDevice } = userProfile;

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{
          flexDirection: 'column', paddingHorizontal: 15, flex: 1
        }}
        >
          {emailVerified && appVerified &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text>{'You are already registered!'}</Text>
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
                  onPress={navigation.navigate('Account')}
                >
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Icon
                      name={'exit-to-app'}
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
                      {'EXIT'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>

            </View>
          }

          {(emailVerified && !appVerified) &&
            <View>
              {newDevice ?
                <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                  <Text style={{ paddingBottom: 3 }}>{'You can activate EZPartD?'}</Text>
                  <Text>{'Your email has already been validated, but it looks like you are accessing EZPartD from a new device. Please login in to activate EZPartD on this device.'}</Text>
                </View>
                :
                <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                  <Text style={{ paddingBottom: 3 }}>{'Did you forget to activate EZPartD?'}</Text>
                  <Text>{'Your email has been validated, but it looks like you did not activate EZPartD with the code you received by ' + provider + '. Please login in to continue the activation process.'}</Text>
                </View>
              }

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
                  onPress={navigation.navigate('Account')}
                >
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Icon
                      name={'exit-to-app'}
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
                      {'EXIT'}
                    </Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={() => navigation.navigate('aLogin')}
                >
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 5 }}>
                    <Icon
                      name={'login'}
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
                      {'LOGIN'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>

            </View>
          }
        </View>
      </View>
    )
  }
}

aRegCheck.propTypes = {
  navigation: PropTypes.object.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(aRegCheck);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});