import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Dimensions,
  Keyboard,
  Platform
} from 'react-native';
import { Icon, SearchBar } from 'react-native-elements';
import { searchBaseDrugs } from '../../Utils/Api';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';


export class pDrugSearch extends React.Component {
  constructor(props, context) {
    super(props, context);
    const stateId = props.userProfile.userStateId;
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      entryComplete: false,
      repeatSearch: false,
      emptySearch: false,
      validStateId: !!stateId,
      lastSearch: '',
      useWildcard: false,
      searchString: ''
    };
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
  }

  componentWillUnmount() {
    console.log('pDrugSearch will unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('pDrugSearch _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _handleSearchTextChanged = (searchString) => {


    this.setState({ searchString });
  }

  _handleUserSearch = () => {
    const { userProfile } = this.props;
    const { searchString } = this.state;
    const stateId = userProfile.userStateId;
    console.log('pDrugSearch _handleUserSearch searchTerm = ', searchString);
    if (searchString.length > 0) {
      Keyboard.dismiss();
      this.setState({
        entryComplete: true,
        lastSearch: searchString,
      });
      searchBaseDrugs((response) => {
        this.onBaseDrugSearchComplete(response);
      }, searchString, stateId, this.state.useWildcard);
    }
  }

  onBaseDrugSearchComplete = (response) => {
    const { success, payLoad, code, err } = response;
    console.log('pDrugSearch onBaseDrugSearchComplete resultList = ', payLoad, ', code = ', code);
    const { handleBaseDrugSearchComplete, navigation } = this.props;
    if (code === 0) {
      this.setState({
        repeatSearch: true,
        entryComplete: false,
      });
      this.mySearch.clear();
    }
    else {
      handleBaseDrugSearchComplete(payLoad);
      this._handleSearchTextChanged('');
      code === 1 ? navigation.navigate('pDrugSelect') : navigation.navigate('pDrugPick')
    }
  }

  _handleRegister = () => {
    const { userProfile } = this.props;
    const { emailVerified, appVerified } = userProfile;
    if (emailVerified || appVerified) {
      console.log('pDrugSearch navigate to regCheck');
      this.props.navigation.navigate('Account', { screen: 'aRegCheck' });
      // this.props.navigation.navigate('aRegCheck');
    }
    else {
      console.log('pDrugSearch navigate to regCreate');
      this.props.navigation.navigate('Account', { screen: 'aRegCreate' });
      // this.props.navigation.navigate('aRegCreate');
    }
  }

  _handleProfile = () => {
    console.log('pDrugSearch navigate to profile');
    this.props.navigation.navigate('Account', { screen: 'aProfile' });
  }

  render() {
    console.log('pDrugSearch render');
    const { adjust, emptySearch, validStateId, repeatSearch, lastSearch, entryComplete, useWildcard, searchString } = this.state;
    const { userProfile } = this.props;
    const { userStateName } = userProfile;
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        {!validStateId &&
          <View>
            <View style={{ padding: 15, backgroundColor: 'rgb(204, 223, 255)', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
              <Text>{'You currently have no state of residence identified in your profile.'}</Text>
              <Text>{'In order to be able to search for drugs, you either need to register with your state or you can set your state in the Profile setting under the Account menu.'}</Text>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingTop: 3,
              backgroundColor: 'rgb(183, 211, 255)',
              borderBottomWidth: 1,
              borderBottomColor: 'black',
              borderTopWidth: 1,
              borderTopColor: 'black'
            }}
            >
              <TouchableHighlight
                onPress={this._handleRegister}
              >
                <View style={{ flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 5 }}>
                  <Icon
                    name={'user-plus'}
                    type={'feather'}
                    color={'black'}
                    size={25}
                    containerStyle={{
                      paddingLeft: 10,
                      paddingRight: 10,
                    }}
                  />
                  <Text
                    style={styles.topTabText}
                  >
                    {'REGISTER'}
                  </Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                onPress={this._handleProfile}
              >
                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Icon
                    name={'account-outline'}
                    type={'material-community'}
                    color={'black'}
                    size={25}
                    containerStyle={{
                      paddingLeft: 10,
                      paddingRight: 10,
                    }}
                  />
                  <Text
                    style={[styles.topTabText, { color: 'black' }]}
                  >
                    {'UPDATE PROFILE'}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>


            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 25 }}>
              <View style={{ width: 2 * Dimensions.get('window').width / 6 }}>
                <Button
                  raised={true}
                  icon={{ 
                    name: 'user-plus', 
                    type: 'feather', 
                    color: 'white' }}
                  iconRight
                  backgroundColor={'green'}
                  color={'white'}
                  title={'Register'}
                  onPress={this._handleRegister}
                />
              </View>
              <View style={{ width: 2 * Dimensions.get('window').width / 6 }}>
                <Button
                  raised={true}
                  icon={{ 
                    name: 'account-outline', 
                    type: 'material-community', 
                    color: 'white' }}
                  iconRight
                  backgroundColor={'green'}
                  color={'white'}
                  title={'Update Profile'}
                  onPress={this._handleProfile}
                />
              </View>
            </View> */}

          </View>
        }
        {validStateId &&
          <View style={{ flexDirection: 'column', flex: 1 }}>
            {emptySearch &&
              <View style={{ padding: 15, backgroundColor: 'rgb(204, 223, 255)', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
                <Text>{'You currently have no drugs in your drug list.'}</Text>
                <Text>{'Please add at least one drug to start plan selection.'}</Text>
              </View>
            }
            {repeatSearch &&
              <View style={{ padding: 15, backgroundColor: 'rgb(204, 223, 255)', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
                <Text>{'No results for "' + lastSearch + '", please try your search again.'}</Text>
                <Text>{'Try entering fewer characters of the drug name you are looking for.'}</Text>
                <Text>{'The text you enter ' + (useWildcard ? 'can occur anywhere within' : 'will be at the start of') + ' the drug name.'}</Text>
              </View>
            }
            <Text style={{ fontSize: 16, color: 'black', textAlign: 'center', paddingTop: 10, paddingBottom: 10 }}>
              {'Searching drugs available in ' + userStateName}</Text>

            <SearchBar
              ref={search => this.mySearch = search}
              placeholder="Enter partial or complete drug name..."
              autoCorrect={false}
              placeholderTextColor='#616a72'
              lightTheme
              inputStyle={{ color: 'black' }}
              containerStyle={{ borderTopColor: '#636363', borderBottomColor: '#636363', }}
              clearIcon={{ name: 'clear', color: 'black' }}
              icon={{ color: '#616a72' }}
              value={searchString}
              onSubmitEditing={this._handleUserSearch}
              onChangeText={this._handleSearchTextChanged}
              returnKeyType={'search'}
              loadingicon={{ name: 'hourglass-empty', color: 'black' }}
              showLoading={entryComplete}
            />
          </View>
        }
      </View>)
  }

}

pDrugSearch.propTypes = {
  handleBaseDrugSearchComplete: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    searchTerm: state.searchTerm,
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
  handleBaseDrugSearchComplete: Dispatch.handleBaseDrugSearchComplete,
}

export default connect(mapStateToProps, mapDispatchToProps)(pDrugSearch);

const styles = StyleSheet.create({
  topTabText: {
    fontSize: 8,
    //fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingTop: 2,
  },
});