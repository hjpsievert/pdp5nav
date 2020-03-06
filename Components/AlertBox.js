import React, { Component } from 'react';
import {
  TouchableHighlight,
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions
} from 'react-native';
import { Icon } from 'react-native-elements';

export default class AlertBox extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    }
  }

  render() {
    const { alertTitle, alertMessage, executeLabel, cancelLabel, callbackFunction } = this.props;
    const marginTop = this.props.marginTop ?? 100;
    const winWidth = Platform.OS === 'web' ? Dimensions.get('window').width / 3 : Dimensions.get('window').width;

    return (
      <View style={{ backgroundColor: 'rgb(183, 211, 255)', borderColor: 'black', borderWidth: 1, marginTop: marginTop, width: winWidth, alignSelf: 'center' }}>
        
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch' }}>
          <Text style={{ fontSize: 18, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 10 }}>{alertTitle}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', backgroundColor: 'rgb(204, 223, 255)' }}>
          <Text style={{ fontSize: 14, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 10, textAlign: 'left' }}>{alertMessage}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'stretch', paddingTop: 5, borderTopWidth: 1, borderTopColor: '#bbb' }}>
          <TouchableHighlight
            onPress={() => callbackFunction(false)}
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
                {cancelLabel}
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => callbackFunction(true)}
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
                {executeLabel}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>


    )
  }
}

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});