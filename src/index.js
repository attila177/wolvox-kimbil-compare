import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { createStore } from "redux";
import { rootReducer } from "./reducers/reducer";
import { Provider } from 'react-redux';

const store = createStore(rootReducer);

const root = createRoot(document.getElementById('root'));
root.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
