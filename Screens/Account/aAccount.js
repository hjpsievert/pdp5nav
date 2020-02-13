import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} from 'react-native';
import { ListItem } from 'react-native-elements';

function buildList() {

  const emailVerified = true;
  const appVerified = true;
  let listOptions = [];
  let i = 0;
  listOptions.push({ key: i++, title: 'Register', subtitle: 'Register for a new account', icon: 'user-plus', type: 'font-awesome', active: !emailVerified, target: (emailVerified || appVerified) ? 'aRegCheck' : 'aRegCreate' });
  listOptions.push({ key: i++, title: 'Activate', subtitle: 'Unlock the EZPartD Application', icon: 'key', type: 'font-awesome', active: emailVerified && !appVerified, target: 'aActivate' });
  listOptions.push({ key: i++, title: 'Login', subtitle: 'Login to your account', icon: 'login', type: 'material-community', active: appVerified, target: 'aLogin' });
  listOptions.push({ key: i++, title: 'Change Password', subtitle: 'Change your password', icon: 'key-change', type: 'material-community', active: appVerified, target: 'aChangePw' });
  listOptions.push({ key: i++, title: 'Reset Password', subtitle: 'Reset your password', icon: 'redo-variant', type: 'material-community', active: appVerified, target: 'aResetPw' });
  listOptions.push({ key: i++, title: 'User Profile', subtitle: 'View and edit your information', icon: 'account-edit', type: 'material-community', active: true, target: 'aProfile' });
  listOptions.push({ key: i++, title: 'User Mode', subtitle: 'Change the way you use EZPartD', icon: 'account-switch', type: 'material-community', active: true, target: 'aUserMode' });
  listOptions.push({ key: i++, title: 'Security', subtitle: 'Configure security options like password reset and two-factor authentication', icon: 'security', type: 'material-community', active: appVerified, target: 'Top' });
  return listOptions;
}

function handlePress(navigation, target){
  navigation.navigate(target);
// console.log('handlePress ', target);
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