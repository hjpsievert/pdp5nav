import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { ListItem } from 'react-native-elements';

function buildList() {

  const userIsSubscribed = false;
  let listOptions = [];
  let i = 0;
  listOptions.push({ key: i++, title: 'Save Active', subtitle: 'Save your active drug list under a new name', icon: 'download', type: 'font-awesome', target: 'dSave' });
  listOptions.push({ key: i++, title: 'Load Active', subtitle: 'Load one of the saved drug lists into the active list', icon: 'upload', type: 'font-awesome', target: 'dLoad' });
  listOptions.push({ key: i++, title: 'Clear Active', subtitle: 'Clear all drugs from the active list', icon: 'eraser', type: 'material-community', target: 'dClear' });  listOptions.push({ key: i++, title: 'Local Data', subtitle: 'Manage data on your device', icon: 'list-alt', type: 'font-awesome', target: 'dStorage', param: 'device' });
  listOptions.push({ key: i++, title: 'Cloud Data', subtitle: 'Manage data across all your devices', icon: 'devices-other', type: 'material', target: 'dStorage', param: 'cloud' });
  return listOptions;
}

function handlePress(navigation, target, param) {
  navigation.navigate(target,  { storageMode: param } );
  // console.log('handlePress ', target);
}

const myList = buildList();

function dManager({ route, navigation }) {
  return (
    <View style={styles.container}>
      {
        myList.map((l, i) => (
          <ListItem
            leftIcon={{
              name: l.icon,
              type: l.type,
              color: l.active ? '#405ce8' : 'grey'
            }}
            key={i}
            title={l.title}
            titleStyle={{ paddingLeft: 20, fontSize: 16, color: l.active ? 'black' : '#86939e' }}
            subtitle={l.subtitle.length ? l.subtitle : null}
            subtitleNumberOfLines={2}
            subtitleStyle={{ paddingLeft: 20, fontSize: 14, color: l.active ? '#86939e' : '#bdc6cf' }}
            onPress={() => handlePress(navigation, l.target, l.param)}
            hideChevron={!l.active}
          />
        ))
      }
    </View>
  )
}

export default dManager;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#999',
    borderRightWidth: 1,
    borderRightColor: '#999',
    marginTop: 0,
    borderTopWidth: 0,
  },
});