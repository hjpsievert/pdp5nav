import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Text,
  View,
  Dimensions,
  Platform,
  TouchableHighlight,
  Alert
} from 'react-native';
import { Icon } from 'react-native-elements';
import { readKeys, loadObject, removeKey } from '../../Utils/Storage';
import { saveDrugList } from '../../Utils/SaveData';
import { loadFromDB, loadFromDbById, deleteFromDBById } from '../../Utils/Api';
import size from 'lodash/size';
import flatMap from 'lodash/flatMap';
import orderBy from 'lodash/orderBy';
import * as Dispatch from '../../Redux/Dispatches';

export class dLoad extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      showOptions: false,
      showIndex: -1,
      showDbIndex: -1,
      isDB: false,
      // upStart: props.windowHeight,
      // upEnd: 0,
      upStart: -props.windowHeight,
      upEnd: 0,
      duration: 500,
      itemHeight: 0 // flag to determine whether to set value
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    this._handleLoadData();
  }

  componentWillUnmount() {
    console.log('dLoad did unmount');
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

  _handleLoadData = () => {
    const contentTypes = ['activePlanDrugs', 'savedPlanDrugs'];
    const { userEmail } = this.props.userProfile;
    readKeys(this._handleReadKeysResult, 'savedPlanDrugs');
    loadFromDB((response) => this._handleReadFromDB(response), userEmail, contentTypes);
  }

  _handleReadKeysResult = (response) => {
    this.setState({
      numSaved: size(response),
      savedList: response,
    })
  }

  _handleReadFromDB = (response) => {
    const { success, payLoad, code } = response;
    console.log('dmLoadScreen _handleReadFromDB success = ', success);
    if (success) {
      this.setState({
        numDb: code,
        dbList: orderBy(payLoad, ['deviceName'], ['asc']),
      })
    }
  }

  _confirmDeleteSaved = () => {
    const { showItem, isDB } = this.state;
    //console.log('Delete Saved');
    let shortTitle;
    if (isDB) {
      shortTitle = showItem.title;
    }
    else {
      shortTitle = (showItem.title + '@@@').split('@@@')[0];
    }
    Alert.alert(
      'Delete Saved Item ' + shortTitle,
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel', onPress: this.setState({ showOptions: false }), style: 'cancel'
        },
        { text: 'Delete', onPress: this._handleDeleteSaved(shortTitle) },
      ]
    );
  }

  _handleDeleteSaved = (shortTitle) => { // fix removeKey
    const { showItem, isDB } = this.state;
    const { title, Id } = showItem;
    console.log('dmLoadScreen handeDeleteSaved title = ' + shortTitle);
    if (isDB) {
      deleteFromDBById((response) => { this._handleDeleteResponse(response, isDB) }, Id);
    }
    else {
      removeKey((response) => {
        this._handleDeleteResponse(response, isDB);
      }, title);
    }
  }

  _handleDeleteResponse = (response, isDB) => {
    let result;
    if (isDB) {
      const { success } = response;
      result = success;
    }
    else {
      result = response.status;
    }
    console.log('dmLoadScreen _handleDeleteResponse ' + result);
    this.setState({ showOptions: false });
    this._handleLoadData();
  }

  _backupActiveDrugList = (inputTitle, inputDescription, myDrugs) => {
    const { userProfile } = this.props;
    saveDrugList(this._handleSaveActiveResponse, userProfile, inputTitle.trim(), inputDescription.trim(), 'System', myDrugs, 'backupActivePlanDrugs')
  }

  _handleSaveActiveResponse = (success) => {
    console.log('dmLoadScreen _backupActiveDrugList saveDrugList successful ' + success);
  }

  _loadSavedDrugList = () => { // fix loadObject
    const { showItem, isDB } = this.state;
    if (!isDB) {
      const shortTitle = (showItem.title + '@@@').split('@@@')[0];
      console.log('Load saved druglist from Device' + shortTitle);
      loadObject((response, mode) => { this._handleLoadActive(response, isDB, mode) }, shortTitle, 'savedPlanDrugs');
    }
    else {
      const { Id } = showItem;
      console.log('Load saved druglist ', Id, ' from DB');
      loadFromDbById((response) => { this._handleLoadActive(response, isDB) }, Id);
    }
  }

  _handleLoadActive = (response, isDB) => {
    const { myDrugs } = this.props;
    let drugList
    if (isDB) {
      const { payLoad } = response;
      drugList = JSON.parse(payLoad);
    }
    else {
      drugList = response.payload;
    }
    // console.log('dmLoadScreen _handleLoadActive success = ', response.success, ', isDB = ', isDB, ', mode = ' + mode, ', drugList = ', JSON.stringify(drugList));
    // console.log('dmLoadScreen _handleLoadActive active list = ', JSON.stringify(myDrugs));

    this._backupActiveDrugList('Active Druglist Backup', 'Saved on Load Active Druglist', myDrugs)
    this.props.handleLoadMyDrugs(drugList);

    //this._handleShowOptions(this.state.showItem, isDB);
    // this.props.updateFlowState({
    //   planListDirty: true,
    //   activeListDirty: true,
    // });
    this.setState({ showOptions: false });
    this._handleLoadData();
  }

  _getItemLayout = (data, index) => (
    { length: this.props.windowWidth, offset: this.props.windowWidth * index, index }
  )

  _handleShowOptions = (item, isDB = false) => {
    // if (this.state.showIndex !== index && this.state.showOptions) {
    //   this.swiper.scrollToIndex({ animated: false, index: index-1 });
    // }
    this.setState({
      showOptions: !this.state.showOptions,
      showIndex: isDB ? -1 : (this.state.showIndex === item.index ? -1 : item.index),
      showDbIndex: isDB ? (this.state.showDbIndex === item.index ? -1 : item.index) : -1,
      showItem: item,
      isDB: isDB,
    });
  }

  _handleExit = () => {
    this.props.navigation.navigate('dmMain');
  }

  _renderItem = (showItem, shortTitle, items, timeStamp, comment, category, bcColor, bcColor2, isDB = false, deviceName = '', contentDescription = '') => {
    return (
      <TouchableHighlight
        onPress={() => this._handleShowOptions(showItem, isDB)}
      >
        <View
          style={{ borderBottomColor: '#bbb', borderBottomWidth: 1, flexDirection: 'column' }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: bcColor2, paddingRight: 5 }}>
            <Text style={{ fontSize: 14, paddingLeft: 15, paddingTop: 5, paddingBottom: 3 }}>
              {(isDB ? (deviceName + ': ' + contentDescription) : shortTitle) + ', ' + items + ' drug' + (items > 1 ? 's' : '')}
            </Text>
            <Icon
              name='dots-vertical'
              type={'material-community'}
              color={'#666'}
              size={20}
            // reverseColor={'white'}
            />
          </View>
          <Text style={{ fontSize: 12, paddingLeft: 35, color: '#777', backgroundColor: bcColor }}>
            {(category ? ('Cat: ' + category + ', s') : 'S') + 'aved: ' + timeStamp}
          </Text>
          <Text style={{ fontSize: 12, paddingLeft: 35, color: '#777', paddingBottom: 5, backgroundColor: bcColor }}>
            {'Comment: ' + comment}
          </Text>
        </View >
      </TouchableHighlight>
    );
  }

  _renderSelectedItem = () => {
    const { showItem } = this.state;
    const { title, items, timeStamp, comment, category } = showItem;
    const shortTitle = (title + '@@@').split('@@@')[0];
    return this._renderItem(showItem, shortTitle, items, timeStamp, comment, category, 'rgb(204, 223, 255)', 'rgb(183, 211, 255)');
  }

  _renderSelectedDbItem = () => {
    const { showItem } = this.state;
    const { title, dateStamp, description, category, payload, deviceName, contentDescription } = showItem;
    const currDate = new Date(dateStamp);
    const newDate = (currDate.getMonth() + 1) + '/' + (currDate.getDate()) + '/' + currDate.getFullYear() + ' ' + (currDate.getHours()) + ':' + (currDate.getMinutes() + 1)
    const items = JSON.parse(payload).length ? JSON.parse(payload).length : 1;
    return this._renderItem(showItem, title, items, newDate, description, category, 'rgb(204, 223, 255)', 'rgb(183, 211, 255)', true, deviceName, contentDescription);
  }

  _renderSavedItem = ({ item }) => {
    const { title, items, timeStamp, comment, category } = item;
    const shortTitle = (title + '@@@').split('@@@')[0];
    return this._renderItem(item, shortTitle, items, timeStamp, comment, category, 'rgb(204, 223, 255)', 'rgb(183, 211, 255)');
  }

  _renderSavedDbItem = ({ item }) => {
    const { title, dateStamp, description, category, payload, deviceName, contentDescription } = item;
    const currDate = new Date(dateStamp);
    const newDate = (currDate.getMonth() + 1) + '/' + (currDate.getDate()) + '/' + currDate.getFullYear() + ' ' + (currDate.getHours()) + ':' + (currDate.getMinutes() + 1)
    const items = JSON.parse(payload).length ? JSON.parse(payload).length : 1;
    return this._renderItem(item, title, items, newDate, description, category, 'rgb(204, 223, 255)', 'rgb(183, 211, 255)', true, deviceName, contentDescription);
  }

  render() {

    let listOptions = [];
    let i = 0;
    listOptions.push({ key: i++, title: 'Load', subtitle: 'Load this saved item into the active list', icon: 'upload', type: 'font-awesome', onPress: this._loadSavedDrugList });
    listOptions.push({ key: i++, title: 'Delete', subtitle: 'Delete this saved item', icon: 'delete', type: 'material', onPress: this._confirmDeleteSaved });
    listOptions.push({ key: i++, title: 'Edit', subtitle: 'Edit title or comment for this saved item', icon: 'edit', type: 'material', onPress: this._handleEmpty });
    // listOptions.push({ key: i++, title: 'Close', subtitle: '', icon: 'ios-exit-outline', type: 'ionicon', onPress: this._handleShowOptions });
    listOptions.push({ key: i++, title: 'Close', subtitle: '', icon: 'exit-to-app', type: 'material', onPress: this._handleShowOptions });

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{'Load Data'}</Text>
      </View>)
  }

}


dLoad.propTypes = {
  handleLoadMyDrugs: PropTypes.func.isRequired,
  myDrugs: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    myDrugs: flatMap(state.myDrugs, (d) => d),
    userProfile: state.profile,
  }
}

const mapDispatchToProps = {
  updateFlowState: Dispatch.updateFlowState,
  handleLoadMyDrugs: Dispatch.handleLoadMyDrugs,
}

export default connect(mapStateToProps, mapDispatchToProps)(dLoad);
