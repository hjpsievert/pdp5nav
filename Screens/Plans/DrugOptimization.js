import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as Dispatch from '../../Redux/Dispatches';
import { connect } from 'react-redux';
import SlideInView from '../../Components/SlideInView';
import {
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { Icon } from 'react-native-elements';
import capitalize from 'lodash/capitalize';
import find from 'lodash/find';


export class DrugOptimization extends Component {
  constructor(props, context) {
    super(props, context);
    const { configDetail } = props.myDrugs[props.selectedDrug];
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      dataSource: props.myDrugs,
      duration: 500,
      splitSelected: configDetail.doSplit,
      compareSelected: configDetail.doCompare,
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);

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

  _handleUpdateOptimize = (altId) => {
    console.log('DrugOptimization _handleUpdateOptimize begin');

    const { splitSelected, compareSelected } = this.state;
    const { selectedDrug } = this.props;
    if (splitSelected) {
      this.props.handleUpdateSplit(selectedDrug);
    }
    else if (compareSelected) {
      this.props.handleUpdateCompare(altId, selectedDrug);
    }
    else {
      this.props.handleClearOptimization(selectedDrug);
    }
    console.log('DrugOptimization _handleUpdateOptimize updating flowState');
    this.props.updateFlowState({
      showOptimize: false,
      planListDirty: true,
      activeListDirty: true,
    });
    console.log('DrugOptimization _handleUpdateOptimize end');
  }

  _toggleSplitSelected = () => {
    this.setState({
      splitSelected: !this.state.splitSelected,
      compareSelected: !this.state.splitSelected ? false : this.state.compareSelected,
    });
  }

  _toggleCompareSelected = () => {
    this.setState({
      compareSelected: !this.state.compareSelected,
      splitSelected: !this.state.compareSelected ? false : this.state.splitSelected,
    });
  }

  _handleExitOptimize = () => {
    this.props.updateFlowState({
      showOptimize: false,
    });
    this.setState({
      splitSelected: false,
      compareSelected: false,
    })
  }

  render() {
    const { adjust, splitSelected, compareSelected, dataSource } = this.state;
    const { selectedDrug } = this.props;
    console.log('DrugOptimization render');

    const { drugDetail } = dataSource[selectedDrug];
    const altDetail = drugDetail.altDetail;
    const titleText = (drugDetail.isBrand ? capitalize(drugDetail.brandName) : drugDetail.baseName) + ' ' + drugDetail.rxStrength + ' ' + drugDetail.units + ' ' + capitalize(drugDetail.pckUnit);
    const titleText2 = 'Optimize for split or equivalent drugs';
    const intro = 'You can only optimize one drug, either for best equivalent drug or to determine the benefit of splitting a higher dose. \nThis app will only give you information that will help you make a decision, no specific recommendation is made. You should always consult with your primary health care professional to make a final determination.';

    const currentCompareDrug = find(dataSource, (d) => d.configDetail.doCompare);
    const currentSplitDrug = find(dataSource, (d) => d.configDetail.doSplit);

    let currentOptimization;
    let currentOptimizationAction = '';
    if (currentCompareDrug) {
      if (currentCompareDrug.drugDetail.ndc != drugDetail.ndc) {
        currentOptimization = (currentCompareDrug.drugDetail.isBrand ? capitalize(currentCompareDrug.drugDetail.brandName) : capitalize(currentCompareDrug.drugDetail.baseName)) + ' is currently selected for finding best equivalent drug';
        currentOptimizationAction = 'Selecting either optimization method and pressing \'Apply\' will replace it';
      }
      else {
        currentOptimization = 'The current drug is selected for finding best equivalent drug';
        currentOptimizationAction = 'Unselecting it or selecting split optimization and pressing \'Apply\' will update optimization';
      }
    }
    else if (currentSplitDrug) {
      if (currentSplitDrug.drugDetail.ndc != drugDetail.ndc) {
        currentOptimization = (currentSplitDrug.drugDetail.isBrand ? capitalize(currentSplitDrug.drugDetail.brandName) : capitalize(currentSplitDrug.drugDetail.baseName)) + ' is currently selected for evaluating drug splitting';
        currentOptimizationAction = 'Selecting either optimization method and pressing \'Apply\' will replace it';
      }
      else {
        currentOptimization = 'The current drug is selected for splitting';
        currentOptimizationAction = 'Unselecting it or selecting equivalent optimization and pressing \'Apply\' will update optimization'
      }
    }
    else {
      currentOptimization = 'No drug currently selected for optimization';
      currentOptimizationAction = 'Select desired choice and press \'Apply\' to set optimization'
    }

    let splitChoice;
    let compareChoice;
    if (drugDetail.ndc2.length > 0) {
      splitChoice = (drugDetail.isBrand ? capitalize(drugDetail.brandName) : drugDetail.baseName) + ' ' + drugDetail.strengthNum2 + ' ' + drugDetail.units + ' available for splitting';
    }
    else {
      splitChoice = null;
    }
    let compareChoices = '';
    if (drugDetail.altCount > 0) {
      compareChoice = drugDetail.altCount + ' equivalent drug' + (drugDetail.altCount > 1 ? 's' : '') + ':';
      let i;
      let lBreak = '';
      for (i = 0; i < drugDetail.altCount; i++) {
        compareChoices += lBreak + (i + 1) + '. ' + capitalize(altDetail[i].drugName.substr(0, altDetail[i].drugName.indexOf('[') + 1)) + altDetail[i].drugName.substr(altDetail[i].drugName.indexOf('[') + 1, 1).toUpperCase() + altDetail[i].drugName.substr(altDetail[i].drugName.indexOf('[') + 2).toLowerCase() + ' by ' + altDetail[i].manufacturer;
        lBreak = '\n';
      }
    }
    else {
      compareChoice = null;
    }

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
              borderWidth: 1,
            }}
            >

              <View style={{ flex: 1, flexDirection: 'column', alignItems: 'stretch' }}>


                <View style={{ borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
                  <Text style={{ fontSize: 18, paddingLeft: 10, paddingRight: 10, paddingTop: 10, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'center', fontWeight: 'bold' }}>
                    {titleText}
                  </Text>
                  <Text style={{ fontSize: 16, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 10, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'center' }}>
                    {titleText2}
                  </Text>
                </View>

                <View style={{ paddingLeft: 15, backgroundColor: 'rgb(204, 223, 255)', alignItems: 'stretch', paddingBottom: 5, borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
                  <Text style={{ fontSize: 12, paddingRight: 10, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                    {intro}
                  </Text>
                </View>

                <View style={{ paddingLeft: 15, backgroundColor: 'rgb(183, 211, 255)', alignItems: 'stretch', paddingBottom: 5, borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
                  <Text style={{ fontSize: 12, paddingLeft: 15, paddingRight: 10, paddingBottom: 5, color: '#777' }}>
                    {currentOptimization}
                  </Text>
                </View>
                <View style={{ paddingLeft: 15, backgroundColor: 'rgb(204, 223, 255)', alignItems: 'stretch', paddingBottom: 5, borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
                  <Text style={{ fontSize: 12, paddingLeft: 15, paddingRight: 10, color: '#777' }}>
                    {currentOptimizationAction}
                  </Text>
                </View>

                {drugDetail.ndc2.length > 0 &&
                  <View style={{ flexDirection: 'row', backgroundColor: 'rgb(204, 223, 255)', alignItems: 'center', paddingBottom: 5 }}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      <Text style={{ fontSize: 14, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, backgroundColor: 'rgb(183, 211, 255)' }}>
                        {splitChoice}
                      </Text>
                      <TouchableHighlight
                        onPress={this._toggleSplitSelected}
                      >
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Icon
                            name={splitSelected ? 'ios-radio-button-on' : 'ios-radio-button-off'}
                            type={'ionicon'}
                            color={'black'}
                            size={15}
                            containerStyle={{
                              paddingLeft: 15,
                              paddingRight: 5,
                            }}
                          />
                          <Text style={{ fontSize: 13, paddingTop: 5, paddingBottom: 5 }}>{'Split this drug?'}</Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </View>
                }

                {drugDetail.altCount > 0 &&
                  <View style={{ flexDirection: 'row', backgroundColor: 'rgb(204, 223, 255)', alignItems: 'center', paddingBottom: 5 }}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      <Text style={{ fontSize: 14, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, backgroundColor: 'rgb(183, 211, 255)' }}>
                        {compareChoice}
                      </Text>
                      <Text style={{ fontSize: 12, paddingLeft: 20, paddingRight: 10, paddingBottom: 3, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                        {compareChoices}
                      </Text>
                      <TouchableHighlight
                        onPress={this._toggleCompareSelected}
                      >
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Icon
                            name={compareSelected ? 'ios-radio-button-on' : 'ios-radio-button-off'}
                            type={'ionicon'}
                            color={'black'}
                            size={15}
                            containerStyle={{
                              paddingLeft: 15,
                              paddingRight: 5,
                            }}
                          />
                          <Text style={{ fontSize: 13, paddingTop: 5, paddingBottom: 5 }}>{'Optimize equivalent drugs?'}</Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </View>
                }

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
                    onPress={this._handleExitOptimize}
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
                    onPress={() => this._handleUpdateOptimize(drugDetail.altId)}
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
                        style={[styles.topTabText, { color: 'black' }]}
                      >
                        {'APPLY'}
                      </Text>
                    </View>
                  </TouchableHighlight>
                </View>

              </View>
            </View>
          </View>
        </View>
      </SlideInView>
    )
  }
}

DrugOptimization.propTypes = {
  handleClearOptimization: PropTypes.func.isRequired,
  handleUpdateCompare: PropTypes.func.isRequired,
  handleUpdateSplit: PropTypes.func.isRequired,
  myDrugs: PropTypes.object.isRequired,
  selectedDrug: PropTypes.number.isRequired,
  updateFlowState: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    myDrugs: state.myDrugs,
  }
}

const mapDispatchToProps = {
  handleClearOptimization: Dispatch.handleClearOptimization,
  handleUpdateCompare: Dispatch.handleUpdateCompare,
  handleUpdateSplit: Dispatch.handleUpdateSplit,
  updateFlowState: Dispatch.updateFlowState,
}
// export default withNavigation(ErrorHandler);

export default connect(mapStateToProps, mapDispatchToProps)(DrugOptimization);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});