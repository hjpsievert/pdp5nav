import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { Icon, Button } from 'react-native-elements';

function pSearch({navigation}) {

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Drug Search</Text>
      <Button
        raised={true}
        icon={{ name: 'ios-arrow-dropright', type: 'ionicon' }}
        iconRight
        backgroundColor={'green'}
        color={'white'}
        title={'Pick Base Drugs'}
        onPress={() => navigation.navigate('pPick')}
      />
      <Button
        raised={true}
        icon={{ name: 'ios-arrow-dropright', type: 'ionicon' }}
        iconRight
        backgroundColor={'green'}
        color={'white'}
        title={'Select final Drugs'}
        onPress={() => navigation.navigate('pSelect')}
      />
          </View>)
}

export default pSearch;