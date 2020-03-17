import React from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { refreshDrugs } from '../../Utils/Api';

export class aProfile extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    //console.log('aProfile componentDidMount');
  }

  componentDidUpdate() {
    console.log('aProfile componentDidUpdate');
  }

  componentWillUnmount() {
    console.log('aUserMode will unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('aRegState _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  render() {
    const { adjust } = this.state;
    const { userProfile } = this.props;
    const { userEmail, displayName, emailVerified, appVerified, userMode, storageMode, userIsSubscribed, userStateId, provider, userContractId, userPlanId, userPlanName } = userProfile;

    let profileInfo = [];
    let i = 0;
    profileInfo.push({ key: i++, title: 'EMail', subtitle: userEmail ?? 'not defined' });
    profileInfo.push({ key: i++, title: 'State code', subtitle: userStateId ?? 'not defined' });
    profileInfo.push({ key: i++, title: 'Display Name', subtitle: displayName ?? 'not defined' });
    profileInfo.push({ key: i++, title: 'EMail verified', subtitle: emailVerified ?? 'no' });
    profileInfo.push({ key: i++, title: 'EZPartD activated', subtitle: appVerified ?? 'no' });
    profileInfo.push({ key: i++, title: 'Two-factor authentication', subtitle: provider ?? 'not defined' });
    profileInfo.push({ key: i++, title: 'User mode', subtitle: userMode ?? 'not defined'  });
    profileInfo.push({ key: i++, title: 'Store to cloud', subtitle: (storageMode ?? 'not defined') === 'cloud' ? 'yes' : 'no' });
    profileInfo.push({ key: i++, title: 'Plan selected', subtitle: userIsSubscribed ?? 'no' });
    if (userIsSubscribed) {
      profileInfo.push({ key: i++, title: 'Contract/Plan ID', subtitle: userContractId ?? 'not defined' + '-' + userPlanId ?? '' });
      profileInfo.push({ key: i++, title: 'Plan Name', subtitle: userPlanName ?? 'not defined' });
    }

    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >      
        <ScrollView>
          {
            profileInfo.map((l, i) => (
              <ListItem
                key={i}
                title={l.title}
                containerStyle={{padding: 0}}
                titleStyle={{ fontSize: 16, paddingLeft: 10, paddingVertical: 5, backgroundColor: '#ddd' }}
                subtitle={l.subtitle.length ? l.subtitle : null}
                subtitleNumberOfLines={2}
                subtitleStyle={{ fontSize: 14, paddingLeft: 20,paddingVertical: 5, backgroundColor: '#eee'  }}
                hideChevron={true}
              />
            ))
          }
        </ScrollView>
              </View>)
  }
}

aProfile.propTypes = {
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    userProfile: state.profile,
  }
}

export default connect(mapStateToProps)(aProfile);

