import { saveDBProfile, saveToDB, saveErrorToDB } from '../Utils/Api';
import { usrMode, errorCodes } from '../Utils/Constants';
import Constants from 'expo-constants';
import { updateProfile } from '../Redux/Actions'
import { store } from '../App';
import { saveProfile, saveDrugs, getIndex, saveIndex, saveErrorLocally, readKeys } from './Storage';
import find from 'lodash/find';

export const saveUserProfile = (callBack, userProfile, doSave, component) => {
  // console.log('SaveData doSave = ', JSON.stringify(doSave));

  if (doSave.store) {
    store.dispatch(updateProfile(userProfile));
    console.log(component, ': saveUserProfile to Store complete');
  }

  if (doSave.cloud) {
    saveDBProfile((response) => {
      _handleSaveProfileDB(response, component);
    }, JSON.stringify(userProfile));
  }
  else {
    console.log(component, ': saveUserProfile to DB skipped');
  }

  if (doSave.local) {
    saveProfile((response) => {
      _handleSaveProfile(callBack, userProfile, response, component);
    }, userProfile);
  }
}

const _handleSaveProfileDB = (response, component) => {
  const { success, payLoad, code, err } = response;
  console.log(component, ': saveUserProfile to DB complete, success ' + success);
}

const _handleSaveProfile = (callBack, userProfile, response, component) => {
  console.log(component, ': saveUserProfile to Local complete, success ' + response.success);
  callBack(userProfile);
}

export const saveError = (callBack, err) => {
  const { code, message } = err;
  const {userProfile} = err;
  const up = JSON.parse(userProfile);
  const errorInfo = find(errorCodes, (ei) => ei.code === code);

  const userData = {
    userEmail: up.userEmail,
    userId: up.userId,
    contentType: 'appError',
    payload: JSON.stringify(err), //code === -10 ? err : JSON.stringify(err),
    deviceIdentifier: Constants.installationId,
    deviceName: Constants.deviceName,
    title: errorInfo.text.trim(),
    description: message.trim(),
    category: errorInfo.category.trim(),
    storageIndex: -1,
  }

  console.log('SaveData userData:',userData);

  saveErrorToDB((response) => { _handleSaveErrorToDB(callBack, userData, response) }, JSON.stringify(userData));
}

const _handleSaveErrorToDB = (callBack, userData, response) => {
  const { success, payLoad, err } = response;
  if (!success) {
    console.log('SaveData unable to save error to DB, saving locally, err = ', err); //, response = ', JSON.stringify(response));
    saveErrorLocally((response) => {
      _handlesaveErrorLocally(callBack, response)
    }, userData);
  }
  else {
    // send email to support and user
    console.log('SaveData error saved to DB, payLoad = ', payLoad);
    callBack(success, 'DB');
    }
}

const _handlesaveErrorLocally = (callBack, response) => {
  const { success } = response;
  console.log('SaveData saveErrorLocally success = ', success);
  callBack(success, 'Local');
}

export const saveDrugList = (callBack, userProfile, inputTitle, inputDescription, inputCategory, myDrugs, contentType) => {
  //console.log ('_savePlanDrugList size = ', drugCount)
  const { userMode } = userProfile;
  if (userMode === usrMode.anon) {
    callBack('saveDrugList skipped, user anonymous');
  }
  else {
    // removeAllKeys(_handleReadKeysResult, 'StorageIndex');
    getIndex((response) => _processIndex(response, callBack, userProfile, inputTitle, inputDescription, inputCategory, myDrugs, contentType));
  }
}

const _processIndex = (response, callBack, userProfile, inputTitle, inputDescription, inputCategory, myDrugs, contentType) => {
  const { userEmail, storageMode, userId } = userProfile;
  let storageIndex = 0;
  if (contentType != 'activePlanDrugs' && contentType != 'findPlanDrugs') {
    storageIndex = response.index;
  }
  console.log('saveDrugList storageIndex = ', storageIndex);

  const userData = {
    userEmail: userEmail,
    userId: userId,
    contentType: contentType,
    payload: JSON.stringify(myDrugs),
    deviceIdentifier: Constants.installationId,
    deviceName: Constants.deviceName,
    title: inputTitle.trim(),
    description: inputDescription.trim(),
    category: inputCategory.trim(),
    storageIndex: storageIndex,
  }
  if (storageMode === 'cloud') {
    saveToDB((response) => {
      _handleSaveDrugsDB(response);
    }, JSON.stringify(userData));
  }
  saveDrugs((response) => {
    _handleSaveDrugs(callBack, storageIndex, response)
  }, userData);
}

const _handleSaveDrugsDB = (response) => {
  const { success, payLoad, code, err } = response;
  console.log('saveDrugList to DB complete, success ' + success);
}

const _handleSaveDrugs = (callBack, storageIndex, response) => {
  console.log('saveDrugList to Local complete, storageIndex = ', storageIndex, ', success ' + response.success);
  const result = response.success;
  if (parseInt(storageIndex) === 0) {
    _finishIndex('skipped', result, callBack)
  }
  else {
    let newIndex = (parseInt(storageIndex) + 1);
    saveIndex((response) => _finishIndex(response, result, callBack), newIndex)
  }
}

const _finishIndex = (response, success, callBack) => {
  console.log('_finishIndex success = ', response.success, ', saveSuccess = ', success);
  //readKeys(null);
  callBack(success);
}

