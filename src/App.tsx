/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChildProfile from './pages/ChildProfile';
import { StoreProvider } from './store';
import { InstallPrompt } from './components/InstallPrompt';
import { InstallEngine } from './components/InstallEngine';

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] to-[#FDFBF7] text-stone-800 font-sans flex items-center justify-center p-0 sm:p-4 md:p-8 print:p-0 print:block print:bg-white">
        <main className="w-full max-w-4xl mx-auto h-[100dvh] sm:h-[850px] bg-white sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border border-stone-100 relative overflow-hidden flex flex-col print:max-w-none print:h-auto print:overflow-visible print:border-none print:shadow-none print:rounded-none">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/child/:id" element={<ChildProfile />} />
          </Routes>
          <InstallPrompt />
          <InstallEngine />
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
