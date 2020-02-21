import React from 'react'
import {
  View,
  Text,
  FlatList,
  Dimensions
} from 'react-native';

export default class pHome extends React.Component {
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
      testData.push({ key: index, title: 'Title ' + index, subtitle: 'Subtitle ' + index });
    }
    return testData;
  }

  _renderItem = (item, index) => {
    return (
      <View style={{ backgroundColor: '#eee', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
        <Text style={{ paddingLeft: 35, fontSize: 12, paddingTop: 5, paddingBottom: 5 }}>
          {(index + ' (' + item.subtitle + ') ' + item.title)}
        </Text>
      </View>
    );
  }

  render() {
    // console.log('pHome render');
    const {adjust} = this.state;
    const testData = this._createTestData(15);
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 5, height: 50, borderWidth: 1, borderColor: 'black' }}>
          <Text style={{ borderWidth: 1, borderColor: 'red' }}>
            {'Welcome Section'}
          </Text>
        </View>
        <View style={{ flexDirection: 'column', justifyContent: 'center', padding: 5, borderWidth: 1, borderColor: 'black' }}>
          <Text style={{ borderWidth: 1, borderColor: 'red' }}>
            {'Message Section'}
          </Text>
          <Text style={{ borderWidth: 1, borderColor: 'red' }}>
            {'More text'}
          </Text>
          <Text style={{ borderWidth: 1, borderColor: 'red' }}>
            {'Even more text'}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 5, height: 200, borderWidth: 1, borderColor: 'blue' }}>
          <Text style={{ borderWidth: 1, borderColor: 'red' }}>
            {'Drug Section'}
          </Text>
          <FlatList
            data={testData}
            renderItem={({ item, index }) => this._renderItem(item, index)}
            keyExtractor={(item) => item.key.toString()}
            horizontal={false}
            extraData={this.state.flag}
          />
        </View>
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 5, borderWidth: 1, borderColor: 'blue' }}>
          <Text style={{ borderWidth: 1, borderColor: 'red' }}>
            {'Plan Section'}
          </Text>
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