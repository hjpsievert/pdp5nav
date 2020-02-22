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
  FlatList
} from 'react-native';
import { Icon } from 'react-native-elements';
import size from 'lodash/size';

export class pPlans extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      animating: false,
      showPhases: true,
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
    console.log('pPlans _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _createTestData = (size) => {
    let testData = [];
    for (let index = 0; index < size; index++) {
      testData.push({ key: index, title: 'Title ' + index, subtitle: 'Subtitle ' + index, line: 'A Line', finalLine: 'The final line' });
    }
    return testData;
  }

  _showPlanCount = (plansToShow, targetCount) => {
    const { planCount } = this.props;
    const targetTest = targetCount < 99 ? targetCount : Math.min(planCount, targetCount);
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
    const { updateFlowState, planCount } = this.props;
    updateFlowState({
      plansToShow: Math.min(numPlans, planCount)
    });
  }

  _handleMailChanged = () => {
    const { updateFlowState, doMailState } = this.props;
    this.setState({
      planListDirty: true,
    })
    updateFlowState({
      doMailState: !doMailState,
    })
  }

  _handlePhaseToggle = () => {
    const { plansToShow } = this.props;
    this.setState({
      showPhases: !this.state.showPhases,
      // dataSource: this.state.showPhases ? take(sortBy(flatMap(this.props.myPlans, (d) => d), 'bestCost'), plansToShow) : take(sortBy(flatMap(this.props.myPlans, (d) => d), 'totalCost'), plansToShow),
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

  render() {
    const testData = this._createTestData(25);
    const { adjust, animating, showPhases } = this.state;
    const { startDate, plansToShow, planCount, doMailState } = this.props;
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        {animating &&
          <View>
            <Text>{'Processing your configuration and finding best plans'}</Text>
            <ActivityIndicator
              animating={true}
              // style={styles.progress}
              size="large"
            />
          </View>}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5, paddingTop: 5, paddingBottom: 5, backgroundColor: '#ddd' }}>
          <Text>{'Start date (update as needed): '}</Text>
          <View style={{ paddingLeft: 5, backgroundColor: '#fff', borderWidth: 1, borderColor: '#aaa' }}>
            {/* <TextInput
                defaultValue={startDate}
                placeholder={startDate}
                onChangeText={(text) => this.props.updateFlowState({ startDate: text })}
                onSubmitEditing={this._handleStartDate}
                keyboardType={'numbers-and-punctuation'}
                returnKeyType={'done'}
                style={{ flex: 1, paddingLeft: 5, paddingRight: 5 }}
              /> */}
          </View>
        </View>

        <View style={{ flexDirection: 'row', paddingLeft: 5, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Text>{'Show'}</Text>
            {(planCount >= 5) && this._showPlanCount(plansToShow, 5)}
            {(planCount >= 10) && this._showPlanCount(plansToShow, 10)}
            {(planCount >= 15) && this._showPlanCount(plansToShow, 15)}
            {this._showPlanCount(plansToShow, 99)}
          </View>
          <TouchableHighlight
            onPress={this._handleMailChanged}
          >
            <View style={{ flexDirection: 'row', paddingRight: 15, paddingLeft: 15 }}>
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
          style={{ fontSize: 14, color: 'black', textAlign: 'center', paddingTop: 3, paddingBottom: 3 }}
        >
          {'Compare Plans Section'}
        </Text>
        <Text
          style={{ fontSize: 14, color: 'black', textAlign: 'center', paddingTop: 3, paddingBottom: 3, backgroundColor: '#ddd' }}
        >
          {'Plan List Section'}
        </Text>
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
            data={testData}
            renderItem={({ item, index }) => this._renderItem(item, index)}
            keyExtractor={(item) => item.key.toString()}
            horizontal={false}
            extraData={this.state.flag}
          />
      </View>
      </View>
    )
  }
}

pPlans.propTypes = {
  doMailState: PropTypes.bool.isRequired,
  planCount: PropTypes.number.isRequired,
  plansToShow: PropTypes.number.isRequired,
  startDate: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
    startDate: state.flowState['startDate'] ? state.flowState['startDate'] : new Date().toLocaleDateString('en-US'),
    plansToShow: state.flowState['plansToShow'] ? state.flowState['plansToShow'] : 10,
    planCount: size(state.myPlans) ? size(state.myPlans) : 20,
    doMailState: state.flowState['doMailState'] ? state.flowState['doMailState'] : false,
  }
}

const mapDispatchToProps = {
  updateFlowState: Dispatch.updateFlowState,
}

export default connect(mapStateToProps, mapDispatchToProps)(pPlans);

const styles = StyleSheet.create({
  container: {
    // maxHeight: Dimensions.get('window').height - 120, //Platform.OS === 'web' ? 827 : 547,  //947 : 667
    // width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
    // flex: 1,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'red',
  },
  main: {
    // flexDirection: 'column',
    // justifyContent: 'flex-start',
    // backgroundColor: '#FFFFFF',

    // width: Dimensions.get('window').width,
    // flex: 1,
    //marginLeft: 10,
    //marginRight: 10,
    borderWidth: 3,
    borderColor: 'black',
  },
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