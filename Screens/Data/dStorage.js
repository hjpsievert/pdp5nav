import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Dimensions,
  Platform,
  Alert,
  FlatList,
  SectionList
} from 'react-native';
import Constants from 'expo-constants';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Dispatch from '../../Redux/Dispatches';
import { Icon, ListItem } from 'react-native-elements';
import SlideInView from '../../Components/SlideInView';
import AlertBox from '../../Components/AlertBox';
import { readKeys, loadObject, removeKey } from '../../Utils/Storage';
import { saveDrugList } from '../../Utils/SaveData';
import { loadFromDB, loadFromDbById, deleteFromDBById, refreshDrugs } from '../../Utils/Api';
import size from 'lodash/size';
import flatMap from 'lodash/flatMap';
import orderBy from 'lodash/orderBy';
import lowerCase from 'lodash/lowerCase';
import upperFirst from 'lodash/upperFirst';
import sortBy from 'lodash/sortBy';


export class dStorage extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      flag: Dimensions.get('window').width * 1000 + Dimensions.get('window').height,
      adjust: Dimensions.get('window').width > Dimensions.get('window').height && Platform.OS !== 'web',
      showOptions: false,
      showIndex: -1,
      upStart: -Dimensions.get('window').height,
      upEnd: 0,
      duration: 500,
      selectedIndex: -1,
      doSections: false,
      headerSelected: Constants.deviceName,
      showSection: true,
      storageMode: 'undefined',
      askDelete: false,
      askShowDelete: false
    }
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this._handleDimChange);
    this.setState({
      storageMode: this.props.route.params.storageMode ?? 'undefined'
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const { storageMode } = prevState;
    console.log('dStorage componentDidUpdate prevStorage = ', storageMode, ', currentStorage = ', this.state.storageMode)
    if (this.state.storageMode === storageMode && this.state.storageMode != 'undefined') {
      return;
    }
    if (this.state.storageMode != 'undefined') {
      this._handleLoadData();
    }
    else {
      this.setState({
        storageMode: this.props.route.params.storageMode ?? 'undefined'
      })
    }
    console.log('dStorage didUpdate');
  }

  componentWillUnmount() {
    console.log('dStorage will unmount');
    Dimensions.removeEventListener('change', this._handleDimChange);
  }

  _handleDimChange = ({ window }) => {
    let flag = window.width * 1000 + window.height;
    let adjust = window.width > window.height && Platform.OS !== 'web';
    // console.log('dStorage _handleDimChange event, new flag  = ', flag);
    this.setState({
      flag: flag,
      adjust: adjust
    })
  }

  _handleLoadData = () => {
    const contentTypes = ['activePlanDrugs', 'savedPlanDrugs', 'backupActivePlanDrugs', 'appError'];
    // const contentTypes = ['activePlanDrugs', 'savedPlanDrugs', 'backupActivePlanDrugs', 'appError'];
    const { userEmail, userIsSubscribed } = this.props.userProfile;
    const { doSections, storageMode } = this.state;
    if (storageMode === 'device') {
      readKeys((response) => this._handleReadData(response, storageMode), contentTypes);
    }
    if (storageMode === 'cloud') {
      this.setState({
        doSections: true
      })
      loadFromDB((response) => this._handleReadData(response, storageMode), userEmail, contentTypes, null, null, true);
    }
  }

  _handleReadData = (response, storageMode) => {
    const { success, code, err } = response;
    let payLoad;
    if (storageMode === 'cloud') {
      payLoad = response.payLoad;
    }
    else {
      payLoad = response.payload;
    }
    console.log('dmStorageScreen _handleReadData success = ', success, ', payload count = ', size(payLoad));
    const { doSections } = this.state;
    if (success) {
      const dataList = orderBy(payLoad, ['contentType'], ['asc']);
      this.setState({
        dataList: dataList,
        dataFiltered: (storageMode === 'device' ? dataList.filter((db) => db.deviceName === Constants.deviceName) : (doSections ? dataList : dataList.filter((db) => db.title === Constants.deviceName)))
      })
    }
  }

  _handleDeleteCallback = (response) => {
    this.setState({
      askDelete: false
    })
    if (response) {
      this._handleDeleteSaved()
    }
  }

  _handleShowDeleteCallback = (response) => {
    this.setState({
      askShowDelete: false,
      showOptions: false
    })
    if (response) {
      this._handleDeleteSaved()
    }
  }

  _confirmDeleteItem = (currItem) => {
    this.setState({
      deleteItem: currItem,
      askDelete: true
    });
  }

  _confirmShowDeleteItem = () => {
    const { showItem } = this.state;
    this.setState({
      deleteItem: showItem,
      askShowDelete: true
    });
  }

  _handleDeleteSaved = () => { // fix removeKey
    const { storageMode, deleteItem } = this.state;
    const { storageIndex, contentType, id, title } = deleteItem;
    console.log('dmStorageScreen handeDeleteSaved title = ' + title);
    if (storageMode === 'cloud') {
      const isDB = true;
      deleteFromDBById((response) => { this._handleDeleteResponse(response, isDB) }, id);
    }
    else {
      const isDB = false;
      removeKey((response) => {
        this._handleDeleteResponse(response, isDB);
      }, storageIndex + '@@@' + contentType);
    }
  }

  _handleDeleteResponse = (response, isDB) => {
    let result;
    if (isDB) {
      const { success, payLoad, code, err } = response;
      result = success;
    }
    else {
      result = response.status;
    }
    console.log('dmStorageScreen _handleDeleteResponse ' + result);
    this.setState({ showOptions: false });
    this._handleLoadData();
  }

  _loadSavedDrugList = () => { // fix loadObject
    const { showItem } = this.state;
    const { storageMode } = this.state;
    if (storageMode === 'device') {
      const { storageIndex, title } = showItem;
      console.log('Load saved druglist from Device' + title);
      const isDB = false;
      loadObject((response, mode) => { this._handleLoadActive(response, isDB, mode) }, storageIndex, 'savedPlanDrugs');
    }
    else {
      const { id } = showItem;
      const isDB = true;
      console.log('Load saved druglist ', id, ' from DB');
      loadFromDbById((response) => { this._handleLoadActive(response, isDB) }, id);
    }
  }

  _handleLoadActive = (response, isDB) => {
    const { myDrugs, userProfile } = this.props;
    let drugList
    if (isDB) {
      const { success, payLoad, code, err } = response;
      // console.log('_handleLoadActive payload = ', payLoad);

      drugList = JSON.parse(payLoad.payload);
    }
    else {
      drugList = response.payload;
    }
    saveDrugList((response) => { this._handleBackupActiveList(response, drugList) }, userProfile, 'Active Druglist Backup', 'Saved on Load Active Druglist', 'System', myDrugs, 'backupActivePlanDrugs')
  }

  _handleBackupActiveList = (success, drugList) => {
    console.log('dmStorageScreen _handleBackupActiveList saveDrugList success ' + success);
    if (success) {
      const { userProfile } = this.props;
      refreshDrugs((response) => {
        this._handleRefresh(response, flatMap(drugList, (d) => d));
      }, flatMap(drugList, (d) => d.drugId), userProfile.userStateId);
    }
  }

  _handleRefresh = (response, drugListOld) => {
    const { success, payLoad, code, err } = response;
    const drugListNew = payLoad;
    const { userProfile, handleLoadMyDrugs } = this.props;
    // console.log('dmStorageScreen _handleRefresh drugListOld = ', flatMap(drugListOld, (d) => d.drugId + ', ' + d.planDetail.avePrice90 * 30), ', druglistNew = ', flatMap(drugListNew, (d) => d.drugId + ', ' + d.planDetail.avePrice90 * 30));

    let drugList = [];
    const oldSorted = sortBy(drugListOld, 'drugId');
    const newSorted = sortBy(drugListNew, 'drugId')
    // console.log('dmStorageScreen oldSorted ', JSON.stringify(flatMap(oldSorted, (d) => d.drugId)), ', newSorted ', JSON.stringify(flatMap(newSorted, (d) => d.drugId)));
    let i;
    for (i = 0; i < oldSorted.length; i++) {
      if (newSorted[i].ndc === 'discontinued') {
        drugList.push({ ...oldSorted[i], ndc: 'discontinued', isSelected: false }); // oldSorted retains configDetails, drugDetail and planDetail are overwritten from newSorted
      }
      else {
        drugList.push({ ...oldSorted[i], ...newSorted[i], isSelected: false }); // oldSorted retains configDetails, drugDetail and planDetail are overwritten from newSorted
      }
    }

    handleLoadMyDrugs(drugList);

    saveDrugList((response) => { this._handleSaveNewActiveList(response) }, userProfile, 'Active List', 'Saved on every change', 'System', drugList, 'activePlanDrugs')
  }

  _handleSaveNewActiveList = (success) => {
    console.log('dmStorageScreen _handleSaveNewActiveList saveDrugList successful ' + success);
    const { navigation } = this.props;
    this.setState({ showOptions: false });

    if (Platform.OS === 'web') {
      alert('Load Drugs into Active List\n\nActive List updated successfully')
    } else {

      Alert.alert(
        'Load Drugs into Active List',
        'Active List updated successfully',
        [
          { text: 'OK', onPress: () => navigation.navigate('fpDrugScreen') },
        ]
      );
    }
  }

  _handleShowOptions = (item) => {
    // if (this.state.showIndex !== index && this.state.showOptions) {
    //   this.swiper.scrollToIndex({ animated: false, index: index-1 });
    // }
    this.setState({
      showOptions: !this.state.showOptions,
      showIndex: this.state.showIndex === item.index ? -1 : item.index,
      showItem: item,
    });
  }

  _handleItemClick = (index) => {
    // console.log('dmStorageScreen _handleItemClick item: ', index);
    this.setState({
      selectedIndex: this.state.selectedIndex === index ? -1 : index,
    });
  }

  _handleHeaderItemClick = (title) => {
    const { showSection, headerSelected } = this.state;
    this.setState({
      headerSelected: showSection && title === headerSelected ? '' : title,
      showSection: showSection && title === headerSelected ? !showSection : true,
    })
  }

  _handleToggleSections = () => {
    const { storageMode } = this.state;
    if (storageMode === 'device') {
      return;
    }
    const { doSections, dataList } = this.state;
    this.setState({
      doSections: !doSections,
      dataFiltered: (!doSections ? dataList : dataList.filter((db) => db.title === Constants.deviceName))
    })
  }

  _renderHeader = (title, count) => {
    const { doSections, headerSelected } = this.state;
    // console.log('_renderHeader doSections = ', doSections, ', headerSelected = ', headerSelected);
    if (!doSections) {
      return null;
    }
    return (
      <TouchableHighlight
        onPress={() => this._handleHeaderItemClick(title)}
      >
        <View style={{ flexDirection: 'row', alignContent: 'center', backgroundColor: '#ddd', borderBottomColor: '#bbb', borderBottomWidth: 1, paddingTop: 5, paddingBottom: 5 }}>
          <Icon
            name={headerSelected === title ? 'triangle-down' : 'triangle-right'}
            type={'entypo'}
            color={'black'}
            size={16}
            containerStyle={{
              paddingLeft: 25,
              paddingRight: 5,
              backgroundColor: '#ddd',
            }}
          />
          <Text style={{ fontSize: 14, color: 'black', textAlign: 'left', backgroundColor: '#ddd' }}>
            {'Device: ' + title + ' (' + count + ')'}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }

  _renderSubItem = (item, index, contentType) => {
    const { doSections } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: 'rgb(204, 223, 255)', borderBottomColor: '#bbb', borderBottomWidth: 1 }}>
        <Text style={{ paddingLeft: doSections ? 40 : 30, fontSize: 12, paddingTop: 5, paddingBottom: 5 }}>
          {contentType === 'activePlanDrugs' || contentType === 'savedPlanDrugs' || contentType === 'backupActivePlanDrugs' ? ((item.drugDetail.isBrand ? item.drugDetail.brandName + ' (' + item.drugDetail.baseName + ')' : item.drugDetail.baseName) + ', ' + item.drugDetail.rxStrength + ' ' + item.drugDetail.units + ' ' + lowerCase(item.drugDetail.dosage || item.drugDetail.fullRoute)) : (contentType === 'appError' ? ('Error occurred on ' + item.dateStamp + ' in component ' + item.component + ' after action ' + item.action) : (item.baseName + ' ' + item.rxStrength))}
        </Text>
      </View>
    );
  }

  _renderDb = (myTitle, currItem, index) => {
    const { selectedIndex, headerSelected, showSection, doSections } = this.state;
    const { contentInfo } = this.props;
    // console.log('dmStorageScreen renderDb showSection = ', showSection, ', headerSelected = ', headerSelected, ', myTitle = ', myTitle, ', contentType = ', contentInfo);
    if (doSections) {
      if (!showSection || myTitle != headerSelected) {
        // console.log('dmStorageScreen renderDb exit');
        return null
      }
    }
    const { dateStamp, description, category, payload, contentType, storageIndex, deviceName } = currItem;
    // if (contentType === 'userProfile') {
    const titleText = contentInfo[contentType];
    const currDate = new Date(dateStamp);
    const newDate = (currDate.getMonth() + 1) + '/' + (currDate.getDate()) + '/' + currDate.getFullYear() + ' ' + (currDate.getHours()) + ':' + (currDate.getMinutes() + 1)
    //} 
    const subTitleText1 = category;
    const subTitleText1a = description;
    const items = JSON.parse(payload).length ? JSON.parse(payload).length : 1;
    const subTitleText1b = newDate + ', ' + items + ' item' + (items > 1 ? 's' : '');
    const subTitleText1c = 'Type: ' + titleText;

    return (

      <View style={{ borderBottomColor: '#bbb', borderBottomWidth: 1, flex: 1 }}>

        <TouchableHighlight
          onPress={() => this._handleItemClick(index)}
        >
          <View style={{ flexDirection: 'row', alignContent: 'center', backgroundColor: 'rgb(183, 211, 255)', paddingTop: 3, paddingBottom: 3 }}>
            <Icon
              name={selectedIndex === index ? 'triangle-down' : 'triangle-right'}
              type={'entypo'}
              color={'black'}
              size={16}
              containerStyle={{
                paddingLeft: doSections ? 35 : 25,
                paddingRight: 5,
                backgroundColor: 'rgb(183, 211, 255)',
              }}
            />
            <Text style={{ fontSize: 14, backgroundColor: 'rgb(183, 211, 255)', textAlign: 'left', flex: 1 }}>
              {titleText}
            </Text>
            {(contentType != 'activePlanDrugs' && contentType != 'findPlanDrugs') &&
              <Icon
                name={'trash'}
                type={'evilicon'}
                color={'black'}
                size={16}
                containerStyle={{
                  paddingLeft: 10,
                  paddingRight: 10,
                  backgroundColor: 'rgb(183, 211, 255)',
                }}
                onPress={() => this._confirmDeleteItem(currItem)}
              />
            }
            {(contentType != 'activePlanDrugs' && contentType != 'findPlanDrugs') &&
              <Icon
                name='dots-vertical'
                type={'material-community'}
                color={'#666'}
                size={16}
                containerStyle={{
                  paddingLeft: 10,
                  paddingRight: 10,
                  backgroundColor: 'rgb(183, 211, 255)',
                }}
                onPress={() => this._handleShowOptions(currItem)}
              />
            }
          </View>
        </TouchableHighlight>

        <View>
          <View style={{ flexDirection: 'row', paddingLeft: doSections ? 35 : 25, backgroundColor: 'rgb(204, 223, 255)', alignItems: 'center', paddingBottom: 5 }}>
            <View style={{ flexDirection: 'column', paddingLeft: 5 }}>
              <Text style={{ fontSize: 12, paddingRight: 5, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                {subTitleText1}
              </Text>
              <Text style={{ fontSize: 12, paddingRight: 5, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                {subTitleText1a}
              </Text>
              <Text style={{ fontSize: 12, paddingRight: 5, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                {subTitleText1b}
              </Text>
              <Text style={{ fontSize: 12, paddingRight: 5, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
                {subTitleText1c}
              </Text>
            </View>
          </View>
        </View>
        {selectedIndex === index &&
          <FlatList
            data={contentType === 'userProfile' || contentType === 'appError' ? [JSON.parse(payload)] : JSON.parse(payload)}
            renderItem={({ item, index }) => this._renderSubItem(item, index, contentType)}
            // keyExtractor={(item) => contentType === 'userProfile' ? item.userEmail : item.drugId.toString()}
            keyExtractor={(item) => contentType === 'userProfile' ? item.userEmail : (contentType === 'appError' ? item.code.toString() : item.drugId.toString())}
            horizontal={false}
          />
        }
      </View>

    );
  }

  _renderSelectedItem = () => {
    const { showItem } = this.state;
    const { contentInfo } = this.props;
    const { dateStamp, description, category, contentType, payload } = showItem;
    const titleText = contentInfo[contentType];
    const bcColor2 = 'rgb(183, 211, 255)';
    const subTitleText1 = category;
    const subTitleText1a = description;
    const currDate = new Date(dateStamp);
    const newDate = (currDate.getMonth() + 1) + '/' + (currDate.getDate()) + '/' + currDate.getFullYear() + ' ' + (currDate.getHours()) + ':' + (currDate.getMinutes() + 1)
    const items = JSON.parse(payload).length ? JSON.parse(payload).length : 1;
    const subTitleText1b = newDate + ', ' + items + ' item' + (items > 1 ? 's' : '');
    const subTitleText1c = 'Type: ' + titleText;

    return (
      <TouchableHighlight
        onPress={() => this._handleShowOptions(showItem)}
      >
        <View
          style={{ borderBottomColor: '#bbb', borderBottomWidth: 1, flexDirection: 'column' }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: bcColor2, paddingRight: 5 }}>
            <Text style={{ fontSize: 14, paddingLeft: 15, paddingTop: 5, paddingBottom: 3 }}>
              {'Option menu for: ' + titleText}
            </Text>
            {/* <Icon
              name='dots-vertical'
              type={'material-community'}
              color={'#666'}
              size={20}
            // reverseColor={'white'}
            /> */}
          </View>
          <Text style={{ fontSize: 12, paddingLeft: 15, paddingRight: 5, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
            {subTitleText1}
          </Text>
          <Text style={{ fontSize: 12, paddingLeft: 15, paddingRight: 5, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
            {subTitleText1a}
          </Text>
          <Text style={{ fontSize: 12, paddingLeft: 15, paddingRight: 5, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
            {subTitleText1b}
          </Text>
          <Text style={{ fontSize: 12, paddingLeft: 15, paddingRight: 5, color: '#777', backgroundColor: 'rgb(204, 223, 255)' }}>
            {subTitleText1c}
          </Text>
        </View >
      </TouchableHighlight>
    );
  }

  render() {
    const { adjust, flag, askDelete, askShowDelete, savedList, dataFiltered, dataList, selectedIndex, doSections, showOptions, upStart, upEnd, duration, headerSelected, showSection, storageMode, deleteItem } = this.state;
    if (storageMode === 'undefined') {
      return null;
    }
    if (!dataFiltered) { // && !savedList) {
      console.log('dStorage render exit');
      return null;
    }
    console.log('dStorage render, doSections = ', doSections, ', showSection = ', showSection, ', headerSelected = ', headerSelected); //, ', dataFiltered = ', dataFiltered); //, ', dataFiltered = ', flatMap(dataFiltered, (pl) => pl.deviceName)); 

    let listOptions = [];
    let i = 0;
    listOptions.push({ key: i++, title: 'Load', subtitle: 'Load this saved item into the active list', icon: 'upload', type: 'font-awesome', onPress: this._loadSavedDrugList });
    listOptions.push({ key: i++, title: 'Delete', subtitle: 'Delete this saved item', icon: 'delete', type: 'material', onPress: this._confirmShowDeleteItem });
    listOptions.push({ key: i++, title: 'Edit', subtitle: 'Edit title or comment for this saved item', icon: 'edit', type: 'material', onPress: this._handleEmpty });
    listOptions.push({ key: i++, title: 'Close', subtitle: '', icon: 'exit-to-app', type: 'material', onPress: this._handleShowOptions });
    let alertMessage;
    if (askDelete || askShowDelete) {
      alertMessage = 'Are you sure you want to delete  \'' + deleteItem.title + '\'?';
    }
    return (
      <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35) }} >

        {askDelete &&
          <AlertBox
            alertTitle={'Delete Storage Item'}
            alertMessage={alertMessage}
            executeLabel={'DELETE'}
            cancelLabel={'CANCEL'}
            callbackFunction={this._handleDeleteCallback}
          />
        }

        {!askDelete &&
          <TouchableHighlight
            onPress={storageMode === 'device' ? null : this._handleToggleSections}
          >
            <View style={{ flexDirection: 'row', alignContent: 'center', backgroundColor: '#bbb' }}>
              <Icon
                name={storageMode === 'device' ? null : (doSections ? 'triangle-down' : 'triangle-right')}
                type={'entypo'}
                color={'black'}
                size={20}
                containerStyle={{
                  paddingLeft: 15,
                  paddingRight: 5,
                  backgroundColor: '#bbb',
                  paddingTop: 10,
                  paddingBottom: 10,
                }}
              />
              <Text style={{ fontSize: 16, color: 'black', textAlign: 'left', paddingTop: 10, paddingBottom: 10, backgroundColor: '#bbb' }}>
                {'Data from ' + upperFirst(storageMode) + (doSections ? '' : (storageMode === 'cloud' ? ' for' : '') + ': ' + Constants.deviceName)}
              </Text>
            </View>
          </TouchableHighlight>
        }
        {storageMode === 'cloud' && !askDelete &&
          <SectionList
            sections={dataFiltered}
            extraData={flag, selectedIndex}
            renderItem={({ section: { title }, item, index }) => this._renderDb(title, item, index)}
            renderSectionHeader={({ section: { title, count } }) => this._renderHeader(title, count)}
            keyExtractor={(item) => (item.id).toString()}
          />
        }
        {storageMode === 'device' && !askDelete &&
          <FlatList
            data={dataFiltered}
            extraData={flag, selectedIndex}
            renderItem={({ item, index }) => this._renderDb(null, item, index)}
            keyExtractor={(item) => (item.storageIndex).toString()}
          />
        }

        {showOptions &&
          <SlideInView
            sideStart={0}
            sideEnd={0}
            upStart={upStart}
            upEnd={upEnd}
            duration={duration}
            slideTop={false}
          >
            <View style={{ height: Dimensions.get('window').height - 75 - (adjust ? 0 : 35), width: Dimensions.get('window').width, backgroundColor: 'rgb(255,255,255)' }}>
              <View style={{ borderColor: '#999', borderWidth: 1 }}>
                {this._renderSelectedItem()}
              </View>
              {askShowDelete &&
                <AlertBox
                  alertTitle={'Delete Storage Item'}
                  alertMessage={alertMessage}
                  executeLabel={'DELETE'}
                  cancelLabel={'CANCEL'}
                  callbackFunction={this._handleShowDeleteCallback}
                />
              }
              {
                listOptions.map((l, i) => (
                  <ListItem
                    leftIcon={{
                      name: l.icon,
                      type: l.type,
                      color: 'black'
                    }}
                    key={i}
                    title={l.title}
                    titleStyle={{ fontSize: 14 }}
                    subtitle={l.subtitle.length ? l.subtitle : null}
                    subtitleNumberOfLines={2}
                    subtitleStyle={{ fontSize: 12 }}
                    onPress={l.onPress}
                  />
                ))
              }
            </View>
          </SlideInView>
        }

      </View>)
  }
}

dStorage.propTypes = {
  contentInfo: PropTypes.object.isRequired,
  handleLoadMyDrugs: PropTypes.func.isRequired,
  myDrugs: PropTypes.array.isRequired,
  navigation: PropTypes.object,
  userProfile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    myDrugs: flatMap(state.myDrugs, (d) => d),
    userProfile: state.profile,
    contentInfo: state.content,
  }
}

const mapDispatchToProps = {
  handleLoadMyDrugs: Dispatch.handleLoadMyDrugs,
}

export default connect(mapStateToProps, mapDispatchToProps)(dStorage);
