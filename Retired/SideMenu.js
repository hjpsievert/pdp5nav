import React from 'react'
import { View } from 'react-native'
import { ListItem } from 'react-native-elements';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';


// export class SideMenu extends React.Component {
//   render() {


//const { navigation, userProfile } = this.props;
const sideMenuList = [
  {
    name: 'Account Management',
    icon: 'account-details',
    iconSet: 'material-community',
    target: 'Account',
    active: true,
  },
  {
    name: 'Settings',
    icon: 'settings',
    iconSet: 'material',
    target: 'Settings',
    active: true,
  },
  {
    name: 'Data Manager',
    icon: 'database',
    iconSet: 'material-community',
    target: 'DataManager',
    active: true, //userProfile.emailVerified,
  },
  {
    name: 'Contact Us',
    icon: 'email',
    iconSet: 'material',
    target: 'ContactUs',
    active: true,
  },
  {
    name: 'System Info',
    icon: 'devices',
    iconSet: 'material',
    target: 'SystemInfo',
    active: true,
  }];

export default function SideMenu(props) {
  console.log('props = ', props);
  return (

    <View style={{ flex: 1, backgroundColor: '#ededed', paddingTop: 50, marginBottom: 20 }}>
      {
        sideMenuList.map((l, i) => (
          <ListItem
            key={i}
            title={l.name}
            titleStyle={{ color: l.active ? 'black' : 'grey' }}
            leftIcon={{ name: l.icon, type: l.iconSet, color: l.active ? '#405ce8' : 'grey', size: 23 }}
            onPress={() => l.active ? props.navigation.navigate(l.target) : null}
            hideChevron={true}
          />
        ))
      }
    </View>
  )
}


// SideMenu.propTypes = {
//   userProfile: PropTypes.object.isRequired,
// };

// const mapStateToProps = (state) => {
//   return {
//     userProfile: state.profile,
//   }
// }

// export default connect(mapStateToProps)(SideMenu);

