import React from 'react'
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Platform,
  TouchableHighlight,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Icon } from 'react-native-elements';
import * as LocalAuthentication from 'expo-local-authentication';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import { loadAllData } from '../../Utils/InitialLoad';
import { findPlans } from '../../Utils/Api';
import { usrMode, Defaults } from '../../Utils/Constants';
import Constants from 'expo-constants';
import { updateDevice, ContentInfo } from '../../Utils/Api';
import { myStyles } from '../../Utils/Styles';
import size from 'lodash/size';
import flatMap from 'lodash/flatMap';
import sortBy from 'lodash/sortBy';
import lowerCase from 'lodash/lowerCase';
import * as Localization from 'expo-localization';

export class pHome extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      drugsLoaded: false,
      showPlans: false,
      showActive: true,
      showGreeting: true,
      animating: false,
      planListDirty: false,
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
    }
  }

  componentDidMount() {
    console.log('pHome did mount');
    Dimensions.addEventListener('change', this._handleDimChange);

    // console.log('Localization region = ', Localization.region, ', timezone = ', Localization.timezone,' current time = ', new Date().toLocaleString(Localization.locale, {timeZone: Localization.timezone}));

    const { userProfile, isStarted } = this.props;
    console.log('pHome componentDidMount isStarted = ', isStarted, ', local profile = ', JSON.stringify(userProfile));

    this._authFunction();

    // removeAllKeys(this._handleSaveActive, 'activeFindDrugs');
    // removeAllKeys(this._handleSaveActive, 'activePlanDrugs');
    // removeAllKeys(this._handleSaveActive, 'savedPlanDrugs');
    // removeAllKeys(this._handleSaveActive, 'backupActivePlanDrugs');
    // removeAllKeys(this._handleSaveActive, 'userProfile');

    loadAllData((profile, drugList) => {
      this._finishDataLoad(profile, drugList)
    });
  }

  componentDidUpdate(prevProps) {
    console.log('pHome componentDidUpdate');

    const { stateSelectionChanged } = this.props;
    if (stateSelectionChanged) {
      this._findPlans();
    }
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this._handleDimChange);
    console.log('pHome did unmount');
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('pHome _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _authFunction = async () => {
    const { isStarted, updatePlatformValue } = this.props;
    if (!isStarted) {
      // only execute if this app has been newly started
      const updateLogin = true;
      updateDevice((response) => { this._finishUpdateDevice(response) }
        , Constants.installationId, null, null, updateLogin);
      ContentInfo((response) => {
        const { payLoad } = response;
        console.log('pHome _authFunction installationId = ', Constants.installationId);
        this.props.updateContent(payLoad)
      });
    }
    let hasHardware = false;
    let isEnrolled = false;
    hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (hasHardware) {
      isEnrolled = await LocalAuthentication.isEnrolledAsync();
    }
    updatePlatformValue({
      hasFPHardware: hasHardware,
      isFPEnrolled: isEnrolled,
    })
  }

  _finishUpdateDevice = (response) => {
    // may finish after loadAllData, but only impacts previous login displayed
    const { success, payLoad } = response;
    console.log('pHome _finishUpdateDevice success = ', success, ', prev login = ', payLoad.previousLogin);
    this.props.updateFlowState({
      isStarted: true,
      previousLogin: payLoad.previousLogin,
    })
  }

  _handleSaveActive = (response) => {
    console.log('pHome saveActive completed ' + response);
  }

  _finishDataLoad = (profile, drugList) => {
    const { addSelectionToMyDrugs, addSelectionToMyFDDrugs, updateFlowState } = this.props;
    console.log('pHome _finishDataLoad, drugCount = ', size(drugList));
    const { userIsSubscribed } = profile;
    const doClear = true;

    if (size(drugList) > 0) {
      if (userIsSubscribed) {
        addSelectionToMyFDDrugs(drugList, doClear);
        updateFlowState({
          fdPlanListDirty: true,
          fdActiveListDirty: false,
          // fdAnimating: true,
          fdAnimating: false,
        });
      }
      else {
        addSelectionToMyDrugs(drugList, doClear);
        updateFlowState({
          activeListDirty: false,
        });
        this.setState({
          animating: true,
          planListDirty: true,
        });
      }
    }
    else {
      updateFlowState({
        activeListDirty: false,
        fdPlanListDirty: false,
        fdActiveListDirty: false,
        fdAnimating: false,
      });
      this.setState({
        animating: false,
        planListDirty: true,
      });
    }
    // common flowState settings across all cases
    updateFlowState({
      doMailState: Defaults.doMailState,
      startDate: new Date().toLocaleDateString('en-US'),
    })
    this.setState({
      drugsLoaded: true,
    });
    this._findPlans();
  }

  _findPlans = () => {
    const { myConfigList, drugCount, doMailState, startDate, userProfile, stateSelectionChanged, updateFlowState } = this.props;
    const { planListDirty } = this.state;
    const { userStateId } = userProfile;
    const stateId = userStateId;
    console.log('pHome _findPlans, drugCount ', drugCount, ', planListDirty = ', planListDirty, ', stateChenged = ', stateSelectionChanged); //, 'userProfile = ' , JSON.stringify(userProfile));

    if (stateSelectionChanged) {
      this.setState({
        planListDirty: true
      });
    }

    if ((planListDirty || stateSelectionChanged) && stateId) {
      this.setState({ animating: true });
      updateFlowState({
        stateSelectionChanged: false
      })

      // console.log('pHome _findPlans config = ', myConfigList);
      findPlans((response) => {
        this.onFindPlansComplete(response);
      }, JSON.stringify(myConfigList), stateId, doMailState, startDate);
    }
  }

  // ToDo: make this a utility function across components??
  onFindPlansComplete = (response) => {
    const { payLoad, code } = response;
    const { handleUpdatePlanList } = this.props;
    handleUpdatePlanList(payLoad);
    console.log('pHome onFindPlansComplete planList size = ', code);

    // setState in pHome, updateFlowState elsewhere
    this.setState({
      planListDirty: false,
      animating: false,
    });
  }

  _toggleShowGreeting = () => {
    this.setState({
      showGreeting: !this.state.showGreeting,
    });
  }

  _toggleShowActive = () => {
    const { drugCount } = this.props;
    if (drugCount > 0) {
      this.setState({
        showActive: !this.state.showActive,
        showGreeting: this.state.showActive ? this.state.showGreeting : false,
      });
    }
  }

  _handleAdd = () => {
    const { navigation } = this.props;
    navigation.navigate('Drugs', { screen: 'pDrugSearch' });
  }

  _renderDrugItem = (item) => {
    return (
      <View style={{ flex: 1, backgroundColor: '#eee', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
        <Text style={{ paddingLeft: 35, fontSize: 12, paddingTop: 5, paddingBottom: 5 }}>
          {(item.isBrand ? item.brandName + ' (' + item.baseName + ')' : item.baseName) + ', ' + item.rxStrength + ' ' + item.units + ' ' + lowerCase(item.dosage || item.fullRoute)}
        </Text>
      </View>
    );
  }

  _toggleShowPlans = () => {
    this.setState({
      showPlans: !this.state.showPlans,
      showGreeting: this.state.showPlans ? this.state.showGreeting : false,
    });
  }

  _renderPlanItem = (item) => {
    const { planName, totalCost } = item;

    const { planNumerator, planDenominator } = this.props;
    const range = (totalCost - planNumerator) / planDenominator;
    const cutoff = 0.8;
    const green = range > 1 - cutoff ? (1 - range) / cutoff * 255 : 255;
    const red = range < 1 - cutoff ? 255 * range / (1 - cutoff) : 255;
    const bcColor = '#' + ((1 << 24) + (red << 16) + (green << 8)).toString(16).slice(1);
    const myTitle = planName + ' $' + totalCost.toFixed(0);

    return (
      <View style={{ borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
        <Text style={{ fontSize: 12, paddingLeft: 35, paddingTop: 5, paddingBottom: 5, backgroundColor: bcColor }}>
          {myTitle}
        </Text>
      </View>
    );
  }

  render() {
    const { showActive, showPlans, showGreeting, adjust, drugsLoaded, animating } = this.state;
    const { drugCount, planCount, myPlans, activeDrugs, userProfile, previousLogin, navigation } = this.props;
    console.log('pHome render, user profile = ', JSON.stringify(userProfile));

    let currDate;
    if (previousLogin) {
      currDate = new Date(previousLogin);
    }
    else {
      currDate = new Date();
    }

    if (Platform.OS === 'web') {
      const hour = currDate.getHours();
      const offset = currDate.getTimezoneOffset() / 60;
      if (hour >= offset) {
        currDate.setHours(hour - offset);
      }
      else {
        currDate.setHours(hour + 24 - offset);
        currDate.setDate(currDate.getDate() - 1);
      }
    }
    const { displayName, userMode, userStateName } = userProfile;

    return (
      <View>
        {!drugsLoaded ?
          <View>
            <Text style={{ paddingTop: 50, textAlign: 'center' }}>{'Loading data ...'}</Text>
            <ActivityIndicator
              animating={true}
              style={styles.progress}
              size="large"
            />
          </View>
          :
          <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >

            <TouchableHighlight
              underlayColor={'#ccc'}
              onPress={this._toggleShowGreeting}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10, paddingTop: 5, paddingBottom: 5, backgroundColor: '#75aaff', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
                <Text style={{ fontSize: 18, color: 'black', textAlign: 'left', paddingLeft: 5, paddingTop: 3, paddingBottom: 3 }}>
                  {'Welcome to EZPartD' + (userStateName ? ' for ' + userStateName : '')}
                </Text>
                {userMode != usrMode.init &&
                  <Text style={{ fontSize: 10, color: 'black', textAlign: 'right', paddingRight: 10, paddingTop: 3, paddingBottom: 3 }}>
                    {showGreeting ? 'hide ...' : 'more ...'}
                  </Text>
                }
              </View>
            </TouchableHighlight>

            {userMode === usrMode.init &&
              <View style={{ flex: 1, flexDirection: 'column', justifyContent:'space-between'}}>
                <View style={{ paddingBottom: 5, backgroundColor: '#a4c6fc' }}>
                  <Text style={styles.body}>{'You are here because this is either the first time you are using EZPartD on this device or because you uninstalled and then reinstalled EZPartD. \n\nIf you are a registered EZPartD user, please '}<Text style={myStyles.textBold}>{'Login'}</Text>{' to your account and your data will be recovered.\n\nIf you have not registered EZPartD before, you must at least register your state of residence. This is required since all prescription plan premiums and drug prices are state specific. Press '}<Text style={myStyles.textBold}>{'Register'}</Text>{' to procede.'}</Text>
                </View>

                <View style={{
                  flexShrink: 1,
                  marginBottom: 20,
                  marginHorizontal: 10,
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
                    onPress={() => navigation.navigate('Account', { screen: 'aRegState' })}
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

                  <TouchableHighlight
                    underlayColor={'#ccc'}
                    onPress={() => navigation.navigate('Account', { screen: 'aLogin' })}
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
                </View>
              </View>
            }

            {showGreeting && userMode != usrMode.init &&
              <View style={{ paddingBottom: 5, backgroundColor: '#a4c6fc' }}>
                <Text style={[styles.body, { textAlign: 'center', paddingBottom: 3 }]}>{(displayName ? displayName : 'Mode') + ': ' + userMode + ', last access ' + currDate.toLocaleString(Localization.locale)}</Text>
                <Text style={styles.body}>{'You are currently not subscribed to any plan. You can use '}<Text style={myStyles.textBold}>{'Add Drug'}</Text>{' to ' + (drugCount > 0 ? 'extend your list' : 'build a list') + '. The plans available for your state will be updated as your drugs are updated.'}</Text>
                <Text style={styles.body}>{'You can configure the list for various "what if" scenarios switching to '}<Text style={myStyles.textBold}>{'Drugs'}</Text>{' and analyze your plans to identify the most cost efficient choice for your needs from '}<Text style={myStyles.textBold}>{'Plans'}</Text>{'.'}</Text>
              </View>
            }

            {userMode != usrMode.init &&
              <View style={{ flexShrink: 1, flexDirection: 'column', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10, backgroundColor: '#ddd', borderBottomColor: '#bbb', paddingTop: 5, paddingBottom: 5, borderBottomWidth: 1 }}>
                  <TouchableHighlight
                    underlayColor={'#ccc'}
                    onPress={drugCount > 0 ? this._toggleShowActive : () => { }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                      {drugCount > 0 &&
                        <Icon
                          name={showActive ? 'triangle-down' : 'triangle-right'}
                          type={'entypo'}
                          color={'black'}
                          size={20}
                        />
                      }
                      <Text style={{ fontSize: 14, color: 'black', textAlign: 'left', paddingLeft: 5, paddingTop: 3, paddingBottom: 3 }}>
                        {'Active List, ' + drugCount + ' drug' + (drugCount != 1 ? 's' : '')}</Text>
                    </View>
                  </TouchableHighlight>
                  {drugCount === 0 &&
                    <TouchableHighlight
                      underlayColor={'#ccc'}
                      onPress={this._handleAdd}
                    >
                      <View style={{ flexDirection: 'row', paddingRight: 10 }}>
                        <Text style={myStyles.topTabText}>
                          {'Add Drug'}
                        </Text>
                        <Icon
                          name={'add'}
                          type={'material'}
                          color={'black'}
                          size={20}
                        />
                      </View>
                    </TouchableHighlight>
                  }
                </View>

                {showActive &&
                  <FlatList
                    data={activeDrugs}
                    renderItem={({ item, index }) => this._renderDrugItem(item, index)}
                    keyExtractor={(item) => item.drugId.toString()}
                    horizontal={false}
                    extraData={this.state.flag}
                  />
                }
              </View>
            }

            {animating &&
              <View >
                <Text style={styles.planLoading}>{'Processing your drug configurations and finding best plans'}</Text>
                <ActivityIndicator
                  animating={true}
                  style={styles.progress}
                  size="large"
                />
              </View>
            }

            {planCount > 0 &&
              <View style={{ flexShrink: 1, flexDirection: 'column', justifyContent: 'center' }}>
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={this._toggleShowPlans}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 10, backgroundColor: '#ddd', borderBottomColor: '#bbb', paddingTop: 5, paddingBottom: 5, borderBottomWidth: 1 }}>
                    <Icon
                      name={showPlans ? 'triangle-down' : 'triangle-right'}
                      type={'entypo'}
                      color={'black'}
                      size={20}
                    />
                    <Text style={{ fontSize: 14, color: 'black', textAlign: 'left', paddingLeft: 5, paddingTop: 3, paddingBottom: 3, flex: 1 }}>
                      {planCount + ' Plan' + (planCount > 1 ? 's' : '') + ' for your drugs in ' + userStateName + (showPlans ? ', showing top 10' : '')}</Text>
                  </View>
                </TouchableHighlight>
                {showPlans &&
                  <FlatList
                    data={myPlans}
                    renderItem={({ item }) => this._renderPlanItem(item)}
                    keyExtractor={(item) => item.planId.toString()}
                    extraData={this.state.flag}
                  />
                }
              </View>
            }
          </View>
        }
      </View>
    )
  }
}

pHome.propTypes = {
  activeDrugs: PropTypes.array.isRequired,
  addSelectionToMyDrugs: PropTypes.func.isRequired,
  addSelectionToMyFDDrugs: PropTypes.func.isRequired,
  doMailState: PropTypes.bool.isRequired,
  drugCount: PropTypes.number.isRequired,
  handleUpdatePlanList: PropTypes.func.isRequired,
  isStarted: PropTypes.bool.isRequired,
  myConfigList: PropTypes.array.isRequired,
  myPlans: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  planCount: PropTypes.number.isRequired,
  planDenominator: PropTypes.number.isRequired,
  planNumerator: PropTypes.number.isRequired,
  previousLogin: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  stateSelectionChanged: PropTypes.bool.isRequired,
  updateContent: PropTypes.func.isRequired,
  updateFlowState: PropTypes.func.isRequired,
  updatePlatformValue: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    userProfile: state.profile,
    isStarted: state.flowState['isStarted'] ?? false,
    doMailState: state.flowState['doMailState'] ?? false,
    startDate: state.flowState['startDate'] ?? new Date().toLocaleDateString('en-US'),
    previousLogin: state.flowState['previousLogin'] ?? '',
    activeDrugs: flatMap(state.myDrugs, (d) => d.drugDetail),
    drugCount: size(state.myDrugs) ?? 0,
    myConfigList: flatMap(state.myDrugs, (d) => d.configDetail),
    myPlans: size(state.myPlans) ? sortBy(flatMap(state.myPlans, (d) => d), 'totalCost').slice(0, 10) : [],
    planCount: size(state.myPlans) ?? 0,
    planDenominator: size(state.myPlans) ? sortBy(flatMap(state.myPlans, (d) => d), 'totalCost')[size(state.myPlans) - 1].totalCost - sortBy(flatMap(state.myPlans, (d) => d), 'totalCost')[0].totalCost : 1,
    stateSelectionChanged: state.flowState['stateSelectionChanged'] ?? false,
    planNumerator: size(state.myPlans) ? sortBy(flatMap(state.myPlans, (d) => d), 'totalCost')[0].totalCost : 0,
  }
}

const mapDispatchToProps = {
  addSelectionToMyDrugs: Dispatch.addSelectionToMyDrugs,
  addSelectionToMyFDDrugs: Dispatch.addSelectionToMyFDDrugs,
  handleUpdatePlanList: Dispatch.handleUpdatePlanList,
  updateContent: Dispatch.updateContent,
  updateFlowState: Dispatch.updateFlowState,
  updatePlatformValue: Dispatch.updatePlatformValue,
}

export default connect(mapStateToProps, mapDispatchToProps)(pHome);

const styles = StyleSheet.create({
  body: {
    marginTop: 3,
    // marginLeft: 15,
    marginLeft: 15,
    marginRight: 15,
    fontSize: 12,
    // borderWidth: 3,
    // borderColor: 'yellow',
  },
  planLoading: {
    fontSize: 10,
    textAlign: 'center',
    margin: 5,
  },
  progress: {
    height: 40,
  },
})
