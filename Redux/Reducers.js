'use strict';
import { combineReducers } from 'redux';
import {  defaultConfigDetail } from '../Utils/Constants';
// import AppNavigation from '../Navigation/AppNavigation'
import findKey from 'lodash/findKey';
import filter from 'lodash/filter';

// const navReducer = (state, action) => {
//   const newState = AppNavigation.router.getStateForAction(action, state)
//   return newState || state
// }

export const searchTerm = (state = {}, action) => {
  switch (action.type) {
    case 'SEARCHTERM':
      return action.searchParam
    //return state;
    default:
      return state
  }
}

export const searchResults = (state = [], action) => {
  switch (action.type) {
    case 'SEARCHRESULT':
      return action.results;
    case 'TOGGLERESULT': {
      //use lodash find instead of findIndex
      //console.log('toggleResults Id = ', action.Id)
      const index = state.findIndex((r) => r.baseId === action.Id);
      return index >= 0 ? [
        ...state.slice(0, index),
        { ...state[index], isSelected: !state[index].isSelected },
        ...state.slice(index + 1)] : state;
    }
    default:
      return state
  }
}

export const comparePlans = (state = [], action) => {
  switch (action.type) {
    case 'UPDATECOMPARELIST': {
      const index = state.findIndex((p) => p.planResults.planId === action.planResults.planId);
      return index >= 0 ? state : state.push(action.result);
    }
    case 'DELETEFROMCOMPARELIST': {
      const index = state.findIndex((p) => p.planResults.planId === action.planId);
      return index >= 0 ? [
        ...state.slice(0, index),
        ...state.slice(index + 1)] : state;
    }
    default:
      return state
  }
}

export const findResults = (state = [], action) => {
  switch (action.type) {
    case 'FINDRESULT':
      return action.results;
    case 'TOGGLEFDRESULT': {
      //use lodash find instead of findIndex
      const index = state.findIndex((r) => r.drugId === action.Id);
      return index >= 0 ? [
        ...state.slice(0, index),
        { ...state[index], isSelected: !state[index].isSelected },
        ...state.slice(index + 1)] : state;
    }
    default:
      return state
  }
}

export const profile = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATEPROFILE': {
      var newState = { ...state, ...action.profileUpdate };
      // console.log('Reducers profile = ' + JSON.stringify(action.profileUpdate));
      return newState;
    }
    default:
      return state;
  }
}

export const content = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATECONTENT': {
      var newState = { ...state, ...action.contentUpdate };
      // console.log('Reducers content = ' + JSON.stringify(action.contentUpdate));
      return newState;
    }
    default:
      return state;
  }
}

export const platform = (state = {}, action) => {
  switch (action.type) {
    case 'SETVALUE': {
      var newState = { ...state };
      newState[action.component] = action.value;
      return newState;
    }
    case 'UPDATEVALUE': {
      return { ...state, ...action.platformValueUpdate };
    }
    default:
      return state;
  }
}

export const flowState = (state = {}, action) => {
  switch (action.type) {
    case 'SETFLOWSTATE': {
      var newState = { ...state };
      newState[action.component] = action.flow;
      //newState[action.component] = {action.component, flow: action.flow};
      return newState;
    }
    case 'UPDATEFLOWSTATE': {
      return { ...state, ...action.stateUpdate }
    }
    default:
      return state;
  }
}

export const visibility = (state = {}, action) => {
  switch (action.type) {
    case 'SETVISIBILITY': {
      var newState = { ...state };
      newState[action.component] = action.visibility;
      return newState;
    }
    case 'UPDATEVISIBILITY': {
      return { ...state, ...action.newVisibility };
    }
    default:
      return state;
  }
}

// const defaultSetting = (state = {}, action) => {
//   switch (action.type) {
//     case 'SETDEFAULT': {
//       var newState = { ...state };
//       newState[action.label] = action.value;
//       return newState;
//     }
//     case 'UPDATEDEFAULT': {
//       return { ...state, ...action.defaultUpdate };
//     }
//     default:
//       return state;
//   }
// }

