
const processRequest = function (cb, mode = 'GET', path, load = null) {

  var url = "https://fun3ezpdbeta2.azurewebsites.net/api/";
  var request = new XMLHttpRequest();
  request.open(mode, url + path, true);
  request.timeout = 30000;

  console.log('API processRequest, mode: ' + mode);
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Content-Type", "application/json");
  const myLoad = JSON.stringify({ post: load ? load : {}, queryString: (path + '?x').split('?')[1] });
  // console.log('API myLoad = ', myLoad, ', path = ', path);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      // cb(data);
      cb({ ...data, uri: path, load: myLoad });

    } else {
      console.log(mode + ": status = " + request.status + " url = " + url + path + ", load = " + load);
      cb({ uri: path, load: myLoad, success: false, code: -2, err: (request.status + ' ' + request.statusText).trim(), payLoad: 'API Request' });
    }
  }

  request.onerror = function () {
    // console.log(mode + " error= " + request.status);
    cb({ uri: path, load: myLoad, success: false, code: -3, err: (request.status + ' ' + request.statusText).trim() });
  }

  request.ontimeout = function () {
    // console.log(mode + " timeout " + request.status);
    cb({ uri: path, load: myLoad, success: false, code: -4, err: 'time-out' });
  }

  request.send(load);
}

export const loadStates = function (cb) {
  const mode = 'GET';
  return processRequest(cb, mode, 'GetStates?code=mLr4B3SXbRSxf2LVGIv7a6K6EnPIu76fsPlCvBZ3IZh2zCWaSebcpQ==');
}

