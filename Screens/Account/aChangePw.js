import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { Input, Icon } from 'react-native-elements';
import { changePassword } from '../../Utils/Api';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

export class aChangePw extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      registered: false,
      oldPasswordInvalid: false,
      oldPasswordWrong: false,
      password: '',
      newPassword: '',
      newPassword2: '',
      newPasswordBad: false,
      newPasswordMismatch: false,
      newPasswordSame: false,
      changeState: 'initial',
      editField: 1,
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aChangePw componentDidMount');
  }

  componentWillUnmount() {
    console.log('aChangePw will unmount');
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

  _checkPwd = (password) => {
    console.log('_checkPwd password: ', password, ' is valid ', (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/).test(password));
    return (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/).test(password);
  }

  _isValidPwd = () => {
    const { password } = this.state;
    Keyboard.dismiss;
    const valid = this._checkPwd(password);
    this.setState({
      oldPasswordInvalid: !valid,
      editField: valid ? 2 : 1,
    });
  }

  _isStrongPwd = () => {
    const { password, newPassword } = this.state;
    Keyboard.dismiss;
    const valid = this._checkPwd(newPassword);
    this.setState({
      newPasswordBad: !valid,
      newPasswordSame: valid ? newPassword === password : false,
      editField: valid && newPassword != password ? 3 : 2,
    });
  }

  _checkNewPassword = () => {
    const { password, newPassword, newPassword2 } = this.state;
    console.log('Check new password is same ', newPassword != newPassword2 ? false : newPassword === password);
    Keyboard.dismiss;
    this.setState({
      newPasswordMismatch: newPassword != newPassword2,
      editField: newPassword === newPassword2 ? 4 : 3
    });
  }

  _saveOldPassword = (password) => {
    // console.log('Save old password = ', password);
    this.setState({
      password: password.trim(),
      oldPasswordInvalid: false,
    });
  }

  _saveNewPassword = (password) => {
    // console.log('Save new password = ', password);
    this.setState({
      newPassword: password.trim(),
      newPasswordBad: false,
      newPasswordSame: false,
    });
  }

  _saveNewPassword2 = (password) => {
    // console.log('Save new password2 = ', password);
    this.setState({
      newPassword2: password.trim(),
      newPasswordMismatch: false,
    });
  }

  _changePassword = () => {
    const { password, newPassword } = this.state;
    const { userProfile } = this.props;
    const { loginId } = userProfile;
    changePassword(this._finishChangePassword, loginId, password, newPassword);
  }

  _finishChangePassword = (response) => {
    const { success, payLoad, code, err } = response;
    if (success) {
      this._handleExit();
    }
    else {
      if (payLoad === 'Incorrect password.') {
        if (Platform.OS === 'web') {
          alert('Change Password\n\nYour existing password is invalid, please correct!')
        }
        else {
          Alert.alert(
            'Change Password',
            'Your existing password is invalid, please correct!',
            [
              {
                text: 'OK'
              },
            ]
          );
        }
      }
      else {
        if (Platform.OS === 'web') {
          alert('Change Password\n\nAn error occurred: ' + payLoad)
        }
        else {
          Alert.alert(
            'Change Password',
            'An error occurred: ' + payLoad,
            [
              {
                text: 'OK'
              },
            ]
          );
        }
      }
    }
  }

  _handleExit = () => {
    const { navigation } = this.props;
    if (Platform.OS === 'web') {
      alert('Change Password\n\nYour password has been changed!')
    }
    else {
      Alert.alert(
        'Change Password',
        'Your password has been changed!',
        [
          {
            text: 'OK'
          },
        ]
      );
    }
    navigation.popToTop();
  }

  render() {
    const { adjust, changeState, oldPasswordInvalid, newPasswordBad, newPasswordMismatch, editField, newPasswordSame } = this.state;

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={65}
          style={styles.kb}
        >
          <View style={{
            flexDirection: 'column', paddingLeft: 15, paddingRight: 15, flex: 1
          }}
          >
            {changeState === 'initial' &&
              <ScrollView>
                <View>
                  <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                    <Text style={{ paddingBottom: 3 }}>{'Password Change.'}</Text>
                    <Text>{'Please enter your existing password and then your new password and confirmation.'}</Text>
                  </View>
                  <Input
                    containerStyle={{ marginTop: 10 }}
                    labelStyle={{ fontSize: 16 }}
                    inputStyle={{ fontSize: 14 }}
                    errorStyle={{ fontSize: 14 }}
                    label={'Existing Password'}
                    placeholder={'Enter existing password ...'}
                    onChangeText={this._saveOldPassword}
                    onSubmitEditing={this._isValidPwd}
                    onBlur={this._isValidPwd}
                    editable={editField >= 1}
                    secureTextEntry={true}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    aoutofocus={true}
                    errorMessage={oldPasswordInvalid ? 'Invalid Password, please enter correct password' : ''}
                  />
                  <Input
                    containerStyle={{ marginTop: 10 }}
                    labelStyle={{ fontSize: 16 }}
                    inputStyle={{ fontSize: 14 }}
                    errorStyle={{ fontSize: 14 }}
                    label={'New Password'}
                    placeholder={'Enter new password ...'}
                    onChangeText={this._saveNewPassword}
                    onSubmitEditing={this._isStrongPwd}
                    onBlur={this._isStrongPwd}
                    editable={editField >= 2}
                    secureTextEntry={true}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    errorMessage={newPasswordBad ? 'New Password must be 8 or more characters, have at least one lowercase and one uppercase letter, one number, and one special character, !@#$%&*()' : (newPasswordSame ? 'New Password must be different from old password' : '')}
                  />
                  <Input
                    containerStyle={{ marginTop: 10 }}
                    labelStyle={{ fontSize: 16 }}
                    inputStyle={{ fontSize: 14 }}
                    errorStyle={{ fontSize: 14 }}
                    label={'New Password Confirmation'}
                    placeholder={'Re-enter your new password ...'}
                    onChangeText={this._saveNewPassword2}
                    onSubmitEditing={this._checkNewPassword}
                    onBlur={this._checkNewPassword}
                    editable={editField >= 3}
                    secureTextEntry={true}
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    errorMessage={newPasswordMismatch ? 'Confirmation password does not match' : ''}
                  />
                  {editField >= 4 &&

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
                        onPress={this._changePassword}
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
                  }
                </View>
              </ScrollView>
            }
            {Platform.OS === 'android' &&
              <View style={{ height: 40 }} />
            }

          </View>
        </KeyboardAvoidingView>
      </View >
    )
  }
}

aChangePw.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(aChangePw);

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