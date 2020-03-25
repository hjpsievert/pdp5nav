/* eslint-disable no-useless-escape */
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
import * as Dispatch from '../../Redux/Dispatches';
import { Input, Icon } from 'react-native-elements';
import { loginUser, validateLogin, getProvider, addUserDevice } from '../../Utils/Api';
import { saveUserProfile } from '../../Utils/SaveData';
import { loadAppData } from '../../Utils/AppLoad';
import { defaultProfileSave, usrMode } from '../../Utils/Constants';
import size from 'lodash/size';
import Constants from 'expo-constants';

export class aLogin extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      loginState: 'notAvailable',
      loginId: '',
      password: '',
      loginBad: false,
      pwdBad: false,
      hidePwd: true,
      validationCode: '',
      validationBad: false,
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aLogin componentDidMount');
    const { userProfile } = this.props;
    const { emailVerified } = userProfile;

    if (emailVerified) {
      this.setState({
        loginState: 'initial',
      });
    }
  }

  componentWillUnmount() {
    console.log('aLogin did unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('aLogin _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _saveLogin = (loginId) => {
    this.setState({
      loginId: loginId.trim(),
    })
  }

  _checkLogin = (loginId) => {
    return (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/).test(loginId);
  }

  _isLogin = () => {
    const { loginId } = this.state;
    this.setState({
      loginBad: !this._checkLogin(loginId),
    });
  }

  _savePwd = (pwd) => {
    this.setState({
      password: pwd.trim(),
    })
  }

  _togglePwdVisibility = () => {
    this.setState({
      hidePwd: !this.state.hidePwd,
    })
  }

  _saveValidation = (validationCode) => {
    this.setState({
      validationCode: validationCode,
    })
  }

  _validationOK = (validationCode) => {
    console.log('Login _validationOK validationCode = "', validationCode, '"');
    return (/^[0-9]{6}$/).test(validationCode);
  }

  _isValidated = () => {
    const { validationCode } = this.state;
    this.setState({
      validationBad: !this._validationOK(validationCode),
    })
  }

  _tryLogin = () => {
    const { loginId, password } = this.state;
    console.log('_tryLogin loginId = ', loginId, ', password = ', password);
    this.myInput.clear();

    if (this._checkLogin(loginId)) {
      this._checkProvider(loginId, password);
    }
    else {
      this.setState({
        loginState: 'loginInvalid',
      });
    }
  }

  _checkProvider = (loginId, password) => {
    getProvider((response) => { this._processLogin(response, loginId, password) }, loginId)
  }

  _processLogin = (response, loginId, password) => {
    const { success, payLoad } = response;
    console.log('_processLogin provider = ', payLoad);
    const { provider } = this.props.userProfile;
    const finalProvider = !success ? (!provider ? '' : provider) : payLoad;
    loginUser((response) => { this._finishLogin(response, finalProvider) }, loginId, password, finalProvider);
  }

  _finishLogin = (response, provider) => {
    const { success, payLoad } = response;
    if (success) {
      if (payLoad === 'Login succeeded') {
        this.setState({
          userProvider: provider,
        });
        this._activateApp(provider);
      }
      else {
        this.setState({
          loginState: 'loginProcessed',
          userProvider: provider,
        });
      }
    }
    else {
      this.setState({
        loginState: 'loginInvalid',
      });
    }
  }

  _processValidation = () => {
    const { validationCode, userProvider } = this.state;
    this.myInput.clear();
    console.log('_processValidation provider = ', userProvider, ', code = ', validationCode);
    validateLogin((response) => { this._finishValidation(response, userProvider) }, userProvider, validationCode)
  }

  _finishValidation = (response, provider) => {
    const { success, payLoad, err } = response;
    console.log('_finishValidation provider = ', provider, ', payload = ', payLoad, ', err = ', err);
    if (success) {
      this._activateApp(provider);
    }
    else {
      this.setState({
        validationBad: true,
      })
    }
  }

  _activateApp = (provider) => {
    this.setState({
      loginState: 'loadingAppData',
    });

    const { loginId } = this.state;
    let updatedUserProfile = {
      // appVerified: true, // move to _finishActivateApp
      emailVerified: true,
      verificationCode: 0,
      provider: provider,
      userEmail: loginId,
      userMode: usrMode.reg,
    }
    addUserDevice((response) => { this._finishActivateApp(response, updatedUserProfile) }, loginId, Constants.installationId)
  }

  _finishActivateApp(response, updatedUserProfile) {
    const { success, payLoad } = response;
    console.log('_finishActivateApp success = ', success, ', payload = ', payLoad);
    if (success) {
      updatedUserProfile.appVerified = true,
        loadAppData((profile, drugList) => { this._finishAppLoad(profile, drugList) }, updatedUserProfile);
    }
  }

  _finishAppLoad = (profile, drugList) => {
    console.log('Login _finishAppLoad, drugCount = ', size(drugList), ', profile = ', profile);
    saveUserProfile(() => { this._finishProfileSave(drugList) }, profile, defaultProfileSave, 'Login');
  }

  _finishProfileSave = (drugList) => {
    const { updateFlowState } = this.props;
    if (size(drugList) > 0) {
      this.props.addSelectionToMyDrugs(drugList);
      updateFlowState({
        planListDirty: true,
      });
    }
    this.setState({
      loginState: 'validationSuccessful',
    });
  }

  _handleRegister = () => {
    const { userProfile } = this.props;
    const { userMode } = userProfile;
    if (userMode===usrMode.created) {
      this.props.navigation.navigate('aRegFinish');
    }
    else {
      this.props.navigation.navigate('aRegCreate');
    }
  }

  _handleLogin = () => {
    this.setState({
      loginState: 'initial'
    })
  }

  render() {
    const { adjust, loginBad, hidePwd, validationBad, loginState, userProvider, loginId } = this.state;

    const { navigation } = this.props;
    //console.log('aLogin render loginState = ', loginState, ', userProfile ' + JSON.stringify(this.props.userProfile));    
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{
          flexDirection: 'column', paddingHorizontal: 15, flex: 1
        }}
        >
          {loginState === 'loadingAppData' &&
            <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
              <Text style={{ paddingBottom: 3 }}>{'Loading app data for user ' + loginId + '.'}</Text>
            </View>
          }

          {loginState === 'notAvailable' &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 5 }}>{'EZPartD login is not available, you are not registered.'}</Text>
                <Text>{'If you have logged in previously from a different device, you can continue with the '}
                  <Text style={{ fontWeight: 'bold' }}>{'Login'}</Text>
                  {' process to activate this device, otherwise please '}
                  <Text style={{ fontWeight: 'bold' }}>{'Register'}</Text>
                </Text>
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
                  onPress={this._handleLogin}
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
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={this._handleRegister}
                >
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
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
                      style={[styles.topTabText, { color: 'black' }]}
                    >
                      {'REGISTER'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>


            </View>}

          {loginState === 'initial' &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text>{'Please login with your user ID (email address) and password.'}</Text>
              </View>
              <View style={{ paddingTop: 10, paddingBottom: 10 }}>
                <Input
                  label='User ID/eMail'
                  labelStyle={{ fontSize: 14 }}
                  placeholder={'Enter your User ID ...'}
                  inputStyle={{ fontSize: 14 }}
                  onChangeText={this._saveLogin}
                  onSubmitEditing={this._isLogin}
                  editable={true}
                  keyboardType={'email-address'}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  errorMessage={loginBad ? 'Invalid User ID, your login should be an email address' : ''}
                />
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={this._togglePwdVisibility}
                >
                  <View style={{ paddingLeft: 20, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ paddingTop: 5, paddingBottom: 5, color: '#86939e', fontSize: 14 }}>{(hidePwd ? 'Show' : 'Hide') + ' password'}</Text>
                    <Icon
                      name={hidePwd ? 'toggle-off' : 'toggle-on'}
                      type={'font-awesome'}
                      color={'#86939e'}
                      size={15}
                      containerStyle={{
                        paddingLeft: 10,
                        paddingRight: 5,
                      }}
                    />
                  </View>
                </TouchableHighlight>
                <Input
                  ref={input => this.myInput = input}
                  label={'Password'}
                  labelStyle={{ fontSize: 14 }}
                  placeholder={'Enter your password ...'}
                  inputStyle={{ fontSize: 14 }}
                  onChangeText={this._savePwd}
                  editable={true}
                  secureTextEntry={hidePwd}
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
                  onPress={this._tryLogin}
                >
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
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
                      style={[styles.topTabText, { color: 'black' }]}
                    >
                      {'CONTINUE'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          }

          {loginState === 'loginProcessed' &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text>{'Your login was processed successfully, but requires an additional validation step. Please enter the six digit validation code you received by ' + userProvider.toLowerCase()}</Text>
              </View>
              <View style={{ paddingTop: 10 }}>
                <Input
                  label={'Login Validation Code'}
                  labelStyle={{ fontSize: 14 }}
                  placeholder={'Enter your login validation code ...'}
                  inputStyle={{ fontSize: 14 }}
                  onChangeText={this._saveValidation}
                  onSubmitEditing={this._isValidated}
                  keyboardType={'numeric'}
                  editable={true}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  errorMessage={validationBad ? 'You entered an incorrect validation code. This should be a six digit code you received by ' + userProvider.toLowerCase() + '.' : ''}
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
                  onPress={this._processValidation}
                >
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
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
                      style={[styles.topTabText, { color: 'black' }]}
                    >
                      {'CONTINUE'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          }

          {loginState === 'loginInvalid' &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text>{'Login unsuccessful!'}</Text>
                <Text>{'You provided an invalid combination of user Id and password. If you forgot your password, you will be able to reset it using your email address.'}</Text>
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
                  onPress={() => {
                    this.setState({
                      loginState: 'initial',
                      loginId: '',
                      password: '',
                    });
                  }}
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
                      {'RETRY LOGIN'}
                    </Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={() => navigation.navigate('acResetPwd')}
                >
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Icon
                      name={'lock-reset'}
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
                      {'RESET PASSWORD'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>

            </View>
          }

          {loginState === 'validationSuccessful' &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'EZPartD Login successful!.'}</Text>
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
                  underlayColor={'#ccc'}
                  onPress={() => navigation.navigate('aAccount')}
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
        </View>
      </View>
    )
  }
}

aLogin.propTypes = {
  addSelectionToMyDrugs: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  updateFlowState: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,

};

const mapStateToProps = (state) => {
  return {
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
  addSelectionToMyDrugs: Dispatch.addSelectionToMyDrugs,
  updateFlowState: Dispatch.updateFlowState,
}

export default connect(mapStateToProps, mapDispatchToProps)(aLogin);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});