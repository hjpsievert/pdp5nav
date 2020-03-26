import React from 'react'
import {
  View,
  Text,
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
import { myStyles } from '../../Utils/Styles';
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
        stateId: userStateId,
        stateName: userStateName,
        stateSelected: true,
        stateListVisible: false,
      });
    }
  }

  componentWillUnmount() {
    console.log('aRegState did unmount');
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
        stateSelectionChanged: true
      });
      navigation.navigate('Home');
    }
    else return;
  }

  _exitCreateAnonymous = () => {
    const { updateFlowState, navigation } = this.props;
    updateFlowState({
      stateSelectionChanged: true
    });
    navigation.navigate('Home');
  }

  _createAnonymous = () => {
    const { stateSelected, stateId, stateName } = this.state;
    const { installationId, deviceName } = Constants;
    const { userProfile } = this.props;
    if (stateSelected) {
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
      userProfile.userMode = usrMode.anon;
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
        navigation.navigate('aAccount');
      }
    }
  }

  _finishSaveProfile = () => {
    console.log('RegisterState _finishSaveProfile completed');
  }

  render() {

    const { navigation, userProfile } = this.props;
    const { userMode } = userProfile;
    const { adjust, stateListVisible, stateName, stateData, stateSelected, registerState } = this.state;
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
            {userMode === usrMode.anon &&
              <View style={{ marginTop: 10, marginBottom: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'You are currently set up as anonymous user. If you want to change your state of registry, select the new state from the list and then press '}<Text style={myStyles.textBold}>{'Continue'}</Text>{' to save your selection.'}</Text>
                <Text style={{ paddingBottom: 3 }}>{'If you would like to become a fully registered user which will allow you to save drug and plan information, press '}<Text style={myStyles.textBold}>{'Register'}</Text>{'.'}</Text>
              </View>
            }
            {userMode === usrMode.init &&
              <View style={{ marginTop: 10, marginBottom: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Text style={{ paddingBottom: 3 }}>{'If you have already registered EZPartD, please '}<Text style={myStyles.textBold}>{'Login'}</Text>{' to your account and your data will be recovered.'}</Text>
                <Text style={{ paddingBottom: 3 }}>{'If you have not registered EZPartD before, you must first provide your state of residence. Once you have done that, you will be given the option to remain anonymous or to register with your eMail. Press '}<Text style={myStyles.textBold}>{'Continue'}</Text>{' to save your state.'}</Text>
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

              {userMode === usrMode.anon &&
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
                      style={myStyles.topTabText}
                    >
                      {'REGISTER'}
                    </Text>
                  </View>
                </TouchableHighlight>
              }
              {userMode === usrMode.init &&
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
                      style={myStyles.topTabText}
                    >
                      {'LOGIN'}
                    </Text>
                  </View>
                </TouchableHighlight>
              }

              {(userMode === usrMode.init || userMode === usrMode.anon) &&
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={stateSelected ? (userMode === usrMode.anon ? this._updateAnonymous : this._createAnonymous) : null}
                >
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Icon
                      name={'skip-forward'}
                      type={'feather'}
                      color={stateSelected ? 'black' : 'grey'}
                      size={25}
                      containerStyle={{
                        paddingLeft: 10,
                        paddingRight: 10,
                      }}
                    />
                    <Text
                      style={[myStyles.topTabText, { color: stateSelected ? 'black' : 'grey' }]}
                    >
                      {'CONTINUE'}
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
              <Text style={{ paddingBottom: 3 }}>{'You can choose to continue to '}<Text style={myStyles.textBold}>{'REGISTER'}</Text>{' with your email and a password. This will allow you to securely store your drug selections and ensures that you are the only person able to access your data.'}</Text>
              <Text>{'If you just want to do do a quick search for presscription plans you can continue in '}<Text style={myStyles.textBold}>{'ANONYMOUS'}</Text>{' mode. No further information will be required from you, but you will not be able to save your drug data.'}</Text>
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
                    style={[myStyles.topTabText, { color: 'black' }]}
                  >
                    {'REGISTER'}
                  </Text>
                </View>
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor={'#ccc'}
                onPress={this._exitCreateAnonymous}
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
                    style={myStyles.topTabText}
                  >
                    {'ANONYMOUS'}
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