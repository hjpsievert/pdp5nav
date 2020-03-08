import React from 'react'
import {
  View,
  Text,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import { Input } from 'react-native-elements';
import { loadDBProfile } from '../../Utils/Api';
import { saveUserProfile } from '../../Utils/SaveData';
import { defaultProfileSave, usrMode } from '../../Utils/Constants';

export class aActivate extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      validation: 0,
      activationComplete: false,
      validationError: false,
      activationPending: false,
      noActivation: true,
    };
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    const { userProfile } = this.props;
    const { userEmail, userIsSubscribed } = userProfile;
    loadDBProfile((response) => { this._processProfile(response, userIsSubscribed) }, userEmail);
  }

  componentWillUnmount() {
    console.log('pDrugSearch will unmount');
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

  _processProfile = (response, userIsSubscribed) => {
    const { navigation } = this.props;
    const { success, payLoad, code, err } = response;

    if (!success) {
      // Alert.alert(
      //   'EZPartD Activation Error',
      //   'An error occurred: ' + payLoad,
      //   [
      //     {
      //       text: 'OK'
      //     },
      //   ]
      // );
      navigation.navigate(userIsSubscribed ? 'fdHomeScreen' : 'fpHomeScreen');
    }
    else {
      const { emailVerified, verificationCode } = payLoad;

      if (emailVerified && parseInt(verificationCode) > 0) {
        this.setState({
          activationPending: true,
          noActivation: false,
        });
      }
    }
  }

  _saveValidation = (validation) => {
    this.setState({
      validation: parseInt(validation),
    })
  }

  _validationOK = (validation) => {
    let { verificationCode } = this.props.userProfile;
    console.log('aActivate _validationOK validation = "', validation, '", verificationCode "', verificationCode, '"');
    return validation === verificationCode;
  }

  _activateApp = () => {
    const { validation } = this.state;
    this.setState({
      validationError: false,
    });

    this._finishActivateApp(this._validationOK(validation));
  }

  _finishActivateApp = (activated) => {
    if (activated) {
      this.myInput.clear();
      const newUserProfile = {
        appVerified: true,
        verificationCode: '',
        userMode: usrMode.reg,
      }
      saveUserProfile((newUserProfile) => { this._finishSaveProfile(newUserProfile) }, newUserProfile, defaultProfileSave, 'aActivate');
    }
    else {
      this.setState({
        validationError: true,
        noActivation: false,
      });
    }
  }

  _finishSaveProfile = (currentUserProfile) => {
    console.log('aActivate _activateApp complete ');
    this.setState({
      activationComplete: true,
      activationPending: false
    });
  }

  _handleRegister = () => {
    const { userProfile, navigation } = this.props;
    const { emailVerified, appVerified } = userProfile;
    if (emailVerified || appVerified) {
      navigation.navigate('aRegCheck');
    }
    else {
      navigation.navigate('aRegCreate');
    }
  }

  _exitToTop = () => {
    // const { navigation, route, updateFlowState } = this.props;
  }

  render() {
    const { adjust, noActivation2, activationComplete2, activationPending, validationError, activationError } = this.state;
    const activationComplete = true;
    const noActivation = false;
    const { userProfile, navigation } = this.props;
    // console.log('aActivate render userProfile ' + JSON.stringify(this.props.userProfile));

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        {noActivation &&
          <View>
            <View style={{ borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
              <Text style={{ paddingBottom: 3 }}>{'EZPartD Activation is not available.'}</Text>
              <Text>{'You must first register or, if you previously registered, you can login to restart activation.'}</Text>
            </View>

            <View style={{
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
                onPress={this._handleRegister}
              >
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 5 }}>
                  <Icon
                    name={'user-plus'}
                    type={'feather'}
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
                    {'REGISTER'}
                  </Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                onPress={() => navigation.navigate('aLogin')}
              >
                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
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
                    style={[styles.topTabText, { color: 'black' }]}
                  >
                    {'LOGIN'}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>

          </View>
        }

        {validationError &&
          <View style={{ borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
            <Text style={{ paddingBottom: 3 }}>{'Incorrect activation code!'}</Text>
            <Text>{'You entered an incorrect activation code. Please check the eight digit code provided to you by ' + userProfile.provider + ' and enter it again.'}</Text>
          </View>
        }

        {activationPending &&
          <View>
            {validationError ?
              <View style={{ borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'Incorrect activation code!'}</Text>
                <Text>{'You entered an incorrect activation code. Please check the eight digit code provided to you by ' + userProfile.provider + ' and enter it again.'}</Text>
              </View>
              :
              <View style={{ borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text>{'Please enter the eight digit activation code you received by ' + userProfile.provider + '.'}</Text>
              </View>
            }
            <View>
              <Input
                ref={input => this.myInput = input}
                inputContainerStyle={{ borderBottomWidth: 0 }}
                label={'Activation Code'}
                placeholder={'Enter your activation code ...'}
                onChangeText={this._saveValidation}
                // onEndEditing={Keyboard.dismiss}
                keyboardType={'numeric'}
                editable={true}
                autoCapitalize={'none'}
                autoCorrect={false}
              />
            </View>

            <View style={{
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
                onPress={this._handleRegister}
              >
                <View style={{ flexDirection: 'column', justifyContent: 'center', paddingBottom: 5 }}>
                  <Icon
                    name={'ios-arrow-dropright'}
                    type={'ionicon'}
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
                    {'CONTINUE'}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>

          </View>
        }

        {activationComplete &&
          <View>
            <View style={{ borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
              <Text style={{ paddingBottom: 3 }}>{'EZPartD Activation successful!.'}</Text>
              <Text>{'You now have full access to all features of EZPartD on this device.'}</Text>
            </View>

            <View style={{
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
                onPress={navigation.popToTop}
              //onPress={() => navigation.popToTop()}
              // onPress={() => navigation.navigate('Top', { screen: 'Home', params: { screen: 'pHome' } })}

              >
                <View style={{ flexDirection: 'column', justifyContent: 'center', paddingBottom: 5 }}>
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
                    style={styles.topTabText}
                  >
                    {'EXIT'}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>

          </View>
        }

      </View>)
  }
}

aActivate.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(aActivate);


const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});