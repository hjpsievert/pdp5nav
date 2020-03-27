import React from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { ListItem } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import { usrMode } from '../../Utils/Constants';

export class aAccount extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    console.log('aAccount componentDidMount, route = ', this.props.route);
  }


  componentWillUnmount() {
    console.log('aAccount did unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _buildList = () => {
    const { userProfile, updateFlowState } = this.props;
    const { userMode, userStateId } = userProfile;
    let listOptions = [];
    let i = 0;

    const doState = (userMode === usrMode.init || userMode=== usrMode.anon || userMode===usrMode.created || userMode=== usrMode.verifying);
    const appVerified = (userMode === usrMode.reg);
    if (userMode === usrMode.init) {
      updateFlowState({
        doClean: true
      });
    }

    listOptions.push({ key: i++, title: 'Select State', subtitle: 'Specify your state of residence', icon: 'select1', type: 'antdesign', active: doState, target: 'aRegState', paramName: 'doClean', param: true });
    listOptions.push({ key: i++, title: 'Register', subtitle: 'Register for a new account', icon: 'user-plus', type: 'font-awesome', active: userMode === usrMode.anon || userMode === usrMode.created, target: userMode === usrMode.created ? 'aRegFinish' : 'aRegCreate' });
    // listOptions.push({ key: i++, title: 'Register Create', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegCreate' });
    // listOptions.push({ key: i++, title: 'Register Provider', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegProvider' });
    // listOptions.push({ key: i++, title: 'Register Phone', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegPhone', paramName: 'provider', param: 'Phone' });
    // listOptions.push({ key: i++, title: 'Register Finish Phone', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegFinish', paramName: 'provider', param: 'Phone' });
    // listOptions.push({ key: i++, title: 'Register Finish Email', subtitle: 'For test only', icon: 'user-plus', type: 'font-awesome', active: true, target: 'aRegFinish', paramName: 'provider', param: 'Email' });
    listOptions.push({ key: i++, title: 'Activate', subtitle: 'Unlock the EZPartD Application', icon: 'key', type: 'font-awesome', active: userMode===usrMode.activating, target: 'aActivate' });
    listOptions.push({ key: i++, title: 'Login', subtitle: 'Login to your account', icon: 'login', type: 'material-community', active: true, target: 'aLogin' });
    listOptions.push({ key: i++, title: 'Change Password', subtitle: 'Change your password', icon: 'key-change', type: 'material-community', active: appVerified, target: 'aChangePw' });
    listOptions.push({ key: i++, title: 'Reset Password', subtitle: 'Reset your password', icon: 'redo-variant', type: 'material-community', active: appVerified, target: 'aResetPw' });
    listOptions.push({ key: i++, title: 'User Profile', subtitle: 'View and edit your information', icon: 'account-edit', type: 'material-community', active: true, target: 'aProfile' });
    listOptions.push({ key: i++, title: 'User Mode', subtitle: 'Change the way you use EZPartD', icon: 'account-switch', type: 'material-community', active: appVerified, target: 'aUserMode' });
    listOptions.push({ key: i++, title: 'Security', subtitle: 'Configure security options like password reset and two-factor authentication', icon: 'security', type: 'material-community', active: appVerified, target: 'Top' });
    return listOptions;
  }

  _handlePress = (active, navigation, target, paramName, param) => {

    if (!active) {
      return
    }
    navigation.navigate(target, paramName ? { [paramName]: param } : {});

    // console.log('handlePress ' + paramName + ': ' + param);
  }


  render() {
    const { navigation } = this.props;
    const myList = this._buildList();
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
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                title={l.title}
                titleStyle={{ paddingLeft: 20, fontSize: 16, color: l.active ? 'black' : '#86939e' }}
                subtitle={l.subtitle.length ? l.subtitle : null}
                subtitleNumberOfLines={2}
                subtitleStyle={{ paddingLeft: 20, fontSize: 14, color: l.active ? '#86939e' : '#bdc6cf' }}
                onPress={() => this._handlePress(l.active, navigation, l.target, l.paramName, l.param)}
                hideChevron={!l.active}
              />
            ))
          }
        </View>
      </ScrollView>
    )
  }
}

aAccount.propTypes = {
  navigation: PropTypes.object.isRequired,
  updateFlowState: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
  updateFlowState: Dispatch.updateFlowState,
}

export default connect(mapStateToProps, mapDispatchToProps)(aAccount);

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