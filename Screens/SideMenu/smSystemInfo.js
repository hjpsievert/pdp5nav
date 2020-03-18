import React from 'react'
import {
  View,
  Text,
  PixelRatio,
  Platform,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
// import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import { ListItem } from 'react-native-elements';
import * as LocalAuthentication from 'expo-local-authentication';

export default class SystemInfo extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      drugsLoaded: false,
    }
  }

  componentDidMount() {

    // if (Platform.OS !== 'web')
    // // Subscribe
    // {
    //   const unsubscribe = NetInfo.addEventListener(state => {
    //     this.setState({
    //       type: state.type,
    //       connected: state.isConnected ? 'connected' : 'disconnected',
    //     });
    //   });

    //   // Unsubscribe
    //   unsubscribe();

    //   NetInfo.fetch().then(state => {
    //     this.setState({
    //       type: state.type,
    //       connected: state.isConnected ? 'connected' : 'disconnected',
    //     });
    //   });
    // }

    this.setState({
      hasHardware: false,
      isEnrolled: false,
    });

    let isTablet = false;
    if (PixelRatio.get() < 2 && (Dimensions.get('window').width * PixelRatio.get() >= 1000 || Dimensions.get('window').height * PixelRatio.get() >= 1000)) {
      isTablet = true;
    }
    else if (PixelRatio.get() === 2 && (Dimensions.get('window').width * PixelRatio.get() >= 1920 || Dimensions.get('window').height * PixelRatio.get() >= 1920)) {
      isTablet = true;
    }
    this.setState({
      isTablet: isTablet,
    });

    if (Platform.OS !== 'web') { this._authFunction(); }
  }

  _authFunction = async () => {
    let hasFPHardware = false;
    let isFPEnrolled = false;

    hasFPHardware = await LocalAuthentication.hasHardwareAsync();
    if (hasFPHardware) {
      this.setState({
        hasFPHardware: true,
      });
      isFPEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (isFPEnrolled) {
        this.setState({
          isFPEnrolled: true,
        });
      }
    }
  }

  render() {
    const { OS } = Platform;
    const { installationId, deviceName, isDevice, platform } = Constants;
    const { tablet, hasFPHardware, isFPEnrolled, connected, type } = this.state;

    let sysInfo = [];
    let i = 0;
    sysInfo.push({ key: i++, title: 'Device Name', subtitle: deviceName });
    sysInfo.push({ key: i++, title: 'Device ID', subtitle: installationId });
    sysInfo.push({ key: i++, title: 'Device Type', subtitle: tablet ? 'Tablet' : 'Phone' });
    sysInfo.push({ key: i++, title: 'Device State', subtitle: isDevice ? 'Real' : 'Emulator' });
    sysInfo.push({ key: i++, title: 'Window dimensions', subtitle: Dimensions.get('window').width + ' x ' + Dimensions.get('window').height });
    sysInfo.push({ key: i++, title: 'Screen dimensions', subtitle: Dimensions.get('window').width * PixelRatio.get() + ' x ' + Dimensions.get('window').height * PixelRatio.get() });
    if (Platform.OS !== 'web') {
      sysInfo.push({ key: i++, title: 'Connection', subtitle: connected });
      sysInfo.push({ key: i++, title: 'Connection Type', subtitle: type });
      sysInfo.push({ key: i++, title: 'Fingerprint Support', subtitle: hasFPHardware ? 'yes' : 'no' });
      sysInfo.push({ key: i++, title: 'Fingerprint stored', subtitle: isFPEnrolled ? 'yes' : 'no' });
    }
    sysInfo.push({ key: i++, title: 'Operating System', subtitle: OS });
    if (OS === 'ios') {
      sysInfo.push({ key: i++, title: 'System Name', subtitle: platform.ios.platform });
      sysInfo.push({ key: i++, title: 'System Version', subtitle: platform.ios.systemVersion });
      sysInfo.push({ key: i++, title: 'Device Model', subtitle: platform.ios.model });
    }
    //console.log('sysInfo = ', sysInfo);
    return (

      <View style={styles.container}>
        <ScrollView>
          {
            sysInfo.map((l, i) => (
              <ListItem
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                title={l.title}
                titleStyle={{ fontSize: 14, paddingBottom: 3 }}
                subtitle={l.subtitle}
                subtitleNumberOfLines={2}
                subtitleStyle={{ fontSize: 12, paddingLeft: 10 }}
                hideChevron={true}
              />
            ))
          }
        </ScrollView>
      </View>
    )
  }

}

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
