import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Dimensions,
  Platform,
  Alert,
  Picker,
} from 'react-native';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import Constants from 'expo-constants';
import { loadStates, createAnonymous } from '../../Utils/Api';
import { saveUserProfile } from '../../Utils/SaveData';
import { defaultProfileSave, usrMode } from '../../Utils/Constants';
import sortBy from 'lodash/sortBy';

export class aRegState extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      stateId: 'AK',
      stateName: 'Select your state ...',
      stateSelected: false,
      stateListVisible: true,
      registerState: 'initial',
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aRegState componentDidMount');
    const { userProfile } = this.props;
    const { userMode, userStateId, userStateName } = userProfile;

    loadStates((response) => {
      const { payLoad } = response;
      // console.log('RegisterState componentDidMount stateList ', response);
      this.setState({
        stateData: sortBy(payLoad, 'stateName'),

      });
    });
    if (userMode === usrMode.anon) {
      this.setState({
        isAnonymous: true,
        stateId: userStateId,
        stateName: userStateName,
        stateSelected: true,
        stateListVisible: false,
      });
    }
  }

  componentWillUnmount() {
    console.log('aRegCheck did unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('aRegState _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _idle = () => {

  }

  _pickState = (itemIndex, itemStateName) => {
    // console.log('pick value = ', itemIndex, ', name = ', itemStateName);
    const { stateData } = this.state;
    this.setState({
      stateId: stateData[itemIndex].stateCode,
      stateName: itemStateName,
      stateListVisible: false,
      stateSelected: true,
    })
  }

  _handleStateEntry = () => {
    this.setState({
      stateListVisible: true,
    })
  }

  _updateAnonymous = () => {
    const { stateSelected, stateId, stateName } = this.state;
    const { installationId } = Constants;
    const { userProfile, navigation, updateFlowState } = this.props;
    if (stateSelected) {
      userProfile.userStateId = stateId;
      userProfile.userStateName = stateName;
      saveUserProfile(() => { this._finishSaveProfile() }, userProfile, defaultProfileSave, 'RegisterState', installationId);
      updateFlowState({
        stateChanged: true
      });
      navigation.navigate('Home');
    }
    else return;
  }

  _createAnonymous = () => {
    const { stateSelected, stateId, stateName } = this.state;
    const { installationId, deviceName } = Constants;
    const { userProfile } = this.props;
    if (stateSelected) {
      userProfile.userMode = usrMode.anon;
      userProfile.userStateId = stateId;
      userProfile.userStateName = stateName;
      createAnonymous((response) => { this._finishCreateAnonymous(response, userProfile) }, installationId, deviceName, JSON.stringify(userProfile));
    }
    else return;
  }

  _finishCreateAnonymous = (response, userProfile) => {
    const { success, payLoad } = response;
    const { installationId } = Constants;
    console.log('_finishCreateAnonymous success = ' + success + ', data ' + payLoad);
    const { navigation } = this.props;

    if (success) {
      saveUserProfile(() => { this._finishSaveProfile() }, userProfile, defaultProfileSave, 'RegisterState', installationId);
      this.setState({
        registerState: 'anonymous'
      })
    }
    else {
      if (Platform.OS === 'web') {
        alert('User Creation Error ' + payLoad)
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
        navigation.navigate('Account');
      }
    }
  }

  _finishSaveProfile = () => {
    console.log('RegisterState _finishSaveProfile completed');
  }

  render() {

    const { navigation } = this.props;
    const { adjust, stateListVisible, stateName, stateData, stateSelected, registerState, isAnonymous } = this.state;
    let serviceItems;
    if (stateData) {
      serviceItems = stateData.map((s) => {
        return <Picker.Item key={s.stateCode} value={s.stateName} label={s.stateName} />
      });
    }

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >

        {registerState === 'initial' &&
          <View style={{
            flexDirection: 'column', paddingLeft: 15, paddingRight: 15, flex: 1
          }}
          >
            {isAnonymous ?
              <View style={{ marginTop: 10, marginBottom: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'You are currently set up as anonymous user. If you want to change your state of registry, select the new state from the list and then press '}<Text style={styles.textBold}>{'Continue'}</Text>{' to save your selection.'}</Text>
                <Text style={{ paddingBottom: 3 }}>{'If you would like to become a fully registered user which will allow you to save drug and plan information, press '}<Text style={styles.textBold}>{'Register'}</Text>{'.'}</Text>
              </View>
              :
              <View style={{ marginTop: 10, marginBottom: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'You are here because this is either the first time you are using EZPartD on this device or because you uninstalled and then reinstalled EZPartD. If you have already registered EZPartD, please '}<Text style={styles.textBold}>{'Login'}</Text>{' to your account and your data will be recovered.'}</Text>
                <Text style={{ paddingBottom: 3 }}>{'If you have never used EZPartD before, you must first provide your state of residence. This is required since all prescription plan premiums and drug prices are state specific. Press '}<Text style={styles.textBold}>{'Continue'}</Text>{' to save your state.'}</Text>
              </View>
            }

            <TouchableHighlight
              onPress={stateListVisible ? this._idle : this._handleStateEntry}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>{'Your State: '}</Text>
                <Text style={{ paddingLeft: 10, color: '#86939e' }}>{stateSelected ? stateName : 'not selected'}
                </Text>
                {!stateListVisible &&
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1, alignItems: 'center' }}>
                    <Text style={{ textAlign: 'right', paddingLeft: 10 }}>
                      {'Pick another'}
                    </Text>
                    <Icon
                      name={'playlist-check'}
                      type={'material-community'}
                      color={'black'}
                      size={25}
                      containerStyle={{
                        paddingLeft: 10,
                        paddingRight: 10,
                      }}
                    />
                  </View>
                }
              </View>
            </TouchableHighlight>

            {stateListVisible &&
              <View style={{ flexShrink: 1, paddingTop: 20, paddingLeft: 20 }}>
                <Picker
                  mode={'dropdown'}
                  selectedValue={stateName}
                  onValueChange={(itemValue, itemIndex) => this._pickState(itemIndex, itemValue)}
                >
                  {serviceItems}
                </Picker>
              </View>
            }
            <View style={{ flexGrow: 1 }}>
              <Text>{' '}</Text>
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
                onPress={isAnonymous ? this._updateAnonymous : this._createAnonymous}
              >
                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
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
                    style={[styles.topTabText, { color: 'black' }]}
                  >
                    {'CONTINUE'}
                  </Text>
                </View>
              </TouchableHighlight>
              {isAnonymous ?
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={() => navigation.navigate('aRegCreate')}
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
                :
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
              }
            </View>
          </View>
        }

        {registerState === 'anonymous' &&
          <View>
            <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
              <Text style={{ paddingBottom: 3 }}>{'Creation  of an anonymous user account was successful!'}</Text>
              <Text style={{ paddingBottom: 3 }}>{'You can choose to continue to '}<Text style={styles.textBold}>{'REGISTER'}</Text>{' with your email and a password. This will allow you to securely store your drug selections and ensures that you are the only person able to access your data.'}</Text>
              <Text>{'If you just want to do do a quick search for presscription plans you can continue in '}<Text style={styles.textBold}>{'ANONYMOUS'}</Text>{' mode. No further information will be required from you, but you will not be able to save your drug data.'}</Text>
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
                    {'ANONYMOUS'}
                  </Text>
                </View>
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor={'#ccc'}
                onPress={() => navigation.navigate('aRegCreate')}
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
                    {'REGISTRATION'}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>

          </View>
        }

      </View >
    )
  }
}

aRegState.propTypes = {
  navigation: PropTypes.object.isRequired,
  // tablet: PropTypes.bool.isRequired,
  updateFlowState: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    tablet: state.platform['Tablet'],
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
  updateFlowState: Dispatch.updateFlowState,
}

export default connect(mapStateToProps, mapDispatchToProps)(aRegState);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
  textBold: {
    fontWeight: 'bold',
  },
});