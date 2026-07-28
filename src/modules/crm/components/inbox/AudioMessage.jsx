/**
 * AudioMessage — toca a nota de voz do WhatsApp (ogg/opus) em QUALQUER navegador.
 *
 * O problema: o WhatsApp manda voz em ogg/opus. Chrome, Firefox, Edge e Android
 * tocam nativamente; o Safari NAO — e no iPhone TODO navegador usa o motor do
 * Safari (WebKit), entao no iPhone nenhum navegador toca. Era o "audio nao sai".
 *
 * A solucao, em camadas, pra nao arriscar o caso que ja funciona:
 *   1. navegador que suporta ogg/opus  -> <audio> nativo (inalterado);
 *   2. navegador que NAO suporta (iPhone) -> decodifica o opus por WASM
 *      (ogg-opus-decoder) e toca pela Web Audio API;
 *   3. se ate a decodificacao falhar -> link de baixar (nunca um player mudo).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Play, Pause, Download } from 'lucide-react';

// canPlayType devolve '' quando o navegador nao sabe tocar o codec. No Safari/iOS
// da '' pra ogg/opus; no Chrome da 'probably'/'maybe'.
function nativeSuportaOggOpus() {
  try {
    const a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/ogg; codecs=opus'));
  } catch {
    return false;
  }
}

function fmtClock(s) {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, '0')}`;
}

export function AudioMessage({ url, isOut }) {
  // Decidido UMA vez: a capacidade do navegador nao muda em runtime.
  const canNative = useMemo(nativeSuportaOggOpus, []);
  const [nativeFailed, setNativeFailed] = useState(false);

  if (canNative && !nativeFailed) {
    return (
      <audio
        controls
        preload="none"
        src={url}
        onError={() => setNativeFailed(true)}
        className="max-w-full mb-1"
        style={{ minWidth: 220, height: 40 }}
      >
        Áudio
      </audio>
    );
  }
  return <DecodedAudio url={url} isOut={isOut} />;
}

// Player pra quem nao tem codec nativo: baixa o ogg, decodifica por WASM e toca
// pela Web Audio API, com barra de progresso e play/pause.
function DecodedAudio({ url, isOut }) {
  const [phase, setPhase] = useState('idle'); // idle | loading | error
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const ctxRef = useRef(null);
  const bufRef = useRef(null);
  const srcRef = useRef(null);
  const offsetRef = useRef(0);     // segundos ja tocados (pra pausar/retomar)
  const startedAtRef = useRef(0);  // ctx.currentTime quando o source atual comecou

  // Limpa tudo ao desmontar (o balao sai da tela ao trocar de conversa).
  useEffect(() => () => {
    try { if (srcRef.current) { srcRef.current.onended = null; srcRef.current.stop(); } } catch { /* ja parou */ }
    try { ctxRef.current?.close(); } catch { /* ja fechou */ }
  }, []);

  // Barra de progresso enquanto toca.
  useEffect(() => {
    if (!playing) return undefined;
    let raf = 0;
    const loop = () => {
      const ctx = ctxRef.current;
      const d = bufRef.current?.duration || 0;
      if (ctx) setCur(Math.min(offsetRef.current + (ctx.currentTime - startedAtRef.current), d));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  async function carregarBuffer() {
    if (bufRef.current) return bufRef.current;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    // Import dinamico: o WASM (~centenas de KB) so entra pra quem precisa (iPhone),
    // nao pesa no bundle de quem toca nativo.
    const { OggOpusDecoder } = await import('ogg-opus-decoder');
    const dec = new OggOpusDecoder();
    await dec.ready;
    const { channelData, sampleRate } = await dec.decode(bytes);
    try { dec.free(); } catch { /* ok */ }
    if (!channelData?.length || !channelData[0]?.length) throw new Error('audio vazio');
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = ctxRef.current || (ctxRef.current = new AC());
    const buf = ctx.createBuffer(channelData.length, channelData[0].length, sampleRate);
    channelData.forEach((ch, i) => buf.copyToChannel(ch, i));
    bufRef.current = buf;
    setDur(buf.duration);
    return buf;
  }

  async function play() {
    try {
      if (phase === 'idle') setPhase('loading');
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = ctxRef.current || (ctxRef.current = new AC());
      await ctx.resume(); // Safari abre o contexto suspenso — precisa do gesto.
      const buf = await carregarBuffer();
      setPhase('idle');

      const off = offsetRef.current >= buf.duration ? 0 : offsetRef.current;
      offsetRef.current = off;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.onended = () => { offsetRef.current = 0; setPlaying(false); setCur(0); };
      startedAtRef.current = ctx.currentTime;
      src.start(0, off);
      srcRef.current = src;
      setPlaying(true);
    } catch (e) {
      console.warn('[AudioMessage] falha ao decodificar/tocar', e?.message || e);
      setPhase('error');
      setPlaying(false);
    }
  }

  function pause() {
    const ctx = ctxRef.current;
    const src = srcRef.current;
    if (!ctx || !src) return;
    offsetRef.current += ctx.currentTime - startedAtRef.current;
    try { src.onended = null; src.stop(); } catch { /* ja parou */ }
    srcRef.current = null;
    setPlaying(false);
  }

  // Ate a decodificacao falhar: link de baixar, nunca um player mudo.
  if (phase === 'error') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 py-1.5 pr-2 min-w-[170px] text-sm text-slate-600 dark:text-slate-200 hover:underline"
      >
        <Mic size={16} className="shrink-0" />
        <span className="flex-1">Baixar áudio</span>
        <Download size={14} className="text-slate-400 shrink-0" />
      </a>
    );
  }

  const loading = phase === 'loading';
  const pct = dur ? (cur / dur) * 100 : 0;
  const accent = isOut ? '#1da57a' : '#00a884';

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[200px]">
      <button
        onClick={() => (playing ? pause() : play())}
        disabled={loading}
        title={playing ? 'Pausar' : 'Tocar'}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-60"
        style={{ backgroundColor: accent }}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : playing ? (
          <Pause size={16} />
        ) : (
          <Play size={16} className="ml-0.5" />
        )}
      </button>
      <div className="flex-1">
        <div className="h-1 rounded-full bg-black/15 dark:bg-white/20 relative">
          <div className="h-1 rounded-full absolute left-0 top-0" style={{ width: `${pct}%`, backgroundColor: accent }} />
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Mic size={12} className="text-slate-400" />
          <span className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
            {fmtClock(playing || cur ? cur : dur)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AudioMessage;
