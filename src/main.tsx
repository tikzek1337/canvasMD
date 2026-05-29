import React from 'react';
import ReactDOM from 'react-dom/client';
import '@xyflow/react/dist/style.css';
import './styles/global.css';
import { CanvasPage } from './pages/CanvasPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CanvasPage />
    </ErrorBoundary>
  </React.StrictMode>
);
