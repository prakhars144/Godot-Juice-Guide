
import React, { useState, useEffect, useRef } from 'react';

interface JuiceDemoProps {
  type: 'intro' | 'squash' | 'shake' | 'particles' | 'flash' | 'persistence' | 'audio' | 'coyote' | 'hitstop' | 'buffer' | 'ghost' | 'text' | 'lookahead' | 'tilt' | 'shockwave' | 'ui' | 'none';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface FloatingText {
    id: number;
    text: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    scale: number;
}

interface Wave {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
}

const JuiceDemo: React.FC<JuiceDemoProps> = ({ type }) => {
  const [active, setActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [decals, setDecals] = useState<{id:number, x:number, y:number, r:number, s:number}[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [waves, setWaves] = useState<Wave[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  
  // Screenshake state
  const [shake, setShake] = useState({ x: 0, y: 0, rot: 0 });
  
  // Intro Demo State
  const [introJuiceEnabled, setIntroJuiceEnabled] = useState(false);

  // Platformer State (Coyote & Buffer)
  const [coyoteGrounded, setCoyoteGrounded] = useState(true);
  const [coyoteTimer, setCoyoteTimer] = useState(0);
  const [bufferTimer, setBufferTimer] = useState(0); // For Buffer Demo
  const [playerY, setPlayerY] = useState(0);
  const [platformX, setPlatformX] = useState(0);
  const [playerVelY, setPlayerVelY] = useState(0);
  const [lastJumpTime, setLastJumpTime] = useState(0); // Visual feedback

  // Ghost Trail State
  const [ghostX, setGhostX] = useState(0);
  const [ghostDir, setGhostDir] = useState(1);
  const [ghosts, setGhosts] = useState<{id:number, x:number, alpha:number}[]>([]);

  // Hitstop State
  const [hitstopActive, setHitstopActive] = useState(false);
  const [hitstopAngle, setHitstopAngle] = useState(0);

  // Lookahead State
  const [lookPlayerX, setLookPlayerX] = useState(0);
  const [lookCamX, setLookCamX] = useState(0);
  const [lookDir, setLookDir] = useState(1);

  // Tilt State
  const [tiltX, setTiltX] = useState(0);
  const [tiltDir, setTiltDir] = useState(1);
  const [tiltRot, setTiltRot] = useState(0);

  // UI State
  const [uiBtnScale, setUiBtnScale] = useState(1.0);

  // --- Reset on Type Change ---
  useEffect(() => {
    setActive(false);
    setParticles([]);
    setDecals([]);
    setFloatingTexts([]);
    setGhosts([]);
    setWaves([]);
    setShake({ x: 0, y: 0, rot: 0 });
    setIntroJuiceEnabled(false);
    
    // Reset platformer
    setPlayerY(0);
    setPlatformX(0);
    setPlayerVelY(0);
    setCoyoteGrounded(true);
    setBufferTimer(0);
    setCoyoteTimer(0);

    // Reset Hitstop
    setHitstopActive(false);
    setHitstopAngle(0);

    // Reset Lookahead/Tilt
    setLookPlayerX(0);
    setLookCamX(0);
    setLookDir(1);
    setTiltX(0);
    setTiltDir(1);
    setTiltRot(0);

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, [type]);


  // --- Logic Loops ---

  // Main Trigger Handler (Clicks)
  const trigger = (e?: React.MouseEvent) => {
    if (active && type !== 'particles' && type !== 'text' && type !== 'shockwave') return; 
    setActive(true);

    // Shockwave
    if (type === 'shockwave') {
        let clickX = 50;
        let clickY = 50;
        if (e) {
            const rect = e.currentTarget.getBoundingClientRect();
            clickX = ((e.clientX - rect.left) / rect.width) * 100;
            clickY = ((e.clientY - rect.top) / rect.height) * 100;
        }
        setWaves(prev => [...prev, { id: Date.now(), x: clickX, y: clickY, size: 0, opacity: 1.0 }]);
    }

    // Hitstop Trigger
    if (type === 'hitstop') {
        setHitstopActive(true);
        // Add shake
        let trauma = 1.0;
        const shakeInterval = setInterval(() => {
            trauma -= 0.1;
            setShake({
                x: (Math.random() - 0.5) * 10 * trauma,
                y: (Math.random() - 0.5) * 10 * trauma,
                rot: 0
            });
            if (trauma <= 0) {
                clearInterval(shakeInterval);
                setShake({x:0, y:0, rot:0});
            }
        }, 16);

        setTimeout(() => {
            setHitstopActive(false);
            setActive(false); // Reset active state so user can click again
        }, 200); // 200ms freeze
        return;
    }

    // Standard Screenshake
    if (type === 'shake' || (type === 'intro' && introJuiceEnabled)) {
      let trauma = 1.0;
      const decay = 0.05;
      const shakeLoop = setInterval(() => {
        trauma = Math.max(0, trauma - decay);
        const amount = trauma * trauma;
        setShake({
            x: (Math.random() - 0.5) * 20 * amount,
            y: (Math.random() - 0.5) * 20 * amount,
            rot: (Math.random() - 0.5) * 10 * amount
        });
        if (trauma <= 0) {
            clearInterval(shakeLoop);
            setActive(false);
        }
      }, 16);
    } else if (type !== 'shockwave') {
        setTimeout(() => setActive(false), type === 'flash' ? 100 : 300);
    }

    // Particles
    if (type === 'particles' || (type === 'intro' && introJuiceEnabled)) {
      const count = type === 'intro' ? 8 : 16;
      const newParts = Array.from({ length: count }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        x: 50, y: 50,
        vx: (Math.random() - 0.5) * (type === 'intro' ? 15 : 25),
        vy: (Math.random() - 0.5) * (type === 'intro' ? 15 : 25) - 5,
        life: 1.0,
        color: ['#ff7085', '#478cbf', '#ffe366'][Math.floor(Math.random() * 3)]
      }));
      setParticles(prev => [...prev, ...newParts]);
    }

    // Floating Text
    if (type === 'text') {
        let clickX = 50;
        let clickY = 50;
        
        if (e) {
            const rect = e.currentTarget.getBoundingClientRect();
            clickX = ((e.clientX - rect.left) / rect.width) * 100;
            clickY = ((e.clientY - rect.top) / rect.height) * 100;
        }
        
        const dmg = Math.floor(Math.random() * 80) + 20;
        const isCrit = Math.random() > 0.7;
        
        const newText: FloatingText = {
            id: Date.now(),
            text: isCrit ? `${dmg}!` : `${dmg}`,
            x: clickX,
            y: clickY,
            vx: (Math.random() - 0.5) * 10,
            vy: -15 - Math.random() * 10,
            life: 1.0,
            scale: isCrit ? 1.5 : 1.0
        };
        setFloatingTexts(prev => [...prev, newText]);
    }

    // Decals
    if (type === 'persistence') {
        const newDecal = {
            id: Date.now(),
            x: 50 + (Math.random() - 0.5) * 40,
            y: 80,
            r: Math.random() * 360,
            s: 0.5 + Math.random() * 0.5
        };
        setDecals(prev => [...prev.slice(-15), newDecal]);
    }
  };

  // Particle & Text & Shockwave Loop
  useEffect(() => {
    if (particles.length === 0 && floatingTexts.length === 0 && waves.length === 0) return;
    const interval = setInterval(() => {
      // Particles
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx * 0.5,
        y: p.y + p.vy * 0.5 + 0.5, // Gravity
        life: p.life - 0.02
      })).filter(p => p.life > 0));

      // Floating Text
      setFloatingTexts(prev => prev.map(t => ({
          ...t,
          x: t.x + t.vx * 0.1,
          y: t.y + t.vy * 0.1,
          vy: t.vy + 0.8, // Gravity
          life: t.life - 0.015
      })).filter(t => t.life > 0));

      // Waves
      setWaves(prev => prev.map(w => ({
          ...w,
          size: w.size + 2.5,
          opacity: w.opacity - 0.03
      })).filter(w => w.opacity > 0));

    }, 16);
    return () => clearInterval(interval);
  }, [particles.length, floatingTexts.length, waves.length]);


  // Platformer Physics Loop (Coyote & Buffer)
  useEffect(() => {
    if (type !== 'coyote' && type !== 'buffer') return;
    
    let lastTime = performance.now();
    const animate = (time: number) => {
        const dt = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        if (type === 'coyote') {
            // Moving platform logic
            setPlatformX(prev => {
                const next = prev - 60 * dt; 
                return next < -100 ? 100 : next; 
            });

            setPlayerY(py => {
                const isSupported = platformX > -30;
                if (isSupported) {
                    setCoyoteGrounded(true);
                    setCoyoteTimer(0.15);
                    setPlayerVelY(0);
                    return 0;
                } else {
                    setCoyoteGrounded(false);
                    setCoyoteTimer(t => Math.max(0, t - dt));
                    setPlayerVelY(vy => vy + 980 * dt);
                    return py + playerVelY * dt;
                }
            });
             if (playerY > 200) { setPlayerY(0); setPlatformX(100); setPlayerVelY(0); }

        } else if (type === 'buffer') {
            // Buffer Demo: Player falls, user clicks to jump before land
            
            // Loop player dropping
            setPlayerY(py => {
                let newY = py + playerVelY * dt;
                let newVel = playerVelY + 980 * dt; // Gravity

                // Floor collision (at y=0)
                // We start high up.
                if (newY >= 0) {
                    newY = 0;
                    setCoyoteGrounded(true);
                    
                    // LANDED: Check Buffer
                    if (bufferTimer > 0) {
                        newVel = -500; // AUTO JUMP
                        setBufferTimer(0);
                        setLastJumpTime(Date.now()); // Visual feedback
                        setCoyoteGrounded(false);
                    } else {
                        // Just land
                         if (newVel > 0) {
                             // Reset after short delay to loop the demo
                             if (newVel < 1000) setTimeout(() => {
                                 setPlayerY(-150); setPlayerVelY(0); setCoyoteGrounded(false);
                             }, 500);
                             newVel = 0;
                         }
                    }
                } else {
                    setCoyoteGrounded(false);
                }
                
                setPlayerVelY(newVel);
                return newY;
            });

            // Decay buffer
            setBufferTimer(t => Math.max(0, t - dt));
        }

        requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [type, platformX, playerVelY, playerY, bufferTimer]);


  // Hitstop, Ghost, Lookahead, Tilt Loop
  useEffect(() => {
      if (!['hitstop', 'ghost', 'lookahead', 'tilt'].includes(type)) return;

      let lastTime = performance.now();
      const animate = (time: number) => {
          const dt = (time - lastTime) / 1000;
          lastTime = time;

          if (type === 'hitstop') {
              if (!hitstopActive) {
                  setHitstopAngle(a => (a + 720 * dt) % 360);
              }
          }

          if (type === 'ghost') {
              setGhostX(prev => {
                  let next = prev + ghostDir * 300 * dt;
                  if (next > 100) { setGhostDir(-1); return 100; }
                  if (next < -100) { setGhostDir(1); return -100; }
                  return next;
              });

              // Spawn ghost every few frames
              if (Math.random() < 0.3) {
                  setGhosts(prev => [
                      ...prev, 
                      { id: Date.now(), x: ghostX, alpha: 0.5 }
                  ]);
              }
              // Fade ghosts
              setGhosts(prev => prev.map(g => ({...g, alpha: g.alpha - 2.0 * dt})).filter(g => g.alpha > 0));
          }

          if (type === 'lookahead') {
              // Move player
              let nextPlayerX = lookPlayerX + lookDir * 80 * dt;
              if (nextPlayerX > 60) { setLookDir(-1); nextPlayerX = 60; }
              if (nextPlayerX < -60) { setLookDir(1); nextPlayerX = -60; }
              setLookPlayerX(nextPlayerX);

              // Update Camera (Lerp to target)
              // Target is player position + offset in direction of movement
              const targetCam = nextPlayerX + (lookDir * 60); 
              // Lerp formula: a + (b - a) * speed * dt
              setLookCamX(prev => prev + (targetCam - prev) * 2.0 * dt);
          }

          if (type === 'tilt') {
               // Move tilt character
               let nextTiltX = tiltX + tiltDir * 150 * dt;
               if (nextTiltX > 80) { setTiltDir(-1); nextTiltX = 80; }
               if (nextTiltX < -80) { setTiltDir(1); nextTiltX = -80; }
               setTiltX(nextTiltX);

               // Calculate Tilt Angle (procedural animation)
               // Target angle based on velocity (direction)
               const targetRot = tiltDir * 15;
               setTiltRot(prev => prev + (targetRot - prev) * 10.0 * dt);
          }

          requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current!);
  }, [type, hitstopActive, ghostX, ghostDir, lookPlayerX, lookDir, lookCamX, tiltX, tiltDir]);


  // --- Styles ---

  const getBoxStyle = () => {
    const base = {
        transition: active && type !== 'hitstop' ? 'none' : 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };

    if (type === 'squash' && active) {
        return { ...base, transform: 'scale(1.5, 0.6) translateY(20px)' };
    }
    if (type === 'intro' && introJuiceEnabled && active) {
        return { ...base, transform: 'scale(1.3, 0.8) translateY(10px)' };
    }
    if (type === 'flash' && active) {
        return { ...base, filter: 'brightness(100) drop-shadow(0 0 15px white)' };
    }
    
    return { ...base, transform: 'scale(1)', filter: 'none' };
  };

  const jump = () => {
      // For coyote demo
      if (type === 'coyote') {
          if (coyoteTimer > 0) {
              setPlayerVelY(-500);
              setCoyoteTimer(0);
              const btn = document.getElementById('coyote-player');
              if(btn) {
                  btn.style.backgroundColor = '#fff';
                  setTimeout(() => btn.style.backgroundColor = '#478cbf', 100);
              }
          }
      }
      // For Buffer demo
      if (type === 'buffer') {
          // If on floor, jump immediately
          if (coyoteGrounded) {
             setPlayerVelY(-500);
             setLastJumpTime(Date.now());
          } else {
             // Else buffer it
             setBufferTimer(0.2); // 0.2s buffer window
          }
      }
  };


  // --- Renderers ---

  if (type === 'intro') {
      return (
        <div className="bg-[#14161b] rounded-xl border border-gray-700 p-8 flex flex-col items-center gap-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff7085] via-[#478cbf] to-[#ffe366]"></div>
            
            <div className="flex gap-4 z-10">
                <button 
                    onClick={() => setIntroJuiceEnabled(false)}
                    className={`px-4 py-2 rounded text-sm font-bold transition-all ${!introJuiceEnabled ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                    No Juice
                </button>
                <button 
                    onClick={() => setIntroJuiceEnabled(true)}
                    className={`px-4 py-2 rounded text-sm font-bold transition-all ${introJuiceEnabled ? 'bg-[#478cbf] text-white shadow-[0_0_15px_#478cbf]' : 'bg-gray-800 text-gray-400'}`}
                >
                    Juice Enabled
                </button>
            </div>

            <div className="relative w-64 h-32 bg-[#1e232e] rounded-lg flex items-center justify-center border border-gray-700"
                 style={{
                     transform: introJuiceEnabled ? `translate(${shake.x}px, ${shake.y}px) rotate(${shake.rot}deg)` : 'none'
                 }}
            >
                {introJuiceEnabled && particles.map(p => (
                    <div key={p.id} className="absolute w-2 h-2 bg-white rounded-full" 
                         style={{ 
                             left: `${p.x}%`, top: `${p.y}%`, 
                             opacity: p.life, backgroundColor: p.color 
                         }} 
                    />
                ))}
                
                <button
                    onClick={trigger}
                    style={getBoxStyle()}
                    className={`w-16 h-16 rounded shadow-lg z-10 flex items-center justify-center font-bold text-xs select-none
                        ${introJuiceEnabled ? 'bg-gradient-to-br from-[#478cbf] to-[#3a7ca5] text-white' : 'bg-gray-500 text-gray-300'}
                    `}
                >
                    CLICK
                </button>
            </div>
            <p className="text-gray-500 text-xs">Try clicking the box in both modes.</p>
        </div>
      );
  }

  if (type === 'coyote' || type === 'buffer') {
      const isBuffer = type === 'buffer';
      return (
          <div className="bg-[#14161b] rounded-xl border border-gray-700 h-64 relative overflow-hidden flex flex-col items-center justify-center select-none cursor-pointer"
               onClick={jump}
          >
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1 pointer-events-none">
                  <div className={`text-xs font-bold uppercase ${
                      (isBuffer ? bufferTimer > 0 : coyoteTimer > 0) ? 'text-green-400' : 'text-red-400'
                  }`}>
                      {isBuffer ? 'Buffer Active' : 'Can Jump'}
                  </div>
                  <div className="w-32 h-2 bg-gray-800 rounded overflow-hidden">
                      <div className="h-full bg-green-400 transition-none" 
                           style={{ width: `${((isBuffer ? bufferTimer : coyoteTimer) / (isBuffer ? 0.2 : 0.15)) * 100}%` }}></div>
                  </div>
                  <div className="text-[10px] text-gray-500">{isBuffer ? 'Jump Buffer' : 'Coyote Timer'}</div>
              </div>

              <div className="relative w-full h-full flex items-center justify-center scale-150 pointer-events-none">
                   {/* Floor / Platform */}
                   {isBuffer ? (
                        <div className="absolute w-full h-1 bg-gray-600 top-1/2 mt-4"></div>
                   ) : (
                        <div 
                            className="absolute w-20 h-4 bg-gray-600 top-1/2 left-1/2 rounded-sm"
                            style={{ transform: `translate(-50%, 20px) translateX(${platformX}px)` }}
                        ></div>
                   )}
                   
                   {/* Player */}
                   <div 
                      id="coyote-player"
                      className={`absolute w-8 h-8 rounded shadow-md flex items-center justify-center transition-colors duration-75
                        ${Date.now() - lastJumpTime < 100 ? 'bg-white' : 'bg-[#478cbf]'}
                      `}
                      style={{ 
                          transform: `translate(-50%, -50%) translateX(${0}px) translateY(${playerY}px) rotate(${playerY * 0.5}deg)`
                      }}
                   >
                       <div className="w-1 h-3 bg-black/20 rounded-full mr-1"></div>
                       <div className="w-1 h-3 bg-black/20 rounded-full ml-1"></div>
                   </div>
              </div>
              <div className="absolute bottom-4 text-gray-400 text-xs animate-pulse">
                  {isBuffer ? 'Click while falling to buffer jump!' : 'Click to Jump!'}
              </div>
          </div>
      )
  }

  if (type === 'hitstop') {
      return (
          <div className="bg-[#14161b] rounded-xl border border-gray-700 h-80 relative flex flex-col items-center justify-center gap-4 overflow-hidden">
               <div className="relative"
                    style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}
               >
                   {/* Spinner */}
                   <div className={`w-32 h-4 bg-gray-700 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
                        style={{ transform: `translate(-50%, -50%) rotate(${hitstopAngle}deg)` }}
                   ></div>
                   <div className={`w-4 h-32 bg-gray-700 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
                        style={{ transform: `translate(-50%, -50%) rotate(${hitstopAngle}deg)` }}
                   ></div>
                   
                   {/* Core */}
                   <div className={`w-16 h-16 rounded-full z-10 relative flex items-center justify-center border-4
                       ${hitstopActive ? 'bg-white border-white scale-110' : 'bg-[#202531] border-[#478cbf]'}
                       transition-none
                   `}>
                       <div className="w-4 h-4 bg-[#ff7085] rounded-full"></div>
                   </div>
                   
                   {/* Visual Flash Overlay */}
                   {hitstopActive && <div className="absolute inset-[-100px] bg-white/20 blur-xl rounded-full"></div>}
               </div>

               <button 
                   onClick={trigger}
                   className="mt-12 px-8 py-3 bg-[#ff7085] hover:bg-[#ff8595] text-[#202531] font-bold rounded shadow-lg active:scale-95 transition-transform"
               >
                   HIT IT!
               </button>
               <p className="text-xs text-gray-500">Click to freeze time for 0.2s</p>
          </div>
      )
  }

  if (type === 'ghost') {
      return (
          <div className="bg-[#14161b] rounded-xl border border-gray-700 h-64 relative flex items-center justify-center overflow-hidden">
               {/* Ghosts */}
               {ghosts.map(g => (
                   <div key={g.id} 
                        className="absolute w-12 h-12 bg-[#478cbf] rounded opacity-50 blur-[1px]"
                        style={{ 
                            transform: `translateX(${g.x}px)`,
                            opacity: g.alpha 
                        }}
                   />
               ))}

               {/* Real Player */}
               <div className="w-12 h-12 bg-white rounded shadow-[0_0_15px_#478cbf] z-10 relative"
                    style={{ transform: `translateX(${ghostX}px)` }}
               >
                   <div className="absolute top-2 right-2 w-2 h-2 bg-black/20 rounded-full"></div>
               </div>
               
               <div className="absolute bottom-4 text-xs text-gray-500">Auto-running Dash</div>
          </div>
      )
  }

  if (type === 'audio') {
      return (
          <div className="bg-[#14161b] rounded-xl border border-gray-700 h-64 flex flex-col items-center justify-center gap-6 relative overflow-hidden"
               onClick={() => trigger()}
          >
               <div className="flex items-end gap-1 h-20">
                   {[...Array(10)].map((_, i) => (
                       <div key={i} 
                            className="w-4 bg-[#478cbf] rounded-t transition-all duration-75"
                            style={{ 
                                height: active ? `${Math.random() * 100}%` : '10%',
                                opacity: active ? 1 : 0.3
                            }}
                       ></div>
                   ))}
               </div>
               <div className="flex gap-4">
                   <div className="text-center">
                       <div className="text-xs text-gray-500 uppercase mb-1">Standard</div>
                       <div className="w-16 h-8 bg-gray-800 rounded flex items-center justify-center text-gray-500 text-sm">1.0</div>
                   </div>
                   <div className="text-center">
                       <div className="text-xs text-[#ff7085] uppercase mb-1 font-bold">Randomized</div>
                       <div className="w-16 h-8 bg-gray-800 rounded border border-[#ff7085] flex items-center justify-center text-white text-sm font-mono">
                           {active ? (0.9 + Math.random() * 0.2).toFixed(2) : '-'}
                       </div>
                   </div>
               </div>
               <div className="text-xs text-gray-500">Click to play sound (visualized)</div>
          </div>
      )
  }

  if (type === 'lookahead') {
      return (
          <div className="bg-[#14161b] rounded-xl border border-gray-700 h-64 relative flex items-center justify-center overflow-hidden">
               {/* Background Grid (shifts opposite to camera to simulate camera movement) */}
               <div className="absolute inset-[-50%] opacity-20"
                    style={{ 
                        backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        transform: `translateX(${-lookCamX}px)`
                    }}
               ></div>

               {/* Camera Frame (Visualizer) */}
               <div className="absolute w-64 h-40 border-2 border-[#ff7085] rounded-lg z-20 flex items-start justify-start p-2 pointer-events-none">
                   <span className="bg-[#ff7085] text-black text-[10px] font-bold px-1 rounded">CAMERA VIEW</span>
               </div>
               <div className="absolute top-1/2 left-1/2 w-1 h-2 bg-[#ff7085] -translate-x-1/2 -translate-y-1/2 z-20 opacity-50"></div>

               {/* Player (shifts opposite to camera + player movement) */}
               <div className="w-8 h-8 bg-[#478cbf] rounded shadow-[0_0_15px_#478cbf] z-10 relative flex items-center justify-center"
                    style={{ transform: `translateX(${lookPlayerX - lookCamX}px)` }}
               >
                   <div className="w-6 h-6 border border-white/30 rounded-full"></div>
               </div>
               
               <div className="absolute bottom-4 text-xs text-gray-500 w-full text-center">
                   Red box is camera view. Notice how it leads the player.<br/>
                   <span className="text-[#ff7085]">Camera X: {Math.round(lookCamX)}</span> | <span className="text-[#478cbf]">Player X: {Math.round(lookPlayerX)}</span>
               </div>
          </div>
      )
  }

  if (type === 'tilt') {
      return (
          <div className="bg-[#14161b] rounded-xl border border-gray-700 h-64 relative flex items-center justify-center overflow-hidden">
               {/* Floor */}
               <div className="absolute w-2/3 h-1 bg-gray-700 bottom-16 rounded-full"></div>
               
               {/* Player */}
               <div className="w-16 h-24 bg-[#478cbf] rounded-lg shadow-lg relative flex flex-col items-center origin-bottom transition-transform duration-75"
                    style={{ 
                        transform: `translateX(${tiltX}px) rotate(${tiltRot}deg)` 
                    }}
               >
                   {/* Eyes */}
                   <div className="flex gap-2 mt-4">
                       <div className="w-3 h-3 bg-white rounded-full"></div>
                       <div className="w-3 h-3 bg-white rounded-full"></div>
                   </div>
               </div>

               <div className="absolute bottom-4 text-xs text-gray-500">
                   Sprite rotates based on velocity direction
               </div>
          </div>
      )
  }

  if (type === 'shockwave') {
      return (
          <div className="bg-[#14161b] rounded-xl border border-gray-700 h-64 relative overflow-hidden cursor-pointer group"
               onClick={trigger}
          >
               {/* Background Grid */}
               <div className="absolute inset-0 opacity-20"
                    style={{ 
                        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}
               ></div>
               
               {/* Instructions */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-active:opacity-0 transition-opacity">
                   <span className="text-gray-600 text-sm font-bold uppercase tracking-widest">Click Anywhere</span>
               </div>

               {/* Waves */}
               {waves.map(w => (
                   <div key={w.id} 
                        className="absolute rounded-full border-4 border-white pointer-events-none"
                        style={{ 
                            left: `${w.x}%`, 
                            top: `${w.y}%`,
                            width: `${w.size}px`,
                            height: `${w.size}px`,
                            transform: 'translate(-50%, -50%)',
                            opacity: w.opacity,
                            filter: 'blur(1px)' // Cheap distortion simulation
                        }}
                   />
               ))}
          </div>
      )
  }

  if (type === 'ui') {
      return (
          <div className="bg-[#14161b] rounded-xl border border-gray-700 h-96 flex flex-col items-center justify-center gap-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-[#161920] to-[#202531]"></div>
               
               <div className="z-10 bg-[#191d26] p-6 rounded-2xl shadow-2xl border border-gray-700 w-64 text-center">
                   <h3 className="text-[#478cbf] font-bold text-lg mb-6 uppercase tracking-wider">Pause Menu</h3>
                   
                   <div className="space-y-3">
                       <button 
                           className="w-full py-3 bg-[#478cbf] text-white font-bold rounded-lg shadow-lg relative overflow-hidden"
                           style={{ transform: `scale(${uiBtnScale})` }}
                           onMouseEnter={() => setUiBtnScale(1.05)}
                           onMouseLeave={() => setUiBtnScale(1.0)}
                           onMouseDown={() => setUiBtnScale(0.95)}
                           onMouseUp={() => {
                               setUiBtnScale(1.05);
                               // Simulate click effect
                               const t = document.createElement('div');
                               t.className = 'absolute inset-0 bg-white/20';
                               // In a real app we'd use state, but this is a quick visual hack
                           }}
                       >
                           RESUME
                       </button>
                       
                       <button 
                           className="w-full py-3 bg-[#2a303e] text-gray-400 font-bold rounded-lg hover:bg-[#323949] hover:text-white transition-all hover:scale-105 active:scale-95"
                       >
                           SETTINGS
                       </button>
                       <button 
                           className="w-full py-3 bg-[#2a303e] text-gray-400 font-bold rounded-lg hover:bg-[#323949] hover:text-[#ff7085] transition-all hover:scale-105 active:scale-95"
                       >
                           QUIT
                       </button>
                   </div>
               </div>
               
               <div className="z-10 text-xs text-gray-500">Interact with the menu</div>
          </div>
      )
  }

  // Default Renderer (Squash, Shake, Flash, Particles, Persistence, Text)
  return (
    <div className="w-full h-64 bg-[#14161b] rounded-xl border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden group select-none shadow-inner"
         onClick={type === 'text' ? trigger : undefined}
    >
      <div className="absolute top-2 left-2 text-xs text-gray-500 uppercase font-bold tracking-widest z-20 bg-[#14161b]/80 px-2 py-1 rounded backdrop-blur-sm">
        Demo: <span className="text-[#478cbf]">{type}</span>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{
            transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.rot}deg)`
        }}
      >
        {/* Decals Layer */}
        {decals.map(d => (
            <div key={d.id} className="absolute w-10 h-10 bg-gray-600/50 rounded-full blur-[1px]"
                style={{
                    left: `${d.x}%`, top: `${d.y}%`,
                    transform: `translate(-50%, -50%) rotate(${d.r}deg) scale(${d.s})`,
                }}
            />
        ))}

        {/* Floating Text Layer */}
        {floatingTexts.map(t => (
            <div key={t.id} 
                 className={`absolute font-black pointer-events-none drop-shadow-md ${t.text.includes('!') ? 'text-[#ff7085] text-2xl' : 'text-white text-xl'}`}
                 style={{
                     left: `${t.x}%`, top: `${t.y}%`,
                     opacity: t.life,
                     transform: `translate(-50%, -50%) scale(${t.scale})`
                 }}
            >
                {t.text}
            </div>
        ))}

        {/* The "Player" Box */}
        <button
          onClick={type !== 'text' ? trigger : undefined}
          style={getBoxStyle()}
          className="w-20 h-20 bg-[#478cbf] rounded-lg shadow-[0_0_30px_rgba(71,140,191,0.2)] hover:bg-[#5da2d5] active:bg-[#ff7085] flex items-center justify-center z-10 cursor-pointer focus:outline-none"
        >
          <div className="flex gap-4 pointer-events-none">
              <div className="w-2 h-6 bg-black/30 rounded-full"></div>
              <div className="w-2 h-6 bg-black/30 rounded-full"></div>
          </div>
        </button>

        {/* Particles Layer */}
        {particles.map(p => (
          <div key={p.id} className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              backgroundColor: p.color, opacity: p.life,
              transform: `scale(${p.life})`
            }}
          />
        ))}

        {type !== 'text' && <div className="absolute bottom-12 w-2/3 h-1 bg-gray-700 rounded-full"></div>}
      </div>
      
      <div className="absolute bottom-3 text-gray-600 text-xs">
        {type === 'text' ? 'Click anywhere on box' : 'Click the box to see effect'}
      </div>
    </div>
  );
};

export default JuiceDemo;
