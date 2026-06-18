import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import App from './App';
import './styles/index.css';
import { CollectionsProvider } from './store/CollectionsProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CollectionsProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </CollectionsProvider>
  </React.StrictMode>,
);
