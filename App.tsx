import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CodeBlock from './components/CodeBlock';
import JuiceDemo from './components/JuiceDemo';
import MarkdownRenderer from './components/MarkdownRenderer';
import { GUIDE_SECTIONS } from './constants';

const App: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState(GUIDE_SECTIONS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = GUIDE_SECTIONS.find(s => s.id === activeSectionId) || GUIDE_SECTIONS[0];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSectionId]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#161920]">
      <Sidebar 
        activeSection={activeSectionId} 
        onSelectSection={setActiveSectionId}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main className="flex-1 h-full overflow-y-auto relative scroll-smooth">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-[#202531]/95 backdrop-blur border-b border-[#191d26] p-4 flex items-center justify-between shadow-lg">
            <span className="font-bold text-gray-200 truncate pr-4">{activeSection.title}</span>
            <button onClick={toggleSidebar} className="text-[#478cbf] p-1 rounded hover:bg-white/5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </div>

        <div className="max-w-5xl mx-auto p-6 md:p-12 pb-32">
          {/* Section Header */}
          <header className="mb-10 border-b border-gray-800 pb-8">
            <div className="flex items-center space-x-2 text-[#478cbf] mb-3 text-xs md:text-sm font-bold tracking-widest uppercase opacity-80">
                <span>{activeSection.category}</span>
                <span className="text-gray-600">/</span>
                <span>Guide</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              {activeSection.title}
            </h1>
            <div className="flex gap-2">
                <div className="h-1.5 w-16 bg-[#ff7085] rounded-full"></div>
                <div className="h-1.5 w-4 bg-[#478cbf] rounded-full"></div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-10">
            {/* Visual Header (Image or Demo) */}
            <div className="w-full">
                {activeSection.demoType && activeSection.demoType !== 'none' ? (
                    <div className="mb-8 ring-1 ring-white/10 rounded-xl overflow-hidden shadow-2xl bg-[#0f1115]">
                        <JuiceDemo type={activeSection.demoType} />
                        <div className="bg-[#191d26] px-4 py-2 border-t border-gray-800 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Interactive Simulation</span>
                        </div>
                    </div>
                ) : activeSection.imagePlaceholder ? (
                   <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8 shadow-2xl ring-1 ring-white/10 relative group">
                     <div className="absolute inset-0 bg-gradient-to-t from-[#161920] to-transparent opacity-60"></div>
                     <img 
                        src={activeSection.imagePlaceholder} 
                        alt={activeSection.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-[2s] ease-out" 
                     />
                     <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded backdrop-blur-md">
                        Visualization
                     </div>
                   </div>
                ) : null}
            </div>

            {/* Content & Code */}
            <div className="prose prose-invert prose-lg max-w-none">
                <MarkdownRenderer content={activeSection.content} />

                {activeSection.codeSnippet && (
                  <div className="mt-12">
                    <div className="flex items-baseline justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-[#478cbf] text-2xl">#</span> Implementation
                        </h3>
                    </div>
                    <CodeBlock code={activeSection.codeSnippet} />
                  </div>
                )}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="mt-24 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-gray-500 text-sm text-center md:text-left">
                 <p>Godot Engine is a trademark of the Godot Engine leaders.</p>
                 <p className="opacity-50 mt-1">Guide generated for Godot 4.5+</p>
             </div>
             <button 
                onClick={() => {
                    const currIndex = GUIDE_SECTIONS.findIndex(s => s.id === activeSectionId);
                    const nextIndex = (currIndex + 1) % GUIDE_SECTIONS.length;
                    setActiveSectionId(GUIDE_SECTIONS[nextIndex].id);
                }}
                className="group relative px-8 py-4 bg-[#202531] hover:bg-[#478cbf] text-white rounded-xl font-bold transition-all border border-gray-700 hover:border-[#478cbf] shadow-lg hover:shadow-[#478cbf]/20 overflow-hidden"
             >
                 <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                 <span className="flex items-center gap-3 relative z-10">
                    Next Topic
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                 </span>
             </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;