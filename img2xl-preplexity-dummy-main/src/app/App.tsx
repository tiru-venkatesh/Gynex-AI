import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Thread } from './components/Thread';
import { ThemeProvider } from 'next-themes';
import { Menu } from 'lucide-react';
import { useAuth } from "../auth/AuthContext";
import Login from "../pages/Login";


export default function App() {

  const { token } = useAuth();   // ✅ first

  // ✅ Auth Guard
  if (!token) {
    return <Login />;
  }

  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setActiveThread(searchQuery); 
  };

  const handleNewThread = () => {
    setActiveThread(null);
    setQuery('');
    setMobileMenuOpen(false);
  };

  if (!mounted) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex h-screen w-full bg-[#f3f3ee] dark:bg-[#191a1a] text-gray-900 dark:text-gray-100 font-['Inter'] transition-colors duration-200 overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#f9f9f9] dark:bg-[#191a1a] border-b border-gray-200 dark:border-gray-800 flex items-center px-4 z-50">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400"
          >
            <Menu size={24} />
          </button>

          <span className="font-['Instrument_Serif'] text-xl font-bold ml-2">
            <span className="text-gray-900 dark:text-white">img</span>
            <span className="text-emerald-600">2xl</span>
          </span>
        </div>

        {/* Overlay */}
        <div 
          className={`
            fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300
            ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={() => setMobileMenuOpen(false)} 
        />

        {/* Sidebar */}
        <div 
          className={`
            fixed md:relative z-50 h-full transition-transform duration-300 transform
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar onNewThread={handleNewThread} />
        </div>

        {/* Main */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden pt-14 md:pt-0">
          {activeThread ? (
            <Thread query={query} onNewSearch={handleSearch} />
          ) : (
            <MainContent onSearch={handleSearch} />
          )}
        </main>

      </div>
    </ThemeProvider>
  );
}