import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Square, Volume2, VolumeX, Settings, 
  Trash2, Sliders, Cpu, Save, FolderOpen, 
  Download, Activity, ArrowRight, Minus, Plus
} from 'lucide-react';

// Instrumentos y sus colores
const INSTRUMENTS = [
  { id: 'BD', name: 'KICK', color: 'bg-rose-500', shadow: 'shadow-rose-500/50' },
  { id: 'SD', name: 'SNARE', color: 'bg-amber-500', shadow: 'shadow-amber-500/50' },
  { id: 'CP', name: 'CLAP', color: 'bg-orange-400', shadow: 'shadow-orange-400/50' },
  { id: 'CH', name: 'C. HAT', color: 'bg-yellow-400', shadow: 'shadow-yellow-400/50' },
  { id: 'OH', name: 'O. HAT', color: 'bg-lime-400', shadow: 'shadow-lime-400/50' },
  { id: 'TM', name: 'TOM', color: 'bg-cyan-400', shadow: 'shadow-cyan-400/50' },
  { id: 'CB', name: 'COWBELL', color: 'bg-indigo-400', shadow: 'shadow-indigo-400/50' }
];

const PRESETS = {
  vacio: {
    name: 'Vacío',
    grid: {
      BD: Array(16).fill(0), SD: Array(16).fill(0), CP: Array(16).fill(0),
      CH: Array(16).fill(0), OH: Array(16).fill(0), TM: Array(16).fill(0), CB: Array(16).fill(0)
    }
  },
  house: {
    name: 'Classic House',
    grid: {
      BD: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      SD: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      CP: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      CH: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      OH: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      TM: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      CB: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  trap: {
    name: 'Trap Bouncer',
    grid: {
      BD: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
      SD: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      CP: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      CH: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      OH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      TM: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      CB: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  reggaeton: {
    name: 'Dembow',
    grid: {
      BD: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      SD: [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
      CP: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      CH: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      OH: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      TM: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      CB: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  }
};

export default function RhythmStudio() {
  // Estado Principal
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [swing, setSwing] = useState(0); // 0 a 0.5
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [activeStep, setActiveStep] = useState(-1);
  const [currentPreset, setCurrentPreset] = useState('vacio');
  const [showSettings, setShowSettings] = useState(false);

  // Estado de la Cuadrícula
  const [drumGrid, setDrumGrid] = useState(PRESETS.vacio.grid);

  // Mixer
  const [volumes, setVolumes] = useState({
    BD: 0.9, SD: 0.8, CP: 0.7, CH: 0.6, OH: 0.6, TM: 0.8, CB: 0.5
  });
  const [mutes, setMutes] = useState({
    BD: false, SD: false, CP: false, CH: false, OH: false, TM: false, CB: false
  });

  // Referencias de Web Audio
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const noiseBufferRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Referencias mutables para el secuenciador
  const drumGridRef = useRef(drumGrid);
  const tempoRef = useRef(tempo);
  const swingRef = useRef(swing);
  const volumesRef = useRef(volumes);
  const mutesRef = useRef(mutes);
  
  // Sincronizar referencias
  useEffect(() => { drumGridRef.current = drumGrid; }, [drumGrid]);
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);
  useEffect(() => { swingRef.current = swing; }, [swing]);
  useEffect(() => { volumesRef.current = volumes; }, [volumes]);
  useEffect(() => { mutesRef.current = mutes; }, [mutes]);

  // Scheduler Refs
  const nextStepTimeRef = useRef(0.0);
  const currentStepRef = useRef(0);
  const scheduleAheadTime = 0.1;
  const lookahead = 25.0;
  const timerIdRef = useRef(null);

  // Inicialización de Audio
  const initAudio = () => {
    if (!audioCtxRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        
        // Crear Buffer de Ruido (para Snare, Clap, Hats)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        noiseBufferRef.current = buffer;

        // Analizador
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);
        masterGain.connect(analyser);
        analyser.connect(ctx.destination);
        
        masterGainRef.current = masterGain;

      } catch (e) {
        console.error("Error al inicializar audio:", e);
      }
    }
    
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(masterVolume, audioCtxRef.current.currentTime, 0.05);
    }
  }, [masterVolume]);

  // Cargar estado de LocalStorage
  useEffect(() => {
    const savedState = localStorage.getItem('rhythm_studio_state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.grid) setDrumGrid(state.grid);
        if (state.tempo) setTempo(state.tempo);
        if (state.volumes) setVolumes(state.volumes);
      } catch (e) {}
    }
  }, []);

  // Guardar estado en LocalStorage
  const saveStateLocally = () => {
    const state = { grid: drumGrid, tempo, volumes };
    localStorage.setItem('rhythm_studio_state', JSON.stringify(state));
  };

  // --- SÍNTESIS DE INSTRUMENTOS ---
  const playInstrument = (inst, time) => {
    if (mutesRef.current[inst]) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    const vol = volumesRef.current[inst];
    const instGain = ctx.createGain();
    instGain.gain.setValueAtTime(vol, time);
    instGain.connect(masterGainRef.current);

    if (inst === 'BD') {
      // KICK (BOMBO)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(instGain);

      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.1);
      gain.gain.setValueAtTime(1.0, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
      osc.start(time);
      osc.stop(time + 0.5);

    } else if (inst === 'SD') {
      // SNARE (CAJA)
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBufferRef.current;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1000;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(instGain);

      const toneOsc = ctx.createOscillator();
      toneOsc.type = 'triangle';
      toneOsc.frequency.setValueAtTime(180, time);
      const toneGain = ctx.createGain();
      toneGain.gain.setValueAtTime(0.5, time);
      toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      
      toneOsc.connect(toneGain);
      toneGain.connect(instGain);

      noiseSource.start(time);
      noiseSource.stop(time + 0.2);
      toneOsc.start(time);
      toneOsc.stop(time + 0.1);

    } else if (inst === 'CP') {
      // CLAP (PALMAS) - Simulamos 3 clicks seguidos
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.5;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.setValueAtTime(1, time + 0.01);
      gain.gain.setValueAtTime(0, time + 0.02);
      gain.gain.setValueAtTime(1, time + 0.03);
      gain.gain.setValueAtTime(0, time + 0.04);
      gain.gain.setValueAtTime(1, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBufferRef.current;
      
      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(instGain);
      
      noiseSource.start(time);
      noiseSource.stop(time + 0.3);

    } else if (inst === 'CH' || inst === 'OH') {
      // HI-HAT (CERRADO Y ABIERTO)
      const source = ctx.createBufferSource();
      source.buffer = noiseBufferRef.current;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, time);
      const gain = ctx.createGain();
      
      const isClosed = inst === 'CH';
      const decay = isClosed ? 0.05 : 0.4;
      
      gain.gain.setValueAtTime(0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(instGain);
      
      source.start(time);
      source.stop(time + decay);

    } else if (inst === 'TM') {
      // TOM
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(instGain);

      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.15);
      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
      osc.start(time);
      osc.stop(time + 0.4);

    } else if (inst === 'CB') {
      // COWBELL (CENCERRO)
      const osc1 = ctx.createOscillator();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(540, time);
      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(800, time);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(860, time);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(instGain);
      
      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 0.2);
      osc2.stop(time + 0.2);
    }
  };

  // --- SCHEDULER ---
  const scheduleNextStep = (step, baseTime) => {
    const currentGrid = drumGridRef.current;
    
    // Aplicar Swing: si es un paso impar (1, 3, 5) lo retrasamos
    let time = baseTime;
    if (step % 2 !== 0) {
      const secondsPerBeat = 60.0 / tempoRef.current;
      const stepDuration = secondsPerBeat / 4;
      time += stepDuration * swingRef.current;
    }

    Object.keys(currentGrid).forEach(inst => {
      if (currentGrid[inst][step]) {
        playInstrument(inst, time);
      }
    });
  };

  const scheduler = useCallback(() => {
    if (!audioCtxRef.current) return;

    while (nextStepTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      scheduleNextStep(currentStepRef.current, nextStepTimeRef.current);
      
      const secondsPerBeat = 60.0 / tempoRef.current;
      const stepDuration = secondsPerBeat / 4; 
      
      nextStepTimeRef.current += stepDuration;
      
      const scheduledStep = currentStepRef.current;
      setTimeout(() => setActiveStep(scheduledStep), 0);

      currentStepRef.current = (currentStepRef.current + 1) % 16;
    }
    
    timerIdRef.current = setTimeout(scheduler, lookahead);
  }, []);

  const togglePlay = () => {
    initAudio();
    if (isPlaying) {
      clearTimeout(timerIdRef.current);
      setIsPlaying(false);
      setActiveStep(-1);
    } else {
      setIsPlaying(true);
      currentStepRef.current = 0;
      nextStepTimeRef.current = audioCtxRef.current.currentTime + 0.05;
      scheduler();
    }
  };

  // Interacción UI
  const toggleStep = (inst, index) => {
    initAudio();
    setDrumGrid(prev => {
      const copy = { ...prev };
      const row = [...copy[inst]];
      row[index] = row[index] ? 0 : 1;
      copy[inst] = row;
      return copy;
    });
  };

  const loadPreset = (presetKey) => {
    setCurrentPreset(presetKey);
    setDrumGrid(PRESETS[presetKey].grid);
  };

  const clearGrid = () => loadPreset('vacio');

  // Visualizador Espectro Básico
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight || 80;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i];
          const percent = barHeight / 255;
          ctx.fillStyle = `rgba(16, 185, 129, ${percent + 0.2})`;
          ctx.fillRect(x, height - (barHeight * (height / 255)), barWidth - 1, barHeight * (height / 255));
          x += barWidth;
        }
      } else {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* HEADER */}
      <header className="border-b border-slate-900 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-amber-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Rhythm Studio
            </h1>
            <p className="text-xs text-slate-400">Drum Machine 808 Avanzada</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => saveStateLocally()} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors" title="Guardar Patrón en el Navegador">
            <Save className="w-4 h-4" />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors" title="Mixer & Ajustes">
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2 sm:p-4 flex flex-col gap-4">
        
        {/* Controles Principales */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between shadow-lg">
          
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <button
              onClick={togglePlay}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isPlaying ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
              }`}
            >
              {isPlaying ? <Square className="w-6 h-6 fill-white text-white" /> : <Play className="w-6 h-6 fill-white text-white ml-1" />}
            </button>

            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tempo (BPM)</span>
                <span className="text-sm font-mono text-white font-bold">{tempo}</span>
              </div>
              <input 
                type="range" min="60" max="180" step="1" value={tempo} 
                onChange={(e) => setTempo(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 rounded-lg bg-slate-800"
              />
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-[200px]">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Swing / Groove</span>
                <span className="text-[10px] font-mono text-white">{Math.round(swing * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="0.5" step="0.05" value={swing} 
                onChange={(e) => setSwing(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 rounded-lg bg-slate-800"
              />
          </div>

        </div>

        {/* Panel de Ajustes / Mixer */}
        {showSettings && (
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 shadow-inner">
            {INSTRUMENTS.map(inst => (
              <div key={inst.id} className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                <span className={`text-[10px] font-bold font-mono tracking-widest ${inst.color.replace('bg-', 'text-')}`}>{inst.name}</span>
                <button 
                  onClick={() => setMutes(prev => ({...prev, [inst.id]: !prev[inst.id]}))}
                  className={`p-1.5 rounded-lg transition-colors ${mutes[inst.id] ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-400'}`}
                >
                  {mutes[inst.id] ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <div className="flex items-center w-full gap-2 mt-1">
                  <VolumeX className="w-3 h-3 text-slate-600" />
                  <input 
                    type="range" min="0" max="1" step="0.05" value={volumes[inst.id]} 
                    onChange={(e) => setVolumes(prev => ({...prev, [inst.id]: parseFloat(e.target.value)}))}
                    className={`w-full accent-${inst.color.replace('bg-', '')} h-1`} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visualizador Main */}
        <div className="relative bg-slate-900 rounded-2xl border border-slate-800/80 overflow-hidden h-16 flex flex-col justify-end p-2 shadow-inner hidden sm:flex">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* CONTENEDOR DEL SECUENCIADOR */}
        <div className="bg-slate-900 p-2 sm:p-5 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col gap-3">
          
          {/* Opciones Superiores de la Cuadrícula */}
          <div className="flex justify-between items-center px-1 pb-2 border-b border-slate-800/60 mb-1">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {Object.keys(PRESETS).map(key => (
                <button 
                  key={key}
                  onClick={() => loadPreset(key)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
                    currentPreset === key ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {PRESETS[key].name}
                </button>
              ))}
            </div>
            <button onClick={clearGrid} className="ml-2 p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Cuadrícula (Scrollable horizontal en móviles pequeños) */}
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[600px] flex flex-col gap-1.5 pt-1">
              {INSTRUMENTS.map((inst) => (
                <div key={inst.id} className="flex items-center gap-2">
                  {/* Label del Instrumento */}
                  <div 
                    className={`w-14 sm:w-20 shrink-0 h-10 sm:h-12 rounded-xl border border-slate-800 flex items-center justify-center font-mono font-bold text-[9px] sm:text-[11px] select-none cursor-pointer hover:brightness-125 transition-all ${
                      mutes[inst.id] ? 'opacity-30 bg-slate-900 text-slate-600' : `${inst.color} text-slate-950`
                    }`}
                    onClick={() => { initAudio(); playInstrument(inst.id, audioCtxRef.current?.currentTime || 0); }}
                  >
                    {inst.id}
                  </div>
                  
                  {/* Fila de 16 pasos */}
                  <div className="grid grid-cols-16 gap-1 flex-1">
                    {drumGrid[inst.id].map((val, step) => {
                      const isActive = val === 1;
                      const isPlayhead = activeStep === step;
                      // Resaltar el inicio de cada tiempo (beat)
                      const isBeatStart = step % 4 === 0;

                      return (
                        <button
                          key={step}
                          onClick={() => toggleStep(inst.id, step)}
                          className={`h-10 sm:h-12 rounded-lg sm:rounded-xl border transition-all ${
                            isActive 
                              ? `${inst.color} border-transparent shadow-lg ${inst.shadow} scale-105 z-10` 
                              : `bg-slate-900 hover:bg-slate-800 ${isBeatStart ? 'border-slate-700' : 'border-slate-800/60'}`
                          } ${isPlayhead ? 'ring-2 ring-white/50 brightness-150' : ''}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Playhead Indicator (Abajo) */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-14 sm:w-20 shrink-0" />
                <div className="grid grid-cols-16 gap-1 flex-1">
                  {Array.from({ length: 16 }).map((_, step) => (
                    <div key={step} className="flex justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeStep === step ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-150' : 'bg-slate-800'}`} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .grid-cols-16 { grid-template-columns: repeat(16, minmax(0, 1fr)); }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 8px; }
      `}} />
    </div>
  );
}
