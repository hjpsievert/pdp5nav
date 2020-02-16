import { createStore } from 'redux';
//import createReducers from './../components/reducers';
import rootReducer from './Reducers';

const defaultState = {
  platform: {},
  flowState: {},
  visibility: {},
  searchTerm: '',
  searchResults: [],
  findResults: [],
  myDrugs: {},
  myFDDrugs: {},
  myPlans: {},
  myFDPlans: {},
  profile: {},
  content: [],
  comparePlans: [],
};

export default function configureStore(initialState = defaultState) {
  const store = createStore(rootReducer, initialState);

  return store;
}