export const myFDPlans = (state = {}, action) => {
  switch (action.type) {
    case 'CLEARSELECTEDFDPLAN': {
      const index = findKey(state, { isSelected: true });
      if (index) {
        let newState = { ...state };
        newState[index] = { ...newState[index], isSelected: false };
        return newState;
      }
      else
        return state;
    }
    case 'HANDLESELECTEDFDPLAN': {
      let newState = { ...state };
      newState[action.newPlanId] = { ...newState[action.newPlanId], isSelected: true };
      return newState;
    }
    case 'ADDFDPLANLIST': {
      //console.log('Adding to plan list');
      return action.planList.reduce((theList, plan) => {
        const { planId } = plan;
        theList[planId] = {
          ...plan,
          isSelected: false
        };
        return theList;
      }, {});
    }
    case 'TOGGLESELECTEDFDPLAN': {
      const indexOld = findKey(state, { isSelected: true });
      const newPlan = { ...state[action.newPlanId], isSelected: !state[action.newPlanId].isSelected };
      if (indexOld && indexOld !== action.newPlanId) {
        return {
          ...state,
          [indexOld]: { ...state[indexOld], isSelected: false },
          [action.newPlanId]: newPlan
        }
      } else {
        return {
          ...state,
          [action.newPlanId]: newPlan
        };
      }
    }

    default:
      return state;
  }
}

export const myPlans = (state = {}, action) => {
  switch (action.type) {
    case 'CLEARSELECTEDPLAN': {
      const index = findKey(state, { isSelected: true });
      if (index) {
        let newState = { ...state };
        newState[index] = { ...newState[index], isSelected: false };
        return newState;
      }
      else
        return state;
    }
    case 'HANDLESELECTEDPLAN': {
      let newState = { ...state };
      newState[action.newPlanId] = { ...newState[action.newPlanId], isSelected: true };
      return newState;
    }
    case 'ADDPLANLIST': {
      //console.log('Adding to plan list');
      return action.planList.reduce((theList, plan) => {
        const { planId } = plan;
        theList[planId] = {
          totalCost: plan.worst.totalCost,
          bestCost: plan.optimized.totalCost - plan.optimized.straddleCost,
          ...plan,
          isSelected: false
        };
        return theList;
      }, {});
    }
    case 'TOGGLESELECTEDPLAN': {
      const indexOld = findKey(state, { isSelected: true });
      const newPlan = { ...state[action.newPlanId], isSelected: !state[action.newPlanId].isSelected };
      if (indexOld && indexOld !== action.newPlanId) {
        return {
          ...state,
          [indexOld]: { ...state[indexOld], isSelected: false },
          [action.newPlanId]: newPlan
        }
      } else {
        return {
          ...state,
          [action.newPlanId]: newPlan
        };
      }
    }

    default:
      return state;
  }
}

