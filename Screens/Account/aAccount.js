import React from 'react'
import {
  View,
  StyleSheet,
  ScrollView
} from 'react-native';
import { ListItem } from 'react-native-elements';

function buildList() {

  const emailVerified = true;
  const appVerified = true;
  let listOptions = [];
  let i = 0;
  listOptions.push({ key: i++, title: 'Register', subtitle: 'Register for a new account', icon: 'user-plus', type: 'font-awesome', active: !emailVerified, target: (emailVerified || appVerified) ? 'aRegCheck' : 'aRegCreate' });
  listOptions.push({ key: i++, title: 'Register State', subtitle: 'Register your state', icon: 'user-plus', type: 'font-awesome', active: !emailVerified, target: 'aRegState' });
  // listOptions.push({ key: i++, title: 'Register Create', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegCreate' });
  // listOptions.push({ key: i++, title: 'Register Provider', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegProvider' });
  // listOptions.push({ key: i++, title: 'Register Phone', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegPhone', paramName: 'provider', param: 'Phone' });
  // listOptions.push({ key: i++, title: 'Register Finish Phone', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegFinish', paramName: 'provider', param: 'Phone' });
  // listOptions.push({ key: i++, title: 'Register Finish Email', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegFinish', paramName: 'provider', param: 'Email' });
  listOptions.push({ key: i++, title: 'Activate', subtitle: 'Unlock the EZPartD Application', icon: 'key', type: 'font-awesome', active: emailVerified && !appVerified, target: 'aActivate' });
  listOptions.push({ key: i++, title: 'Login', subtitle: 'Login to your account', icon: 'login', type: 'material-community', active: appVerified, target: 'aLogin' });
  listOptions.push({ key: i++, title: 'Change Password', subtitle: 'Change your password', icon: 'key-change', type: 'material-community', active: appVerified, target: 'aChangePw' });
  listOptions.push({ key: i++, title: 'Reset Password', subtitle: 'Reset your password', icon: 'redo-variant', type: 'material-community', active: appVerified, target: 'aResetPw' });
  listOptions.push({ key: i++, title: 'User Profile', subtitle: 'View and edit your information', icon: 'account-edit', type: 'material-community', active: true, target: 'aProfile' });
  listOptions.push({ key: i++, title: 'User Mode', subtitle: 'Change the way you use EZPartD', icon: 'account-switch', type: 'material-community', active: true, target: 'aUserMode' });
  listOptions.push({ key: i++, title: 'Security', subtitle: 'Configure security options like password reset and two-factor authentication', icon: 'security', type: 'material-community', active: appVerified, target: 'Top' });
  return listOptions;
}

function handlePress(navigation, target, paramName, param) {

  navigation.navigate(target, paramName ? { [paramName]: param } : {});

  // console.log('handlePress ' + paramName + ': ' + param);
}

const myList = buildList();

function aAccount({ navigation }) {
  return (
    <ScrollView>
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
              onPress={() => handlePress(navigation, l.target, l.paramName, l.param)}
              hideChevron={!l.active}
            />
          ))
        }
      </View>
    </ScrollView>
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