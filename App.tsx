import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { TreeState } from './types';
import { Sparkles, Play, Minimize2 } from 'lucide-react';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);
  const [audioStarted, setAudioStarted] = useState(false);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
    );
    
    if (!audioStarted) {
      setAudioStarted(true);
      // In a real app, play background music here
    }
  };

  return (
    <div className="w-full h-screen relative bg-black text-white overflow-hidden font-sans">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Scene treeState={treeState} />
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="flex flex-col items-start space-y-2 pointer-events-auto">
          <div className="flex items-center space-x-2 opacity-80">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-xs tracking-[0.3em] uppercase text-yellow-500/80">Signature Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ fontFamily: 'Cinzel, serif' }}>
            ARIX
          </h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-yellow-500 to-transparent"></div>
        </header>

        {/* Center Prompt (Only visible if scattered initially) */}
        {treeState === TreeState.SCATTERED && !audioStarted && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto cursor-pointer group" onClick={toggleState}>
              <div className="p-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-all duration-700 group-hover:scale-110">
                <Play className="w-8 h-8 text-yellow-400 fill-yellow-400 opacity-80" />
              </div>
              <p className="mt-4 text-sm tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity">Assemble The Spirit</p>
           </div>
        )}

        {/* Footer / Controls */}
        <footer className="flex flex-row items-end justify-between pointer-events-auto">
          <div className="max-w-xs text-xs text-gray-400 leading-relaxed hidden md:block">
            <p>Experience the convergence of digital art and holiday spirit.</p>
            <p className="mt-2 opacity-50">© 2024 Arix Design Systems.</p>
          </div>

          <div className="flex flex-col items-end space-y-4">
             {/* State Toggle Button */}
            <button 
              onClick={toggleState}
              className="group relative px-8 py-3 bg-gradient-to-r from-emerald-900/80 to-black/80 border border-emerald-500/30 backdrop-blur-md rounded-sm overflow-hidden transition-all duration-300 hover:border-yellow-500/50"
            >
              <div className="absolute inset-0 w-0 bg-white/5 transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
              <span className="relative flex items-center space-x-3 text-sm tracking-widest uppercase text-yellow-50">
                {treeState === TreeState.SCATTERED ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Converge</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Disperse</span>
                  </>
                )}
              </span>
            </button>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
               <div className={`w-1.5 h-1.5 rounded-full ${treeState === TreeState.TREE_SHAPE ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500 shadow-[0_0_10px_#eab308]'}`}></div>
               <span className="text-[10px] uppercase tracking-widest text-white/40">
                 System: {treeState === TreeState.TREE_SHAPE ? 'Coherent' : 'Entropy'}
               </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;