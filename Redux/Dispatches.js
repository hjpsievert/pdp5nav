import * as Actions from './Actions';
import { Alert } from 'react-native';

// Flow management across components

export const setFlowState = (component, text) => {
  return Actions.updateFlow({ [component]: text });
  // return Actions.setFlow(component, text);
}
export const updateFlowState = (newFlowState) => {
  return Actions.updateFlow(newFlowState);
}

export const handleExitToNewDrugsTop = () => {
  return handleExitToNone('NewDrugsTop');
}
export const handleExitToMyPlans = () => {
  return handleExitToNone('MyPlans');
}
export const handleExitToPlansTop = () => {
  return handleExitToNone('PlansTop');
}
export const handleExitToMain = () => {
  return Actions.setFlow('Main', 'home');
}
export const handleExitToNone = (area) => {
  return Actions.setFlow(area, 'none');
}

// Plan Compare functions

export const updatePlanCompareList = (result) => {
  return Actions.updatePlanCompareList(result);
}

export const deleteFromPlanComapareList = (planId) => {
  return Actions.deleteFromPlanComapareList(planId);
}

// Drug search functions

export const handleSearchTextChanged = (text) => {
  return Actions.updateSearchTerm(text);
}
export const handleBaseDrugSearchComplete = (resultsList) => {
  resultsList.forEach((r) => (r.isSelected = resultsList.length === 1));
  return Actions.addResult(resultsList);
}
export const handleFindDrugSearchComplete = (resultsList) => {
  return Actions.addFDResult(resultsList);
}
export const handleBaseDrugClick = (baseDrug) => {
  return Actions.toggleResult(baseDrug.baseId);
}

// Drug List management

export const addSelectionToMyDrugs = (selection, doClear = false) => {
  return Actions.addToMyDrugs(selection, doClear);
}
export const addSelectionToMyFDDrugs = (selection, doClear = false) => {
  return Actions.addToMyFDDrugs(selection, doClear);
}
export const handleToggleSelectedDrug = (drug) => {
  return Actions.toggleSelectedDrug(drug);
}
export const handleToggleSelectedFDDrug = (drug) => {
  return Actions.toggleSelectedFDDrug(drug);
}
export const handleDeleteFromMyDrugs = (drug) => {
  return Actions.deleteFromMyDrugs(drug);
}
export const handleDeleteFromMyFDDrugs = (drug) => {
  return Actions.deleteFromMyFDDrugs(drug);
}
export const handleClearMyDrugs = () => {
  return Actions.clearMyDrugs();
}
export const handleLoadMyDrugs = (myDrugs) => {
  return Actions.loadMyDrugs(myDrugs);
}
export const handleUpdateSplit = (selectedDrug) => {
  return Actions.updateSplit(selectedDrug);
}
export const handleUpdateFDSplit = (selectedDrug) => {
  return Actions.updateFDSplit(selectedDrug);
}
export const handleUpdateCompare = (altId, selectedDrug) => {
  return Actions.updateCompare(altId, selectedDrug);
}
export const handleUpdateFDCompare = (altId, selectedDrug) => {
  return Actions.updateFDCompare(altId, selectedDrug);
}
export const handleClearOptimization = (selectedDrug) => {
  return Actions.clearOptimization(selectedDrug);
}
export const handleClearFDOptimization = (selectedDrug) => {
  return Actions.clearFDOptimization(selectedDrug);
}
export const handleUpdateMode = (isAcute, numEpisodes, episodeDays, dosesPerDay, drugId) => {
  return Actions.updateMode(isAcute, numEpisodes, episodeDays, dosesPerDay, drugId);
}
export const handleUpdateFDMode = (isAcute, numEpisodes, episodeDays, dosesPerDay, drugId) => {
  return Actions.updateFDMode(isAcute, numEpisodes, episodeDays, dosesPerDay, drugId);
}
// Assorted functions

export const handleUpdateDosage = (newDrug, selectedDrug) => {
  return Actions.updateDosage(newDrug, selectedDrug);
}
export const handleUpdateFDDosage = (newDrug, selectedDrug) => {
  return Actions.updateFDDosage(newDrug, selectedDrug);
}

// export const setDefault = (label, value) => {
//   // return Actions.Defaults(label, value);
//   return Actions.updateDefaults({ [label]: value });
// }

// export const updateDefault = (defaultUpdate) => {
//   return Actions.updateDefaults(defaultUpdate);
// }

// Set platform values

export const setPlatformValue = (component, value) => {
  return Actions.updatePlatformValue({[component]: value});
  // return Actions.setPlatformValue(component, value);
}

export const updatePlatformValue = (platformValueUpdate) => {
  return Actions.updatePlatformValue(platformValueUpdate);
}

export const updateProfile = (profileUpdate) => {
  return Actions.updateProfile(profileUpdate);
}

export const updateContent = (contentUpdate) => {
  return Actions.updateContent(contentUpdate);
}

// Plan management
export const handleUpdatePlanList = (planList) => {
  return Actions.addPlans(planList);
}
export const handleToggleSelectedPlan = (plan) => {
  return Actions.toggleSelectedPlan(plan);
}
export const handleSelectedPlan = (plan) => {
  return Actions.handleSelectedPlan(plan);
}
export const handleClearPlanSelection = () => {
  return Actions.clearPlanSelection();
}