export const myFDDrugs = (state = {}, action) => {
  switch (action.type) {
    case 'CLEAR_MYFDDRUGS': {
      return {};
    }
    case 'DELETE_FROM_MYFDDRUGS': {
      let newState = { ...state };
      delete newState[action.drugId];
      console.log('reducer executed DELETE_FROM_MYFDDRUGS');
      return newState;
    }

    case 'TOGGLE_SELECTED_FDDRUG': {
      const indexOld = findKey(state, { isSelected: true });
      let newState = { ...state };
      if (indexOld && indexOld != action.newDrugId) {
        newState[indexOld] = { ...newState[indexOld], isSelected: false };
      }
      newState[action.newDrugId] = { ...newState[action.newDrugId], isSelected: !(state[action.newDrugId].isSelected) };
      return newState;
    }

    case 'UPDATE_FDDOSAGE': {
      let newState = { ...state };
      const { newDrug, selectedDrugId } = action;
      delete newState[selectedDrugId];
      return newDrug.reduce((mergedState, drug) => {
        const { drugId } = drug;
        mergedState[drugId] = {
          ...drug,
          isSelected: false,
          configDetail: drug.configDetail ? { ...drug.configDetail, dosesPerDay: 1 } : { ...defaultConfigDetail, drugId }
        };
        return mergedState;
      }, { ...newState });
    }

    case 'UPDATE_FDMODE': {
      const { isAcute, numEpisodes, episodeDays, dosesPerDay, drugId } = action;
      if (drugId) {
        return {
          ...state,
          [drugId]: {
            ...state[drugId],
            configDetail: {
              ...state[drugId].configDetail,
              isAcute,
              numEpisodes,
              episodeDays,
              dosesPerDay
            }
          }
        };
      }
      else
        return state;
    }

    case 'CLEAR_FDOPTIMIZATION': {
      let currentSplitOrCompare = filter(state, ((s) => s.configDetail.doCompare || s.configDetail.doSplit));
      return currentSplitOrCompare.reduce((mergedState, drug) => {
        const { drugId } = drug;
        mergedState[drugId] = {
          ...drug,
          configDetail: { ...drug.configDetail, doSplit: false, doCompare: false }
        };
        return mergedState;
      }, { ...state });
    }

    case 'UPDATE_FDSPLIT': {
      let currentSplit = filter(state, ((s) => s.configDetail.doCompare || s.configDetail.doSplit));
      currentSplit = currentSplit.reduce((mergedState, drug) => {
        const { drugId } = drug;
        mergedState[drugId] = {
          ...drug,
          configDetail: { ...drug.configDetail, doSplit: false, doCompare: false },
        };
        return mergedState;
      }, { ...state });
      currentSplit[action.selectedDrug] = { ...currentSplit[action.selectedDrug], configDetail: { ...currentSplit[action.selectedDrug].configDetail, doSplit: true } }
      return currentSplit;
    }

    case 'UPDATE_FDCOMPARE': {
      let currentCompare = filter(state, ((s) => s.configDetail.doCompare || s.configDetail.doSplit));
      currentCompare = currentCompare.reduce((mergedState, drug) => {
        const { drugId } = drug;
        mergedState[drugId] = {
          ...drug,
          configDetail: { ...drug.configDetail, doSplit: false, doCompare: false },
        };
        return mergedState;
      }, { ...state });
      currentCompare[action.selectedDrug] = { ...currentCompare[action.selectedDrug], configDetail: { ...currentCompare[action.selectedDrug].configDetail, doCompare: true } }
      return currentCompare;
    }

    case 'ADD_TO_MYFDDRUGS': {
      // adds flattened array of drug objects and converts to hash list, configDetail is added or updated
      if (action.addItems) {
        let initialState = {};
        if (!action.doClear) {
          initialState = { ...state };
        }
        return action.addItems.reduce((mergedState, drug) => {
          const { drugId } = drug;
          mergedState[drugId] = {
            ...drug,
            isSelected: false,
            configDetail: drug.configDetail ? { ...drug.configDetail, dosesPerDay: 1 } : { ...defaultConfigDetail, drugId }
          };
          return mergedState;
        }, initialState);
      }
      else {
        return state;
      }
    }

    case 'LOAD_MYFDDRUGS': {
      // replaces current drug list with hashed drug list, assumes this is loaded from storage and has configDetail in place already
      return action.addItems;
    }
    default:
      return state
  }
}

