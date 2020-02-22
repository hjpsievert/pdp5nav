import React from 'react'
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Platform
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as Dispatch from '../../Redux/Dispatches';
import DrugDosage from './DrugDosage';
import { Button } from 'react-native-elements';

export class pDrugs extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web'
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    this.props.updateFlowState({
      showDosage: false,
    })
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

  _createTestData = (size) => {
    let testData = [];
    for (let index = 0; index < size; index++) {
      testData.push({ key: index, title: 'Title ' + index, subtitle: 'Subtitle ' + index, line: 'A Line', finalLine: 'The final line' });
    }
    return testData;
  }
  
  _showDosage = () => {
    this.props.updateFlowState({
      showDosage: true,
    })
  }
  _renderItem = (item, index) => {
    const newText = item.subtitle + '\n' + item.line + '\n' + item.finalLine;
    return (
      <View style={{ backgroundColor: '#eee', borderBottomColor: '#bbb', borderBottomWidth: 1, paddingBottom: 5 }}>
        <Text style={{ paddingLeft: 35, fontSize: 14, paddingTop: 5, paddingBottom: 5 }}>
          {(index + ': ' + item.title)}
        </Text>
        <Text style={{ paddingLeft: 35, fontSize: 10 }}>
          {(newText)}
        </Text>

      </View>
    );
  }

  render() {
    const testData = this._createTestData(5);
    const { adjust } = this.state;
    const { showDosage } = this.props;
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 5, height: 50, borderWidth: 1, borderColor: 'black' }}>
          <Text style={{ borderWidth: 1, borderColor: 'red' }}>
            {'Drug Information'}
          </Text>
        </View>
        <View style={{ flexShrink: 1, flexDirection: 'column', justifyContent: 'center', padding: 5, borderWidth: 1, borderColor: 'blue' }}>
          <FlatList
            data={testData}
            renderItem={({ item, index }) => this._renderItem(item, index)}
            keyExtractor={(item) => item.key.toString()}
            horizontal={false}
            extraData={this.state.flag}
          />
          <Button
            raised={true}
            containerStyle={{width: 200, marginTop: 10, marginBottom: 5, alignSelf: 'center'}}
            icon={{ name: 'ios-arrow-dropright', type: 'ionicon', color: 'white' }}
            iconRight
            backgroundColor={'green'}
            color={'white'}
            title={'Drug Dosage'}
            onPress={() => this._showDosage()}
          />
        </View>

        {
          showDosage ?
            <DrugDosage />
            : null
        }
      </View>
    )
  }
}

pDrugs.propTypes = {
  showDosage: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  return {
    showDosage: state.flowState['showDosage'] ? state.flowState['showDosage'] : false,
  }
}

const mapDispatchToProps = {
  updateFlowState: Dispatch.updateFlowState,
}


export default connect(mapStateToProps, mapDispatchToProps)(pDrugs);