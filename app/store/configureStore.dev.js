import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware, routerActions } from 'react-router-redux';
import { autoMergeNameSpaces } from 'redux-dusk';
import { storage, persistReducer, persistStore } from 'redux-persist';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers';
import * as counterActions from '../actions/counter';
import type { counterStateType } from '../reducers/types';
import { combinedReducer } from '../handlers';

const history = createHashHistory();

const configureStore = (initialState?: counterStateType) => {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Thunk Middleware
  middleware.push(thunk);

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger);
  }

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // Redux DevTools Configuration
  // const actionCreators = {
  //   ...counterActions,
  //   ...routerActions
  // };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://extension.remotedev.io/docs/API/Arguments.html
        // actionCreators
      })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Persisting Config with redux-persist
  const persistConfig = {
    key: 'appNameGoesHere',
    storage,
    stateReconciler: autoMergeNameSpaces,
    debug: false,
  };

  const persistedReducer = persistReducer(persistConfig, combinedReducer);

  // Create Store
  const store = createStore(persistedReducer, enhancer);
  const persistor = persistStore(store);

  if (module.hot) {
    module.hot.accept(() => {
      // This fetch the new state of the above reducers.
      const { combinedReducer: nextRootReducer } = require('../handlers'); /* eslint-disable-line global-require */
      const nextPersistedReducer = persistReducer(persistConfig, nextRootReducer);
      store.replaceReducer(nextPersistedReducer);
    });
  }

  return { store, persistor };
};

export default { configureStore, history };