export const loadStatePlans = function (cb, stateId) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManagePlans?code=HfUY50gafaoHk6UfXgka7n0IA/wpZyrM6ZWt8p1vl8TTuXA7fy2Lbw==&FunctionType=Load&StateId=${stateId}`);
}

export const searchBaseDrugs = function (cb, searchTerm, stateId, wildCard) {
  // console.log(`basesearch?Id=${searchId}&drugName=${searchTerm}&drugMode=${searchMode}`);
  const mode = 'GET';
  return processRequest(cb, mode, `SearchDrugs?code=aZK74w7z5zIoiop1KY654R57nPWEKPPHa1ymzz4MyaoGbs21CY68AA==&stateId=${stateId}&drugName=${searchTerm}&wildCard=${wildCard}`);
}

export const loadDrugClasses = function (cb, planId, contractId) {
  //console.log(`DrugClasses?planId=${planId}&contractId=${contractId}`);
  const mode = 'GET';
  return processRequest(cb, mode, `ManageRx?code=qoU7fMaReBtnCKZyCJ2NVUZvGhT2Y8gYWi0A/lqrcF6MAnab0jQG5g==&planId=${planId}&contractId=${contractId}`);
}

export const RXsearchDrugs = function (cb, searchTerm, planId, contractId, isText, wildCard) {
  //console.log(`DrugFind?planId=${planId}&contractId=${contractId}&searchTerm=${searchTerm}&textSearch=${isText}&wildCard=${wildCard}`);
  const mode = 'GET';
  return processRequest(cb, mode, `RXSearchDrugs?planId=${planId}&contractId=${contractId}&searchTerm=${searchTerm}&textSearch=${isText}&wildCard=${wildCard}`);
}
export const RXloadDrugs = function (cb, planId, contractId, baseId) {
  console.log(`RXloadDrugs?planId=${planId}&contractId=${contractId}&baseId=${baseId}`);
  const mode = 'GET';
  return processRequest(cb, mode, `RXLoadDrugs?planId=${planId}&contractId=${contractId}&baseId=${baseId}`);
}
export const loadDrugsByBaseId = function (cb, stateCode, baseIds) {
  const baseDrugSearchString = baseIds.map((baseId) => `baseId=${baseId}`).join('&');
  console.log('loadDrugsByBaseId?stateId=' + stateCode + `&${baseDrugSearchString}`);
  const mode = 'GET';
  return processRequest(cb, mode, `LoadDrugs?code=d3UuPnTj83apumI2g7pfPF2TYEKwGetXS8iapQunjFiStYJ85tk43g==&FunctionType=LoadById&stateId=${stateCode}&${baseDrugSearchString}`);
}

export const loadDrugsByBaseName = function (cb, stateCode, baseName = '') {
  const baseDrugSearchString = `baseName=${baseName}`;
  console.log('loadDrugsByBaseName?stateId=' + stateCode + `&${baseDrugSearchString}`);
  const mode = 'GET';
  return processRequest(cb, mode, `LoadDrugs?code=d3UuPnTj83apumI2g7pfPF2TYEKwGetXS8iapQunjFiStYJ85tk43g==&FunctionType=LoadByName&stateId=${stateCode}&${baseDrugSearchString}`);
}

export const refreshDrugs = function (cb, NDCIds, stateCode) {
  const NDCIdSearchString = NDCIds.map((ndc) => `drugId=${ndc}`).join('&');
  console.log('RefreshDrugs?stateId=' + stateCode + `&${NDCIdSearchString}`);
  const mode = 'GET';
  return processRequest(cb, mode, `RefreshDrugs?code=tshJbaFStUSmYRdvy8GwZGUYs76ORJ9UYeNDslOVJMu0JnCHut7ILw==&stateId=${stateCode}&${NDCIdSearchString}`);
}

// export const loadPrescDrugs = function (cb, baseIds, planId) {
//   const baseDrugSearchString = baseIds.map((baseId) => `baseDrugId=${baseId}`).join('&');
//   //console.log('drugconfig?stateId=' + stateCode + `&${drugIdSearchString}`);
//   const mode = 'GET';
// return processRequest(cb, mode, `prescdrug?planId=${planId}&${baseDrugSearchString}`);
// }

export const findPlans = function (cb, myDrugs, stateCode, doMail, startDate, doTest = false) {
  //console.log('findPlans myDrugs ', myDrugs, ' stateCode ', stateCode, ', doMail ', doMail, ', startDate ', startDate);
  const mode = 'POST';
  return processRequest(cb, mode, `ManagePlans?code=HfUY50gafaoHk6UfXgka7n0IA/wpZyrM6ZWt8p1vl8TTuXA7fy2Lbw==&FunctionType=Find&stateId=${stateCode}&doMail=${doMail}&startDate=${startDate}`, myDrugs);
}

export const planBreakdown = function (cb, configData, doMail, startDate) {
  let url = `ManagePlans?code=HfUY50gafaoHk6UfXgka7n0IA/wpZyrM6ZWt8p1vl8TTuXA7fy2Lbw==&FunctionType=Breakdown&doMail=${doMail}&startDate=${startDate}`;
  // console.log('url = ', url, ', myDrugs = ' + configData);
  const mode = 'POST';
  return processRequest(cb, mode, url, configData);
}

export const saveToDB = function (cb, userData) {
  // console.log('saveToDB userData = ', userData);
  const mode = 'POST';
  return processRequest(cb, mode, 'SaveData?code=wsUtZXRcVMphwoTw7NcH/fRrPdtRgDwVqwORnJZlK5MGzIFV5IHMNg==&FunctionType=Save', userData);
}

export const saveErrorToDB = (cb, userData) => {
  // console.log('saveErrorToDB userData = ', userData);
  const mode = 'POST';
  return processRequest(cb, mode, 'SaveData?code=wsUtZXRcVMphwoTw7NcH/fRrPdtRgDwVqwORnJZlK5MGzIFV5IHMNg==&FunctionType=SaveError', userData);
}

export const ContentInfo = function (cb) {
  const mode = 'GET';
  return processRequest(cb, mode, 'ManageData?code=uRPD4/G26dMaRwcSGOnIfo/Qiio8DC5GeSAYz0GzNP6eSUX/EYDbfQ==&FunctionType=ContentInfo');
}

export const loadFromDB = function (cb, email, contentType = null, deviceId = null, deviceName = null, doSections = false) {
  let url = `ManageData?code=uRPD4/G26dMaRwcSGOnIfo/Qiio8DC5GeSAYz0GzNP6eSUX/EYDbfQ==&FunctionType=Load&UserEmail=${email}`;
  if (contentType) {
    url = url + '&' + contentType.map((ct) => `ContentType=${ct}`).join('&');
  }
  if (deviceId) {
    url = url + '&' + deviceId.map((di) => `DeviceId=${di}`).join('&');
  }
  if (deviceName) {
    url = url + `&DeviceName=${deviceName}`;
  }
  url = url + `&DoSections=${doSections}`;
  console.log('Api loadFromDB url =', url);
  const mode = 'GET';
  return processRequest(cb, mode, url);
}

export const loadFromDbById = function (cb, Id) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageData?code=uRPD4/G26dMaRwcSGOnIfo/Qiio8DC5GeSAYz0GzNP6eSUX/EYDbfQ==&FunctionType=LoadById&ID=${Id}`);
}

