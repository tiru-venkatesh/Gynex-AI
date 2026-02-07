import React from 'react';
import { 
  Plus, 
  Search, 
  Compass, 
  Library, 
  Settings, 
  Menu,
  PanelLeftClose,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface SidebarProps {
  onNewThread: () => void;
}

export function Sidebar({ onNewThread }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <aside 
      className={`
        flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-[#f9f9f9] dark:bg-[#191a1a] 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16 items-center' : 'w-60'}
      `}
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-['Instrument_Serif'] text-3xl font-bold tracking-tight">
            <span className="text-gray-900 dark:text-white">img</span>
            <span className="text-emerald-600">2xl</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
        >
          {isCollapsed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <div className="px-3 py-2">
        <button 
          onClick={onNewThread}
          className={`
            flex items-center gap-3 w-full p-3 rounded-full border border-gray-200 dark:border-gray-700 
            bg-white dark:bg-transparent hover:border-gray-300 dark:hover:border-gray-600 
            hover:shadow-sm transition-all text-sm font-medium
            ${isCollapsed ? 'justify-center px-0' : ''}
          `}
        >
          <Plus size={20} className="text-gray-500" />
          {!isCollapsed && <span>New Thread</span>}
          {!isCollapsed && (
            <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
              <span className="border border-gray-200 dark:border-gray-700 rounded px-1 min-w-[20px] text-center">Ctrl</span>
              <span className="border border-gray-200 dark:border-gray-700 rounded px-1 min-w-[20px] text-center">I</span>
            </div>
          )}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem icon={<Search size={20} />} label="Home" active isCollapsed={isCollapsed} />
        <NavItem icon={<Compass size={20} />} label="Discover" isCollapsed={isCollapsed} />
        <NavItem icon={<Library size={20} />} label="Library" isCollapsed={isCollapsed} />
        
        {!isCollapsed && (
          <div className="pt-6 pb-2">
            <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">History</div>
            <div className="space-y-1">
              {['Invoice extraction #204', 'Q3 Financial Report', 'Receipt scan analysis', 'Table to CSV conversion'].map((item, i) => (
                <button key={i} className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg truncate transition-colors">
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="px-3 py-4 mt-auto space-y-1 border-t border-gray-200 dark:border-gray-800">
         <NavItem icon={<Settings size={20} />} label="Settings" isCollapsed={isCollapsed} />
         <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`
            flex items-center gap-3 w-full p-2.5 rounded-lg text-sm font-medium transition-colors
            text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false, isCollapsed }: { icon: React.ReactNode, label: string, active?: boolean, isCollapsed: boolean }) {
  return (
    <button 
      className={`
        flex items-center gap-3 w-full p-2.5 rounded-lg text-sm font-medium transition-colors
        ${active 
          ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
    >
      <span className={active ? "text-emerald-600 dark:text-emerald-400" : ""}>{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </button>
  );
}
