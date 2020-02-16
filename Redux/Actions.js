
// Flow management across components

export const setFlow = (component, flowState) => ({
  type: 'SETFLOWSTATE',
  flow: flowState,
  component: component
})

export const updateFlow = (newFlowState) => ({
  type: 'UPDATEFLOWSTATE',
  stateUpdate: newFlowState,
})

// Visibility management across components

export const setVisibility = (component, visibility) => ({
  type: 'SETVISIBILITY',
  visibility: visibility,
  component: component
})

export const updateVisibility = (newVisibility) => ({
  type: 'UPDATEVISIBILITY',
  newVisibility: newVisibility,
})

// Plan Compare actions

export const updatePlanCompareList = (result) => ({
  type: 'UPDATECOMPARELIST',
  result
})

export const deleteFromPlanComapareList = (planId) => ({
  type: 'DELETEFROMCOMPARELIST',
  planId
})
// Drug search actions

export const updateSearchTerm = (searchString) => ({
  type: 'SEARCHTERM',
  searchParam: searchString.trim()
})
export const addResult = (results) => ({
  type: 'SEARCHRESULT',
  results
})
export const toggleResult = (baseId) => ({
  type: 'TOGGLERESULT',
  Id: baseId
})

// Drug find actions

export const addFDResult = (results) => ({
  type: 'FINDRESULT',
  results
})
export const toggleFDResult = (drugId) => ({
  type: 'TOGGLEFDRESULT',
  Id: drugId
})

// Drug List management

export const addToMyDrugs = (newItems, doClear) => ({
  type: 'ADD_TO_MYDRUGS',
  addItems: newItems,
  doClear: doClear
})
export const addToMyFDDrugs = (newItems, doClear) => ({
  type: 'ADD_TO_MYFDDRUGS',
  addItems: newItems,
  doClear: doClear
})
export const deleteFromMyFDDrugs = (drug) => ({
  type: 'DELETE_FROM_MYFDDRUGS',
  drugId: drug.drugId
})
export const toggleSelectedFDDrug = (drug) => ({
  type: 'TOGGLE_SELECTED_FDDRUG',
  newDrugId: drug.drugId
})
export const toggleSelectedDrug = (drug) => ({
  type: 'TOGGLE_SELECTED_DRUG',
  newDrugId: drug.drugId
})
export const updateSplit = (selectedDrug) => ({
  type: 'UPDATE_SPLIT',
  selectedDrug: selectedDrug,
})
export const updateFDSplit = (selectedDrug) => ({
  type: 'UPDATE_FDSPLIT',
  selectedDrug: selectedDrug,
})
export const updateCompare = (altId, selectedDrug) => ({
  type: 'UPDATE_COMPARE',
  altId: altId,
  selectedDrug: selectedDrug,
})
export const updateFDCompare = (altId, selectedDrug) => ({
  type: 'UPDATE_FDCOMPARE',
  altId: altId,
  selectedDrug: selectedDrug,
})
export const clearOptimization = (selectedDrug) => ({
  type: 'CLEAR_OPTIMIZATION',
  selectedDrug: selectedDrug,
})
export const clearFDOptimization = (selectedDrug) => ({
  type: 'CLEAR_FDOPTIMIZATION',
  selectedDrug: selectedDrug,
})
export const updateMode = (isAcute, numEpisodes, episodeDays, dosesPerDay, drugId) => ({
  type: 'UPDATE_MODE',
  isAcute: isAcute,
  numEpisodes: numEpisodes,
  episodeDays: episodeDays,
  dosesPerDay: dosesPerDay,
  drugId: drugId
})
export const updateFDMode = (isAcute, numEpisodes, episodeDays, dosesPerDay, drugId) => ({
  type: 'UPDATE_FDMODE',
  isAcute: isAcute,
  numEpisodes: numEpisodes,
  episodeDays: episodeDays,
  dosesPerDay: dosesPerDay,
  drugId: drugId
})
export const updateDosage = (newDrug, selectedDrugId) => ({
  type: 'UPDATE_DOSAGE',
  newDrug: newDrug,
  selectedDrugId: selectedDrugId,
})
export const updateFDDosage = (newDrug, selectedDrug) => ({
  type: 'UPDATE_FDDOSAGE',
  newDrug: newDrug,
  selectedDrug: selectedDrug,
})
export const deleteFromMyDrugs = (drug) => ({
  type: 'DELETE_FROM_MYDRUGS',
  drugId: drug.drugId
})
export const clearMyDrugs = () => ({
  type: 'CLEAR_MYDRUGS',
})
export const loadMyDrugs = (newItems) => ({
  type: 'LOAD_MYDRUGS',
  addItems: newItems
})

// Assorted functions

export const Defaults = (label, value) => ({
  type: 'SETDEFAULT',
  value: value,
  label: label
})

// export const updateDefaults = (defaultUpdate) => ({
//   type: 'UPDATEDEFAULT',
//   defaultUpdate: defaultUpdate
// })

export const setPlatformValue = (component, value) => ({
  type: 'SETVALUE',
  value: value,
  component: component
})

export const updatePlatformValue = (platformValueUpdate) => ({
  type: 'UPDATEVALUE',
  platformValueUpdate: platformValueUpdate,
})

export const updateProfile = (profileUpdate) => ({
  type: 'UPDATEPROFILE',
  profileUpdate: profileUpdate,
})

export const updateContent = (contentUpdate) => ({
  type: 'UPDATECONTENT',
  contentUpdate: contentUpdate,
})

// Plan management

export const addPlans = (planList) => ({
  type: 'ADDPLANLIST',
  planList: planList,
})
export const toggleSelectedPlan = (plan) => ({
  type: 'TOGGLESELECTEDPLAN',
  newPlanId: plan.planId
})
export const handleSelectedPlan = (plan) => ({
  type: 'HANDLESELECTEDPLAN',
  newPlanId: plan.planId
})
export const clearPlanSelection = () => ({
  type: 'CLEARSELECTEDPLAN',
})


