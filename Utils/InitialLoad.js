import { loadObject } from './Storage';
import { loadDBProfile, loadFromDB, refreshDrugs } from './Api';
import Constants from 'expo-constants';
import { defaultProfile, defaultProfileSave } from './Constants';
import { saveUserProfile, saveDrugList } from './SaveData';
import { store } from '../App';
import { updateProfile } from '../Redux/Actions'
import size from 'lodash/size';
import flatMap from 'lodash/flatMap';
import sortBy from 'lodash/sortBy';

export const loadAllData = function (callBack) {
  const { installationId } = Constants;
  loadDBProfile((response) => {
    _handleLoadProfileDB(callBack, response);
  }, null, installationId);
}

const _handleLoadProfileDB = (callBack, response) => {
  // if we get a profile back (success true), we will save it to redux state and then update local storage
  const { success, payLoad } = response;
  if (success) {
    const dbProfile = payLoad;
    console.log('InitialLoad _handleLoadProfileDB success, dbProfile = ', JSON.stringify(dbProfile));
    const doSave = { ...defaultProfileSave };
    doSave.cloud = false; // no need to save, we just loaded from cloud
    saveUserProfile((userProfile) => { _handleSaveProfileToStorage(callBack, userProfile) }, dbProfile, doSave, 'InitialLoad');
  }
  else {
    console.log('InitialLoad _handleLoadProfileDB failed, exit with empty drug list and default profile');
    const finalDrugs = {};
    store.dispatch(updateProfile(defaultProfile));
    console.log('InitialLoad _handleLoadProfileDB saved default profile locally');
    callBack(defaultProfile, finalDrugs);
  }
}

const _handleSaveProfileToStorage = (callBack, userProfile) => {
  // console.log('InitialLoad _handleSaveProfileToStorage started'); //,  profile ', JSON.stringify(userProfile));

  const { userEmail, userStateId, userIsSubscribed } = userProfile;
  const activeListIndex = 0;
  if (!!userEmail && !!userStateId) {
    console.log('InitialLoad _handleSaveProfileToStorage user is subscribed: ', userIsSubscribed, ', load respective drug list from local storage');
    loadObject((response) => { _handleLoadActiveStorage(response, callBack, userStateId, userEmail, userProfile) }, activeListIndex, !userIsSubscribed ? 'activePlanDrugs' : 'activeFindDrugs')
  }
  else {
    // there is no drug list, return profile and empty drug list in the callBack
    console.log('InitialLoad _handleSaveProfileToStorage user not registered, exit with empty drug list and loaded profile');
    const finalDrugs = {};
    callBack(userProfile, finalDrugs);
  }
}

const _handleLoadActiveStorage = (response, callBack, userStateId, userEmail, mergedProfile) => {
  console.log('InitialLoad _handleLoadActiveStorage success ', response.success, ', size = ', size(response.payload));
  const { userIsSubscribed } = mergedProfile;
  if (response.success && size(response.payload) > 0) {
    const drugList = response.payload;
    if (userIsSubscribed) {
      console.log('InitialLoad user is subscribed, exit with profile and loaded drug list');
      callBack(mergedProfile, flatMap(drugList, (d) => d));
    }
    else {
      console.log('_handleLoadActiveStorage refresh findPlan drug list to pick up any data changes since last startup');
      refreshDrugs((response) => { // refresh drug list to pick up any data changes since last startup
        _handleRefresh(response, callBack, flatMap(drugList, (d) => d), userEmail, mergedProfile);
      }, flatMap(drugList, (d) => d.drugId), userStateId);
    }
  }
  else {
    // console.log('InitialLoad _handleLoadActiveStorage load from DB');
    if (userIsSubscribed) { // if drugFind no DB storage of active list, exit with empty drug list
      console.log('InitialLoad _handleLoadActiveStorage user is subscribed, but no drugs, exit with profile and empty drug list');
      const finalDrugs = {};
      callBack(mergedProfile, finalDrugs);
    }
    else {
      // try to load druglist from database
      console.log('InitialLoad _handleLoadActiveStorage no active findPlan drugs, try to load from DB');
      loadFromDB((response) => {
        _handleLoadActiveDB(response, callBack, userStateId, userEmail, mergedProfile);
      }, userEmail, ['activePlanDrugs'], [Constants.installationId]);
    }
  }
}

const _handleLoadActiveDB = (response, callBack, userStateId, userEmail, mergedProfile) => {
  const { success, payLoad, code } = response;
  if (success) {
    // console.log('InitialLoad _handleLoadActiveDB, response items ' + code);
    const drugList = JSON.parse(payLoad[0].payload); // pick first response in case multiple instances are returned
    console.log('_handleLoadActiveDB successful, refresh findPlan drug list to pick up any data changes since last startup');
    refreshDrugs((response) => {
      _handleRefresh(response, callBack, flatMap(drugList, (d) => d), userEmail, mergedProfile);
    }, flatMap(drugList, (d) => d.drugId), userStateId);
  }
  else {
    console.log('InitialLoad _handleLoadActiveDB, no data, exit with empty drug list and user profile');
    const finalDrugs = {};
    callBack(mergedProfile, finalDrugs);
  }
}

const _handleRefresh = (response, callBack, drugListOld, userEmail, mergedProfile) => {
  const { success, payLoad } = response;
  let drugList = [];
  if (success) {
    const drugListNew = payLoad;
    // console.log('InitialLoad _handleRefresh drugListOld = ', flatMap(drugListOld, (d) => d.drugId + ', ' + d.planDetail.avePrice90*30), ', druglistNew = ', flatMap(drugListNew, (d) => d.drugId + ', ' + d.planDetail.avePrice90*30));
    const oldSorted = sortBy(drugListOld, 'drugId');
    const newSorted = sortBy(drugListNew, 'drugId')
    // console.log('InitialLoad oldSorted ', JSON.stringify(flatMap(oldSorted, (d) => d.drugId)), ', newSorted ', JSON.stringify(flatMap(newSorted, (d) => d.drugId)));
    let i;
    for (i = 0; i < oldSorted.length; i++) {
      if (newSorted[i].ndc === 'discontinued') {
        drugList.push({ ...oldSorted[i], ndc: 'discontinued' }); // oldSorted retains configDetails, drugDetail and planDetail are overwritten from newSorted
      }
      else {
        drugList.push({ ...oldSorted[i], ...newSorted[i] }); // oldSorted retains configDetails, drugDetail and planDetail are overwritten from newSorted
      }
    }
    console.log('InitialLoad _handleRefresh succeeded, saving refreshed list into Active');
  }
  else {
    drugList = drugListOld;
    console.log('InitialLoad _handleRefresh failed, saving old list into Active');
  }

  saveDrugList((response) => { _handleSaveActive(response, callBack, drugList, mergedProfile) }, mergedProfile, 'Active List', 'Saved on every change', 'System', drugList, 'activePlanDrugs')
}

const _handleSaveActive = (response, callBack, drugList, mergedProfile) => {
  console.log('InitialLoad _handleSaveActive success: ' + response, ', calling final callBack');
  callBack(mergedProfile, drugList);
}
