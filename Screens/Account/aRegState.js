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
      stateName: 'Select the name of your state ...',
      stateSelected: false,
      stateBad: false,
      stateListVisible: false,
      registerState: 'initial',
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aRegState componentDidMount');
    loadStates((response) => {
      // console.log('RegisterState componentDidMount stateList ', response);
      const { success, payLoad, code, err } = response;
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
    else {
      this.setState({
        stateBad: !stateSelected,
      });
      Alert.alert(
        'Register User',
        'You have to provide a valid state in order to complete registration!',
        [
          {
            text: 'OK'
          },
        ]
      );
    }
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
      navigation.navigate(userIsSubscribed ? 'fdHomeScreen' : 'fpHomeScreen');
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
            <ScrollView>
              <View style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
                <View style={{ marginTop: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                  <Text style={{ paddingBottom: 3 }}>{'You are here because this is either the first time you are using EZPartD on this device or because you uninstalled and then reinstalled EZPartD. If you have already registered EZPartD, please '}<Text style={styles.textBold}>{'Login'}</Text>{' to your account and your data will be recovered.'}</Text>
                  <Text style={{ paddingBottom: 3 }}>{'If you have never used EZPartD before, you must first provide your state of residence. This is required since all prescription plan premiums and drug prices are state specific. Press '}<Text style={styles.textBold}>{'Continue'}</Text>{' to save your state.'}</Text>
                </View>

                <Text>{'State of Residence'}</Text>
                {stateListVisible ?
                  <View style={{ paddingLeft: 20, flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <View style={{ width: Dimensions.get('window').width / 2, maxHeight: Dimensions.get('window').height / 4 }}>
                      {Platform.OS === 'ios' ?
                        <FlatList
                          data={stateData}
                          initialNumToRender={size(stateData)}
                          renderItem={({ item }) => this._renderState(item)}
                          keyExtractor={(item) => item.stateCode}
                        />
                        :
                        <Picker
                          mode={'dropdown'}
                          selectedValue={stateName}
                          onValueChange={(itemValue, itemIndex) => this._pickState(itemIndex, itemValue)}
                        >
                          {serviceItems}
                        </Picker>
                      }
                    </View>
                  </View>
                  :
                  <TouchableHighlight
                    onPress={this._handleStateEntry}
                  >
                    <View style={styles.stateContainer}>
                      <Text style={[styles.input, { color: stateSelected ? '#86939e' : '#C7C7CD' }]}>{stateName}</Text>
                    </View>
                  </TouchableHighlight>
                }
                {stateBad && <Text>
                  {'You must select a state of residence.'}
                </Text>}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 25 }}>
                  <View style={{ width: 2 * Dimensions.get('window').width / 4 }}>
                    <Button
                      raised={true}
                      icon={{ name: 'ios-arrow-dropright', type: 'ionicon' }}
                      iconRight
                      backgroundColor={'green'}
                      color={'white'}
                      title={'Continue'}
                      onPress={this._createAnonymous}
                    />
                  </View>
                  <View style={{ width: 2 * Dimensions.get('window').width / 4 }}>
                    <Button
                      raised={true}
                      icon={{ name: 'ios-arrow-dropright', type: 'ionicon' }}
                      iconRight
                      backgroundColor={'green'}
                      color={'white'}
                      title={'Login'}
                      onPress={() => navigation.navigate('acLogin')}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          }
                </View>
    )
  }
}

aRegState.propTypes = {
  navigation: PropTypes.object.isRequired,
  tablet: PropTypes.bool.isRequired,
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