import React from 'react'
import {
  View,
  StyleSheet,
} from 'react-native';
import { ListItem } from 'react-native-elements';

function buildList() {

  let listOptions = [];
  let i = 0;
  listOptions.push({ key: i++, title: 'Register', subtitle: 'Register for a new account', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegCreate' });
  listOptions.push({ key: i++, title: 'Login', subtitle: 'Login to your account', icon: 'login', type: 'material-community', active: true, target: 'aLogin' });

  return listOptions;
}

function handlePress(navigation, target){
  navigation.navigate(target);
}

const myList = buildList();

function aAccount({ route, navigation }) {
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
            titleStyle={{ fontSize: 14, color: l.active ? 'black' : '#86939e' }}
            subtitle={l.subtitle.length ? l.subtitle : null}
            subtitleNumberOfLines={2}
            subtitleStyle={{ fontSize: 12, color: l.active ? '#86939e' : '#bdc6cf' }}
            onPress={() => handlePress(navigation, l.target)}
            hideChevron={!l.active}
          />
        ))
      }
    </View>
  )
}

export default aAccount;

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