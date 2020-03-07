import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as Dispatch from '../../Redux/Dispatches';
import { connect } from 'react-redux';
import { Icon, Slider } from 'react-native-elements'; // patched Slider.js in sourcecode
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
import capitalize from 'lodash/capitalize';

export class DrugMode extends Component {
  constructor(props, context) {
    super(props, context);
    const { myDrugs, selectedDrug } = props;
    const { configDetail } = myDrugs[selectedDrug];
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      dataSource: myDrugs,
      duration: 500,
      isAcute: configDetail.isAcute,
      episodeDays: configDetail.episodeDays,
      numEpisodes: configDetail.numEpisodes,
      dosesPerDay: configDetail.dosesPerDay,
      showAlert: false
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

  _handleUpdateMode = (drugId) => {
    const { isAcute, numEpisodes, episodeDays, dosesPerDay } = this.state;
    this.props.handleUpdateMode(isAcute, numEpisodes, episodeDays, dosesPerDay, drugId);
    this.props.updateFlowState({
      showMode: false,
      planListDirty: true,
      activeListDirty: true,
    });
  }

  _toggleDrugMode = () => {
    this.setState({
      isAcute: !this.state.isAcute,
    });
  }

  _handleExitMode = () => {
    this.props.updateFlowState({
      showMode: false,
    });
    this.setState({
      isAcute: false,
      episodeDays: 90,
      numEpisodes: 4,
      dosesPerDay: 1,
    })
  }

  render() {
    const { adjust, showAlert, isAcute, episodeDays, dataSource } = this.state;
    //if (!dataSource) return null;
    const { selectedDrug } = this.props;
    const item = dataSource[selectedDrug];
    const { drugId, drugDetail, configDetail } = item;

    const titleText = (drugDetail.isBrand ? capitalize(drugDetail.brandName) : drugDetail.baseName) + ' ' + drugDetail.rxStrength + ' ' + drugDetail.units + ' ' + capitalize(drugDetail.pckUnit);
    const titleText2 = 'Define Usage Mode';
    const intro = 'Identify whether this drug is a maintenance medication used on a continuous base or a drug you expect to require only for a few acute episodes during the year. Acute drugs may reqire a shorter course of administration which you will be able to define in more detail.';
    const currentType = 'Current drug is used in ' + (configDetail.isAcute ? 'Acute' : 'Maintenance') + ' mode.';
    const episodeDetail = 'You are configured for ' + configDetail.numEpisodes + ' episodes of ' + configDetail.episodeDays + ' days, and you are taking ' + configDetail.dosesPerDay + ' dose' + (configDetail.dosesPerDay > 1 ? 's' : '') + ' each day.'

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
              <ScrollView>

                <View style={{ flex: 1, flexDirection: 'column', alignItems: 'stretch', borderTopColor: '#black', borderTopWidth: Platform.OS === 'web' && !showAlert ? 1 : 0 }}>

                  <View>
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

                  <View style={{ flexDirection: 'row', backgroundColor: 'rgb(204, 223, 255)', alignItems: 'center', paddingBottom: 5, borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      <Text style={{ fontSize: 14, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, backgroundColor: 'rgb(183, 211, 255)' }}>
                        {currentType}
                      </Text>
                      <TouchableHighlight
                        onPress={this._toggleDrugMode}
                      >
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <Text style={{ paddingLeft: 15, paddingTop: 5, paddingBottom: 5 }}>{'Change mode: '}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon
                              name={isAcute ? 'ios-square-outline' : 'ios-checkbox-outline'}
                              type={'ionicon'}
                              color={'black'}
                              size={15}
                              containerStyle={{
                                paddingLeft: 5,
                                paddingRight: 10,
                              }}
                            />
                            <Text style={{ paddingTop: 5, paddingBottom: 5 }}>{'Maintenance'}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon
                              name={isAcute ? 'ios-checkbox-outline' : 'ios-square-outline'}
                              type={'ionicon'}
                              color={'black'}
                              size={15}
                              containerStyle={{
                                paddingLeft: 5,
                                paddingRight: 10,
                              }}
                            />
                            <Text style={{ paddingTop: 5, paddingBottom: 5, paddingRight: 15 }}>{'Acute'}</Text>
                          </View>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </View>

                  <View
                    style={{ alignItems: 'stretch', justifyContent: 'center' }}
                  >
                    <Text style={{ fontSize: 14, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, backgroundColor: 'rgb(183, 211, 255)' }}>
                      {episodeDetail}
                    </Text>
                    <View
                      style={{ alignSelf: 'stretch', justifyContent: 'center', paddingLeft: 25, paddingRight: 25, paddingTop: 10 }}
                    >
                      <Text>{'Number of episodes: ' + this.state.numEpisodes + ' (1 - 6)'}</Text>
                      <Slider
                        minimumValue={1}
                        maximumValue={6}
                        step={1}
                        thumbTintColor={'#405ce8'}
                        minimumTrackTintColor={'rgb(155, 193, 255)'}
                        maximumTrackTintColor={'rgb(41, 73, 232)'}
                        value={this.state.numEpisodes}
                        onValueChange={(numEpisodes) => this.setState({ numEpisodes })}
                        onSlidingComplete={(value) => this.setState({ numEpisodes: value })}
                      />
                    </View>
                  </View>

                  <View
                    style={{ alignItems: 'stretch', justifyContent: 'center', paddingLeft: 25, paddingRight: 25, paddingTop: 10 }}
                  >
                    <Text>{'Episode duration in days: ' + episodeDays + ' (1 - 90)'}</Text>
                    {episodeDays >= 60 ?
                      <Slider
                        minimumValue={0}
                        maximumValue={90}
                        step={15}
                        thumbTintColor={'#405ce8'}
                        minimumTrackTintColor={'rgb(155, 193, 255)'}
                        maximumTrackTintColor={'rgb(41, 73, 232)'}
                        value={episodeDays}
                        onValueChange={(episodeDays) => this.setState({ episodeDays })}
                        onSlidingComplete={(value) => this.setState({ episodeDays: value })}
                      />
                      :
                      episodeDays >= 30 ?
                        <Slider
                          minimumValue={0}
                          maximumValue={90}
                          step={5}
                          thumbTintColor={'#405ce8'}
                          minimumTrackTintColor={'rgb(155, 193, 255)'}
                          maximumTrackTintColor={'rgb(41, 73, 232)'}
                          value={episodeDays}
                          onValueChange={(episodeDays) => this.setState({ episodeDays })}
                          onSlidingComplete={(value) => this.setState({ episodeDays: value })}
                        />
                        :
                        <Slider
                          minimumValue={1}
                          maximumValue={90}
                          step={1}
                          thumbTintColor={'#405ce8'}
                          minimumTrackTintColor={'rgb(155, 193, 255)'}
                          maximumTrackTintColor={'rgb(41, 73, 232)'}
                          value={episodeDays}
                          onValueChange={(episodeDays) => this.setState({ episodeDays })}
                          onSlidingComplete={(value) => this.setState({ episodeDays: value })}
                        />
                    }
                  </View>

                  <View
                    style={{ alignItems: 'stretch', justifyContent: 'center', paddingLeft: 25, paddingRight: 25 }}
                  >
                    <Text>{'Doses taken per day: ' + this.state.dosesPerDay + ' (1 - 5)'}</Text>
                    <Slider
                      minimumValue={1}
                      maximumValue={5}
                      step={1}
                      thumbTintColor={'#405ce8'}
                      minimumTrackTintColor={'rgb(155, 193, 255)'}
                      maximumTrackTintColor={'rgb(41, 73, 232)'}
                      value={this.state.dosesPerDay}
                      onValueChange={(dosesPerDay) => this.setState({ dosesPerDay })}
                      onSlidingComplete={(value) => this.setState({ dosesPerDay: value })}
                    />
                  </View>

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
                      onPress={this._handleExitMode}
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
                      onPress={() => this._handleUpdateMode(drugId)}
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
              </ScrollView>
            </View>
          </View>
        </View>
      </SlideInView>
    )
  }
}

DrugMode.propTypes = {
  handleUpdateMode: PropTypes.func.isRequired,
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
  handleUpdateMode: Dispatch.handleUpdateMode,
  updateFlowState: Dispatch.updateFlowState,
}
// export default withNavigation(ErrorHandler);

export default connect(mapStateToProps, mapDispatchToProps)(DrugMode);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});