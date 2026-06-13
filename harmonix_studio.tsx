import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Music, 
  BookOpen, 
  Sparkles, 
  Play, 
  Square, 
  Volume2, 
  Compass, 
  Check, 
  Layers, 
  ChevronRight, 
  Sliders, 
  Activity, 
  Cpu, 
  Trash2,
  ListFilter,
  ArrowUpDown
} from 'lucide-react';

// ==========================================
// CONSTANTES Y DATOS DE ARMONÍA MUSICAL
// ==========================================

const NOTES_DATA = [
  { note: 'C', name: 'Do', isBlack: false, freq: 261.63, index: 0 },
  { note: 'C#', name: 'Do#', isBlack: true, freq: 277.18, index: 1 },
  { note: 'D', name: 'Re', isBlack: false, freq: 293.66, index: 2 },
  { note: 'D#', name: 'Re#', isBlack: true, freq: 311.13, index: 3 },
  { note: 'E', name: 'Mi', isBlack: false, freq: 329.63, index: 4 },
  { note: 'F', name: 'Fa', isBlack: false, freq: 349.23, index: 5 },
  { note: 'F#', name: 'Fa#', isBlack: true, freq: 369.99, index: 6 },
  { note: 'G', name: 'Sol', isBlack: false, freq: 392.00, index: 7 },
  { note: 'G#', name: 'Sol#', isBlack: true, freq: 415.30, index: 8 },
  { note: 'A', name: 'La', isBlack: false, freq: 440.00, index: 9 },
  { note: 'A#', name: 'La#', isBlack: true, freq: 466.16, index: 10 },
  { note: 'B', name: 'Si', isBlack: false, freq: 493.88, index: 11 },
  
  { note: 'C5', name: 'Do', isBlack: false, freq: 523.25, index: 12 },
  { note: 'C#5', name: 'Do#', isBlack: true, freq: 554.37, index: 13 },
  { note: 'D5', name: 'Re', isBlack: false, freq: 587.33, index: 14 },
  { note: 'D#5', name: 'Re#', isBlack: true, freq: 622.25, index: 15 },
  { note: 'E5', name: 'Mi', isBlack: false, freq: 659.25, index: 16 },
  { note: 'F5', name: 'Fa', isBlack: false, freq: 698.46, index: 17 },
  { note: 'F#5', name: 'Fa#', isBlack: true, freq: 739.99, index: 18 },
  { note: 'G5', name: 'Sol', isBlack: false, freq: 783.99, index: 19 },
  { note: 'G#5', name: 'Sol#', isBlack: true, freq: 830.61, index: 20 },
  { note: 'A5', name: 'La', isBlack: false, freq: 880.00, index: 21 },
  { note: 'A#5', name: 'La#', isBlack: true, freq: 932.33, index: 22 },
  { note: 'B5', name: 'Si', isBlack: false, freq: 987.77, index: 23 }
];

const CHORD_TEMPLATES = [
  { id: 'maj', name: 'Mayor', formula: [0, 4, 7], suffix: '', intervals: 'Tónica - 3ª Mayor - 5ª Justa', desc: 'Sonido brillante, alegre e institucional.' },
  { id: 'min', name: 'Menor', formula: [0, 3, 7], suffix: 'm', intervals: 'Tónica - 3ª Menor - 5ª Justa', desc: 'Sonido melancólico, introspectivo o emotivo.' },
  { id: 'dom7', name: 'Séptima Dom.', formula: [0, 4, 7, 10], suffix: '7', intervals: 'Tónica - 3ª Mayor - 5ª Justa - 7ª Menor', desc: 'Genera tensión activa. Típico del Blues y Jazz.' },
  { id: 'maj7', name: 'Maj7', formula: [0, 4, 7, 11], suffix: 'maj7', intervals: 'Tónica - 3ª Mayor - 5ª Justa - 7ª Mayor', desc: 'Sonido suave, elegante, sofisticado y nostálgico.' },
  { id: 'min7', name: 'Menor 7', formula: [0, 3, 7, 10], suffix: 'm7', intervals: 'Tónica - 3ª Menor - 5ª Justa - 7ª Menor', desc: 'Aporta una textura moderna, jazzera y relajada.' },
  { id: 'dim', name: 'Disminuido', formula: [0, 3, 6], suffix: 'dim', intervals: 'Tónica - 3ª Menor - 5ª Disminuida', desc: 'Sonido inestable de transición.' }
];

const SCALES = [
  { id: 'major', name: 'Escala Mayor (Jónica)', formula: [0, 2, 4, 5, 7, 9, 11], desc: 'La base tonal de la música occidental. Transmite estabilidad.' },
  { id: 'minor', name: 'Escala Menor Natural', formula: [0, 2, 3, 5, 7, 8, 10], desc: 'Tonalidad clásica de carácter dramático y melódico.' },
  { id: 'pentamaj', name: 'Pentatónica Mayor', formula: [0, 2, 4, 7, 9], desc: '5 notas. Imposible tocar una nota discordante. Ideal para solos alegres.' },
  { id: 'pentamin', name: 'Pentatónica Menor', formula: [0, 3, 5, 7, 10], desc: 'Estructura angular del Rock, Blues y Pop contemporáneo.' },
  { id: 'blues', name: 'Escala de Blues', formula: [0, 3, 5, 6, 7, 10], desc: 'Agrega la "blue note" (5ª disminuida) para generar ese sonido rasgado.' }
];

