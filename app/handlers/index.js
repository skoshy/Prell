import { combineReducers } from 'redux';
import { setupDusk, getPartFromHandlers } from 'redux-dusk';
import * as App from './App';

const handlers = [
  App,
];

export const {
  nameSpaces,
  types,
  reducers,
  stateMapper,
  actionsMapper,
} = setupDusk(handlers);

export const combinedReducer = combineReducers(reducers);

// we need a combined logic object to pass to set up redux-logic
export const combinedLogic = getPartFromHandlers(handlers, 'logic');
