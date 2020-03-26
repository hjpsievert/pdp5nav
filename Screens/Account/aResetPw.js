/* eslint-disable no-useless-escape */
import React from 'react'
import {
  View,
  Text,
  TouchableHighlight,
  Dimensions,
  Platform,
  Alert,
  Keyboard
} from 'react-native';
import { Icon, Input } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { saveUserProfile } from '../../Utils/SaveData';
import { defaultProfileSave, usrMode } from '../../Utils/Constants';
import { myStyles } from '../../Utils/Styles';
import { forgotPassword, resetPassword, loadDBProfile } from '../../Utils/Api';
import Constants from 'expo-constants';

export class aResetPw extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      email: '',
      emailBad: false,
      passwordBad: false,
      password: '',
      password2: '',
      passwordMismatch: false,
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    const { userProfile } = this.props;
    const { userMode } = userProfile;
    console.log('aResetPw componentDidMount, userMode ', userMode);
    this.setState({
      requestState: userMode,
    });
  }

  componentWillUnmount() {
    console.log('aResetPw did unmount');
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

  _saveEmail = (email) => {
    this.setState({
      email: email.trim(),
      emailBad: false,
    });
  }

  _checkEmail = (email) => {
    return (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/).test(email);
  }

  _isEmail = () => {
    const { email } = this.state;
    this.setState({
      emailBad: !this._checkEmail(email),
    });
  }

  _checkPwd = (password) => {
    return (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/).test(password);
  }

  _isStrongPwd = () => {
    const { password } = this.state;
    Keyboard.dismiss;
    this.setState({
      passwordBad: !this._checkPwd(password),
    });
  }

  _checkMatchedPwd = (password, password2) => {
    return password == password2;
  }

  _doPasswordsMatch = () => {
    const { password, password2 } = this.state;
    Keyboard.dismiss;
    this.setState({
      passwordMismatch: !this._checkMatchedPwd(password, password2),
    });
  }

  _savePassword = (password) => {
    this.setState({
      password: password.trim(),
      passwordBad: false,
    });
  }

  _saveConfirmPassword = (password) => {
    this.setState({
      password2: password.trim(),
      passwordMismatch: false,
    });
  }

  _checkReset = () => {
    const { installationId } = Constants;
    loadDBProfile((response) => {
      this._handleLoadProfileDB(response);
    }, null, installationId);
  }

  _handleLoadProfileDB = (response) => {
    const { success, payLoad } = response;

    if (success) {
      const userProfile = payLoad;
      const { userMode } = userProfile;
      this.setState({
        requestState: userMode,
      })
    }
  }

  _forgotPassword = () => {
    const { email } = this.state;
    console.log('_forgotPassword email = ', email);

    if (this._checkEmail(email)) {
      forgotPassword(this._finishForgotPassword, email);
    }
    else {
      this.setState({
        emailBad: true,
      });
    }
  }

  _finishForgotPassword = (response) => {
    const { success } = response;
    if (success) {
      this.setState({
        requestState: 'resetRequestEmailed',
      });
    }
    else {
      this.setState({
        requestState: 'resetRequestEmailFailed',
      });
    }
  }

  _resetPassword = () => {
    const { password, password2 } = this.state;
    const { userProfile } = this.props;
    const { loginId } = userProfile;
    console.log('_resetPassword password = ', password, ', password2 = ', password2);
    if (this._checkPwd(password) && this._checkMatchedPwd(password, password2)) {
      resetPassword((response) => { this._finishResetPassword(response) }, loginId, password);
    }
    else {
      this._isEmail();
      this._isStrongPwd();
      this._doPasswordsMatch();
      if (Platform.OS === 'web') {
        alert('Register User\n\nYou have to provide valid entries for email and password in order to complete registration!')
      }
      else {
        Alert.alert(
          'Register User',
          'You have to provide valid entries for email and password in order to complete registration!',
          [
            {
              text: 'OK'
            },
          ]
        );
      }
    }
  }

  _finishResetPassword = (response) => {
    const { success } = response;
    console.log('_finishResetPassword success = ', success);
    if (success) {
      const currentUserProfile = this.props.userProfile;
      currentUserProfile.userMode = usrMode.reg;
      saveUserProfile(this._finishSaveProfile, currentUserProfile, defaultProfileSave, 'ResetPwd');
    }
    else {
      if (Platform.OS === 'web') {
        alert('Reset Password\n\nYour password reset was unsuccessful!')
      }
      else {
        Alert.alert(
          'Reset Password',
          'Your password reset was unsuccessful!',
          [
            {
              text: 'OK'
            },
          ]
        );
      }
    }
  }

  _finishSaveProfile = () => {
    console.log('Exiting ResetPwd');
    this._handleExit();
  }

  _handleExit = () => {
    const { navigation } = this.props;
    if (Platform.OS === 'web') {
      alert('Reset Password\n\nYour password has been reset!')
    }
    else {
      Alert.alert(
        'Reset Password',
        'Your password has been reset!',
        [
          {
            text: 'OK'
          },
        ]
      );
    }

    navigation.navigate('aAccount');
  }

  _handleRetry = () => {
    this.setState({
      requestState: usrMode.reg,
    })
  }

  render() {
    const { adjust, emailBad, requestState, passwordBad, passwordMismatch } = this.state;
    const { navigation } = this.props;
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{
          flexDirection: 'column', paddingLeft: 15, paddingRight: 15, flex: 1
        }}
        >
          {requestState === 'resetRequestEmailFailed' &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'Password reset email failed.'}</Text>
                <Text>{'The email request for a password reset was unsuccessful. You can Retry the request or Exit and come back later to try again.'}</Text>
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
                  onPress={() => navigation.navigate('aAccount')}
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

                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={this._handleRetry}
                >
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Icon
                      name={'ios-repeat'}
                      type={'ionicon'}
                      color={'black'}
                      size={25}
                      containerStyle={{
                        paddingLeft: 10,
                        paddingRight: 10,
                      }}
                    />
                    <Text
                      style={[myStyles.topTabText, { color: 'black' }]}
                    >
                      {'RETRY'}
                    </Text>
                  </View>
                </TouchableHighlight>

              </View>

            </View>
          }

          {requestState === 'resetRequestEmailed' &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'Password reset email has been requested.'}</Text>
                <Text>{'If the email address you provided is associated with your account, a password request link has been sent which could take a few minutes to reach you. Click on the link in the email and then press Continue.'}</Text>
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
                  onPress={this._checkReset}
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
                      style={[myStyles.topTabText, { color: 'black' }]}
                    >
                      {'CONTINUE'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>

            </View>
          }

          {requestState === usrMode.resetting &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'Password reset request not validated.'}</Text>
                <Text>{'It looks like you have not received the email or have not validated the reset request. Click on the link in the email and then press Continue.'}</Text>
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
                  onPress={this._checkReset}
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
                      style={[myStyles.topTabText, { color: 'black' }]}
                    >
                      {'CONTINUE'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>

            </View>}

          {requestState === usrMode.reset &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'Reset request validated.'}</Text>
                <Text>{'Please enter and then confirm your new password.'}</Text>
              </View>
              <Input
                containerStyle={{ marginTop: 10 }}
                labelStyle={{ fontSize: 16 }}
                inputStyle={{ fontSize: 14 }}
                errorStyle={{ fontSize: 14 }}
                label={'Password'}
                placeholder={'Enter a password ...'}
                onChangeText={this._savePassword}
                onSubmitEditing={this._isStrongPwd}
                editable={true}
                secureTextEntry={true}
                autoCapitalize={'none'}
                autoCorrect={false}
                errorMessage={passwordBad ? 'Password must be 8 or more characters, have at least one lowercase and one uppercase letter, one number, and one special character, !@#$%&*()' : ''}
              />
              <Input
                containerStyle={{ marginTop: 10 }}
                labelStyle={{ fontSize: 16 }}
                inputStyle={{ fontSize: 14 }}
                errorStyle={{ fontSize: 14 }}
                label={'Password Confirmation'}
                placeholder={'Re-enter your password ...'}
                onChangeText={this._saveConfirmPassword}
                onSubmitEditing={this._doPasswordsMatch}
                editable={true}
                secureTextEntry={true}
                autoCapitalize={'none'}
                autoCorrect={false}
                errorMessage={passwordMismatch ? 'Confirmation password does not match first password' : ''}
              />

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
                  onPress={this._resetPassword}
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
                      style={[myStyles.topTabText, { color: 'black' }]}
                    >
                      {'CONTINUE'}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>

            </View>}

          {requestState === usrMode.reg &&
            <View>
              <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text>{'Please provide the email address you registered with and a password reset link will be sent to that email'}</Text>
              </View>
              <View>
                <Input
                  containerStyle={{ marginTop: 10 }}
                  labelStyle={{ fontSize: 16 }}
                  inputStyle={{ fontSize: 14 }}
                  errorStyle={{ fontSize: 14 }}
                  label={'Email'}
                  placeholder={'Enter your email address ...'}
                  oninput
                  onChangeText={this._saveEmail}
                  onSubmitEditing={this._isEmail}
                  onEndEditing={Keyboard.dismiss}
                  editable={true}
                  keyboardType={'email-address'}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  errorMessage={emailBad ? 'Invalid email format' : ''}
                />
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
                  onPress={this._forgotPassword}
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
                      style={[myStyles.topTabText, { color: 'black' }]}
                    >
                      {'CONTINUE'}
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

aResetPw.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(aResetPw);