export const myDrugs = (state = {}, action) => {
  switch (action.type) {
    case 'CLEAR_MYDRUGS': {
      return {};
    }
    case 'DELETE_FROM_MYDRUGS': {
      let newState = { ...state };
      delete newState[action.drugId];
      console.log('reducer executed DELETE_FROM_MYDRUGS');
      return newState;
    }

    case 'TOGGLE_SELECTED_DRUG': {
      const indexOld = findKey(state, { isSelected: true });
      let newState = { ...state };
      if (indexOld && indexOld != action.newDrugId) {
        newState[indexOld] = { ...newState[indexOld], isSelected: false };
      }
      newState[action.newDrugId] = { ...newState[action.newDrugId], isSelected: !(state[action.newDrugId].isSelected) };
      return newState;
    }

    case 'UPDATE_DOSAGE': {
      let newState = { ...state };
      const { newDrug, selectedDrugId } = action;
      delete newState[selectedDrugId];
      return newDrug.reduce((mergedState, drug) => {
        const { drugId } = drug;
        mergedState[drugId] = {
          ...drug,
          isSelected: false,
          configDetail: drug.configDetail ? { ...drug.configDetail, dosesPerDay: 1 } : { ...defaultConfigDetail, drugId }
        };
        return mergedState;
      }, { ...newState });
    }

    case 'UPDATE_MODE': {
      const { isAcute, numEpisodes, episodeDays, dosesPerDay, drugId } = action;
      if (drugId) {
        return {
          ...state,
          [drugId]: {
            ...state[drugId],
            configDetail: {
              ...state[drugId].configDetail,
              isAcute,
              numEpisodes,
              episodeDays,
              dosesPerDay
            }
          }
        };
      }
      else
        return state;
    }

    case 'CLEAR_OPTIMIZATION': {
      let currentSplitOrCompare = filter(state, ((s) => s.configDetail.doCompare || s.configDetail.doSplit));
      return currentSplitOrCompare.reduce((mergedState, drug) => {
        const { drugId } = drug;
        mergedState[drugId] = {
          ...drug,
          configDetail: { ...drug.configDetail, doSplit: false, doCompare: false }
        };
        return mergedState;
      }, { ...state });
    }

    case 'UPDATE_SPLIT': {
      let currentSplit = filter(state, ((s) => s.configDetail.doCompare || s.configDetail.doSplit));
      currentSplit = currentSplit.reduce((mergedState, drug) => {
        const { drugId } = drug;
        mergedState[drugId] = {
          ...drug,
          configDetail: { ...drug.configDetail, doSplit: false, doCompare: false },
        };
        return mergedState;
      }, { ...state });
      currentSplit[action.selectedDrug] = { ...currentSplit[action.selectedDrug], configDetail: { ...currentSplit[action.selectedDrug].configDetail, doSplit: true } }
      return currentSplit;
    }

    case 'UPDATE_COMPARE': {
      let currentCompare = filter(state, ((s) => s.configDetail.doCompare || s.configDetail.doSplit));
      currentCompare = currentCompare.reduce((mergedState, drug) => {
        const { drugId } = drug;
        mergedState[drugId] = {
          ...drug,
          configDetail: { ...drug.configDetail, doSplit: false, doCompare: false },
        };
        return mergedState;
      }, { ...state });
      currentCompare[action.selectedDrug] = { ...currentCompare[action.selectedDrug], configDetail: { ...currentCompare[action.selectedDrug].configDetail, doCompare: true } }
      return currentCompare;
    }

    case 'ADD_TO_MYDRUGS': {
      // adds flattened array of drug objects and converts to hash list, configDetail is added or updated
      if (action.addItems) {
        let initialState = {};
        if (!action.doClear) {
          initialState = { ...state };
        }
        return action.addItems.reduce((mergedState, drug) => {
          const { drugId } = drug;
          mergedState[drugId] = {
            ...drug,
            isSelected: false,
            configDetail: drug.configDetail ? { ...drug.configDetail, dosesPerDay: 1 } : { ...defaultConfigDetail, drugId }
          };
          return mergedState;
        }, initialState);
      }
      else {
        return state;
      }
    }

    case 'LOAD_MYDRUGS': {
      // clears current drug list and adds flattened array of drug objects and converts to hash list, configDetail is added
      if (action.addItems) {
        return action.addItems.reduce((mergedState, drug) => {
          const { drugId } = drug;
          mergedState[drugId] = {
            ...drug,
            isSelected: false,
            configDetail: drug.configDetail ? { ...drug.configDetail, dosesPerDay: 1 } : { ...defaultConfigDetail, drugId }
          };
          return mergedState;
        }, {});
      }
      else {
        return state;
      }
    }

    default:
      return state
  }
}

const rootReducer = combineReducers({
  // searchTerm, searchResults, findResults, flowState, myDrugs, myFDDrugs, myPlans, myFDPlans, visibility, platform, profile, content, nav: navReducer
  searchTerm, searchResults, findResults, flowState, myDrugs, myFDDrugs, myPlans, myFDPlans, visibility, platform, profile, content, comparePlans
});

export default rootReducer;
