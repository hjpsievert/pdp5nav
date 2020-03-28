import React from 'react'
import {
  View,
  Text,
} from 'react-native';

export default class ContactUs extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      drugsLoaded: false,
    }
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{'Contact Us'}</Text>
      </View>)
  }
}
