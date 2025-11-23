import React from 'react';
import { GUIDE_SECTIONS } from '../constants';
import { Category, Section } from '../types';

interface SidebarProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelectSection, isOpen, toggleSidebar }) => {
  // Group by category
  const categories = Object.values(Category);
  const groupedSections: Record<string, Section[]> = {};
  
  GUIDE_SECTIONS.forEach(section => {
    if (!groupedSections[section.category]) {
      groupedSections[section.category] = [];
    }
    groupedSections[section.category].push(section);
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-[#202531] border-r border-[#191d26] transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block flex flex-col
        `}
      >
        <div className="p-6 border-b border-[#191d26] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#478cbf] rounded flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-[#e0e0e0] tracking-tight">Juice Guide</h1>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map(category => (
            groupedSections[category] && (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  {category}
                </h3>
                <ul className="space-y-1">
                  {groupedSections[category].map(section => (
                    <li key={section.id}>
                      <button
                        onClick={() => {
                          onSelectSection(section.id);
                          if (window.innerWidth < 768) toggleSidebar();
                        }}
                        className={`
                          w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200
                          ${activeSection === section.id 
                            ? 'bg-[#478cbf]/10 text-[#478cbf] border-l-2 border-[#478cbf]' 
                            : 'text-gray-400 hover:text-white hover:bg-[#2d3342]'}
                        `}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </nav>

        <div className="p-4 border-t border-[#191d26]">
          <div className="text-xs text-gray-600 text-center">
            Designed for Godot 4.5+
            <br />
            Make it juicy.
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;