import React from 'react'
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Platform
} from 'react-native';

export default class pDrugs extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web'
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    // ScreenOrientation.addOrientationChangeListener(this._myListener);
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this._handleDimChange);
    // ScreenOrientation.removeOrientationChangeListeners();
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height  && Platform.OS !== 'web';
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

  _renderItem = (item, index) => {
    return (
      <View style={{ backgroundColor: '#eee', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
        <Text style={{ paddingLeft: 35, fontSize: 14, paddingTop: 5, paddingBottom: 5 }}>
          {(index + ': ' + item.title)}
        </Text>
        <Text style={{ paddingLeft: 35, fontSize: 10, paddingTop: 5, paddingBottom: 5 }}>
          {(item.subtitle)}
        </Text>
        <Text style={{ paddingLeft: 35, fontSize: 10, paddingTop: 5, paddingBottom: 5 }}>
          {(item.line)}
        </Text>
        <Text style={{ paddingLeft: 35, fontSize: 10, paddingTop: 5, paddingBottom: 5 }}>
          {(item.finalLine)}
        </Text>
      </View>
    );
  }

  render() {
    const testData = this._createTestData(8);
    const {adjust} = this.state;
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 5, height: 50, borderWidth: 1, borderColor: 'black' }}>
          <Text style={{ borderWidth: 1, borderColor: 'red' }}>
            {'Drug Information'}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 5, borderWidth: 1, borderColor: 'blue' }}>
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
