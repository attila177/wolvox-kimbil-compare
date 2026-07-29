import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { createStore } from "redux";
import { rootReducer } from "./reducers/reducer";
import { Provider } from 'react-redux';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const store = createStore(rootReducer);
  const root = createRoot(document.getElementById('root'));
  root.render(<Provider store={store}><App /></Provider>, div);
  root.unmountComponentAtNode(div);
});
