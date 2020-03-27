export const Defaults = {
  // profileKey: 'userProfile',
  // profileTitle: 'User Profile',
  // activeListKey: 'activePlanDrugs',
  // activeListTitle: 'Active Drug List',
  // findListKey: 'activeFindDrugs',
  // findListTitle: 'Find Drug List',
  // savedFindListKey: 'savedFindDrugs',
  // savedFindListTitle: 'Saved Rx Drugs',
  // savedPlanListKey: 'savedPlanDrugs',
  // savedPlanListTitle: 'Saved Plan Drugs',
  // backupActiveListKey: 'backupActivePlanDrugs',
  // backupFindListKey: 'backupActiveFindDrugs',
  doMailState: true,
  plansToShow: 10,
}
export const usrMode = {
  init: 'initial',
  anon: 'anonymous',
  created: 'created',
  verifying: 'verification pending',
  activating: 'activation pending',
  reg: 'registered',
  resetting: 'password reset pending',
  reset: 'password reset validated',
}
export const defaultProfile = {
  loginId: '',
  userId: 0,
  userEmail: '',
  storageMode: 'cloud',
  userMode: usrMode.init,
  appVerified: false,
  displayName: '',
  emailVerified: false,
  provider: 'Email',
  userPlanId: '',
  userContractId: '',
  userPlanName: '',
  userStateId: '',
  verificationCode: '',
  userIsSubscribed: false
}

export const defaultProfileSave = {
  store: true,
  cloud: true,
  local: true,
}

export const defaultConfigDetail = {
  drugId: 0,
  isAcute: false,
  dosesPerDay: 1,
  episodeDays: 90,
  numEpisodes: 4,
  doCompare: false,
  doSplit: false,
  configSelected: false
}

export const errorCodes = {
  dataError : {
    code: 0,
    text: 'Input Data Error',
    category: 'Data',
    description: "No data were found that match the inputs provided by EZPartD to the data center"
  },
  serverError : {
    code: -1,
    text: 'Server Code Error',
    category: 'Data',
    description: "A system error occurred when retrieving information from the data canter"
  },
  httpStatus : {
    code: -2,
    text: 'HTTP Status Error',
    category: 'Comm',
    description: "An error occurred while communicating with the data center"
  },
  httpRequest : {
    code: -3,
    text: 'HTTP Request Error',
    category: 'Comm',
    description: "EZPartD was not able to communicate with the data center"
  },
  httpTimeout : {
    code: -4,
    text: 'HTTP Timeout Error',
    category: 'Comm',
    description: "The data center did not respond within the expected time frame"
  },
  boundaryError : {
    code: -10,
    text: 'React Boundary Error',
    category: 'App',
    description: "An error occurred during rendering of an EZPartD screen"
  }
}

