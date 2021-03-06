import React from 'react'
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Platform,
  TouchableHighlight,
  ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Dispatch from '../../Redux/Dispatches';
import DrugDosage from './DrugDosage';
import DrugMode from './DrugMode';
import AlertBox from '../../Components/AlertBox';
import DrugOptimization from './DrugOptimization';
import { Icon } from 'react-native-elements';
import { findPlans } from '../../Utils/Api';
import { saveDrugList } from '../../Utils/SaveData';
import flatMap from 'lodash/flatMap';
import size from 'lodash/size';
import capitalize from 'lodash/capitalize';
import lowerCase from 'lodash/lowerCase';

export class pDrugs extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      upStart: -Dimensions.get('window').height,
      upEnd: 0,
      duration: 500,
      askDelete: false,
      drugToDelete: {},
      selectedDrug: 0,
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    const { drugCount, userProfile, myDrugs, activeListDirty, animating } = this.props;
    console.log('pDrugs did mount, activeListDirty = ', activeListDirty, ', drugCount = ', drugCount);

    if (activeListDirty && !animating) {
      saveDrugList(this._handleSaveActive, userProfile, 'Active List', 'Saved on every change', 'System', myDrugs, 'activePlanDrugs')
    }
  }

  componentDidUpdate() {
    const { drugCount, userProfile, myDrugs, activeListDirty, animating } = this.props;
    // console.log('pDrugs didUpdate route = '), route
    console.log('pDrugs did update, activeListDirty = ', activeListDirty, ', drugCount = ', drugCount);

    if (activeListDirty && !animating) {
      saveDrugList(this._handleSaveActive, userProfile, 'Active List', 'Saved on every change', 'System', myDrugs, 'activePlanDrugs')
    }
  }


  componentWillUnmount() {
    console.log('pDrugs did unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('pDrugs _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _handleSaveActive = (success) => {
    const { planListDirty, updateFlowState, animating, doMailState, startDate, userProfile, myConfigList } = this.props;
    const { userStateId } = userProfile;

    console.log('pDrugs saveActive completed, success = ', success);
    updateFlowState({
      activeListDirty: false,
    });

    if (planListDirty && !animating) {
      updateFlowState({ animating: true });
      findPlans((response) => {
        this._onFindPlansComplete(response);
      }, JSON.stringify(myConfigList), userStateId, doMailState, startDate);
    }
  }

  // ToDo: make this a utility function across components??
  _onFindPlansComplete = (response) => {
    const { payLoad, code } = response;
    const { handleUpdatePlanList } = this.props;
    handleUpdatePlanList(payLoad);
    const { updateFlowState } = this.props;
    console.log('pDrugs onFindPlansComplete planList size = ', code);
    // setState in pHome, updateFlowState elsewhere
    updateFlowState({
      planListDirty: false,
      animating: false,
    });
  }

  _confirmDeleteDrug = (drug) => {
    console.log('Delete Saved?');
    this.setState({
      askDelete: true,
      drugToDelete: drug
    })
  }

  _handleCallback = (mode) => {
    if (mode) {
      this._handleDeleteFromMyDrugs(this.state.drugToDelete);
    }
    else {
      this.setState({
        askDelete: false,
      })
    }
  }

  _handleDeleteFromMyDrugs = (drug) => {
    const { updateFlowState, handleDeleteFromMyDrugs } = this.props;
    handleDeleteFromMyDrugs(drug);
    console.log('pDrugs _handleDeleteFromMyDrugs finishing up');

    this.setState({
      askDelete: false,
    })

    updateFlowState({
      planListDirty: true,
      activeListDirty: true,
    });
  }

  _handleDrugClick = (item) => {
    console.log('pDrugs _handleDrugClick item.drugId: ', item.drugId);
    this.props.handleToggleSelectedDrug(item);
  }

  _handleStartDosage = (drugId, baseName) => {
    console.log('pDrugs _handleStartDosage');
    this.props.updateFlowState({
      showDosage: true,
    });
    this.setState({
      baseName: baseName,
      selectedDrug: drugId,
    });

  }

  _handleStartOptimize = (drugId) => {
    console.log('pDrugs _handleStartOptimize');
    this.setState({
      selectedDrug: drugId,
    });
    this.props.updateFlowState({
      showOptimize: true,
    });
  }

  _handleStartMode = (drugId) => {
    console.log('pDrugs _handleStartMode');
    this.setState({
      selectedDrug: drugId,
    });
    this.props.updateFlowState({
      showMode: true,
    });
  }

  _renderActiveItem = (item) => {
    const { drugDetail, planDetail, configDetail, isSelected, ndc } = item;
    // console.log('pDrugs render item, drugId = ', item.drugId); //, ' drugDetail = ', drugDetail);

    const discontinued = ndc === 'discontinued';
    const titleText = (drugDetail.isBrand ? capitalize(drugDetail.brandName) + ' (Brand)' : drugDetail.baseName + ' (Generic)') + ', ' + drugDetail.rxStrength + ' ' + drugDetail.units + ' ' + capitalize(drugDetail.pckUnit);
    const displayColor1 = '#405ce8';
    const subTitleText1 = drugDetail.manufacturer + ', ' + drugDetail.rxStrength + ' ' + drugDetail.units + ' ' + lowerCase(drugDetail.dosage || drugDetail.fullRoute);
    const subTitleText1b = 'National Drug Code (NDC): ' + (drugDetail.ndc ? drugDetail.ndc.replace(/(\d{5})(\d{4})(\d{2})/, "$1-$2-$3") : '');
    const subTitleText1c = '$' + (planDetail.avePrice90 * 30).toFixed(2) + '/30 days (' + (planDetail.avePrice90 / planDetail.aveCost90 * 100).toFixed(1) + ' % of drug price)';
    const subTitleText2 = configDetail.isAcute ? 'Acute' : 'Maintenance' + ' drug, ' + configDetail.dosesPerDay + (configDetail.dosesPerDay === 1 ? ' dose' : ' doses') + ' per day';
    const displayText2 = configDetail.isAcute ? 'A' : 'M';
    const displayText2long = configDetail.isAcute ? 'Acute' : 'Maintenance';
    const displayColor2 = discontinued ? 'lightgrey' : (configDetail.isAcute ? 'salmon' : 'mediumseagreen');
    const subTitleText2b = configDetail.numEpisodes + ' refill periods of ' + configDetail.episodeDays + ' days each';
    let subTitleText3 = '';
    let subTitleText3b = '';
    if (drugDetail.ndc2.length === 0 && drugDetail.altCount === 0) {
      subTitleText3 = 'Optimization not available for this drug';
      subTitleText3b = null;
    }
    else {
      if (drugDetail.ndc2.length > 0) {
        subTitleText3 = configDetail.doSplit ? 'Optimizing for splitting ' + drugDetail.strengthNum2 + ' ' + drugDetail.units : 'Double dose for splitting (' + drugDetail.strengthNum2 + ' ' + drugDetail.units + ') is available';
      }
      else {
        subTitleText3 = null;
      }
      if (drugDetail.altCount > 0) {
        subTitleText3b = configDetail.doCompare ? 'Optimizing against ' + drugDetail.altCount + ' equivalent drug' + (drugDetail.altCount > 1 ? 's' : '') : drugDetail.altCount + ' equivalent drug' + (drugDetail.altCount > 1 ? 's' : '') + ' found'
      }
      else {
        subTitleText3b = null;
      }
    }
    const displayText3 = configDetail.doSplit ? 'S' : configDetail.doCompare ? 'E' : 'O';
    const displayText3long = configDetail.doSplit ? 'Split' : configDetail.doCompare ? 'Equivalent' : (drugDetail.ndc2.length === 0 && drugDetail.altCount === 0 ? "Can't Optimize" : 'Optimize');
    const displayColor3 = discontinued ? 'lightgrey' : (drugDetail.ndc2.length === 0 && drugDetail.altCount === 0 ? 'lightgrey' : (configDetail.doCompare || configDetail.doSplit ? 'limegreen' : 'sandybrown'));

    return (

      <View style={{ borderBottomColor: '#bbb', borderBottomWidth: 1 }}>

        <TouchableHighlight
          onPress={() => this._handleDrugClick(item)}
        >
          <View style={{ flexDirection: 'row', alignContent: 'center', backgroundColor: 'rgb(183, 211, 255)' }}>
            <Icon
              name={isSelected ? 'triangle-down' : 'triangle-right'}
              type={'entypo'}
              color={'black'}
              size={20}
              containerStyle={{
                paddingLeft: 15,
                paddingRight: 5,
                backgroundColor: 'rgb(183, 211, 255)',
              }}
            />
            <Text style={{ flex: 1, fontSize: 14, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'left', paddingTop: 2 }}>
              {ndc === 'discontinued' ? <Text style={{ color: 'red', fontWeight: 'bold' }}>{'Discontinued! '}</Text> : ''}
              {titleText}
            </Text>
            <Icon
              name={'trash'}
              type={'evilicon'}
              color={'black'}
              size={20}
              containerStyle={{
                paddingLeft: 10,
                paddingRight: 15,
                backgroundColor: 'rgb(183, 211, 255)',
              }}
              onPress={() => this._confirmDeleteDrug(item)}
            />
          </View>
        </TouchableHighlight>

        {!isSelected &&
          <TouchableHighlight
            onPress={() => this._handleDrugClick(item)}
          >
            <View style={{ flexDirection: 'column', paddingLeft: 25, paddingBottom: 5, backgroundColor: 'rgb(204, 223, 255)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignContent: 'center', padding: 5, backgroundColor: 'rgb(204, 223, 255)' }}>
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'center', backgroundColor: 'rgb(204, 223, 255)' }}>
                  <Text style={{ backgroundColor: displayColor1, color: 'white', fontSize: 12, fontWeight: 'bold', paddingLeft: 5, paddingRight: 5 }}>{discontinued ? 'Replace' : 'Dosage'}</Text>
                </View>
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'center', backgroundColor: 'rgb(204, 223, 255)' }}>
                  <Text style={{ backgroundColor: displayColor2, color: 'white', fontSize: 12, fontWeight: 'bold', paddingLeft: 5, paddingRight: 5 }}>
                    {displayText2long}
                  </Text>
                </View>
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'center', backgroundColor: 'rgb(204, 223, 255)' }}>
                  <Text style={{ backgroundColor: displayColor3, color: 'white', fontSize: 12, fontWeight: 'bold', paddingLeft: 5, paddingRight: 5 }}>
                    {displayText3long}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, paddingRight: 35, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                {subTitleText1}
              </Text>
            </View>
          </TouchableHighlight>
        }

        <View>
          <TouchableHighlight
            onPress={isSelected ? () => this._handleStartDosage(drugDetail.drugId, drugDetail.baseName) : null}
          >
            <View>
              {isSelected &&
                <View style={{ flexDirection: 'row', paddingLeft: 15, paddingTop: 5, backgroundColor: 'rgb(204, 223, 255)', alignItems: 'center', paddingBottom: 5 }}>
                  <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'center', backgroundColor: 'rgb(204, 223, 255)' }}>
                    <Text style={{ backgroundColor: displayColor1, color: 'white', fontSize: 18, fontWeight: 'bold', paddingLeft: 5, paddingRight: 5 }}>{discontinued ? 'R' : 'D'}</Text>
                  </View>
                  <View style={{ flexDirection: 'column', paddingLeft: 10 }}>
                    <Text style={{ fontSize: 12, paddingRight: 35, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                      {(discontinued ? 'REPLACE: ' : '') + subTitleText1}
                    </Text>
                    <Text style={{ fontSize: 12, paddingRight: 35, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                      {subTitleText1b}
                    </Text>
                    <Text style={{ fontSize: 12, paddingRight: 35, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                      {subTitleText1c}
                    </Text>
                  </View>
                </View>
              }
            </View>
          </TouchableHighlight>
          {isSelected ?
            <View>
              <TouchableHighlight
                underlayColor={'#ccc'}
                onPress={discontinued ? null : () => this._handleStartMode(item.drugId)}
              >
                <View style={{ flexDirection: 'row', paddingLeft: 15, backgroundColor: 'rgb(204, 223, 255)', alignItems: 'center', paddingBottom: 5 }}>
                  <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'center', backgroundColor: 'rgb(204, 223, 255)' }}>
                    <Text style={{ backgroundColor: displayColor2, color: 'white', fontSize: 18, fontWeight: 'bold', paddingLeft: 5, paddingRight: 5 }}>
                      {displayText2}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'column', paddingLeft: 10 }}>
                    <Text style={{ fontSize: 12, paddingRight: 35, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                      {subTitleText2}
                    </Text>
                    <Text style={{ fontSize: 12, paddingRight: 35, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                      {subTitleText2b}
                    </Text>
                  </View>
                </View>
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor={'#ccc'}
                onPress={discontinued ? null : (drugDetail.ndc2.length === 0 && drugDetail.altCount === 0 ? null : () => this._handleStartOptimize(item.drugId))}
              >
                <View style={{ flexDirection: 'row', paddingLeft: 15, backgroundColor: 'rgb(204, 223, 255)', alignItems: 'center', paddingBottom: 5 }}>
                  <View style={{ flexDirection: 'column', justifyContent: 'center', alignContent: 'center', backgroundColor: 'rgb(204, 223, 255)' }}>
                    <Text style={{ backgroundColor: displayColor3, color: 'white', fontSize: 18, fontWeight: 'bold', paddingLeft: 5, paddingRight: 5 }}>{displayText3}</Text>
                  </View>
                  <View style={{ flexDirection: 'column', paddingLeft: 10 }}>
                    {subTitleText3 ?
                      <Text style={{ fontSize: 12, paddingRight: 35, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                        {subTitleText3}
                      </Text>
                      : null}
                    {subTitleText3b ?
                      <Text style={{ fontSize: 12, paddingRight: 35, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                        {subTitleText3b}
                      </Text>
                      : null}
                  </View>
                </View>
              </TouchableHighlight>
            </View>
            : null}
        </View>
      </View>
    );
  }

  render() {
    const { navigation, drugCount, showDosage, showOptimize, showMode, planListDirty, planCount, animating, myDrugs } = this.props;
    const { adjust, selectedDrug, baseName, askDelete, drugToDelete } = this.state;
    let alertMessage;
    if (askDelete) {
      const { drugDetail } = drugToDelete;
      alertMessage = 'Are you sure you want to delete ' + (drugDetail.isBrand ? capitalize(drugDetail.brandName) + ' (Brand)' : drugDetail.baseName + ' (Generic)') + ', ' + drugDetail.rxStrength + ' ' + drugDetail.units + ' ' + capitalize(drugDetail.pckUnit + '?');
    }
    console.log('pDrugs render planListDirty = ', planListDirty, ', animating = ', animating, ', planCount = ', planCount, ", drugCount = ", drugCount, ', showDosage = ', showDosage, ', selectedDrug = ', selectedDrug);

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

        {
          askDelete ?
            <AlertBox
              alertTitle={'Delete Drug'}
              alertMessage={alertMessage}
              executeLabel={'DELETE'}
              cancelLabel={'CANCEL'}
              callbackFunction={this._handleCallback}
            />
            :
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: 10, paddingRight: 10, backgroundColor: '#ddd' }}>
                <Text style={{ flex: 1, fontSize: 16, color: 'black', textAlign: 'left', paddingTop: 10, paddingBottom: 10 }}>
                  {'Active List - ' + drugCount + ' drug' + (drugCount != 1 ? 's' : '')}
                </Text>
                <TouchableHighlight
                  underlayColor={'#ccc'}
                  onPress={() => navigation.navigate('pDrugSearch')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: 'black', textAlign: 'right', paddingTop: 10, paddingBottom: 10, paddingRight: 5 }}>
                      {'Add'}
                    </Text>
                    <Icon
                      name='add'
                      type={'material'}
                      color={'black'}
                      size={20}
                      containerStyle={{ width: 20 }}
                    />
                  </View>
                </TouchableHighlight>

              </View>

              <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                <FlatList
                  style={{ flexShrink: 1 }}
                  data={myDrugs}
                  keyExtractor={(item) => item.drugId.toString()}
                  renderItem={({ item }) => this._renderActiveItem(item)}
                  horizontal={false}
                  extraData={this.state.flag}
                />
              </View>
            </View>
        }

        {
          (showOptimize && selectedDrug >= 0) &&
          <DrugOptimization
            selectedDrug={selectedDrug}
          />
        }

        {
          (showDosage && selectedDrug >= 0) &&
          <DrugDosage
            selectedDrug={selectedDrug}
            baseName={baseName}
          />
        }

        {
          (showMode && selectedDrug >= 0) &&
          <DrugMode
            selectedDrug={selectedDrug}
          />
        }

      </View>
    )
  }
}

pDrugs.propTypes = {
  activeListDirty: PropTypes.bool.isRequired,
  animating: PropTypes.bool.isRequired,
  doMailState: PropTypes.bool.isRequired,
  drugCount: PropTypes.number.isRequired,
  handleDeleteFromMyDrugs: PropTypes.func.isRequired,
  handleToggleSelectedDrug: PropTypes.func.isRequired,
  handleUpdatePlanList: PropTypes.func.isRequired,
  myConfigList: PropTypes.array.isRequired,
  myDrugs: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  planCount: PropTypes.number.isRequired,
  planListDirty: PropTypes.bool.isRequired,
  showDosage: PropTypes.bool.isRequired,
  showMode: PropTypes.bool.isRequired,
  showOptimize: PropTypes.bool.isRequired,
  updateFlowState: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    activeListDirty: state.flowState['activeListDirty'] ?? false,
    animating: state.flowState['animating'] ?? false,
    doMailState: state.flowState['doMailState'] ?? false,
    drugCount: size(state.myDrugs),
    myConfigList: flatMap(state.myDrugs, (d) => d.configDetail),
    myDrugs: flatMap(state.myDrugs, (d) => d),
    planCount: size(state.myPlans) ?? 0,
    planListDirty: state.flowState['planListDirty'] ?? false,
    showDosage: state.flowState['showDosage'] ?? false,
    showMode: state.flowState['showMode'] ?? false,
    showOptimize: state.flowState['showOptimize'] ?? false,
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
  handleDeleteFromMyDrugs: Dispatch.handleDeleteFromMyDrugs,
  handleToggleSelectedDrug: Dispatch.handleToggleSelectedDrug,
  handleUpdatePlanList: Dispatch.handleUpdatePlanList,
  updateFlowState: Dispatch.updateFlowState,
}


export default connect(mapStateToProps, mapDispatchToProps)(pDrugs);