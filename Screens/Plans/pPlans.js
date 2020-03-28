import React from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Dispatch from '../../Redux/Dispatches';
import {
  View,
  Text,
  Dimensions,
  Platform,
  ActivityIndicator,
  StyleSheet,
  TouchableHighlight,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Defaults } from '../../Utils/Constants';
import { findPlans } from '../../Utils/Api';
import { Icon } from 'react-native-elements';
import flatMap from 'lodash/flatMap';
import sortBy from 'lodash/sortBy';
import take from 'lodash/take';
import size from 'lodash/size';

export class pPlans extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      showPhases: true,
      compareSelected: [],
      dataSource: take(sortBy(flatMap(props.myPlans, (d) => d), 'totalCost'), Defaults.plansToShow),
      maxCompare: 5,
      plansToShow: Defaults.plansToShow
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    const { userProfile, myConfigList, doMailState, startDate, planListDirty, animating, planCount, myPlans, updateFlowState } = this.props;
    const { userStateId, userStateName } = userProfile;
    const { dataSource, plansToShow } = this.state;

    console.log('pPlans did mount, doMailState = ', doMailState, ', startDate = ', startDate);
    this.props.navigation.setParams({
      stateTitle: 'Drug Plans for ' + userStateName,
    })

    if (planListDirty && !animating) {
      updateFlowState({ animating: true });
      findPlans((response) => {
        this.onFindPlansComplete(response);
      }, JSON.stringify(myConfigList), userStateId, doMailState, startDate);
    }
    if (planCount > 0 && size(dataSource) === 0) {
      this.setState({
        dataSource: take(sortBy(flatMap(myPlans, (d) => d), 'totalCost'), plansToShow),
      })
    }
  }

  componentDidUpdate(prevProps) {
    const { planListDirty, animating, userProfile, myConfigList, doMailState, startDate, updateFlowState, planCount, myPlans } = this.props;
    const { dataSource, plansToShow } = this.state;

    console.log('pPlans did update, planListDirty ', planListDirty, ', planCount = ', planCount); //, ', dataSource = ', size(dataSource));
    const userStateId = userProfile.userStateId;

    if (planListDirty && !animating) {
      updateFlowState({ animating: true });
      findPlans((response) => {
        this.onFindPlansComplete(response);
      }, JSON.stringify(myConfigList), userStateId, doMailState, startDate);
    }
    if ((planCount > 0 && size(dataSource) === 0) || prevProps.myPlans != this.props.myPlans) {
      console.log('pPlans myPlans has changed: ', prevProps.myPlans != this.props.myPlans)
      this.setState({
        dataSource: take(sortBy(flatMap(myPlans, (d) => d), 'totalCost'), plansToShow),
      })
    }
  }

  componentWillUnmount() {
    console.log('pPlans did unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('pPlans _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  // ToDo: make this a utility function across components??
  onFindPlansComplete = (response) => {
    const { payLoad, code } = response;
    const { handleUpdatePlanList } = this.props;
    handleUpdatePlanList(payLoad);
    const { updateFlowState, myPlans } = this.props;
    const {plansToShow} = this.state;
    console.log('pPlans onFindPlansComplete planList size = ', code);
    // only in pPlans
    this.setState({
      dataSource: take(sortBy(flatMap(myPlans, (d) => d), 'totalCost'), plansToShow),
    });
    // setState in pHome, updateFlowState elsewhere
    updateFlowState({
      planListDirty: false,
      animating: false,
    });
  }

  _showPlanCount = (plansToShow, targetCount) => {
    const { planCount } = this.props;
    const targetTest = targetCount < 99 ? targetCount : Math.min(planCount, targetCount);
    // console.log('pPlans _showPlanCount plansToShow = ', plansToShow, ', targetCount = ', targetCount, ', targetTest = ', targetTest);
    return (
      <TouchableHighlight
        onPress={() => this._handleShowPlans(targetCount)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{ fontSize: 14, color: 'black', textAlign: 'left', paddingLeft: 5 }}
          >{targetCount < 99 ? targetCount : 'All'}</Text>
          <Icon
            name={plansToShow === targetTest ? 'radiobox-marked' : 'radiobox-blank'}
            type={'material-community'}
            color={'black'}
            size={18}
            iconStyle={{ paddingLeft: 5 }}
          />
        </View>
      </TouchableHighlight>
    )
  }

  _handleShowPlans = (numPlans) => {
    const { planCount, myPlans } = this.props;
    const plansToShow = Math.min(numPlans, planCount);

    this.setState({
      plansToShow: plansToShow,
      dataSource: take(sortBy(flatMap(myPlans, (d) => d), 'totalCost'), plansToShow),
    })
    console.log('pPlans _handleShowPlans numPlans = ', numPlans, ', plansToShow = ', plansToShow);
  }

  _handleMailChanged = () => {
    const { updateFlowState, doMailState } = this.props;
    updateFlowState({
      planListDirty: true,
      doMailState: !doMailState,
    })
  }

  _handlePhaseToggle = () => {
    this.setState({
      showPhases: !this.state.showPhases,
      // dataSource: this.state.showPhases ? take(sortBy(flatMap(this.props.myPlans, (d) => d), 'bestCost'), plansToShow) : take(sortBy(flatMap(this.props.myPlans, (d) => d), 'totalCost'), plansToShow),
    })
  }

  _handleStartDate = () => {
    const { updateFlowState } = this.props;
    updateFlowState({
      planListDirty: true,
    })
  }

  _renderItem = (item, index) => {
    const newText = item.subtitle + ' ' + item.line + ' ' + item.finalLine;
    return (
      <View style={{ backgroundColor: '#eee', borderBottomColor: '#bbb', borderBottomWidth: 1, paddingBottom: 5 }}>
        <Text style={{ paddingLeft: 35, fontSize: 14, paddingTop: 5, paddingBottom: 5, backgroundColor: '#ddd' }}>
          {(index + ': ' + item.title)}
        </Text>
        <Text style={{ paddingLeft: 35, fontSize: 10 }}>
          {(newText)}
        </Text>

      </View>
    );
  }

  _handlePlanClick = (item) => {
    const { navigation } = this.props;
    console.log('pPlans _handlePlanClick item.planId = ', item.planId)
    // navigation.navigate('fpBreak', { planSelected: [item.planId, 55, 217] });
    navigation.navigate('pPlanBreakdown', { planSelected: [item.planId] });
  }

  _handlePlanSelect = (item) => {
    const { compareSelected, maxCompare } = this.state;
    let index = compareSelected.indexOf(item.planId);
    if (index > -1) {
      this.setState({
        compareSelected: [...compareSelected.slice(0, index), ...compareSelected.slice(index + 1)]
      })
    }
    else {
      if (compareSelected.length === maxCompare) {
        console.log('pPlans compare limit reached');
        if (Platform.OS === 'web') {
          alert('Compare Plans\n\nCan only compare ' + maxCompare + ' plans, remove a plan first before selecting this one.')
        } else {
          Alert.alert(
            'Compare Plans',
            'Can only compare ' + maxCompare + ' plans, remove a plan first before selecting this one.',
            [
              {
                text: 'OK'
              },
            ]
          );
        }


      }
      else {
        this.setState({
          compareSelected: [...compareSelected, item.planId]
        })
      }
    }
  }

  _handlePlanCompare = () => {
    const { navigation } = this.props;
    const { compareSelected } = this.state;
    navigation.navigate('pPlanBreakdown', { planSelected: compareSelected });
  }

  _renderRow = (item, scaleIn, planNumerator, planDenominator) => {
    const { planName, premium, deductible, totalCost, bestCost, optimized, worst } = item;
    const { notCovered, initCost, gapCost, dedCost, catCost, initRemaining, gapRemaining } = worst;
    const { startDate } = this.props;
    const { showPhases, compareSelected } = this.state;
    const planMonths = 13 - startDate.split('/')[0];
    const range = (totalCost - planNumerator) / planDenominator;
    const cutoff = 0.8;
    const green = range > 1 - cutoff ? (1 - range) / cutoff * 255 : 255;
    const red = range < 1 - cutoff ? 255 * range / (1 - cutoff) : 255;
    const bcColor = 'rgb(' + red + ', ' + green + ', ' + '0' + ')';
    // const bcColor2 = 'rgba(' + red + ', ' + green + ', 0, 0.5)';
    // const colStyle = [styles.colItem];
    // colStyle.push({ backgroundColor: bcColor2 });

    const scale = scaleIn / 16 * 15;
    let rowText2;
    if (showPhases) {
      rowText2 = totalCost > 0 ? '$' + totalCost.toFixed(0) : ' ';
    }
    else {
      rowText2 = bestCost > 0 ? '$' + bestCost.toFixed(0) : ' ';
    }
    return (
      <View style={{ flexDirection: 'column', borderTopColor: '#999', borderTopWidth: 1 }}>
        <TouchableHighlight onPress={() => this._handlePlanClick(item)}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: bcColor }}>
            <Text
              numberOfLines={1}
              ellipsizeMode={'tail'}
              style={{ backgroundColor: bcColor, flex: 1, paddingTop: 3, paddingBottom: 3, fontSize: 14, textAlign: 'left', paddingLeft: 10, paddingRight: 5, }}
            >{rowText2 + ': ' + planName}</Text>
            <Icon
              name={'ios-arrow-forward'}
              type={'ionicon'}
              color={'black'}
              size={18}
              containerStyle={{ backgroundColor: bcColor, width: 30, paddingTop: 3, paddingBottom: 3 }}
            />
          </View>
        </TouchableHighlight>

        <TouchableHighlight onPress={() => this._handlePlanSelect(item)}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'linen', borderTopColor: '#bbb', borderTopWidth: 1 }}>
            <Icon
              name={compareSelected.indexOf(item.planId) > -1 ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
              type={'material-community'}
              color={'black'}
              size={15}
              containerStyle={{ width: 30, paddingTop: 3, paddingBottom: 3 }}
            />
            <View style={{ flex: 1 }}>
              {showPhases ?
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingTop: 3, paddingBottom: 3, paddingLeft: 0 }}>
                  <View style={{ width: (scale * planMonths * premium), height: 22, backgroundColor: 'dodgerblue', borderColor: 'black', borderWidth: 1 }}>
                    <Text style={{ textAlign: 'center' }}>{'P'}</Text>
                  </View>

                  {notCovered != 0 &&
                    <View style={{ width: (scale * notCovered), height: 22, backgroundColor: 'silver', borderColor: 'black', borderWidth: 1 }}>
                      <Text
                        style={{ textAlign: 'center', }}
                        numberOfLines={1}
                      >{'Not Covered'}</Text>
                    </View>
                  }

                  {deductible != 0 &&
                    <View style={{ width: (scale * dedCost), height: 22, backgroundColor: 'burlywood', borderColor: 'black', borderWidth: 1 }} >
                      <Text style={{ textAlign: 'center' }}>{'D'}</Text>
                    </View>
                  }

                  {(dedCost < deductible && deductible != 0) &&
                    <View style={{ width: (scale * (deductible - dedCost)), height: 22, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }}>
                      <Text style={{ textAlign: 'center', color: 'grey' }}>{'D'}</Text>
                    </View>
                  }

                  {initCost != 0 &&
                    <View style={{ width: (scale * initCost), height: 22, backgroundColor: 'lightskyblue', borderColor: 'black', borderWidth: 1 }}>
                      <Text style={{ textAlign: 'center' }}>{'I'}</Text>
                    </View>
                  }

                  {(initRemaining > 0 && initCost != 0) &&
                    <View style={{ width: (scale * initRemaining), height: 22, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }}>
                      <Text style={{ textAlign: 'center', color: 'grey' }}>{'I'}</Text>
                    </View>
                  }

                  {gapCost != 0 &&
                    <View style={{ width: (scale * gapCost), height: 22, backgroundColor: 'peru', borderColor: 'black', borderWidth: 1 }}>
                      <Text style={{ textAlign: 'center' }}>{'G'}</Text>
                    </View>
                  }

                  {(gapRemaining > 0 && gapCost != 0) &&
                    <View style={{ width: (scale * gapRemaining), height: 22, backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }}>
                      <Text style={{ textAlign: 'center', color: 'grey' }}>{'G'}</Text>
                    </View>
                  }

                  {catCost != 0 &&
                    <View style={{ width: (scale * (catCost)), height: 22, backgroundColor: 'darkseagreen', borderColor: 'black', borderWidth: 1 }} >
                      <Text style={{ textAlign: 'center' }}>{'C'}</Text>
                    </View>
                  }
                </View>
                :
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingTop: 3, paddingBottom: 3, paddingLeft: 0 }}>
                  <View style={{ width: (scale * planMonths * premium), height: 22, backgroundColor: 'dodgerblue', borderColor: 'black', borderWidth: 1 }}>
                    <Text style={{ textAlign: 'center' }}>{'P'}</Text>
                  </View>

                  {notCovered != 0 &&
                    <View style={{ width: (scale * optimized.notCovered), height: 22, backgroundColor: 'silver', borderColor: 'black', borderWidth: 1 }}>
                      <Text
                        style={{ textAlign: 'center', }}
                        numberOfLines={1}
                      >{'Not Covered'}</Text>
                    </View>
                  }

                  {deductible != 0 &&
                    <View style={{ width: (scale * optimized.dedCost), height: 22, backgroundColor: 'burlywood', borderColor: 'black', borderWidth: 1 }} >
                      <Text style={{ textAlign: 'center' }}>{'D'}</Text>
                    </View>
                  }

                  <View style={{ width: (scale * (optimized.acuteCost + optimized.maintenanceCost - optimized.dedCost - optimized.straddleCost)), height: 22, backgroundColor: 'lightskyblue', borderColor: 'black', borderWidth: 1 }} >
                    <Text style={{ textAlign: 'center' }}>{'Dr'}</Text>
                  </View>

                  <View style={{ width: (scale * optimized.straddleCost), height: 22, backgroundColor: 'peru', borderColor: 'black', borderWidth: 1 }} >
                    <Text style={{ textAlign: 'center' }}>{'S'}</Text>
                  </View>

                  <View style={{ width: (scale * (worst.totalCost - optimized.totalCost)), height: 22, backgroundColor: 'darkseagreen', borderColor: 'black', borderWidth: 1 }} >
                    <Text style={{ textAlign: 'center' }}>{'O'}</Text>
                  </View>
                </View>
              }
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  render() {
    const { adjust, animating, showPhases, dataSource, compareSelected, flag, plansToShow } = this.state;
    const { startDate, planCount, doMailState, planFullNumerator, planFullDenominator, planMax } = this.props;
    console.log('pPlans render dataSource size = ', size(dataSource));
    if (size(dataSource) === 0) return null;
    const scale = Dimensions.get('window').width / planMax / 1.1;
    console.log('pPlans render plansToShow = ', plansToShow, ', denom = ', planFullDenominator, ', num = ', planFullNumerator, ', max = ', planMax, ', scale = ', scale);

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        {animating &&
          <View>
            <Text>{'Processing your configuration and finding best plans'}</Text>
            <ActivityIndicator
              animating={true}
              size="large"
            />
          </View>}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5, paddingTop: 5, paddingBottom: 5, backgroundColor: '#ddd' }}>
          <Text>{'Set start date: '}</Text>
          <View style={{ paddingLeft: 5, backgroundColor: '#fff', borderWidth: 1, borderColor: '#aaa' }}>
            <TextInput
              defaultValue={startDate}
              placeholder={startDate}
              onChangeText={(text) => this.props.updateFlowState({ startDate: text })}
              onSubmitEditing={this._handleStartDate}
              keyboardType={'numbers-and-punctuation'}
              returnKeyType={'done'}
              style={{ flex: 1, paddingLeft: 5, paddingRight: 5 }}
            />
          </View>
          <TouchableHighlight
            onPress={this._handleMailChanged}
            style={{ flex: 1 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 15, paddingLeft: 15 }}>
              <Icon
                name={doMailState ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
                type={'material-community'}
                color={'black'}
                size={18}
                iconStyle={{ paddingLeft: 5 }}
              />
              <Text
                style={{ fontSize: 14, color: 'black', textAlign: 'left', paddingLeft: 5 }}
              >{'Mail Order'}
              </Text>
            </View>
          </TouchableHighlight>
        </View>

        <Text
          style={{ fontSize: 14, color: 'black', textAlign: 'center', paddingTop: 3, paddingBottom: 3, backgroundColor: '#ddd' }}
        >
          {'Plan List - ' + (plansToShow < planCount ? ('Top ' + plansToShow + ' of ') : '') + planCount + ' plans'}
        </Text>
        <View style={{ flexDirection: 'row', paddingLeft: 5, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Text>{'Show'}</Text>
            {(planCount >= 5) && this._showPlanCount(plansToShow, 5)}
            {(planCount >= 10) && this._showPlanCount(plansToShow, 10)}
            {(planCount >= 15) && this._showPlanCount(plansToShow, 15)}
            {this._showPlanCount(plansToShow, 99)}
          </View>
        </View>

        <TouchableHighlight
          onPress={compareSelected.length > 1 ? this._handlePlanCompare : null}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee', borderBottomColor: 'black', borderBottomWidth: 1, borderTopColor: 'black', borderTopWidth: 1 }}>
            <Text
              style={{ fontSize: 14, color: 'black', textAlign: 'center', paddingTop: 3, paddingBottom: 3, paddingRight: 10 }}
            >
              {compareSelected.length > 1 ? 'Compare Selected Plans' : 'Check plans for comparison'}
            </Text>
            {(compareSelected.length > 1) &&
              <Icon
                name={'ios-arrow-forward'}
                type={'ionicon'}
                color={'black'}
                size={18}
              />
            }
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._handlePhaseToggle}
        >
          {showPhases ?
            <View style={styles.tableView}>
              <Text style={[styles.colHeader, { backgroundColor: 'dodgerblue' }]}>{'Premium'}</Text>
              <Text style={[styles.colHeader, { backgroundColor: 'burlywood' }]}>{'Deductible'}</Text>
              <Text style={[styles.colHeader, { backgroundColor: 'lightskyblue' }]}>{'Initial'}</Text>
              <Text style={[styles.colHeader, { backgroundColor: 'peru' }]}>{'Gap'}</Text>
              <Text style={[styles.colHeader, { backgroundColor: 'darkseagreen' }]}>{'Catastrophic'}</Text>
            </View>
            :
            <View style={styles.tableView}>
              <Text style={[styles.colHeader, { backgroundColor: 'dodgerblue' }]}>{'Premium'}</Text>
              <Text style={[styles.colHeader, { backgroundColor: 'burlywood' }]}>{'Deductible'}</Text>
              <Text style={[styles.colHeader, { backgroundColor: 'lightskyblue' }]}>{'Drugs'}</Text>
              <Text style={[styles.colHeader, { backgroundColor: 'peru' }]}>{'Straddle'}</Text>
              <Text style={[styles.colHeader, { backgroundColor: 'darkseagreen' }]}>{'Optimized'}</Text>
            </View>
          }
        </TouchableHighlight>
        <View style={{ flexShrink: 1, flexDirection: 'column', justifyContent: 'center', padding: 5, borderWidth: 1, borderColor: 'blue' }}>
          <FlatList
            data={dataSource}
            extraData={{ compareSelected, flag, showPhases }}
            keyExtractor={(item) => item.planId.toString()}
            initialNumToRender={30}
            renderItem={({ item }) => this._renderRow(item, scale, planFullNumerator, planFullDenominator)}
          />
        </View>
      </View>
    )
  }
}

