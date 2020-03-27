import React from 'react'
import {
  Text,
  View,
  TouchableHighlight,
  Dimensions,
  Keyboard,
  Platform
} from 'react-native';
import { Icon, SearchBar } from 'react-native-elements';
import { searchBaseDrugs } from '../../Utils/Api';
import { myStyles } from '../../Utils/Styles';
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
    console.log('pDrugSearch did mount');
  }

  componentDidUpdate() {
    console.log('pDrugSearch did update');
    const { entryComplete } = this.state;
    if (entryComplete)
      this.setState({
        entryComplete: false,
      })
  }

  componentWillUnmount() {
    console.log('pDrugSearch did unmount');
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
        this._onBaseDrugSearchComplete(response);
      }, searchString, stateId, this.state.useWildcard);
    }
  }

  _onBaseDrugSearchComplete = (response) => {
    const { payLoad, code } = response;
    console.log('pDrugSearch _onBaseDrugSearchComplete resultList = ', payLoad, ', code = ', code);
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
      console.log('_onBaseDrugSearchComplete code = ', code);
      code === 1 ? navigation.navigate('pDrugSelect', { params: { doPick: false } }) : navigation.navigate('pDrugPick', { params: { doPick: true } })
    }
  }

  render() {
    console.log('pDrugSearch render');
    const { adjust, emptySearch, validStateId, repeatSearch, lastSearch, entryComplete, useWildcard, searchString } = this.state;
    const { userProfile, navigation } = this.props;
    const { userStateName } = userProfile;
    console.log('pDrugSearch render entryComplete ', entryComplete);
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >
        {!validStateId &&
          <View>
            <View style={{ padding: 15, backgroundColor: 'rgb(204, 223, 255)', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
              <Text>{'You currently have no state of residence identified in your profile.'}</Text>
              <Text>{'In order to be able to search for drugs, you either need to Register your state or you can set your state in the Profile setting under the Account menu.'}</Text>
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
                underlayColor={'#ccc'}
                onPress={() => navigation.navigate('Account', { screen: 'aRegState' })}
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
                    style={myStyles.topTabText}
                  >
                    {'REGISTER'}
                  </Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor={'#ccc'}
                onPress={() => navigation.navigate('Account', { screen: 'aProfile' })}
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
                    style={[myStyles.topTabText, { color: 'black' }]}
                  >
                    {'UPDATE PROFILE'}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>

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
            {Platform.OS === 'web' &&
              <Text style={{ paddingTop: 10, paddingLeft: 20, fontSize: 16 }}>
                {'Hit \'Enter\' to search'}
              </Text>
            }
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