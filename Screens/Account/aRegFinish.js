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
import { Icon } from 'react-native-elements';
import { registerUser } from '../../Utils/Api';
import { saveUserProfile } from '../../Utils/SaveData';
import { defaultProfileSave, usrMode } from '../../Utils/Constants';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

export class aRegFinish extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      registered: false,
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aRegFinish componentDidMount');
    const { route, userProfile } = this.props;
    const provider = route.params?.provider ?? '';

    console.log('aRegFinish route = ', route);
    registerUser((response) => { this._finishRegisterUser(response) }, userProfile.loginId, provider);
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

  _finishRegisterUser = (response) => {
    const { success, payLoad, code, err } = response;
    console.log('_finishRegisterUser success = ', success, ', response = ', payLoad);
    if (success) {
      let newUserProfile;

      const { route } = this.props;
      const provider = route.params?.provider ?? '';

      newUserProfile = {
        emailVerified: false,
        appVerified: false,
        provider: provider,
        userMode: usrMode.verifying,
      }
      saveUserProfile(() => { this._finishSaveProfile() }, newUserProfile, defaultProfileSave, 'RegisterFinish');
    }
    else {
      if (Platform.OS === 'web') {
        alert('Register User\n\nAn error occurred: ' + payLoad)
      }
      else {
        Alert.alert(
          'Register User',
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

  _finishSaveProfile = () => {
    this.setState({
      registered: true,
    })
  }

  render() {
    const { adjust, registered } = this.state;
    const { navigation, route } = this.props;
    const provider = route.params?.provider ?? '';

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >

        {!registered &&
          <Text style={{ paddingTop: 50, textAlign: 'center' }}>{'Generating verification email ...'}</Text>
        }

        {registered &&
          <View style={{
            flexDirection: 'column', paddingLeft: 15, paddingRight: 15, flex: 1
          }}
          >
            <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
              <Text style={{ paddingBottom: 3 }}>{'Verification email has been sent. It should arrive within the next few minutes. Clicking on the link in the verification email will generate your final activation code which will arrive by ' + provider.toLowerCase() + '.'}</Text>
              <Text>{'If your code has already arrived, you can continue to Activation, otherwise come back later to Account Management and Activate EZPartD.'}</Text>
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
                onPress={() => navigation.navigate('aActivate')}
              >
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 5 }}>
                  <Icon
                    name={'skip-forward'}
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
                    {'ACTIVATE'}
                  </Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
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
            </View>
          </View>
        }
      </View>

    )
  }
}

aRegFinish.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(aRegFinish);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});