pPlans.propTypes = {
  animating: PropTypes.bool.isRequired,
  doMailState: PropTypes.bool.isRequired,
  handleUpdatePlanList: PropTypes.func.isRequired,
  myConfigList: PropTypes.array.isRequired,
  myPlans: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  planCount: PropTypes.number.isRequired,
  planFullDenominator: PropTypes.number.isRequired,
  planFullNumerator: PropTypes.number.isRequired,
  planListDirty: PropTypes.bool.isRequired,
  planMax: PropTypes.number.isRequired,
  startDate: PropTypes.string.isRequired,
  updateFlowState: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    animating: state.flowState['animating'] ?? false,
    planListDirty: state.flowState['planListDirty'] ?? false,
    startDate: state.flowState['startDate'] ?? new Date().toLocaleDateString('en-US'),
    planCount: size(state.myPlans) ?? 0,
    doMailState: state.flowState['doMailState'] ?? false,
    myPlans: sortBy(state.myPlans, 'totalCost'),
    myConfigList: flatMap(state.myDrugs, (d) => d.configDetail),
    myDrugs: flatMap(state.myDrugs, (d) => d),
    planFullNumerator: size(state.myPlans) ? sortBy(flatMap(state.myPlans, (d) => d), 'totalCost')[0].totalCost : 0,
    planFullDenominator: size(state.myPlans) ? sortBy(flatMap(state.myPlans, (d) => d), 'totalCost')[size(state.myPlans) - 1].totalCost - sortBy(flatMap(state.myPlans, (d) => d), 'totalCost')[0].totalCost : 1,
    planMax: size(state.myPlans) ? Math.max(...flatMap(state.myPlans, (d) => d.totalCost)) : 9999,
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
  updateFlowState: Dispatch.updateFlowState,
  handleUpdatePlanList: Dispatch.handleUpdatePlanList,
}

export default connect(mapStateToProps, mapDispatchToProps)(pPlans);

const styles = StyleSheet.create({
  tableView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: 'linen',
    borderTopColor: '#bbb',
    borderTopWidth: 1,
  },
  colHeader: {
    //flex: 3,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 3,
    paddingRight: 3,
    fontSize: 12,
    textAlign: 'center',
    borderColor: 'black',
    borderWidth: 1,
    //backgroundColor: 'rgba(64, 92, 232, 0.75)'
  },
})