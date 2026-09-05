'use client';

import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

export default function LegacyElectionApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}