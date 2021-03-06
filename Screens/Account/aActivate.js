import React from 'react'
import {
  View,
  Text,
  Dimensions,
  Platform,
  TouchableHighlight
} from 'react-native';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Input } from 'react-native-elements';
import { loadDBProfile } from '../../Utils/Api';
import { saveUserProfile } from '../../Utils/SaveData';
import { defaultProfileSave, usrMode } from '../../Utils/Constants';
import { myStyles } from '../../Utils/Styles';

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
    };
  }

  componentDidMount() {
    console.log('aActivate did mount');
    Dimensions.addEventListener('change', this._handleDimChange);
    const { userProfile } = this.props;
    const { userEmail, userIsSubscribed } = userProfile;
    const retry = false;
    loadDBProfile((response) => { this._processProfile(response, retry, userIsSubscribed) }, userEmail);
  }

  componentWillUnmount() {
    console.log('aActivate did unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleRetry = () => {
    const retry = true;
    const { userProfile } = this.props;
    const { userEmail, userIsSubscribed } = userProfile;
    loadDBProfile((response) => { this._processProfile(response, retry, userIsSubscribed) }, userEmail);
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

  _processProfile = (response, retry, userIsSubscribed) => {
    const { navigation } = this.props;
    const { success, payLoad } = response;

    if (!success && !retry) {
      // Alert.alert(
      //   'EZPartD Activation Error',
      //   'An error occurred: ' + payLoad,
      //   [
      //     {
      //       text: 'OK'
      //     },
      //   ]
      // );
      navigation.navigate(userIsSubscribed ? 'fdHomeScreen' : 'Home');
    }
    else {
      const { userMode, verificationCode } = payLoad;

      if (userMode === usrMode.activating) {
        this.setState({
          verificationCode: verificationCode,
          activationPending: true,
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
    let { verificationCode } = this.state;
    verificationCode = parseInt(verificationCode);
    // console.log('aActivate _validationOK validation = "', validation, '", verificationCode "', verificationCode, '", OK = ', validation === verificationCode);
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
    const {userProfile} = this.props;
    if (activated) {
      this.myInput.clear();
      userProfile.verificationCode = '',
      userProfile.userMode = usrMode.reg,
      saveUserProfile((newUserProfile) => { this._finishSaveProfile(newUserProfile) }, userProfile, defaultProfileSave, 'aActivate');
    }
    else {
      this.setState({
        validationError: true,
      });
    }
  }

  _finishSaveProfile = () => {
    console.log('aActivate _activateApp complete ');
    this.setState({
      activationComplete: true,
      activationPending: false
    });
  }

  render() {
    const { adjust, activationComplete, activationPending, validationError } = this.state;
    const { userProfile, navigation } = this.props;
    const { userMode } = userProfile;
    console.log('aActivate render, userMode = ', userMode); // userProfile ' + JSON.stringify(this.props.userProfile));

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{
          flexDirection: 'column', paddingHorizontal: 15, flex: 1
        }}
        >
          {(userMode === usrMode.verifying && !activationPending) &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'EMail Verification incomplete.'}</Text>
                <Text>{'The verification email was sent, but you either have not received it yet or have not clicked on the link that will generate and transmit your final activation code. Click Retry once you are ready to enter the code or Exit and come back later.'}</Text>
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
                  underlayColor={'#ccc'}
                  onPress={this._handleRetry}
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
                      style={myStyles.topTabText}
                    >
                      {'RETRY'}
                    </Text>
                  </View>
                </TouchableHighlight>

                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={() => navigation.navigate('aAccount')}
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
                      style={myStyles.topTabText}
                    >
                      {'EXIT'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>

            </View>
          }

          {activationPending &&
            <View>
              {validationError ?
                <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                  <Text style={{ paddingBottom: 3 }}>{'Incorrect activation code!'}</Text>
                  <Text>{'You entered an incorrect activation code. Please check the eight digit code provided to you by ' + userProfile.provider + ' and enter it again.'}</Text>
                </View>
                :
                <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
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
                  underlayColor={'#ccc'}
                  onPress={this._activateApp}
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
                      style={myStyles.topTabText}
                    >
                      {'ACTIVATE'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>

            </View>
          }

          {activationComplete &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'EZPartD Activation successful!.'}</Text>
                <Text>{'You now have full access to all features of EZPartD on this device.'}</Text>
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
                  onPress={() => navigation.navigate('Home')}
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
                      style={myStyles.topTabText}
                    >
                      {'EXIT'}
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