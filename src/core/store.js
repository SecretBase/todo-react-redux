import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';
import createSagaMiddleware from 'redux-saga';
import mySaga from '../sagas';

export default (initialState = {}) => {

	const sagaMiddleware = createSagaMiddleware();
  let middleware = applyMiddleware(thunk, sagaMiddleware);

  if (process.env.NODE_ENV !== 'production') {
    // configure redux-devtools-extension
    // @see https://github.com/zalmoxisus/redux-devtools-extension
    const devToolsExtension = window.devToolsExtension;
    if (typeof devToolsExtension === 'function') {
      middleware = compose(middleware, devToolsExtension());
    }
  }

  const store = createStore(reducers, initialState, middleware);

  sagaMiddleware.run(mySaga, [store.getState]);

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(require('./reducers').default);
    });
  }

  return store;
};
