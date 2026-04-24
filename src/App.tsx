/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ChildProfile from './pages/ChildProfile';
import About from './pages/About';
import { StoreProvider } from './store';
import { InstallPrompt } from './components/InstallPrompt';
import { HelpCircle } from 'lucide-react';

function GlobalLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] to-[#FDFBF7] text-stone-800 font-sans flex items-center justify-center p-0 sm:p-4 md:p-8 print:p-0 print:block print:bg-white">
      <main className="w-full max-w-4xl mx-auto h-[100dvh] sm:h-[850px] bg-white sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border border-stone-100 relative overflow-hidden flex flex-col print:max-w-none print:h-auto print:overflow-visible print:border-none print:shadow-none print:rounded-none">
        
        {/* Global About Button */}
        {!isAboutPage && (
          <Link
            to="/about"
            className="absolute top-4 right-4 z-[100] p-2 rounded-full bg-white/80 backdrop-blur-sm border border-stone-100 shadow-sm hover:bg-white hover:shadow-md transition-all text-stone-400 hover:text-stone-600 active:scale-95 sm:top-6 sm:right-6"
            title="О приложении"
            id="global-about-link"
          >
            <HelpCircle className="w-6 h-6" />
          </Link>
        )}

        {children}
        <InstallPrompt />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <GlobalLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/child/:id" element={<ChildProfile />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </GlobalLayout>
      </Router>
    </StoreProvider>
  );
}