export const deleteFromDBById = function (cb, Id) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageData?code=uRPD4/G26dMaRwcSGOnIfo/Qiio8DC5GeSAYz0GzNP6eSUX/EYDbfQ==&FunctionType=DeleteById&ID=${Id}`);
}

export const deleteFromDBByStorageIndex = function (cb, storageIndex, deviceIdentifier) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageData?code=uRPD4/G26dMaRwcSGOnIfo/Qiio8DC5GeSAYz0GzNP6eSUX/EYDbfQ==&FunctionType=DeleteByStorageIndex&StorageIndex=${storageIndex}&DviceIdentifier=${deviceIdentifier}`);
}

export const loadDBProfile = function (cb, UserEmail = null, deviceIdentifier = null) {
  let url = 'ManageProfile?code=hs5RnPswRXhEsA9X/Dn8WwT8OoXia3QI7PlsXViKmz9nACNem58xbQ==&FunctionType=Load&';
  if (UserEmail) {
    url = url + `UserEmail=${UserEmail}`;
  }
  if (deviceIdentifier) {
    if (UserEmail) {
      url = url + '&';
    }
    url = url + `DeviceIdentifier=${deviceIdentifier}`;
  }
  //console.log('loadDBProfile url =', url);
  const mode = 'GET';
  return processRequest(cb, mode, url);
}

export const saveDBProfile = function (cb, userData, deviceIdentifier = null) {
  let url = 'ManageProfile?code=hs5RnPswRXhEsA9X/Dn8WwT8OoXia3QI7PlsXViKmz9nACNem58xbQ==&FunctionType=Save';
  if (deviceIdentifier) {
    url = url + `&DeviceIdentifier=${deviceIdentifier}`;
  }
  const mode = 'POST';
  return processRequest(cb, mode, url, userData);
}

export const updateAnonymous = function (cb, deviceIdentifier, userData) {
  const mode = 'POST';
  return processRequest(cb, mode, `ManageProfile?code=hs5RnPswRXhEsA9X/Dn8WwT8OoXia3QI7PlsXViKmz9nACNem58xbQ==&FunctionType=Update&DeviceIdentifier=${deviceIdentifier}`, userData);
}

export const createAnonymous = function (cb, deviceIdentifier, deviceName, userData) {
  // console.log('createAnonymous url = ', `userData/CreateAnonymous?deviceIdentifier=${deviceIdentifier}&deviceName=${deviceName}`, ', userData = ', userData)
  const mode = 'POST';
  return processRequest(cb, mode, `ManageProfile?code=hs5RnPswRXhEsA9X/Dn8WwT8OoXia3QI7PlsXViKmz9nACNem58xbQ==&FunctionType=Create&DeviceIdentifier=${deviceIdentifier}&DeviceName=${deviceName}`, userData);
}

export const addUserDevice = function (cb, userEmail, deviceId, deviceName) {
  const mode = 'GET';
  return processRequest(cb, mode, `SaveData?code=wsUtZXRcVMphwoTw7NcH/fRrPdtRgDwVqwORnJZlK5MGzIFV5IHMNg==&FunctionType=AddDevice&UserEmail=${userEmail}&DeviceIdentifier=${deviceId}&DeviceName=${deviceName}`);
}

