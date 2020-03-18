/* eslint-disable no-useless-escape */
import React from 'react'
import {
  View,
  Text,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableHighlight,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { createUser, updateAnonymous } from '../../Utils/Api';
import { saveUserProfile } from '../../Utils/SaveData';
import { defaultProfileSave, usrMode } from '../../Utils/Constants';
import Constants from 'expo-constants';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Input, Icon } from 'react-native-elements';

export class aRegCreate extends React.Component {
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
      userId: '',
      duplicateEmail: false,
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aRegCreate componentDidMount');
  }


  componentWillUnmount() {
    console.log('aRegCreate will unmount');
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
    });
  }

  _checkEmail = (email) => {
    return (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/).test(email);
  }

  _isEmail = () => {
    const { email } = this.state;
    Keyboard.dismiss;
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
    });
  }

  _saveConfirmPassword = (password) => {
    this.setState({
      password2: password.trim(),
    });
  }

  _createUser = () => {
    const { email, password, password2 } = this.state;
    if (this._checkEmail(email) && this._checkPwd(password) && this._checkMatchedPwd(password, password2)) {
      createUser((response) => { this._processCreateUser(response); }, email.trim(), password.trim());
    }
    else {
      this._isEmail();
      this._isStrongPwd();
      this._doPasswordsMatch();
      if (Platform.OS === 'web') {
        alert('Register User\n\nYou have to provide valid entries for email and password in order to complete registration!')
      } else {
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

  _processCreateUser = (response) => {
    const { success, payLoad } = response;
    console.log('_processCreateUser success = ' + success + ', data ' + payLoad);
    const { email } = this.state;
    const { installationId } = Constants;
    const { navigation, userProfile } = this.props;

    if (success) {

      userProfile.loginId = payLoad;
      userProfile.userEmail = email;
      userProfile.userMode = usrMode.created;
      updateAnonymous((response) => { this._finishCreateUser(response, userProfile) }, installationId, userProfile);
    }
    else {
      userProfile.emailVerified = true;
      if (response === 'Duplicate Email') {
        this.setState({
          duplicateEmail: true,
        });
        saveUserProfile(() => { this._finishSaveProfile() }, userProfile, defaultProfileSave, 'RegisterCreate');
      }
      else {
        if (Platform.OS === 'web') {
          alert('User Creation Error')
        } else {
          Alert.alert(
            'User Creation Error',
            response,
            [
              {
                text: 'OK'
              },
            ]
          );
        }
        navigation.popToTop();
      }
    }
  }

  _finishCreateUser = (response, userProfile) => {
    const { navigation } = this.props;
    const { success, payLoad } = response;
    if (success) {
      saveUserProfile(() => { this._finishSaveProfile() }, userProfile, defaultProfileSave, 'RegisterCreate');
      navigation.navigate('aRegProvider')
    }
    else {
      if (Platform.OS === 'web') {
        alert('User Creation Error' + payLoad)
      } else {
        Alert.alert(
          'User Creation Error',
          payLoad,
          [
            {
              text: 'OK'
            },
          ]
        );
      }
      navigation.popToTop();
    }
  }

  _finishSaveProfile = () => {
    console.log('RegisterCreate _finishSaveProfile completed');
  }

  render() {
    const { userProfile, navigation } = this.props;
    const { userEmail } = userProfile;
    const { adjust, emailBad, passwordBad, passwordMismatch, duplicateEmail } = this.state;

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >

        <View style={{
          flexDirection: 'column', paddingLeft: 15, paddingRight: 15, flex: 1
        }}
        >
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={65}
            style={styles.kb}
          >
            {duplicateEmail &&
              <View>
                <View style={{ marginTop: 10, marginBottom: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                  <Text>{'Registration email already exists.'}</Text>
                  <Text>{'If you are a registered user of EZPartD, you can simply login and activate this device. You will be able to retrieve information you may have stored on another device.'}</Text>
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
                    onPress={navigation.popToTop}
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
                    onPress={() => navigation.navigate('aLogin', { userEmail: userEmail })}
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

            {!duplicateEmail &&
              <ScrollView>
                <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                  <Text style={{ paddingBottom: 3 }}>{'Registering with email and password ensures that you are the only person able to access your data.'}</Text>
                </View>
                <Input
                  containerStyle={{ marginTop: 10 }}
                  labelStyle={{ fontSize: 16 }}
                  inputStyle={{ fontSize: 14 }}
                  errorStyle={{ fontSize: 14 }}
                  label={'Email'}
                  placeholder={'Enter your email address ...'}
                  onChangeText={this._saveEmail}
                  onSubmitEditing={this._isEmail}
                  editable={true}
                  keyboardType={'email-address'}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  errorMessage={emailBad ? 'Invalid email address' : ''}
                />
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
                    onPress={this._createUser}
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
              </ScrollView>
            }

            {Platform.OS === 'android' &&
              <View style={{ height: 40 }} />
            }
          </KeyboardAvoidingView>
        </View>
      </View >)
  }
}

aRegCreate.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(aRegCreate);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
  kb: {
    flex: 1,
    justifyContent: 'space-between',
  },
});