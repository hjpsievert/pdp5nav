import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableHighlight,
  Dimensions,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { loadDrugsByBaseId } from '../../Utils/Api';
import { myStyles } from '../../Utils/Styles';
import isEqual from 'lodash/isEqual';
import capitalize from 'lodash/capitalize';
import lowerCase from 'lodash/lowerCase';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import size from 'lodash/size';

export class pDrugSelect extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      dataSource: props.searchResults,
      drugsLoaded: false,
      userData: '',
      response: '',
      mainDrugs: [],
      drugsSelected: 0
    };
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    const { baseList, userStateId } = this.props;
    console.log('pDrugSelect componentDidMount');
    loadDrugsByBaseId((response) => {
      this._handleLoadDrugs(response)
    }, userStateId, baseList);
  }

  componentDidUpdate(prevProps) {
    const { baseList, userStateId, searchResultCount, navigation } = this.props;
    const { drugsLoaded } = this.state;
    console.log('pDrugSelect didUpdate');

    // console.log('Prev: ', prevProps.baseList, ', current: ', baseList);
    if (isEqual(prevProps.baseList, baseList) && drugsLoaded) return;

    loadDrugsByBaseId((response) => {
      this._handleLoadDrugs(response)
    }, userStateId, baseList);

    if (prevProps.searchResultCount != searchResultCount) {
      navigation.setParams({ resultCount: searchResultCount })
    }
  }

  componentWillUnmount() {
    console.log('pDrugSelect did unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('pDrugSelect _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _handleLoadDrugs = (response) => {
    const { success, payLoad } = response;
    // console.log('pDrugSelect loadDrugsByBaseId response code = ', code, ', err = ', err, ', payLoad = ', payLoad);
    if (success) {
      this.setState({
        mainDrugs: payLoad,
        dataSource: payLoad,
        showGeneric: false,
        showBrand: false,
        showAll: true,
        doCombo: true,
        drugsLoaded: true,
      });
    }
    // else {
    //   const { myDrugs, userProfile } = this.props;
    //   const { uri, load } = response;
    //   this.setState({
    //     hasError: true,
    //     err: {
    //       user: userProfile.displayName || userProfile.userEmail,
    //       action: payLoad,
    //       input: load,
    //       detail: err,
    //       code: code,
    //       uri: uri,
    //       message: code === -1 ? err.Message : err,
    //       component: 'pDrugSelect',
    //       userProfile: JSON.stringify(userProfile),
    //       drugList: JSON.stringify(myDrugs),
    //     },
    //   })
    // }
  }

  _handleAddSelection = () => {
    const { mainDrugs } = this.state;
    const { addSelectionToMyDrugs, navigation, updateFlowState } = this.props;
    let selected = mainDrugs.filter((configDrug) => configDrug.isSelected);
    selected.forEach((r) => (r.isSelected = false));
    if (size(selected) > 0) {
      addSelectionToMyDrugs(selected);
      updateFlowState({
        planListDirty: true,
        activeListDirty: true,
      });
      console.log('pDrugSelect _handleAddSelection size =', size(selected));
      navigation.navigate('pDrugs');
    }
  }

  _handleDrugClick = (drug) => {
    //console.log('DrugSearcher _handleDrugClick');
    const { mainDrugs, doCombo, showAll, showBrand } = this.state;
    const drugIndex = mainDrugs.indexOf(drug);
    const comboLimit = (doCombo ? 99 : 2);
    let checked = [...mainDrugs];
    if (drugIndex > -1) {
      checked[drugIndex].isSelected = !drug.isSelected;
      this.setState({
        drugsSelected: size(checked.filter((r) => r.isSelected))
      });
    }

    let updated;
    if (showAll)
      updated = checked;
    else
      updated = checked.filter((myType) => myType.drugDetail.isBrand === showBrand ? true : false || myType.isSelected);
    updated = updated.filter((myCombo) => myCombo.drugDetail.components < comboLimit || myCombo.isSelected);
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
    const { mainDrugs, doCombo } = this.state;
    const comboLimit = (doCombo ? 99 : 2);
    if (type === 'all')
      updated = mainDrugs;
    else
      updated = mainDrugs.filter((myType) => myType.drugDetail.isBrand === (type === 'brand') ? true : false || myType.isSelected);
    updated = updated.filter((myCombo) => myCombo.drugDetail.components < comboLimit || myCombo.isSelected);
    this.setState({
      dataSource: updated
    });
  }

  _handleComboChanged = () => {
    let updated;
    const { mainDrugs, showBrand, showAll, doCombo } = this.state;
    const combo = !doCombo;
    const comboLimit = (combo ? 99 : 2);
    if (showAll)
      updated = mainDrugs;
    else
      updated = mainDrugs.filter((myType) => myType.drugDetail.isBrand === showBrand ? true : false || myType.isSelected);
    updated = updated.filter((myCombo) => myCombo.drugDetail.components < comboLimit || myCombo.isSelected);
    this.setState({
      doCombo: combo,
      dataSource: updated
    });
  }

  _renderDrug = (item) => {
    const { ndc, drugDetail, planDetail, isSelected } = item;
    const titleText = (drugDetail.isBrand ? capitalize(drugDetail.brandName) + ' (Brand)' : drugDetail.baseName + ' (Generic)') + ', ' + drugDetail.rxStrength + ' ' + drugDetail.units;
    // const subTitleText = ndc + (drugDetail.components > 1 ? ' (multi ' + drugDetail.components + ')' : '') + ', ' + drugDetail.manufacturer.substr(0, drugDetail.manufacturer.indexOf(' ')) + ', $' + (planDetail.avePrice90 * 30).toFixed(2) + ' for 30 days';
    const subTitleText = drugDetail.manufacturer + ', dosage form ' + drugDetail.rxStrength + ' ' + drugDetail.units + ' ' + lowerCase(drugDetail.dosage || drugDetail.fullRoute);
    const subTitleText2 = 'ndc ' + ndc.replace(/(\d{5})(\d{4})(\d{2})/, "$1-$2-$3") + (drugDetail.components > 1 ? ' (multi ' + drugDetail.components + ')' : '') + ', $' + (planDetail.avePrice90 * 30).toFixed(2) + ' for 30 days';
    return (
      <View>
        <TouchableHighlight
          onPress={() => this._handleDrugClick(item)}
        >
          <View style={{ flexDirection: 'row', alignContent: 'center', backgroundColor: 'rgb(183, 211, 255)', borderBottomWidth: 1, borderBottomColor: '#bbb' }}>
            <Icon
              name={(isSelected ? 'checkbox-marked-outline' : 'checkbox-blank-outline')}
              type={'material-community'}
              color={'black'}
              size={18}
              containerStyle={{
                paddingLeft: 15,
                paddingRight: 10,
                paddingTop: 2,
                backgroundColor: 'rgb(183, 211, 255)',
              }}
            />
            <Text style={{ flex: 1, fontSize: 14, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'left', paddingTop: 5, paddingBottom: 5, color: 'black' }}>
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
    const { adjust, doCombo, showGeneric, showBrand, showAll, drugsSelected } = this.state;

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', paddingTop: 5, paddingBottom: 5, backgroundColor: 'white' }}>

          <Text style={{ fontSize: 14, color: 'black', textAlign: 'center' }}>
            {'Filter Results'}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 5, paddingBottom: 5 }}>
            <TouchableHighlight
              underlayColor={'#ccc'}
              onPress={this._handleDrugTypeGeneric}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
                <Icon
                  name={showGeneric ? 'radiobox-marked' : 'radiobox-blank'}
                  type={'material-community'}
                  color={'black'}
                  size={18}
                  iconStyle={{ paddingLeft: 5 }}
                />
                <Text
                  style={{ fontSize: 12, color: 'black', textAlign: 'left', paddingLeft: 5 }}
                >{'Generic'}</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={'#ccc'}
              onPress={this._handleDrugTypeBrand}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name={showBrand ? 'radiobox-marked' : 'radiobox-blank'}
                  type={'material-community'}
                  color={'black'}
                  size={18}
                  iconStyle={{ paddingLeft: 5 }}
                />
                <Text
                  style={{ fontSize: 12, color: 'black', textAlign: 'left', paddingLeft: 5 }}
                >{'Brand'}</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={'#ccc'}
              onPress={this._handleDrugTypeAll}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name={showAll ? 'radiobox-marked' : 'radiobox-blank'}
                  type={'material-community'}
                  color={'black'}
                  size={18}
                  iconStyle={{ paddingLeft: 5 }}
                />
                <Text
                  style={{ fontSize: 12, color: 'black', textAlign: 'left', paddingLeft: 5 }}
                >{'All'}</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor={'#ccc'}
              onPress={this._handleComboChanged}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingLeft: 15 }}>
                <Icon
                  name={doCombo ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
                  type={'material-community'}
                  color={'black'}
                  size={18}
                  iconStyle={{ paddingLeft: 5 }}
                />
                <Text
                  style={{ fontSize: 12, color: 'black', textAlign: 'left', paddingLeft: 5 }}
                >{'Multi drugs'}</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={{ flexShrink: 1, borderTopWidth: 1, borderTopColor: '#666', borderBottomWidth: 1, borderBottomColor: '#666' }}>
            <FlatList
              data={this.state.dataSource}
              extraData={adjust}
              keyExtractor={(item) => item.ndc.toString()}
              renderItem={({ item }) => this._renderDrug(item)}
            />
          </View>
          {drugsSelected > 0 &&
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
                onPress={this._handleAddSelection}
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
                    style={[myStyles.topTabText, { color: 'black' }]}
                  >
                    {'CONTINUE'}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>
          }
        </View>

      </View>)
  }
}

pDrugSelect.propTypes = {
  addSelectionToMyDrugs: PropTypes.func.isRequired,
  baseList: PropTypes.array.isRequired,
  // myDrugs: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  searchResultCount: PropTypes.number.isRequired,
  updateFlowState: PropTypes.func.isRequired,
  // userProfile: PropTypes.object.isRequired,
  userStateId: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
    // myDrugs: state.myDrugs,
    // userProfile: state.profile,
    baseList: state.searchResults.filter((r) => r.isSelected).map((bl) => bl.baseId),
    searchResultCount: state.searchResults.length,
    userStateId: state.profile['userStateId'] ?? '',
  }
}

const mapDispatchToProps = {
  addSelectionToMyDrugs: Dispatch.addSelectionToMyDrugs,
  updateFlowState: Dispatch.updateFlowState,
}

export default connect(mapStateToProps, mapDispatchToProps)(pDrugSelect);