export default function App() {
  // Configuración de Audio y Sintetizador de Piano
  const [soundProfile, setSoundProfile] = useState('acoustic_piano');
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('composicion');

  // Ajustes acústicos avanzados
  const [resonance, setResonance] = useState(0.4);
  const [brightness, setBrightness] = useState(0.6);

  const [activeNotes, setActiveNotes] = useState({});
  const [detectedChord, setDetectedChord] = useState('');

  // Modos interactivos
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedChordType, setSelectedChordType] = useState('maj');
  const [learnedChords, setLearnedChords] = useState([]);
  const [selectedMelodyScale, setSelectedMelodyScale] = useState('major');
  const [selectedMelodyRoot, setSelectedMelodyRoot] = useState('C');

  // Modo Composición / Secuenciador
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordInLoop, setActiveChordInLoop] = useState(-1);
  const [tempo, setTempo] = useState(115);
  
  // Paginación del Secuenciador TR-808 para Móvil (Pasos 1-8 o 9-16)
  const [sequencerPage, setSequencerPage] = useState(0); 
  const [activeStep, setActiveStep] = useState(-1);
  const [drumVolume, setDrumVolume] = useState(0.6);

  // CONFIGURACIÓN DE PROGRESIONES PERSONALIZADAS (4 Slots editables)
  const [customProgression, setCustomProgression] = useState([
    { root: 'C', type: 'maj' },
    { root: 'G', type: 'maj' },
    { root: 'A', type: 'min' },
    { root: 'F', type: 'maj' }
  ]);
  const [selectedPresetSlot, setSelectedPresetSlot] = useState(0);

  // CONFIGURACIÓN DEL ARPEGIADOR
  const [arpEnabled, setArpEnabled] = useState(true);
  const [arpPattern, setArpPattern] = useState('up');

  // Matriz interna TR-808 de 16 pasos
  const [drumGrid, setDrumGrid] = useState({
    BD: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // Kick
    SD: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Snare
    CH: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1], // Hat
    CB: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]  // Cowbell
  });

  // Web Audio Nodes & Refs
  const audioCtxRef = useRef(null);
  const mainGainNodeRef = useRef(null);
  const drumGainNodeRef = useRef(null);
  const delayNodeRef = useRef(null);
  const delayGainNodeRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const oscsRef = useRef({});
  const noiseBufferRef = useRef(null);
  
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // REFS PARA SINCRO EN TIEMPO REAL (Evita latencias y paradas)
  const drumGridRef = useRef(drumGrid);
  const tempoRef = useRef(tempo);
  const customProgressionRef = useRef(customProgression);
  const arpEnabledRef = useRef(arpEnabled);
  const arpPatternRef = useRef(arpPattern);
  const soundProfileRef = useRef(soundProfile);

  // Sincronización continua de referencias mutables
  useEffect(() => { drumGridRef.current = drumGrid; }, [drumGrid]);
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);
  useEffect(() => { customProgressionRef.current = customProgression; }, [customProgression]);
  useEffect(() => { arpEnabledRef.current = arpEnabled; }, [arpEnabled]);
  useEffect(() => { arpPatternRef.current = arpPattern; }, [arpPattern]);
  useEffect(() => { soundProfileRef.current = soundProfile; }, [soundProfile]);

  // Scheduler Clock Refs
  const nextStepTimeRef = useRef(0.0);
  const currentStepRef = useRef(0);
  const scheduleAheadTime = 0.1;
  const lookahead = 25.0;
  const timerIdRef = useRef(null);

  // Inicialización de búferes y entorno de Audio
  const initAudio = () => {
    if (!audioCtxRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        noiseBufferRef.current = buffer;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserNodeRef.current = analyser;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(muted ? 0 : volume, ctx.currentTime);

        const drumGain = ctx.createGain();
        drumGain.gain.setValueAtTime(drumVolume, ctx.currentTime);

        masterGain.connect(analyser);
        drumGain.connect(analyser);
        analyser.connect(ctx.destination);

        const delay = ctx.createDelay(1.0);
        const delayGain = ctx.createGain();
        
        delay.delayTime.setValueAtTime(0.24, ctx.currentTime);
        delayGain.gain.setValueAtTime(resonance * 0.35, ctx.currentTime);

        delay.connect(delayGain);
        delayGain.connect(delay); 
        delayGain.connect(masterGain);

        mainGainNodeRef.current = masterGain;
        drumGainNodeRef.current = drumGain;
        delayNodeRef.current = delay;
        delayGainNodeRef.current = delayGain;
      } catch (e) {
        console.error("Fallo de inicialización de audio:", e);
      }
    }
    
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Sincronización dinámica de volumen y efectos
  useEffect(() => {
    if (mainGainNodeRef.current && audioCtxRef.current) {
      const targetVolume = muted ? 0 : volume;
      mainGainNodeRef.current.gain.setTargetAtTime(targetVolume, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume, muted]);

  useEffect(() => {
    if (drumGainNodeRef.current && audioCtxRef.current) {
      drumGainNodeRef.current.gain.setTargetAtTime(drumVolume, audioCtxRef.current.currentTime, 0.05);
    }
  }, [drumVolume]);

  useEffect(() => {
    if (delayGainNodeRef.current && audioCtxRef.current) {
      delayGainNodeRef.current.gain.setTargetAtTime(resonance * 0.35, audioCtxRef.current.currentTime, 0.1);
    }
  }, [resonance]);

  // Renderizado del Visualizador de Espectro
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight || 120;

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 120;
      }
    };
    window.addEventListener('resize', handleResize);

    const bufferLength = analyserNodeRef.current ? analyserNodeRef.current.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      ctx.fillStyle = 'rgba(11, 15, 30, 0.35)';
      ctx.fillRect(0, 0, width, height);

      if (analyserNodeRef.current && (isPlaying || Object.keys(activeNotes).length > 0)) {
        analyserNodeRef.current.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];
          const percent = barHeight / 255;
          const r = Math.floor(16 + percent * 120);
          const g = Math.floor(185 + percent * 70);
          const b = Math.floor(129 + percent * 126);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${percent + 0.15})`;
          ctx.fillRect(x, height - (barHeight * (height / 255)), barWidth - 1, barHeight * (height / 255));

          ctx.fillStyle = `rgba(${r + 30}, ${g + 30}, ${b + 30}, 0.8)`;
          ctx.fillRect(x, height - (barHeight * (height / 255)) - 1, barWidth - 1, 1);

          x += barWidth;
        }
      } else {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height - 10);
        ctx.lineTo(width, height - 10);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeNotes, isPlaying]);

  // SÍNTESIS ACÚSTICA ADITIVA (PIANO COLA / RHODES)
  const triggerNoteOn = useCallback((freq) => {
    initAudio();
    if (!audioCtxRef.current || !mainGainNodeRef.current) return;

    if (oscsRef.current[freq]) {
      triggerNoteOff(freq);
    }

    const now = audioCtxRef.current.currentTime;
    const oscsList = [];

    const noteGain = audioCtxRef.current.createGain();
    noteGain.gain.setValueAtTime(0, now);
    
    const noteFilter = audioCtxRef.current.createBiquadFilter();
    noteFilter.type = 'lowpass';

    noteGain.connect(noteFilter);
    noteFilter.connect(mainGainNodeRef.current);
    if (delayNodeRef.current) {
      noteFilter.connect(delayNodeRef.current);
    }

    if (soundProfile === 'acoustic_piano') {
      const targetCutoff = freq * (2.5 + brightness * 5);
      noteFilter.frequency.setValueAtTime(targetCutoff, now);
      noteFilter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.8);
      noteFilter.Q.setValueAtTime(1, now);

      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.45, now + 0.005);
      noteGain.gain.exponentialRampToValueAtTime(0.09, now + 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.015, now + 3.5);

      const osc1 = audioCtxRef.current.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      const gain1 = audioCtxRef.current.createGain();
      gain1.gain.setValueAtTime(0.65, now);
      osc1.connect(gain1);
      gain1.connect(noteGain);
      osc1.start(now);
      oscsList.push(osc1);

      const osc2 = audioCtxRef.current.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);
      const gain2 = audioCtxRef.current.createGain();
      gain2.gain.setValueAtTime(0.28, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(noteGain);
      osc2.start(now);
      oscsList.push(osc2);

      const osc3 = audioCtxRef.current.createOscillator();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(freq * 3, now);
      const gain3 = audioCtxRef.current.createGain();
      gain3.gain.setValueAtTime(0.12, now);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc3.connect(gain3);
      gain3.connect(noteGain);
      osc3.start(now);
      oscsList.push(osc3);

      const oscHammer = audioCtxRef.current.createOscillator();
      oscHammer.type = 'triangle';
      oscHammer.frequency.setValueAtTime(freq * 6.2, now);
      const gainHammer = audioCtxRef.current.createGain();
      gainHammer.gain.setValueAtTime(0.4, now);
      gainHammer.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      oscHammer.connect(gainHammer);
      gainHammer.connect(noteGain);
      oscHammer.start(now);
      oscsList.push(oscHammer);

    } else {
      const targetCutoff = freq * (2.0 + brightness * 3);
      noteFilter.frequency.setValueAtTime(targetCutoff, now);
      noteFilter.frequency.exponentialRampToValueAtTime(freq * 1.1, now + 2.2);

      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.4, now + 0.012);
      noteGain.gain.exponentialRampToValueAtTime(0.12, now + 0.5);
      noteGain.gain.exponentialRampToValueAtTime(0.01, now + 4.0);

      const osc1 = audioCtxRef.current.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      const gain1 = audioCtxRef.current.createGain();
      gain1.gain.setValueAtTime(0.7, now);
      osc1.connect(gain1);
      gain1.connect(noteGain);
      osc1.start(now);
      oscsList.push(osc1);

      const osc2 = audioCtxRef.current.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq + 0.45, now);
      const gain2 = audioCtxRef.current.createGain();
      gain2.gain.setValueAtTime(0.18, now);
      osc2.connect(gain2);
      gain2.connect(noteGain);
      osc2.start(now);
      oscsList.push(osc2);

      const oscTine = audioCtxRef.current.createOscillator();
      oscTine.type = 'sine';
      oscTine.frequency.setValueAtTime(freq * 11.2, now);
      const gainTine = audioCtxRef.current.createGain();
      gainTine.gain.setValueAtTime(0.35, now);
      gainTine.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      oscTine.connect(gainTine);
      gainTine.connect(noteGain);
      oscTine.start(now);
      oscsList.push(oscTine);
    }

    oscsRef.current[freq] = {
      oscsList,
      gainNode: noteGain,
      filterNode: noteFilter,
      startTime: now
    };

    setActiveNotes(prev => ({
      ...prev,
      [freq]: true
    }));
  }, [soundProfile, volume, muted, brightness]);

  const triggerNoteOff = useCallback((freq) => {
    if (!audioCtxRef.current || !oscsRef.current[freq]) return;

    const now = audioCtxRef.current.currentTime;
    const { oscsList, gainNode } = oscsRef.current[freq];

    try {
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35); 
      
      oscsList.forEach(osc => {
        osc.stop(now + 0.4);
      });
    } catch (e) {
      // Ignorar excepciones Web Audio
    }

    delete oscsRef.current[freq];
    
    setActiveNotes(prev => {
      const copy = { ...prev };
      delete copy[freq];
      return copy;
    });
  }, []);

  // SÍNTESIS DE INSTRUMENTOS TR-808 (KICK, SNARE, HIHAT, COWBELL)

  const play808Kick = (time) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(drumGainNodeRef.current);

    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.11);

    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.42);

    osc.start(time);
    osc.stop(time + 0.45);
  };

  const play808Snare = (time) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !noiseBufferRef.current) return;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBufferRef.current;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1050;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(drumGainNodeRef.current);

    const toneOsc = ctx.createOscillator();
    toneOsc.type = 'triangle';
    toneOsc.frequency.setValueAtTime(180, time);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.45, time);
    toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

    toneOsc.connect(toneGain);
    toneGain.connect(drumGainNodeRef.current);

    noiseSource.start(time);
    noiseSource.stop(time + 0.18);
    toneOsc.start(time);
    toneOsc.stop(time + 0.13);
  };

  const play808Hihat = (time) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !noiseBufferRef.current) return;

    const source = ctx.createBufferSource();
    source.buffer = noiseBufferRef.current;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7800, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(drumGainNodeRef.current);

    source.start(time);
    source.stop(time + 0.07);
  };

  const play808Cowbell = (time) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

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
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(drumGainNodeRef.current);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.25);
    osc2.stop(time + 0.25);
  };

  // SINTETIZADOR DE PLUCK PARA ARPEGIOS DE ALTA VELOCIDAD
  const playPluckNote = (freq, time) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = soundProfileRef.current === 'acoustic_piano' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, time + 0.12);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.35, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(mainGainNodeRef.current);

    osc.start(time);
    osc.stop(time + 0.18);
  };

  // PROGRAMACIÓN CLÁSICA (COMPLETA) SIN TEMPORIZADORES DE REACT
  const playPresetChordNoTimer = (rootNote, chordTypeId, time) => {
    const rootIndex = NOTES_DATA.findIndex(n => n.note === rootNote || n.note.replace('5', '') === rootNote);
    const template = CHORD_TEMPLATES.find(t => t.id === chordTypeId);
    
    if (rootIndex !== -1 && template) {
      template.formula.forEach((semitones, idx) => {
        const note = NOTES_DATA[rootIndex + semitones];
        if (note) {
          const noteGain = audioCtxRef.current.createGain();
          const noteFilter = audioCtxRef.current.createBiquadFilter();
          
          noteFilter.type = 'lowpass';
          noteFilter.frequency.setValueAtTime(note.freq * 2.3, time);
          
          noteGain.connect(noteFilter);
          noteFilter.connect(mainGainNodeRef.current);
          if (delayNodeRef.current) noteFilter.connect(delayNodeRef.current);

          noteGain.gain.setValueAtTime(0, time + idx * 0.018);
          noteGain.gain.linearRampToValueAtTime(0.3, time + idx * 0.018 + 0.005);
          noteGain.gain.exponentialRampToValueAtTime(0.04, time + idx * 0.018 + 0.4);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, time + idx * 0.018 + 1.1);

          const osc = audioCtxRef.current.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, time + idx * 0.018);
          osc.connect(noteGain);
          
          osc.start(time + idx * 0.018);
          osc.stop(time + idx * 0.018 + 1.2);
        }
      });
    }
  };

  // DETECTAR E INTERPRETAR LA NOTA DE ARPEGIO SEGÚN EL PATRÓN ELEGIDO
  const playArpStep = (rootNote, chordTypeId, stepOffset, time) => {
    const rootIndex = NOTES_DATA.findIndex(n => n.note === rootNote || n.note.replace('5', '') === rootNote);
    const template = CHORD_TEMPLATES.find(t => t.id === chordTypeId);
    
    if (rootIndex !== -1 && template) {
      const chordNotes = template.formula.map(semitones => {
        return NOTES_DATA[rootIndex + semitones];
      }).filter(Boolean);

      if (chordNotes.length === 0) return;

      let arpNotes = [...chordNotes];
      const pattern = arpPatternRef.current;

      if (pattern === 'down') {
        arpNotes.reverse();
      } else if (pattern === 'updown') {
        const bodyReverse = [...chordNotes].reverse().slice(1, -1);
        arpNotes = chordNotes.concat(bodyReverse);
      }

      const targetNote = arpNotes[stepOffset % arpNotes.length];
      if (targetNote) {
        playPluckNote(targetNote.freq, time);
      }
    }
  };

  // PROCESADOR DE PASOS EN TIEMPO REAL
  const scheduleNextStep = (step, time) => {
    const currentGrid = drumGridRef.current;

    if (currentGrid.BD[step]) play808Kick(time);
    if (currentGrid.SD[step]) play808Snare(time);
    if (currentGrid.CH[step]) play808Hihat(time);
    if (currentGrid.CB[step]) play808Cowbell(time);

    const chordIndex = Math.floor(step / 4) % 4;
    const targetChord = customProgressionRef.current[chordIndex];
    
    setActiveChordInLoop(chordIndex);

    if (arpEnabledRef.current) {
      playArpStep(targetChord.root, targetChord.type, step % 4, time);
    } else {
      if (step % 4 === 0) {
        playPresetChordNoTimer(targetChord.root, targetChord.type, time);
      }
    }
  };

  // RECEPTOR TEMPORAL DEL CLOCK DE AUDIO
  const scheduler = useCallback(() => {
    if (!audioCtxRef.current) return;

    while (nextStepTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      scheduleNextStep(currentStepRef.current, nextStepTimeRef.current);
      
      const secondsPerBeat = 60.0 / tempoRef.current;
      const stepDuration = secondsPerBeat / 4; 
      
      nextStepTimeRef.current += stepDuration;
      
      const scheduledStep = currentStepRef.current;
      setTimeout(() => {
        setActiveStep(scheduledStep);
      }, 0);

      currentStepRef.current = (currentStepRef.current + 1) % 16;
    }
    
    timerIdRef.current = setTimeout(scheduler, lookahead);
  }, []);

  const startClock = () => {
    initAudio();
    setIsPlaying(true);
    currentStepRef.current = 0;
    nextStepTimeRef.current = audioCtxRef.current.currentTime + 0.05;
    scheduler();
  };

  const stopClock = () => {
    clearTimeout(timerIdRef.current);
    setIsPlaying(false);
    setActiveStep(-1);
    setActiveChordInLoop(-1);
  };

  // CONFIGURAR EN TIEMPO REAL LOS ACORDES PRESETEADOS DEL LOOP
  const updatePresetSlot = (field, value) => {
    setCustomProgression(prev => {
      const copy = [...prev];
      copy[selectedPresetSlot] = {
        ...copy[selectedPresetSlot],
        [field]: value
      };
      return copy;
    });
  };

  const toggleSequencerStep = (instrument, index) => {
    initAudio();
    setDrumGrid(prev => {
      const copy = { ...prev };
      const row = [...copy[instrument]];
      row[index] = row[index] ? 0 : 1;
      copy[instrument] = row;
      return copy;
    });
  };

  const loadPresetPattern = (type) => {
    initAudio();
    const blank = {
      BD: Array(16).fill(0),
      SD: Array(16).fill(0),
      CH: Array(16).fill(0),
      CB: Array(16).fill(0)
    };

    if (type === 'trap') {
      blank.BD = [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0];
      blank.SD = [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]; 
      blank.CH = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; 
    } else if (type === 'house') {
      blank.BD = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]; 
      blank.SD = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
      blank.CH = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]; 
    } else if (type === 'latin') {
      blank.BD = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0];
      blank.SD = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
      blank.CB = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0];
    }
    setDrumGrid(blank);
  };

  const clearPattern = () => {
    setDrumGrid({
      BD: Array(16).fill(0),
      SD: Array(16).fill(0),
      CH: Array(16).fill(0),
      CB: Array(16).fill(0)
    });
  };

  // RECONOCEDOR DE ACORDES (PIANO LIBRE)
  useEffect(() => {
    const activeFreqs = Object.keys(activeNotes).map(f => parseFloat(f));
    if (activeFreqs.length < 3) {
      setDetectedChord('');
      return;
    }

    const activeIndices = activeFreqs.map(f => {
      const match = NOTES_DATA.find(n => Math.abs(n.freq - f) < 1.0 || Math.abs(n.freq * 2 - f) < 1.0);
      return match ? match.index % 12 : -1;
    }).filter(idx => idx !== -1);

    const uniqueIndices = Array.from(new Set(activeIndices)).sort((a, b) => a - b);

    let matchedChord = '';
    for (let r = 0; r < 12; r++) {
      const rootNote = NOTES_DATA.find(n => n.index === r)?.name || '';
      
      for (const t of CHORD_TEMPLATES) {
        const targetIntervals = t.formula.map(interval => (r + interval) % 12).sort((a, b) => a - b);
        const isMatch = targetIntervals.every(interval => uniqueIndices.includes(interval));
        
        if (isMatch) {
          matchedChord = `${rootNote} ${t.name} (${t.suffix ? rootNote + t.suffix : rootNote})`;
          break;
        }
      }
      if (matchedChord) break;
    }

    setDetectedChord(matchedChord);
  }, [activeNotes]);

  // FILTRADO DE NOTAS SUGERIDAS
  const highlightedNotes = useMemo(() => {
    const targetMap = {};

    if (activeTab === 'armonia') {
      const rootIndex = NOTES_DATA.findIndex(n => n.note === selectedRoot || n.note.replace('5', '') === selectedRoot);
      const template = CHORD_TEMPLATES.find(t => t.id === selectedChordType);
      
      if (rootIndex !== -1 && template) {
        template.formula.forEach(semitones => {
          const targetIndex = rootIndex + semitones;
          if (NOTES_DATA[targetIndex]) {
            targetMap[NOTES_DATA[targetIndex].freq] = 'armonia';
          }
        });
      }
    } else if (activeTab === 'melodia') {
      const rootIndex = NOTES_DATA.findIndex(n => n.note === selectedMelodyRoot);
      const scaleTemplate = SCALES.find(s => s.id === selectedMelodyScale);

      if (rootIndex !== -1 && scaleTemplate) {
        scaleTemplate.formula.forEach(semitones => {
          for (let oct = 0; oct < 2; oct++) {
            const targetIndex = rootIndex + semitones + (oct * 12);
            if (NOTES_DATA[targetIndex]) {
              targetMap[NOTES_DATA[targetIndex].freq] = 'melodia';
            }
          }
        });
      }
    }

    return targetMap;
  }, [activeTab, selectedRoot, selectedChordType, selectedMelodyScale, selectedMelodyRoot]);

  // REPRODUCCIÓN DE ACORDES PREESTABLECIDOS
  const playPresetChord = (rootNote, chordTypeId) => {
    initAudio();
    const rootIndex = NOTES_DATA.findIndex(n => n.note === rootNote || n.note.replace('5', '') === rootNote);
    const template = CHORD_TEMPLATES.find(t => t.id === chordTypeId);
    
    if (rootIndex !== -1 && template) {
      Object.keys(oscsRef.current).forEach(f => triggerNoteOff(f));

      template.formula.forEach((semitones, idx) => {
        const note = NOTES_DATA[rootIndex + semitones];
        if (note) {
          setTimeout(() => {
            triggerNoteOn(note.freq);
          }, idx * 40);

          setTimeout(() => {
            triggerNoteOff(note.freq);
          }, 1600);
        }
      });

      const chordName = `${rootNote} ${template.name}`;
      if (!learnedChords.includes(chordName)) {
        setLearnedChords(prev => [...prev, chordName]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* Cabecera Principal */}
      <header className="border-b border-slate-900 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Harmonix Studio <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">Pro Suite</span>
            </h1>
            <p className="text-xs text-slate-400">Síntesis aditiva, secuenciador TR-808, arpegiador integrado y editor armónico directo</p>
          </div>
        </div>

        {/* Consola de Control de Audio General */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-950 p-2 rounded-xl border border-slate-850">
          
          {/* Perfil Piano */}
          <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
            <Layers className="w-4 h-4 text-emerald-400" />
            <select 
              value={soundProfile} 
              onChange={(e) => setSoundProfile(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="acoustic_piano" className="bg-slate-900">Piano Acústico</option>
              <option value="rhodes_piano" className="bg-slate-900">Piano Rhodes</option>
            </select>
          </div>

          {/* Ajuste de Resonancia / Sala */}
          <div className="flex items-center gap-2 border-r border-slate-800 pr-3 text-xs text-slate-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>Resonancia</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={resonance} 
              onChange={(e) => setResonance(parseFloat(e.target.value))}
              className="w-14 accent-emerald-500 h-1 rounded bg-slate-800 cursor-pointer"
            />
          </div>

          {/* Brillo de Cuerda */}
          <div className="flex items-center gap-2 border-r border-slate-800 pr-3 text-xs text-slate-400">
            <Activity className="w-3.5 h-3.5" />
            <span>Brillo</span>
            <input 
              type="range" 
              min="0.1" 
              max="1" 
              step="0.05" 
              value={brightness} 
              onChange={(e) => setBrightness(parseFloat(e.target.value))}
              className="w-14 accent-emerald-500 h-1 rounded bg-slate-800 cursor-pointer"
            />
          </div>

          {/* Controlador de Volumen Piano */}
          <div className="flex items-center gap-2 border-r border-slate-800 pr-3 text-xs text-slate-400">
            <span>Vol. Piano</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-14 accent-emerald-500 cursor-pointer h-1 rounded-lg bg-slate-800"
            />
          </div>

          {/* Controlador de Volumen TR-808 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Vol. 808</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={drumVolume} 
              onChange={(e) => setDrumVolume(parseFloat(e.target.value))}
              className="w-14 accent-amber-500 cursor-pointer h-1 rounded-lg bg-slate-800"
            />
          </div>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-6">
        
        {/* Navegación de Pestañas */}
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/50">
          <button 
            onClick={() => { stopClock(); setActiveTab('composicion'); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'composicion' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'hover:bg-slate-800/50 text-slate-400'}`}
          >
            <Play className="w-4 h-4" />
            Secuenciador & Presets
          </button>
          <button 
            onClick={() => { stopClock(); setActiveTab('armonia'); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'armonia' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400'}`}
          >
            <BookOpen className="w-4 h-4" />
            Teoría de Acordes
          </button>
          <button 
            onClick={() => { stopClock(); setActiveTab('melodia'); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'melodia' ? 'bg-violet-500 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400'}`}
          >
            <Sparkles className="w-4 h-4" />
            Guía de Escalas
          </button>
          <button 
            onClick={() => { stopClock(); setActiveTab('exploracion'); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'exploracion' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'hover:bg-slate-800/50 text-slate-400'}`}
          >
            <Compass className="w-4 h-4" />
            Teclado Libre
          </button>
        </nav>

        {/* Visualizador de Espectro Real */}
        <div className="relative bg-slate-900 rounded-2xl border border-slate-800/80 overflow-hidden h-24 flex flex-col justify-end p-3 shadow-inner">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="relative z-10 flex justify-between items-center bg-slate-950/85 backdrop-blur-sm px-3 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Analizador de Señal Estéreo
            </span>
            <span className="text-white font-mono font-medium">
              {detectedChord ? `Acorde Detectado: ${detectedChord}` : 'Esperando entrada de notas'}
            </span>
          </div>
        </div>

        {/* Contenido Modular */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800/80 p-5 shadow-xl relative overflow-hidden">
          
          {/* TAB 1: LABORATORIO DE COMPOSICIÓN, ARPEGIADOR Y PRESETS DE ACORDES */}
          {activeTab === 'composicion' && (
            <div className="space-y-6">
              
              {/* SECCIÓN 1: EDITOR DE PROGRESIÓN PERSONALIZADA (PRESETS DE ACORDES) */}
              <div className="bg-slate-950/45 p-4 rounded-2xl border border-slate-850 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      <ListFilter className="w-4 h-4 text-amber-400" /> Presets de Acordes & Secuencia Directa
                    </h4>
                    <p className="text-[11px] text-slate-400">Personaliza la raíz y la especie del acorde para cada uno de los 4 compases en tiempo real.</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/15 text-amber-300 font-mono border border-amber-500/20 px-2 py-0.5 rounded-md self-start">Hot-Swappable</span>
                </div>

                {/* Grid de los 4 slots editables */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {customProgression.map((ch, idx) => {
                    const noteName = NOTES_DATA.find(n => n.note === ch.root)?.name || ch.root;
                    const chordTypeStr = CHORD_TEMPLATES.find(t => t.id === ch.type)?.name || ch.type;
                    const isSelected = selectedPresetSlot === idx;
                    const isPlayingRightNow = activeChordInLoop === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedPresetSlot(idx)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected 
                            ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-500/30' 
                            : 'bg-slate-900/85 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Slot {idx + 1}</span>
                          {isPlayingRightNow && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                        <div className="text-lg font-bold text-white mt-1.5 leading-none">
                          {noteName} <span className="text-xs font-normal text-slate-400">{chordTypeStr}</span>
                        </div>
                        <div className="text-[10px] font-mono text-amber-500 mt-1">
                          {ch.root}{ch.type === 'maj' ? '' : ch.type === 'min' ? 'm' : ch.type}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Panel de edición del slot seleccionado */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Nota Raíz */}
                  <div className="md:col-span-5 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">1. Nota Tónica (Slot {selectedPresetSlot + 1})</span>
                    <div className="grid grid-cols-7 gap-1">
                      {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => {
                        const noteLabel = NOTES_DATA.find(n => n.note === note)?.name || note;
                        const isCurrent = customProgression[selectedPresetSlot]?.root === note;
                        return (
                          <button
                            key={note}
                            onClick={() => updatePresetSlot('root', note)}
                            className={`py-1 text-xs font-semibold rounded-md transition-colors ${
                              isCurrent ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {noteLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tipo de Acorde (Especie) */}
                  <div className="md:col-span-7 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">2. Especie del Acorde</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                      {CHORD_TEMPLATES.map((t) => {
                        const isCurrent = customProgression[selectedPresetSlot]?.type === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => updatePresetSlot('type', t.id)}
                            className={`py-1 text-[10px] font-semibold rounded-md transition-colors leading-tight ${
                              isCurrent ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: ARPEGIADOR Y SECUENCIADOR DRUM 808 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Panel de Ajustes Rápidos & Arpegiador */}
                <div className="lg:col-span-4 space-y-4">
                  
                  {/* Modificador Arpegiador */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1">
                        <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" /> Arpegiador Integrado
                      </span>
                      
                      {/* Toggle On/Off */}
                      <button
                        onClick={() => setArpEnabled(!arpEnabled)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          arpEnabled ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {arpEnabled ? 'ACTIVO' : 'DESACTIVADO'}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal">
                      Divide el acorde del compás en notas secuenciales distribuidas a velocidad de semicorchea.
                    </p>

                    {/* Patrón / Dirección */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dirección del Patrón</span>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'up', label: 'Ascendente' },
                          { id: 'down', label: 'Descendente' },
                          { id: 'updown', label: 'Alternado' }
                        ].map(pat => (
                          <button
                            key={pat.id}
                            disabled={!arpEnabled}
                            onClick={() => setArpPattern(pat.id)}
                            className={`py-1.5 text-[10px] font-semibold rounded-lg transition-colors ${
                              arpPattern === pat.id && arpEnabled
                                ? 'bg-amber-500 text-slate-950 font-bold' 
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-850 disabled:opacity-40'
                            }`}
                          >
                            {pat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-950/85 rounded-xl border border-slate-850">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold">TEMPO</span>
                        <span className="text-amber-400 font-mono font-bold">{tempo} BPM</span>
                      </div>
                      <input 
                        type="range" 
                        min="75" 
                        max="140" 
                        step="1" 
                        value={tempo} 
                        onChange={(e) => setTempo(parseInt(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1 rounded bg-slate-800"
                      />
                    </div>

                    <div className="p-3 bg-slate-950/85 rounded-xl border border-slate-850 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Presets Ritmo</span>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        <button onClick={() => loadPresetPattern('trap')} className="py-1 text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded">Trap</button>
                        <button onClick={() => loadPresetPattern('house')} className="py-1 text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded">House</button>
                        <button onClick={() => loadPresetPattern('latin')} className="py-1 text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded">Salsa</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secuenciador TR-808 Touch-Optimized */}
                <div className="lg:col-span-8 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
                  
                  <div>
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800/50">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-amber-500 font-mono uppercase tracking-wider">Pasos en Tiempo Real</span>
                      </div>
                      
                      {/* Paginador Móvil de Pasos */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setSequencerPage(0)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${sequencerPage === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                        >
                          Pasos 1 - 8 {activeStep >= 0 && activeStep <= 7 && isPlaying && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 ml-1 animate-ping" />}
                        </button>
                        <button 
                          onClick={() => setSequencerPage(1)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${sequencerPage === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                        >
                          Pasos 9 - 16 {activeStep >= 8 && activeStep <= 15 && isPlaying && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 ml-1 animate-ping" />}
                        </button>
                        <button 
                          onClick={clearPattern}
                          title="Limpiar Secuencia"
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors ml-1 bg-slate-900 rounded-lg border border-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Matriz Compacta de 8 columnas */}
                    <div className="space-y-2">
                      {Object.keys(drumGrid).map((inst) => {
                        const labelMap = { BD: 'BOMBO (BD)', SD: 'CAJA (SD)', CH: 'HI-HAT (CH)', CB: 'CENCERRO (CB)' };
                        const colorMap = { BD: 'bg-rose-500', SD: 'bg-amber-500', CH: 'bg-yellow-400', CB: 'bg-teal-400' };
                        
                        const startIndex = sequencerPage * 8;
                        const stepsToShow = drumGrid[inst].slice(startIndex, startIndex + 8);
                        
                        return (
                          <div key={inst} className="flex items-center gap-1.5">
                            <span className="w-16 text-[9px] font-bold text-slate-400 font-mono tracking-tight shrink-0">
                              {labelMap[inst].replace(' (', ' ').replace(')', '')}
                            </span>
                            
                            {/* Fila de 8 pasos */}
                            <div className="grid grid-cols-8 gap-1.5 w-full">
                              {stepsToShow.map((val, stepOffsetIdx) => {
                                const stepRealIdx = startIndex + stepOffsetIdx;
                                const isPlayhead = activeStep === stepRealIdx;
                                const isActive = val === 1;
                                
                                return (
                                  <button
                                    key={stepOffsetIdx}
                                    onClick={() => toggleSequencerStep(inst, stepRealIdx)}
                                    className={`h-9 rounded-lg border transition-all ${
                                      isActive 
                                        ? `${colorMap[inst]} border-transparent scale-102` 
                                        : 'bg-slate-900 border-slate-800/80 hover:bg-slate-850'
                                    } ${isPlayhead ? 'ring-2 ring-emerald-400' : ''}`}
                                  >
                                    <span className={`text-[8px] block opacity-40 ${isActive ? 'text-slate-950 font-bold' : 'text-slate-500'}`}>
                                      {stepRealIdx + 1}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Regla Playhead */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-16 shrink-0" />
                      <div className="grid grid-cols-8 gap-1.5 w-full">
                        {Array.from({ length: 8 }).map((_, idx) => {
                          const realStepIdx = (sequencerPage * 8) + idx;
                          const isActive = activeStep === realStepIdx;
                          return (
                            <div 
                              key={idx} 
                              className={`h-1 rounded-full transition-all ${isActive ? 'bg-emerald-400 shadow-md shadow-emerald-500/50 scale-x-110' : 'bg-slate-900'}`}
                            />
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Acciones principales de disparo */}
                  <div className="flex items-center gap-2 pt-2">
                    {isPlaying ? (
                      <button
                        onClick={stopClock}
                        className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" /> Detener Secuenciador
                      </button>
                    ) : (
                      <button
                        onClick={startClock}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" /> Iniciar Secuenciador Sincronizado
                      </button>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TEORÍA DE ACORDES */}
          {activeTab === 'armonia' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" /> Formación de Acordes
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Seleccione una nota tónica y un modo armónico para visualizar sus intervalos sobre el teclado.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">1. Seleccionar Raíz (Tónica)</label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {['C', 'D', 'E', 'F', 'G', 'A'].map((root) => (
                        <button
                          key={root}
                          onClick={() => setSelectedRoot(root)}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${selectedRoot === root ? 'bg-indigo-500 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'}`}
                        >
                          {NOTES_DATA.find(n => n.note === root)?.name || root}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">2. Estructura del Acorde</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CHORD_TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedChordType(t.id)}
                          className={`p-2 text-left rounded-xl border text-xs transition-all flex flex-col justify-between h-16 ${selectedChordType === t.id ? 'bg-indigo-500/20 border-indigo-400/80 text-white' : 'bg-slate-800/40 border-slate-750 text-slate-300 hover:bg-slate-800'}`}
                        >
                          <span className="font-bold flex justify-between w-full">
                            {t.name} <span className="text-indigo-400 font-mono text-xs">{t.suffix || 'Maj'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 line-clamp-1 leading-tight">{t.intervals}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-indigo-400 font-mono tracking-widest uppercase">Análisis Teórico</span>
                      <span className="text-xs bg-slate-850 px-2 py-0.5 rounded border border-slate-850 font-mono text-slate-300">
                        {NOTES_DATA.find(n => n.note === selectedRoot)?.name} {CHORD_TEMPLATES.find(t => t.id === selectedChordType)?.name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      {CHORD_TEMPLATES.find(t => t.id === selectedChordType)?.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => playPresetChord(selectedRoot, selectedChordType)}
                    className="mt-4 w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/10"
                  >
                    <Volume2 className="w-4 h-4" /> Escuchar Arpegio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GUÍA DE ESCALAS */}
          {activeTab === 'melodia' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400" /> Guía de Escalas Melódicas
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Las notas que estructuran la escala elegida brillarán en color morado. Excelentes para improvisar solos armónicos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Tónica de la Escala</label>
                    <div className="grid grid-cols-6 gap-1">
                      {['C', 'D', 'E', 'F', 'G', 'A'].map((root) => (
                        <button
                          key={root}
                          onClick={() => setSelectedMelodyRoot(root)}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${selectedMelodyRoot === root ? 'bg-violet-500 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'}`}
                        >
                          {NOTES_DATA.find(n => n.note === root)?.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Estructura Escalar</label>
                    {SCALES.map((scale) => (
                      <button
                        key={scale.id}
                        onClick={() => setSelectedMelodyScale(scale.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl border transition-all flex items-center justify-between text-xs ${selectedMelodyScale === scale.id ? 'bg-violet-500/10 border-violet-400/80 text-violet-200' : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                      >
                        <span className="font-bold">{scale.name}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-7 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-violet-400 font-mono tracking-widest uppercase">Anatomía Melódica</span>
                    <h4 className="text-base font-bold text-white mt-1">
                      Modo {NOTES_DATA.find(n => n.note === selectedMelodyRoot)?.name} {SCALES.find(s => s.id === selectedMelodyScale)?.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {SCALES.find(s => s.id === selectedMelodyScale)?.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPLORACIÓN LIBRE */}
          {activeTab === 'exploracion' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-400" /> Exploración Libre
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Toque directamente sobre las teclas del piano para experimentar con la polifonía y el modelado acústico avanzado.
                  </p>
                </div>
                <span className="text-xs bg-slate-800 border border-slate-700/60 text-slate-300 px-3 py-1.5 rounded-lg">
                  Sugerencia: Pulse Do - Mi - Sol (C - E - G)
                </span>
              </div>
            </div>
          )}

        </div>

        {/* PIANO INTERACTIVO */}
        <div className="bg-slate-900 rounded-3xl border border-slate-850 p-4 md:p-5 shadow-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400">Rango: <span className="font-mono text-slate-300">C4 - B5</span></span>
            <div className="flex gap-3 text-[9px] uppercase font-bold tracking-wide text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Acorde</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500"></span> Escala</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Activo</span>
            </div>
          </div>

          {/* Teclado */}
          <div className="relative overflow-x-auto pb-2 pt-1 select-none touch-none" style={{ touchAction: 'none' }}>
            <div className="flex min-w-[580px] md:min-w-full relative h-56 md:h-64">
              
              {/* TECLAS BLANCAS */}
              {NOTES_DATA.filter(n => !n.isBlack).map((note) => {
                const isPressed = activeNotes[note.freq];
                const isSuggestion = highlightedNotes[note.freq];
                
                return (
                  <button
                    key={note.freq}
                    onPointerDown={(e) => {
                      triggerNoteOn(note.freq);
                    }}
                    onPointerUp={(e) => {
                      triggerNoteOff(note.freq);
                    }}
                    onPointerEnter={(e) => {
                      if (e.buttons === 1) {
                        triggerNoteOn(note.freq);
                      }
                    }}
                    onPointerLeave={(e) => {
                      triggerNoteOff(note.freq);
                    }}
                    className={`flex-1 flex flex-col justify-between items-center pb-3 pt-2 border-r border-slate-200 rounded-b-xl transition-all relative outline-none select-none ${
                      isPressed 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 translate-y-0.5 shadow-inner' 
                        : isSuggestion === 'armonia'
                        ? 'bg-indigo-50 border-indigo-200 shadow-indigo-100 shadow-lg'
                        : isSuggestion === 'melodia'
                        ? 'bg-violet-50 border-violet-200 shadow-violet-100 shadow-lg'
                        : 'bg-white hover:bg-slate-50 text-slate-900'
                    }`}
                    style={{ zIndex: 10 }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      {isSuggestion === 'armonia' && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>}
                      {isSuggestion === 'melodia' && <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>}
                    </div>
                    
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-xs font-bold leading-none">{note.name}</span>
                      <span className="text-[8px] font-mono opacity-50 mt-1">{note.note}</span>
                    </div>
                  </button>
                );
              })}

              {/* TECLAS NEGRAS */}
              <div className="absolute inset-x-0 top-0 h-32 pointer-events-none" style={{ zIndex: 20 }}>
                <div className="flex w-full h-full relative">
                  {NOTES_DATA.map((note) => {
                    if (!note.isBlack) return null;

                    const posMap = {
                      1: 4.5,   // C#
                      3: 11.5,  // D#
                      6: 25.5,  // F#
                      8: 32.5,  // G#
                      10: 39.5, // A#
                      13: 54.5, // C#5
                      15: 61.5, // D#5
                      18: 75.5, // F#5
                      20: 82.5, // G#5
                      22: 89.5  // A#5
                    };

                    const leftPosition = posMap[note.index] || 0;
                    const isPressed = activeNotes[note.freq];
                    const isSuggestion = highlightedNotes[note.freq];

                    return (
                      <button
                        key={note.freq}
                        onPointerDown={(e) => {
                          triggerNoteOn(note.freq);
                        }}
                        onPointerUp={(e) => {
                          triggerNoteOff(note.freq);
                        }}
                        onPointerEnter={(e) => {
                          if (e.buttons === 1) {
                            triggerNoteOn(note.freq);
                          }
                        }}
                        onPointerLeave={(e) => {
                          triggerNoteOff(note.freq);
                        }}
                        className={`absolute w-[4.8%] h-full rounded-b-lg border-x border-b transition-all pointer-events-auto flex flex-col justify-between items-center pb-2 pt-1 outline-none select-none ${
                          isPressed 
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 scale-95 shadow-inner' 
                            : isSuggestion === 'armonia'
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : isSuggestion === 'melodia'
                            ? 'bg-violet-600 border-violet-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                        }`}
                        style={{ 
                          left: `${leftPosition}%`,
                          boxShadow: '0px 3px 5px rgba(0,0,0,0.3)'
                        }}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {isSuggestion === 'armonia' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse"></span>}
                          {isSuggestion === 'melodia' && <span className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse"></span>}
                        </div>

                        <div className="flex flex-col items-center leading-none">
                          <span className="text-[8px] font-bold">{note.name}</span>
                          <span className="text-[7px] font-mono opacity-50 mt-0.5">{note.note}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>

      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 mt-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Harmonix Studio. Síntesis acústica de alto rendimiento mediante osciladores paralelos y secuenciador TR-808 en tiempo real.</p>
        </div>
      </footer>

    </div>
  );
}