export const getDeviceByIdentifier = function (cb, deviceIdentifier) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageDevice?code=bFFaZzgPNrvBeKj9ECSzDVspnX6FFWaqH8kNaS/6RIjCVmCKazoaIQ==&FunctionType=GetById&DeviceIdentifier=${deviceIdentifier}`);
}

export const getDeviceByName = function (cb, deviceName, userEmail) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageDevice?code=bFFaZzgPNrvBeKj9ECSzDVspnX6FFWaqH8kNaS/6RIjCVmCKazoaIQ==&FunctionType=GetByName&DeviceName=${deviceName}&UserEmail=${userEmail}`);
}

export const deviceList = function (cb, userEmail) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageDevice?code=bFFaZzgPNrvBeKj9ECSzDVspnX6FFWaqH8kNaS/6RIjCVmCKazoaIQ==&FunctionType=GetList&UserEmail=${userEmail}`);
}

export const updateDevice = function (cb, deviceIdentifier, deviceName = null, friendlyName = null, updateLogin = null) {
  let url = `ManageDevice?code=bFFaZzgPNrvBeKj9ECSzDVspnX6FFWaqH8kNaS/6RIjCVmCKazoaIQ==&FunctionType=Update&DeviceIdentifier=${deviceIdentifier}`;
  if (deviceName) {
    url = url + `&DeviceName=${deviceName}`;
  }
  if (friendlyName) {
    url = url + `&FriendlyName=${friendlyName}`;
  }
  if (updateLogin) {
    url = url + `&UpdateLogin=${updateLogin}`;
  }
  // console.log('API updateDevice url = ', url);
  const mode = 'GET';
  return processRequest(cb, mode, url);
}

export const createUser = function (cb, eMail, password) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=CreateUser&UserEmail=${eMail}&Password=${password}`);
}

export const addPhone = function (cb, userId, phoneNumber) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=AddPhone&UserId=${userId}&PhoneNumber=${phoneNumber}`);
}

export const verifyPhone = function (cb, userId, phoneNumber, code) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=VerifyPhone&UserId=${userId}&PhoneNumber=${phoneNumber}&VerificationCode=${code}`);
}

export const registerUser = function (cb, userId, provider) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=RegisterUser&UserId=${userId}&Provider=${provider}`);
}

export const activateApp = function (cb, userId, code, provider, verifyEmail = true) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=ActivateApp&UserId=${userId}&VerificationCode=${code}&Provider=${provider}&VerifyEmail=${verifyEmail}`);
}

export const getUserID = function (cb, eMail) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=GetUserID&UserEmail=${eMail}`);
}

export const loginUser = function (cb, eMail, password, provider) {
  // console.log('Login API = ', `User/Login?eMail=${eMail}&password=${password}&provider=${provider}`);
  const mode = 'GET';
  console.log('loginUser url = ', `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=LoginUser&UserEmail=${eMail}&Password=${password}&Provider=${provider}`);
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=LoginUser&UserEmail=${eMail}&Password=${password}&Provider=${provider}`);
}

export const validateLogin = function (cb, provider, code) {
  const mode = 'GET';
  console.log('validateLogin url = ', `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=ValidateLogin&Provider=${provider}&VerificationCode=${code}`);
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=ValidateLogin&Provider=${provider}&VerificationCode=${code}`);
}

export const forgotPassword = function (cb, email) {
  // console.log('forgotPassword url = ',`User/ForgotPassword?email=${email}`);
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=ForgotPassword&UserEmail=${email}`);
}

export const resetPassword = function (cb, userId, password) {
  // console.log('resetPassword url = ',`User/ResetPassword?userId=${userId}&password=${password}`);
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=ResetPassword&UserId=${userId}&Password=${password}`);
}

export const changePassword = function (cb, userId, oldPassword, newPassword) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=ChangePassword&UserId=${userId}&Password=${oldPassword}&NewPassword=${newPassword}`);
}

export const getProvider = function (cb, userEmail) {
  const mode = 'GET';
  return processRequest(cb, mode, `ManageUser?code=PAcknwFI96heB5FnS9YCSP5HqmlJ4Gk0IKymhUt6daPbt8BTy1zk1A==&FunctionType=GetProvider&UserEmail=${userEmail}`);
}
