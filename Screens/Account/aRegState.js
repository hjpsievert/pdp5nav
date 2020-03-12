import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Dimensions,
  Platform,
  Alert,
  ScrollView,
  FlatList,
  Picker,
  Keyboard
} from 'react-native';
import { Icon, Button } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Constants from 'expo-constants';
import { loadStates, createAnonymous } from '../../Utils/Api';
import { saveUserProfile } from '../../Utils/SaveData';
import { defaultProfileSave, usrMode } from '../../Utils/Constants';
import sortBy from 'lodash/sortBy';
import size from 'lodash/size';
// import normalize from '../Utils/normalizeText';

export class aRegState extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      stateId: 'AK',
      stateName: 'Select your state ...',
      stateSelected: false,
      stateBad: false,
      stateListVisible: true,
      registerState: 'initial',
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aRegState componentDidMount');
    loadStates((response) => {
      const { success, payLoad, code, err } = response;
      // console.log('RegisterState componentDidMount stateList ', response);
      this.setState({
        stateData: sortBy(payLoad, 'stateName'),
      });
    });
  }

  componentWillUnmount() {
    console.log('aRegCheck will unmount');
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

  _pickState = (itemValue, itemStateName) => {
    // console.log('pick value = ', itemValue, ', name = ', itemStateName);
    this.setState({
      stateId: itemValue,
      stateName: itemStateName,
      stateListVisible: false,
      stateSelected: true,
      stateBad: false,
    })
  }

  _handleStateEntry = () => {
    this.setState({
      stateListVisible: true,
    })
  }

  _renderState = (item) => {
    //console.log('_renderState item: ' + JSON.stringify(item.stateCode));
    return (
      <TouchableHighlight
        onPress={() => this._pickState(item.stateCode, item.stateName)}
      >
        <View style={{ borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
          <Text style={{ fontSize: 12, paddingTop: 5, paddingBottom: 5, textAlign: 'center' }}>
            {item.stateName}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

  _createAnonymous = () => {
    const { stateSelected, stateId, stateName } = this.state;
    const { installationId, deviceName } = Constants;
    const { userProfile } = this.props;
    const currDate = new Date();
    if (stateSelected) {
      userProfile.userMode = usrMode.anon;
      userProfile.userStateId = stateId;
      userProfile.userStateName = stateName;
      createAnonymous((response) => { this._finishCreateAnonymous(response, userProfile) }, installationId, deviceName, JSON.stringify(userProfile));
    }
    else return;
  }

  _finishCreateAnonymous = (response, userProfile) => {
    const { success, payLoad, code, err } = response;
    console.log('_finishCreateAnonymous success = ' + success + ', data ' + payLoad);
    const { navigation } = this.props;
    const { userIsSubscribed } = userProfile;

    if (success) {
      saveUserProfile(() => { this._finishSaveProfile() }, userProfile, defaultProfileSave, 'RegisterState');
      this.setState({
        registerState: 'anonymous'
      })
    }
    else {
      Alert.alert(
        'User Creation Error',
        payLoad,
        [
          {
            text: 'OK'
          },
        ]
      );
      navigation.popToTop();
    }
  }

  _finishSaveProfile = () => {
    console.log('RegisterState _finishSaveProfile completed');
  }

  render() {

    const { tablet, navigation, userProfile } = this.props;
    const { userIsSubscribed } = userProfile;
    const { adjust, stateListVisible, stateName, stateData, stateSelected, stateBad, registerState2 } = this.state;
    const registerState = 'initial';
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
            <View style={{ marginTop: 10, marginBottom: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
              <Text style={{ paddingBottom: 3 }}>{'You are here because this is either the first time you are using EZPartD on this device or because you uninstalled and then reinstalled EZPartD. If you have already registered EZPartD, please '}<Text style={styles.textBold}>{'Login'}</Text>{' to your account and your data will be recovered.'}</Text>
              <Text style={{ paddingBottom: 3 }}>{'If you have never used EZPartD before, you must first provide your state of residence. This is required since all prescription plan premiums and drug prices are state specific. Press '}<Text style={styles.textBold}>{'Continue'}</Text>{' to save your state.'}</Text>
            </View>

            <TouchableHighlight
              onPress={stateListVisible ? this._idle : this._handleStateEntry}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>{'Your State: '}</Text>
                <Text style={{ paddingLeft: 10, color: '#86939e' }}>{stateSelected ? stateName : 'not selected'}
                </Text>
                {!stateListVisible &&
                  <View style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1, alignItems: 'center'}}>
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
              <View style={{ flexShrink: 1, paddingTop: 20, paddingLeft: 20, width: Dimensions.get('window').width / 2 }}>
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
                onPress={this._createAnonymous}
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
              <TouchableHighlight
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
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    tablet: state.platform['Tablet'],
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
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
  stateContainer: {
    marginLeft: 15,
    marginRight: 15,
    ...Platform.select({
      ios: {
        marginLeft: 20,
        marginRight: 20,
      },
    }),
    borderBottomColor: '#bdc6cf',
    borderBottomWidth: 1,
  },
  input: {
    color: '#86939e',
    fontSize: 14, //Platform.OS === 'ios' ? normalize(14) : 14,
    paddingTop: 7,
    minHeight: 36,
  },
  textBold: {
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});