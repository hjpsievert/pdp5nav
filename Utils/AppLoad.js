import { loadObject } from './Storage';
import { loadFromDB, refreshDrugs } from './Api';
import Constants from 'expo-constants';
import { saveDrugList } from './SaveData';
import size from 'lodash/size';
import flatMap from 'lodash/flatMap';
import orderBy from 'lodash/orderBy';

export const loadAppData = function (callBack, userProfile) {
  console.log('AppLoad _handleSaveProfileToStorage profile ', JSON.stringify(userProfile));

  const { userEmail, userStateId, userIsSubscribed } = userProfile;
  const activeListIndex = 0;
  if (!!userEmail && !!userStateId) {
    if (!userIsSubscribed) {
      console.log('AppLoad user is not subscribed');
      loadObject((response) => { _handleLoadActiveStorage(response, callBack, userStateId, userEmail, userProfile) }, activeListIndex, 'activePlanDrugs')
    }
    else {
      console.log('AppLoad user is subscribed');
      loadObject((response) => { _handleLoadActiveStorage(response, callBack, userStateId, userEmail, userProfile) }, activeListIndex, 'activeFindDrugs')
    }
  }
  else {
    // there is no drug list, return profile and empty drug list in the callBack
    console.log('AppLoad no drugs found');
    const finalDrugs = {};
    callBack(userProfile, finalDrugs);
  }
}

const _handleLoadActiveStorage = (response, callBack, userStateId, userEmail, mergedProfile) => {
  console.log('AppLoad _handleLoadActiveStorage success ', response.success, ', size = ', size(response.payload));
  const { userIsSubscribed } = mergedProfile;
  if (response.success && size(response.payload) > 0) {
    const drugList = response.payload;
    if (userIsSubscribed) { // if drugFind no DB storage of active list, exit with drug list from storage
      console.log('AppLoad user is subscribed, exit with loaded drug list');
      callBack(mergedProfile, flatMap(drugList, (d) => d));
    }
    else {
      refreshDrugs((response) => {
        _handleRefresh(response, callBack, flatMap(drugList, (d) => d), userEmail, mergedProfile);
      }, flatMap(drugList, (d) => d.drugId), userStateId);
    }
  }
  else {
    // console.log('AppLoad _handleLoadActiveStorage load from DB');
    if (userIsSubscribed) { // if drugFind no DB storage of active list, exit with empty drug list
      console.log('AppLoad user is subscribed, exit with empty drug list');
      const finalDrugs = {};
      callBack(mergedProfile, finalDrugs);
    }
    else {
      // try to load druglist from database
      loadFromDB((response) => {
        _handleLoadActiveDB(response, callBack, userStateId, userEmail, mergedProfile);
      }, userEmail, ['activePlanDrugs'], [Constants.installationId]);
    }
  }
}

const _handleLoadActiveDB = (response, callBack, userStateId, userEmail, mergedProfile) => {
  const {success, payLoad, code} = response;
  console.log('AppLoad _handleLoadActiveDB, response items ' + code);
  if (success) {
    const drugList = JSON.parse(payLoad[0].payload);
    refreshDrugs((response) => {
      _handleRefresh(response, callBack, flatMap(drugList, (d) => d), userEmail, mergedProfile);
    }, flatMap(drugList, (d) => d.drugId), userStateId);
  }
  else {
    console.log('AppLoad _handleLoadActiveDB, no data, set drugsLoaded to true');
    const finalDrugs = {};
    callBack(mergedProfile, finalDrugs);
  }
}

const _handleRefresh = (response, callBack, drugListOld, userEmail, mergedProfile) => {
  const {payLoad} = response;
  const drugListNew = payLoad;
  console.log('AppLoad _handleRefresh drugListOld length ', flatMap(drugListOld, (d) => d.drugId + ', ' + d.planDetail.avePrice90 * 30), ', druglistNew = ', flatMap(drugListNew, (d) => d.drugId + ', ' + d.planDetail.avePrice90 * 30));
  let drugList = [];
  const oldSorted = orderBy(drugListOld, 'drugId');
  const newSorted = orderBy(drugListNew, 'drugId')
  console.log('AppLoad oldSOrted ', JSON.stringify(flatMap(oldSorted, (d) => d.drugId)), ', newSorted ', JSON.stringify(flatMap(newSorted, (d) => d.drugId)));
  let i;
  for (i = 0; i < oldSorted.length; i++) {
    if (newSorted[i].ndc === 'discontinued'){
      drugList.push({ ...oldSorted[i], ndc: 'discontinued' }); // oldSorted retains configDetails, drugDetail and planDetail are overwritten from newSorted
    }
    else {
      drugList.push({ ...oldSorted[i], ...newSorted[i] }); // oldSorted retains configDetails, drugDetail and planDetail are overwritten from newSorted
    }
  }
  console.log('AppLoad _handleRefresh drugList length ', flatMap(drugList, (d) => d.drugId + ', ' + d.ndc));
  saveDrugList((response) => { _handleSaveActive(response, callBack, drugList, mergedProfile) }, mergedProfile, 'Active List', 'Saved on every change', 'System', drugList, 'activePlanDrugs')

  console.log('AppLoad _handleRefresh reached end');
}

const _handleSaveActive = (response, callBack, drugList, mergedProfile) => {
  console.log('AppLoad saveDrugList successful ' + response, ', calling final callBack');
  callBack(mergedProfile, drugList);
}
