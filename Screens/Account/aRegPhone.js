import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { Input, Icon } from 'react-native-elements';
import { addPhone, verifyPhone } from '../../Utils/Api';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

export class aRegPhone extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      phone: '',
      prettyPhone: '',
      validatePhone: false,
      validationCode: 0,
      validationBad: false,
      usePhone: false,
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aRegPhone componentDidMount');
  }

  componentWillUnmount() {
    console.log('aRegCheck will unmount');
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

  _checkPhone = (phone) => {
    return (phone.length === 10);
  }

  _updatePhoneBad = () => {
    const { phone } = this.state;
    this.setState({
      phoneBad: !this._checkPhone(phone),
    });
  }

  _savePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    this.setState({
      phone: cleanPhone,
      phoneBad: false,
      prettyPhone: cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
    });
  }

  _addPhone = () => {
    const { phone } = this.state;
    const { userProfile } = this.props;
    const { loginId } = userProfile;

    if (this._checkPhone(phone)) {
      addPhone((response) => { this._finishAddPhone(response); }, loginId, phone);
    }
    else {
      this._updatePhoneBad();
      if (Platform.OS === 'web') {
        alert('Add Phone Number\n\nYou have to provide a valid phone number to continue with phone validation!')
      } else {
        Alert.alert(
          'Add Phone Number',
          'You have to provide a valid phone number to continue with phone validation!',
          [
            {
              text: 'OK'
            },
          ]
        );
      }
    }
  }

  _finishAddPhone = (response) => {
    const { success, payLoad, code, err } = response;
    const { navigation } = this.props;
    if (success) {
      this.setState({
        usePhone: true,
        // validationCode: parseInt(payLoad), 
        // don't put returned validation code into state, mnust be provided by user
      });
    }
    else {
      if (Platform.OS === 'web') {
        alert('Add Phone Number Error', payLoad)
      }
      else {
        Alert.alert(
          'Add Phone Number Error',
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

  _saveValidation = (validationCode) => {
    this.setState({
      validationCode: validationCode,
      validationBad: false
    })
  }

  _validationOK = (validationCode) => {
    console.log('Login _validationOK validationCode = "', validationCode, '", passed ', (/^[0-9]{6}$/).test(validationCode));
    return (/^[0-9]{6}$/).test(validationCode);
  }

  _updateValidationBad = () => {
    const { validationCode } = this.state;
    this.setState({
      validationBad: !this._validationOK(validationCode),
    })
  }

  _validatePhone = () => {
    const { validationCode, phone } = this.state;
    const { userProfile } = this.props;
    const { loginId } = userProfile;
    if (this._validationOK(validationCode)) {
      verifyPhone((response) => { this._finishValidatePhone(response) }, loginId, phone, validationCode);
    }
    else {
      this._updateValidationBad();
      if (Platform.OS === 'web') {
        alert('Validation Code Error\n\nYour validation code must consist of six digits')
      }
      else {
        Alert.alert(
          'Validation Code Error',
          'Your validation code must consist of six digits',
          [
            {
              text: 'OK'
            },
          ]
        );
      }
    }
  }

  _finishValidatePhone = (response) => {
    const { success, payLoad, code, err } = response;
    console.log('_finishValidatePhone response ', payLoad);
    const { navigation } = this.props;

    if (success) {
      navigation.navigate('aRegFinish', {
        provider: 'Phone',
      })
    }
    else {
      if (Platform.OS === 'web') {
        alert('Validate Phone Number Error', payLoad)
      }
      else {
        Alert.alert(
          'Validate Phone Number Error',
          payLoad,
          [
            {
              text: 'OK'
            },
          ]
        );
      }
    }
  }

  render() {
    const { adjust, phoneBad, prettyPhone, usePhone, validationBad } = this.state;

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{
          flexDirection: 'column', paddingLeft: 15, paddingRight: 15, flex: 1
        }}
        >
          <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
            <Text style={{ paddingBottom: 3 }}>{'The mobile phone number you provide will only be used to send verification or activation codes as an alternative to email-based validation.'}</Text>
            <Text>{'You can disable phone validation or remove the phone number at any time through the '}<Text style={{ fontWeight: 'bold' }}>{'User Account'}</Text>{' settings.'}</Text>
          </View>

          <Input
            ref={input => this.myInput1 = input}
            containerStyle={{ marginTop: 10 }}
            labelStyle={{ fontSize: 16 }}
            inputStyle={{ fontSize: 14 }}
            errorStyle={{ fontSize: 14 }}
            label={'Mobile Phone Number'}
            placeholder={'Enter a 10-digit mobile phone number ...'}
            onChangeText={this._savePhone}
            onSubmitEditing={this._updatePhoneBad}
            // onEndEditing={Keyboard.dismiss}
            keyboardType={'phone-pad'}
            returnKeyType='done'
            value={prettyPhone}
            editable={!usePhone}
            autoCapitalize={'none'}
            autoCorrect={false}
            errorMessage={phoneBad ? 'Not a valid phone number, make sure not to include a leading 1' : ''}
          />

          {usePhone &&
            <View>
              <Input
                ref={input => this.myInput2 = input}
                containerStyle={{ marginTop: 10 }}
                labelStyle={{ fontSize: 16 }}
                inputStyle={{ fontSize: 14 }}
                errorStyle={{ fontSize: 14 }}
                label={'Phone Verification Code'}
                placeholder={'Enter your phone activation code ...'}
                onChangeText={this._saveValidation}
                onSubmitEditing={this._updateValidationBad}
                // onEndEditing={Keyboard.dismiss}
                keyboardType={'numeric'}
                editable={true}
                autoCapitalize={'none'}
                autoCorrect={false}
                errorMessage={validationBad ? 'You entered an incorrect activation code.' : ''}
              />
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
              onPress={usePhone ? this._validatePhone : this._addPhone}
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

          {/* <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 25 }}>
            <View style={{ width: 2 * Dimensions.get('window').width / 3 }}>
              <Button
                raised={true}
                icon={{ name: 'ios-arrow-dropright', type: 'ionicon' }}
                iconRight
                backgroundColor={'green'}
                color={'white'}
                title={'Continue'}
                onPress={usePhone ? this._validatePhone : this._addPhone}
              />
            </View>
          </View> */}

        </View>
      </View>
    )
  }
}

aRegPhone.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(aRegPhone);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});