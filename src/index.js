import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { store } from './app/store'
import { Provider } from 'react-redux'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

const renderApp = () => {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
    ,
    document.getElementById('root')
  );
};

renderApp();