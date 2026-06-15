import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './styles/index.css';
import { CollectionsProvider } from './store/CollectionsProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CollectionsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CollectionsProvider>
  </React.StrictMode>,
);
