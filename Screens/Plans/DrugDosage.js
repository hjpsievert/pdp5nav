import React, { Component } from 'react';
import {
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import SlideInView from '../../Components/SlideInView';
import { loadDrugsByBaseName } from '../../Utils/Api';
import capitalize from 'lodash/capitalize';


export class DrugDosage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      drugPicked: 0,
      drugsLoaded: false,
      doCombo: true,
      showGeneric: false,
      showBrand: false,
      showAll: true,
      userData: '',
      response: '',
      showAlert: false
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    const { userProfile, myDrugs, baseName } = this.props;
    // console.log('DrugDosage componentDidMount, myDrugs = ', myDrugs, ', baseName = ', baseName);
    const stateId = userProfile.userStateId;

    loadDrugsByBaseName((response) => {
      this._handleLoadDrugs(response, myDrugs, userProfile)
    }, stateId, baseName);
  }

  componentDidUpdate() {
    const { drugsLoaded } = this.state;
    if (drugsLoaded) return;
    const { baseName, userProfile } = this.props;
    const stateId = userProfile.userStateId;

    loadDrugsByBaseName((response) => {
      this._handleLoadDrugs(response)
    }, stateId, baseName);
    console.log('DrugDosage componentDidUpdate baseName = ', baseName);
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    console.log('pDrugs _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _handleLoadDrugs = (response) => {
    const { success, payLoad, code, err } = response;
    console.log('DrugDosage loadDrugsByBaseName code = ', code, ', err = ', err);
    if (success) {
      //console.log('DrugDosage _handleLoadDrugs dataSource = ', payLoad);
      this.setState({
        mainDrugs: payLoad,
        dataSource: payLoad,
        drugsLoaded: true,
      });
    }
    else {
      const { myDrugs, userProfile } = this.props;
      const { uri, load } = response;
      this.setState({
        hasError: true,
        err: {
          user: userProfile.displayName || userProfile.userEmail,
          action: payLoad,
          input: load,
          detail: err,
          code: code,
          uri: uri,
          message: code === -1 ? err.Message : err,
          component: 'DrugDosage',
          userProfile: JSON.stringify(userProfile),
          drugList: JSON.stringify(myDrugs),
        },
      })
    }
  }

  _confirmUpdateDosage = () => {
    // console.log('Update Dosage?');
    this._setAlert(true);
  }

  _handleUpdateDosage = () => {
    console.log('DrugDosage _handleUpdateDosage begin');
    this._setAlert(false);
    const { mainDrugs, drugPicked } = this.state;
    const { handleUpdateDosage, selectedDrug } = this.props;
    let newDrug = mainDrugs.filter((configDrug) => configDrug.drugId === drugPicked);
    // newDrug.isSelected = false;
    console.log('DrugDosage _handleUpdateDosage new drug = ', JSON.stringify(newDrug), ', old drug = ', selectedDrug);
    handleUpdateDosage(newDrug, selectedDrug);
    this.props.updateFlowState({
      showDosage: false,
      planListDirty: true,
      activeListDirty: true,
    });
    console.log('DrugDosage _handleUpdateDosage end');
  }

  _handleExitDosage = () => {
    this.props.updateFlowState({
      showDosage: false,
    })
  }

  _handleDrugClick = (drug) => {
    const { mainDrugs, doCombo, showAll, showBrand, drugPicked } = this.state;
    const { selectedDrug } = this.props;
    const currDrug = drug.drugId;
    const comboLimit = (doCombo ? 99 : 2);
    let checked = [...mainDrugs];
    // const currentIndex = checked.findIndex((d) => d.drugId === drugPicked)
    // console.log('DrugDosage _handleDrugClick currDrug = ', currDrug, ', drugPicked = ', drugPicked);
    if (drugPicked === currDrug) {
      this.setState({
        drugPicked: 0
      })
    }
    else {
      this.setState({
        drugPicked: currDrug
      })
    }

    let updated;
    if (showAll)
      updated = checked;
    else
      updated = checked.filter((myType) => myType.drugDetail.isBrand === showBrand ? true : false || myType.drugId === drugPicked || myType.drugDetail.drugId === selectedDrug);
    updated = updated.filter((myCombo) => myCombo.drugDetail.components < comboLimit || myCombo.drugId === drugPicked || myCombo.drugDetail.drugId === selectedDrug);
    this.setState(
      {
        mainDrugs: checked,
        dataSource: updated,
      }
    );
  }

  _handleDrugTypeGeneric = () => {
    this.setState({
      showGeneric: true,
      showBrand: false,
      showAll: false
    });
    this._handleDrugTypeChanged('generic');
  }

  _handleDrugTypeBrand = () => {
    this.setState({
      showGeneric: false,
      showBrand: true,
      showAll: false
    });
    this._handleDrugTypeChanged('brand');
  }

  _handleDrugTypeAll = () => {
    this.setState({
      showGeneric: false,
      showBrand: false,
      showAll: true
    });
    this._handleDrugTypeChanged('all');
  }

  _handleDrugTypeChanged = (type) => {
    let updated;
    const { mainDrugs, doCombo, drugPicked } = this.state;
    const { selectedDrug } = this.props;
    const comboLimit = (doCombo ? 99 : 2);
    if (type === 'all')
      updated = mainDrugs;
    else
      updated = mainDrugs.filter((myType) => myType.drugDetail.isBrand === (type === 'brand') ? true : false || myType.drugId === drugPicked || myType.drugDetail.drugId === selectedDrug);
    updated = updated.filter((myCombo) => myCombo.drugDetail.components < comboLimit || myCombo.drugId === drugPicked);
    this.setState({
      dataSource: updated
    });
  }

  _handleComboChanged = () => {
    let updated;
    const { mainDrugs, showBrand, showAll, doCombo, drugPicked } = this.state;
    const { selectedDrug } = this.props;
    const combo = !doCombo;
    const comboLimit = (combo ? 99 : 2);
    if (showAll)
      updated = mainDrugs;
    else
      updated = mainDrugs.filter((myType) => myType.drugDetail.isBrand === showBrand ? true : false || myType.drugId === drugPicked || myType.drugDetail.drugId === selectedDrug);
    updated = updated.filter((myCombo) => myCombo.drugDetail.components < comboLimit || myCombo.drugId === drugPicked);
    this.setState({
      doCombo: combo,
      dataSource: updated
    });
  }

  _setAlert = (visibility) => {
    this.setState({
      showAlert: visibility,
    })
  }

  _renderDrug = (item, discontinued) => {
    const { selectedDrug, myDrugs } = this.props;
    const { drugPicked } = this.state;
    const { ndc, drugDetail, planDetail, drugId } = item;
    // console.log('DrugDosage _renderDrug item = ', item);
    const isCurrent = selectedDrug === drugId;
    const isSelected = drugPicked === drugId;
    // console.log('DrugDosage _renderDrug drugPicked = ', drugPicked, ', drugId = ', drugId, ', discontinued = ', discontinued, ', isSelected = ', isSelected, ', isCurrent = ', isCurrent);
    let isMatch = false;
    if (discontinued) {
      // const oldDetail = myDrugs[selectedDrug].drugDetail;
      const { fullRoute, Dosage, strengthNum, units, isBrand } = myDrugs[selectedDrug].drugDetail; //oldDetail;
      isMatch = (fullRoute || Dosage).toLowerCase() === drugDetail.fullRoute.toLowerCase() && strengthNum === drugDetail.strengthNum && units === drugDetail.units && isBrand === drugDetail.isBrand;
    }
    // if (isCurrent) return;
    const titleText = (isCurrent ? 'Current: ' : '') + (drugDetail.isBrand ? capitalize(drugDetail.brandName) + ' (Brand)' : drugDetail.baseName + ' (Generic)') + ', ' + drugDetail.rxStrength + ' ' + drugDetail.units + ' ' + capitalize(drugDetail.pckUnit);
    const subTitleText = drugDetail.manufacturer;
    const subTitleText2 = 'NDC ' + ndc + (drugDetail.components > 1 ? ' (multi ' + drugDetail.components + ')' : '') + ', $' + (planDetail.avePrice90 * 30).toFixed(2) + ' for 30 days';
    return (
      <View>
        <TouchableHighlight
          onPress={isCurrent ? null : () => this._handleDrugClick(item)}
        >
          <View style={{ flexDirection: 'row', alignContent: 'center', backgroundColor: 'rgb(183, 211, 255)', borderBottomWidth: 1, borderBottomColor: '#bbb' }}>
            <Icon
              name={isCurrent ? 'minus-circle-outline' : (isSelected ? 'radiobox-marked' : 'radiobox-blank')}
              type={'material-community'}
              color={isCurrent ? 'grey' : 'black'}
              size={16}
              containerStyle={{
                paddingLeft: 15,
                paddingRight: 5,
                paddingTop: 6,
                backgroundColor: 'rgb(183, 211, 255)',
              }}
            />
            <Text style={{ flex: 1, fontSize: 14, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'left', paddingTop: 5, paddingBottom: 5, color: isCurrent ? 'grey' : 'black' }}>
              {isMatch && <Text style={{ color: 'green' }}>{'Best Match - '}</Text>
              }
              {titleText}
            </Text>
          </View>
        </TouchableHighlight>
        <View style={{ flexDirection: 'column', paddingLeft: 35, backgroundColor: 'rgb(204, 223, 255)', paddingTop: 5, paddingBottom: 5, paddingRight: 10, }}>
          <Text style={{ fontSize: 12, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
            {subTitleText}
          </Text>
          <Text style={{ fontSize: 12, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
            {subTitleText2}
          </Text>
        </View>
      </View>
    );
  }

  render() {

    const { selectedDrug, myDrugs } = this.props;
    // console.log('DrugDosage selectedDrug = ', selectedDrug, ', myDrugs =', myDrugs);
    if (!selectedDrug || !myDrugs[selectedDrug]) {
      console.log('DrugDosage no selectedDrug');
      return null;
    }
    const { adjust, doCombo, drugPicked, showGeneric, showBrand, showAll, showAlert } = this.state;
    const { drugDetail, ndc } = myDrugs[selectedDrug];
    const discontinued = ndc === 'discontinued';
    const selectionMade = drugPicked > 0;
    console.log('DrugDosage render, drugPicked = ', drugPicked, ', selectionMade = ' + selectionMade, ', windowWid = ', Dimensions.get('window').width, ', height = ', Dimensions.get('window').height - 70 - 50);
    const titleText = (drugDetail.isBrand ? capitalize(drugDetail.brandName + (discontinued ? ' (Brand)' : '')) : drugDetail.baseName + (discontinued ? ' (Generic)' : '')) + ' ' + drugDetail.rxStrength + ' ' + drugDetail.units + ' ' + capitalize(drugDetail.pckUnit);
    const titleText2 = (discontinued ? 'Select new' : 'Change') + ' Dosage or Manufacturer';

    return (
      <SlideInView
        sideStart={Dimensions.get('window').width}
        sideEnd={0}
        upStart={0}
        upEnd={0}
        duration={this.state.duration}
        slideTop={false}
      >
        <View style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35), backgroundColor: 'rgb(255,255,255)' }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 10,
            }}
          >
            <View style={{
              flexShrink: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              backgroundColor: 'white',
              borderColor: 'black',
              borderWidth: !showAlert ? 1 : 0,
            }}
            >
              <View style={{ flex: 1, flexDirection: 'column', alignItems: 'stretch' }}>

                {showAlert &&
                  <View style={{ backgroundColor: 'rgb(183, 211, 255)', borderColor: 'black', borderWidth: 1, }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch' }}>
                      <Text style={{ fontSize: 18, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 10 }}>{'Update Dosage'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', backgroundColor: 'rgb(204, 223, 255)' }}>
                      <Text style={{ fontSize: 14, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 10, textAlign: 'left' }}>{'Are you sure you want to update the dosage for this drug? \n\nThe optimization settings for the drug you replace will be lost.'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'stretch', paddingTop: 5, borderTopWidth: 1, borderTopColor: '#bbb' }}>
                      <TouchableHighlight
                        onPress={() => this._setAlert(false)}
                      >
                        <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 5 }}>
                          <Icon
                            name={'ios-close-circle-outline'}
                            type={'ionicon'}
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
                            {'CANCEL'}
                          </Text>
                        </View>
                      </TouchableHighlight>
                      <TouchableHighlight
                        onPress={() => this._handleUpdateDosage()}
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
                            style={styles.topTabText}
                          >
                            {'UPDATE'}
                          </Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </View>
                }
                {!showAlert &&
                  <View>
                    <Text style={{ fontSize: 18, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 10, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'center' }}>
                      {titleText2}
                    </Text>
                    <Text style={{ fontSize: 16, paddingLeft: 10, paddingRight: 10, paddingBottom: 10, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'center' }}>
                      {'Current drug: '}<Text style={{ fontWeight: 'bold' }}>{titleText}</Text>
                    </Text>
                    {discontinued &&
                      <Text style={{ fontSize: 14, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 10, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'center' }}>
                        {drugDetail.manufacturer}{<Text style={{ color: 'red', fontWeight: 'bold' }}>{' Discontinued!'}</Text>}
                      </Text>
                    }
                  </View>
                }
                {!showAlert &&

                  <View style={{ flexDirection: 'column', paddingTop: 5, paddingBottom: 5, backgroundColor: 'rgb(204, 223, 255)', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
                    <Text style={{ fontSize: 16, color: 'black', textAlign: 'center' }}>
                      {'Filter Results'}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 5, paddingBottom: 5 }}>
                      <TouchableHighlight
                        onPress={this._handleDrugTypeGeneric}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
                          <Icon
                            name={showGeneric ? 'radiobox-marked' : 'radiobox-blank'}
                            type={'material-community'}
                            color={'black'}
                            size={16}
                            iconStyle={{ paddingLeft: 5 }}
                          />
                          <Text
                            style={styles.filterText}
                          >{'Generic'}</Text>
                        </View>
                      </TouchableHighlight>
                      <TouchableHighlight
                        onPress={this._handleDrugTypeBrand}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Icon
                            name={showBrand ? 'radiobox-marked' : 'radiobox-blank'}
                            type={'material-community'}
                            color={'black'}
                            size={16}
                            iconStyle={{ paddingLeft: 5 }}
                          />
                          <Text
                            style={styles.filterText}
                          >{'Brand'}</Text>
                        </View>
                      </TouchableHighlight>
                      <TouchableHighlight
                        onPress={this._handleDrugTypeAll}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Icon
                            name={showAll ? 'radiobox-marked' : 'radiobox-blank'}
                            type={'material-community'}
                            color={'black'}
                            size={16}
                            iconStyle={{ paddingLeft: 5 }}
                          />
                          <Text
                            style={styles.filterText}
                          >{'All'}</Text>
                        </View>
                      </TouchableHighlight>

                      <TouchableHighlight
                        onPress={this._handleComboChanged}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingLeft: 15 }}>
                          <Icon
                            name={doCombo ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
                            type={'material-community'}
                            color={'black'}
                            size={16}
                            iconStyle={{ paddingLeft: 5 }}
                          />
                          <Text
                            style={styles.filterText}
                          >{'Multi drugs'}</Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </View>
                }
                {!showAlert &&

                  <View style={{ flexShrink: 1 }}>

                    <FlatList
                      data={this.state.dataSource}
                      keyExtractor={(item) => item.ndc.toString()}
                      renderItem={({ item }) => this._renderDrug(item, discontinued)}
                    />
                  </View>

                }
                {!showAlert &&
                  <View style={{
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
                      onPress={this._handleExitDosage}
                    >
                      <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 5 }}>
                        <Icon
                          name={'ios-close-circle-outline'}
                          type={'ionicon'}
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
                          {'CANCEL'}
                        </Text>
                      </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                      onPress={!selectionMade ? null : this._confirmUpdateDosage}
                    >
                      <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Icon
                          name={'ios-arrow-dropright'}
                          type={'ionicon'}
                          color={!selectionMade ? 'grey' : 'black'}
                          size={25}
                          containerStyle={{
                            paddingLeft: 10,
                            paddingRight: 10,
                          }}
                        />
                        <Text
                          style={[styles.topTabText, { color: !selectionMade ? 'grey' : 'black' }]}
                        >
                          {'APPLY'}
                        </Text>
                      </View>
                    </TouchableHighlight>
                  </View>

                }
              </View>
            </View>
          </View>
        </View>
      </SlideInView>
    )
  }
}

DrugDosage.propTypes = {
  baseName: PropTypes.string,
  handleUpdateDosage: PropTypes.func.isRequired,
  myDrugs: PropTypes.object.isRequired,
  selectedDrug: PropTypes.number,
  updateFlowState: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};


const mapStateToProps = (state) => {
  return {
    myDrugs: state.myDrugs,
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
  handleUpdateDosage: Dispatch.handleUpdateDosage,
  updateFlowState: Dispatch.updateFlowState,
}

export default connect(mapStateToProps, mapDispatchToProps)(DrugDosage);

const styles = StyleSheet.create({
  filterText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'left',
    paddingLeft: 5
  },
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});