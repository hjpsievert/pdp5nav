import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform,
  Dimensions,
  Picker
} from 'react-native';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import Constants from 'expo-constants';
import { usrMode } from '../../Utils/Constants';
import { loadStates, loadStatePlans } from '../../Utils/Api';
import { saveUserProfile } from '../../Utils/SaveData';
import { defaultProfileSave } from '../../Utils/Constants';
import sortBy from 'lodash/sortBy';
import size from 'lodash/size';

export class aUserMode extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      stateBad: false,
      planBad: false,
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aUserMode componentDidMount');
    loadStates((response) => {
      const { payLoad } = response;
      const { userProfile } = this.props;
      const { userPlanId, userContractId, userPlanName, userStateId, userIsSubscribed } = userProfile;
      const planDisplay = userPlanId && userContractId && userPlanName ? (userPlanId + '-' + userContractId + ': ' + userPlanName) : 'Select your plan ...';
      this.setState({
        stateId: userStateId,
        stateName: userStateId ? payLoad.find((st) => st.stateCode === userStateId).stateName : 'Select the name of your state ...',
        stateSelected: userStateId ? true : false,
        stateData: sortBy(payLoad, 'stateName'),
        planId: userPlanId,
        contractId: userContractId,
        planReload: userStateId ? true : false,
        planName: userPlanName,
        planSelected: userPlanId ? true : false,
        planDisplay: planDisplay ? planDisplay : ('Select your' + (userStateId ? (' ' + payLoad.find((st) => st.stateCode === userStateId).stateName + ' ') : ' ') + 'plan ...'),
        drugFind: userIsSubscribed ? true : false,
      });
      console.log('aUserMode componentDidMount, stateData loaded');
      // console.log('aUserMode componentDidMount, stateData = ' + JSON.stringify(payLoad));
    }
    );
  }

  componentDidUpdate() {
    const { stateId, planReload, planId } = this.state;
    console.log('aUserMode componentDidUpdate');
    if (planReload && stateId) {
      loadStatePlans((response) => {
        const { payLoad } = response;
        this.setState({
          planData: sortBy(payLoad, 'planName'),
          planName: planId ? (payLoad.find((pl) => pl.planId === planId) ? payLoad.find((pl) => pl.planId === planId).planName : payLoad[0].planName) : payLoad[0].planName,
          planReload: false,
        });
        console.log('aUserMode componentDidUpdate, stateData loaded');

      }, stateId);
    }
  }

  componentWillUnmount() {
    console.log('aUserMode did unmount');
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

  // called from both _renderState for iOS flatList and Picker in render() for Android pick list
  _pickState = (itemIndex, itemStateName) => {
    const { stateData } = this.state;
    console.log('pick state value = ', itemIndex, ', name = ', itemStateName, 'stateId = ', stateData[itemIndex].stateCode);
    this.setState({
      stateId: stateData[itemIndex].stateCode,
      stateName: itemStateName,
      stateListVisible: false,
      stateSelected: true,
      stateBad: false,
      planReload: true,
      planSelected: false,
      planBad: false,
      planId: '',
      contractId: '',
      planName: '',
      planDisplay: 'Select your ' + itemStateName + ' plan ...',
    })
  }

  // called when state is only displayed, switches to entry mode
  _handleStateEntry = () => {
    this.setState({
      stateListVisible: true,
      planListVisible: false,
    })
  }

  // called when drug find radio button pressed
  _handleDrugFind = () => {
    this.setState({
      drugFind: true,
    });
  }

  _pickPlan = (itemIndex, itemPlanName) => {
    const { planData } = this.state;
    console.log('pick plan value = ', itemIndex, ', name = ', itemPlanName, ', plans ', + size(planData));
    this.setState({
      planId: planData[itemIndex].planId,
      contractId: planData[itemIndex].contractId,
      planName: itemPlanName,
      planDisplay: planData[itemIndex].planId + '-' + planData[itemIndex].contractId + ': ' + itemPlanName,
      planListVisible: false,
      planSelected: true,
      planBad: false,
    })
  }

  // called when plan is only displayed, switches to entry mode
  _handlePlanEntry = () => {
    this.setState({
      planListVisible: true,
      stateListVisible: false,
    })
  }

  // called when plan find radio button pressed
  _handlePlanFind = () => {
    this.setState({
      drugFind: false,
    });
  }

  _saveProfile = () => {
    const { userProfile } = this.props;
    const {userMode} = userProfile;
    const {installationId} = Constants;
    console.log('aUserMode _saveProfile, user profile = ', JSON.stringify(userProfile));
    const { stateId, stateName, planId, planName, contractId, drugFind, planSelected, stateSelected } = this.state;
    let newProfile = { ...userProfile };
    if (drugFind) {
      if (!planSelected || !stateSelected) {
        this.setState({
          planBad: planSelected ? false : true,
          stateBad: stateSelected ? false : true,
        })
      }
      else {
        newProfile.userStateId = stateId;
        newProfile.userStateName = stateName;
        newProfile.userPlanId = planId;
        newProfile.userContractId = contractId;
        newProfile.userPlanName = planName;
        newProfile.userIsSubscribed = true;
        saveUserProfile(() => { this._finishSaveProfile() }, newProfile, defaultProfileSave, 'aUserMode', userMode === usrMode.anon ? installationId : null);
      }
    }
    else {
      newProfile.userStateId = stateId;
      newProfile.userStateName = stateName;
      newProfile.userIsSubscribed = false;
      saveUserProfile(() => { this._finishSaveProfile() }, newProfile, defaultProfileSave, 'aUserMode', userMode === usrMode.anon ? installationId : null);
    }
  }

  _finishSaveProfile = () => {
    console.log('Exiting RegisterUserMode');
    const { navigation, updateFlowState } = this.props;
    // navigation.navigate('top');
    updateFlowState({
      reloadMain: true,
    })
    navigation.popToTop();
  }

  render() {

    const { adjust, stateListVisible, planListVisible, stateName, planName, planDisplay, stateData, planData, stateSelected, planSelected, drugFind } = this.state;
    const { userProfile } = this.props;

    if (!userProfile) {
      return null;
    }

    // data to populate pick lists for state and plans, used with Android
    let stateListItems;
    if (stateData) {
      stateListItems = stateData.map((s) => {
        return <Picker.Item key={s.stateCode} value={s.stateName} label={s.stateName} />
      });
    }
    let planListItems;
    if (planData) {
      planListItems = planData.map((s) => {
        return <Picker.Item key={s.planId + '-' + s.contractId} value={s.planName} label={s.planName} />
      });
    }

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{
          flexDirection: 'column', paddingLeft: 15, paddingRight: 15, flex: 1
        }}
        >

          <View style={{ marginTop: 10, marginBottom: 10, borderColor: '#bbb', borderWidth: 1, backgroundColor: 'linen', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
            <Text style={{ paddingBottom: 3 }}>{'Update your user mode as needed'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text>{'User Mode'}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 5, paddingBottom: 5, borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
            <TouchableHighlight
              onPress={this._handlePlanFind}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
                <Icon
                  name={!drugFind ? 'radiobox-marked' : 'radiobox-blank'}
                  type={'material-community'}
                  color={'black'}
                  size={18}
                  iconStyle={{ paddingLeft: 5 }}
                />
                <Text
                  style={{ fontSize: 12, color: 'black', textAlign: 'left', paddingLeft: 5 }}
                >{'Plan Finder'}</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={this._handleDrugFind}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name={drugFind ? 'radiobox-marked' : 'radiobox-blank'}
                  type={'material-community'}
                  color={'black'}
                  size={18}
                  iconStyle={{ paddingLeft: 5 }}
                />
                <Text
                  style={{ fontSize: 12, color: 'black', textAlign: 'left', paddingLeft: 5 }}
                >{'Drug Finder'}</Text>
              </View>
            </TouchableHighlight>
          </View>

          <TouchableHighlight
            underlayColor={'#ccc'}
            onPress={stateListVisible && !planListVisible ? this._idle : this._handleStateEntry}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 4, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: 5 }}>
                <Text>{'Your State: '}</Text>
                <Text style={{ paddingLeft: 10, color: '#86939e' }}>{stateSelected ? stateName : 'not selected'}
                </Text>
              </View>

              {!stateListVisible && !planListVisible &&
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 2, alignItems: 'center' }}>
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

          {stateListVisible && !planListVisible &&
            <View style={{ flexShrink: 1, paddingTop: 20, paddingLeft: 20 }}>
              <Picker
                mode={'dropdown'}
                selectedValue={stateName}
                onValueChange={(itemValue, itemIndex) => this._pickState(itemIndex, itemValue)}
              >
                {stateListItems}
              </Picker>
            </View>
          }

          {drugFind &&
            <View>
              <TouchableHighlight
                underlayColor={'#ccc'}
                onPress={planListVisible && !stateListVisible ? this._idle : this._handlePlanEntry}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 4, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: 5 }}>
                    <Text>{'Your Insurance Plan: '}</Text>
                    <Text style={{ paddingLeft: 10, color: '#86939e' }}>{planSelected ? planDisplay : 'not selected'}
                    </Text>
                  </View>
                  {!planListVisible && !stateListVisible &&
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 2, alignItems: 'center' }}>
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

              {planListVisible && !stateListVisible &&
                <View style={{ flexShrink: 1, paddingTop: 20, paddingLeft: 0 }}>
                  <Picker
                    mode={'dropdown'}
                    selectedValue={planName}
                    onValueChange={(itemValue, itemIndex) => this._pickPlan(itemIndex, itemValue)}
                  >
                    {planListItems}
                  </Picker>
                </View>
              }
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
              onPress={this._saveProfile}
            >
              <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                <Icon
                  name={'content-save-outline'}
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
                  {'SAVE'}
                </Text>
              </View>
            </TouchableHighlight>

          </View>
        </View>
      </View>
    )
  }
}

aUserMode.propTypes = {
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
  updateFlowState: Dispatch.updateFlowState,
}

export default connect(mapStateToProps, mapDispatchToProps)(aUserMode);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});