import { enhanceText } from "@/utils/gemini";
import { enqueueSnackbar } from "notistack";
// @ts-ignore
import { BaseEditor } from "handsontable/editors/baseEditor";

// ── User context (set by CalismaKagitiHotTable on mount) ──────────────────────
let _userGetter: (() => any) | null = null;
export function setEditorUserGetter(fn: () => any): void {
  _userGetter = fn;
}

// ── Theme colors (set by CalismaKagitiHotTable on mount) ──────────────────────
let _primaryMain = "#0074BA";
let _primaryLight = "#EFF9FF";
export function setEditorPrimaryColor(main: string, light: string): void {
  _primaryMain = main;
  _primaryLight = light;
}

// ── Speech recognition types ──────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

// ── AI prompts ────────────────────────────────────────────────────────────────
const AI_PROMPTS = [
  {
    label: "Zenginleştir",
    instruction:
      "Aşağıdaki metni daha profesyonel ve resmi bir dille yeniden yazın. Teknik terimleri koruyun ancak ifadeyi daha net ve anlaşılır hale getirin ve yalnızca yeniden yazılmış metni döndürün. Ek açıklama veya açıklama eklemeyin.",
  },
  {
    label: "Özetle",
    instruction:
      "Aşağıdaki metni ana noktaları koruyarak daha özlü bir şekilde özetleyin ve yalnızca yeniden yazılmış metni döndürün. Ek açıklama veya açıklama eklemeyin.",
  },
  {
    label: "Detaylandır",
    instruction:
      "Aşağıdaki metni daha detaylı ve açıklayıcı bir şekilde genişletin, önemli noktaları vurgulayın ve yalnızca yeniden yazılmış metni döndürün. Ek açıklama veya açıklama eklemeyin.",
  },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const ICON_MIC = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
  viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
  <line x1="12" y1="19" x2="12" y2="23"/>
  <line x1="8" y1="23" x2="16" y2="23"/>
</svg>`;

const ICON_MIC_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
  viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="1" y1="1" x2="23" y2="23"/>
  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
  <line x1="12" y1="19" x2="12" y2="23"/>
  <line x1="8" y1="23" x2="16" y2="23"/>
</svg>`;

const ICON_AI = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 36 36">
  <circle cx="18" cy="18" r="18" fill="#0d0d1a"/>
  <defs>
    <radialGradient id="orb" cx="42%" cy="38%" r="55%">
      <stop offset="0%" stop-color="#7ee8ff"/>
      <stop offset="45%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#0a1a4a"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="1.2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="18" cy="18" r="9" fill="url(#orb)" filter="url(#glow)"/>
  <ellipse cx="18" cy="18" rx="14" ry="5" fill="none" stroke="#4fc3f7" stroke-width="1" opacity="0.7" transform="rotate(-30 18 18)"/>
  <ellipse cx="18" cy="18" rx="14" ry="5" fill="none" stroke="#81d4fa" stroke-width="0.8" opacity="0.5" transform="rotate(30 18 18)"/>
</svg>`;

const ICON_CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
  viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/>
</svg>`;

// ── State ─────────────────────────────────────────────────────────────────────
interface EditorState {
  container: HTMLDivElement;
  textarea: HTMLTextAreaElement;
  micBtn: HTMLButtonElement;
  statusEl: HTMLSpanElement;
  waveCanvas: HTMLCanvasElement;
  waveCtx: CanvasRenderingContext2D | null;
  analyser: AnalyserNode | null;
  vizStream: MediaStream | null;
  vizAudioCtx: AudioContext | null;
  animFrameId: number | null;
  aiBtn: HTMLButtonElement;
  aiPanel: HTMLDivElement;
  aiResultText: HTMLDivElement;
  aiApplyBtn: HTMLButtonElement;
  aiLoading: boolean;
  aiPanelVisible: boolean;
  pendingAiResult: string;
  recognition: SpeechRecognitionInstance | null;
  recording: boolean;
  anchor: string;
  scrollHandler: (() => void) | null;
  hotScrollables: Element[];
}

const stateMap = new WeakMap<object, EditorState>();

function getState(ed: object): EditorState | undefined {
  return stateMap.get(ed);
}

// ── Layout constants ──────────────────────────────────────────────────────────
const EDITOR_MIN_WIDTH = 340;
const TOOLBAR_H = 34;
const AI_PANEL_H = 210;
const BASE_TEXTAREA_H = 160;
const VIEWPORT_PAD = 10;
const BOTTOM_PAD = 20;

function totalHeight(s: EditorState): number {
  return BASE_TEXTAREA_H + TOOLBAR_H + (s.aiPanelVisible ? AI_PANEL_H : 0);
}

// ── Positioning ───────────────────────────────────────────────────────────────
function getEditorRootRect(editor: SpeechTextEditor): DOMRect | null {
  const hot = (editor as any).hot ?? (editor as any).hotInstance;
  const root = hot?.rootElement as HTMLElement | undefined;
  return root?.getBoundingClientRect?.() ?? null;
}

function applyOverlayPosition(editor: SpeechTextEditor, s: EditorState, TD: HTMLElement): void {
  const rect = TD.getBoundingClientRect();
  const rootRect = getEditorRootRect(editor);
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const minLeft = Math.max(VIEWPORT_PAD, rootRect?.left ?? VIEWPORT_PAD);
  const maxRight = Math.min(viewW - VIEWPORT_PAD, rootRect?.right ?? viewW - VIEWPORT_PAD);
  const availableWidth = Math.max(220, maxRight - minLeft);
  const editorH = totalHeight(s);
  const width = Math.max(rect.width, EDITOR_MIN_WIDTH);

  let top = rect.bottom + 4;
  if (top + editorH + BOTTOM_PAD > viewH) top = rect.top - editorH - 4;
  top = Math.max(top, VIEWPORT_PAD);

  const clampedWidth = Math.min(width, availableWidth);
  let left = rect.left;
  if (left + clampedWidth > maxRight) left = rect.right - clampedWidth;
  left = Math.max(left, minLeft);
  left = Math.min(left, maxRight - clampedWidth);

  Object.assign(s.container.style, {
    top: `${top}px`,
    left: `${left}px`,
    width: `${clampedWidth}px`,
    height: `${editorH}px`,
  });
}

// ── Speech ────────────────────────────────────────────────────────────────────
class GlobalRecognitionManager {
  private static _inst: GlobalRecognitionManager | null = null;
  private active: SpeechTextEditor | null = null;

  static get(): GlobalRecognitionManager {
    if (!GlobalRecognitionManager._inst) {
      GlobalRecognitionManager._inst = new GlobalRecognitionManager();
    }
    return GlobalRecognitionManager._inst;
  }

  register(editor: SpeechTextEditor): void {
    if (this.active && this.active !== editor) stopRecording(this.active);
    this.active = editor;
  }

  release(editor: SpeechTextEditor): void {
    if (this.active === editor) this.active = null;
  }
}

// ── Waveform visualizer ───────────────────────────────────────────────────────
function drawWave(s: EditorState): void {
  const { waveCtx: ctx, waveCanvas: canvas, analyser, recording } = s;
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const barCount = 7;
  const barW = 3;
  const gap = 2;
  const totalW = barCount * (barW + gap) - gap;
  const startX = (W - totalW) / 2;
  const maxH = H - 4;
  const minH = 2;

  const values: number[] = [];
  if (analyser && recording) {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const step = Math.floor(data.length / barCount);
    for (let i = 0; i < barCount; i++) values.push(data[i * step] / 255);
  } else {
    for (let i = 0; i < barCount; i++) values.push(0);
  }

  ctx.fillStyle = _primaryMain;
  for (let i = 0; i < barCount; i++) {
    const h = minH + values[i] * (maxH - minH);
    const x = startX + i * (barW + gap);
    const y = (H - h) / 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, barW, h, 1.5);
    else ctx.rect(x, y, barW, h);
    ctx.fill();
  }

  if (recording) s.animFrameId = requestAnimationFrame(() => drawWave(s));
}

function stopViz(s: EditorState): void {
  if (s.animFrameId != null) { cancelAnimationFrame(s.animFrameId); s.animFrameId = null; }
  try { s.vizAudioCtx?.close(); } catch { /* noop */ }
  s.vizStream?.getTracks().forEach((t) => t.stop());
  s.analyser = null;
  s.vizAudioCtx = null;
  s.vizStream = null;
  drawWave(s); // draw flat
}

function updateMicUI(s: EditorState, recording: boolean): void {
  s.micBtn.innerHTML = recording ? ICON_MIC_OFF : ICON_MIC;
  s.micBtn.title = recording ? "Durdurmak için tıklayın" : "Sesle Yaz";
  Object.assign(s.micBtn.style, {
    color: recording ? _primaryMain : "#6b7280",
    background: recording ? _primaryLight : "#ffffff",
  });
  s.statusEl.style.display = recording ? "inline" : "none";
  s.waveCanvas.style.display = recording ? "block" : "none";
}

function stopRecording(editor: SpeechTextEditor): void {
  const s = getState(editor);
  if (!s) return;
  s.recording = false;
  s.anchor = "";
  if (s.recognition) {
    try {
      s.recognition.onend = null;
      s.recognition.onerror = null;
      s.recognition.abort();
    } catch {
      // noop
    }
    s.recognition = null;
  }
  GlobalRecognitionManager.get().release(editor);
  stopViz(s);
  updateMicUI(s, false);
}

async function startRecording(editor: SpeechTextEditor): Promise<void> {
  const s = getState(editor);
  if (!s) return;

  const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
  if (!SR) {
    enqueueSnackbar("Tarayıcınız ses tanımayı desteklemiyor.", { variant: "error" });
    return;
  }

  let vizStream: MediaStream | null = null;
  try {
    vizStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err: any) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      enqueueSnackbar("Mikrofon izni reddedildi. Adres çubuğundan izin verin.", { variant: "error" });
    } else if (err.name === "NotFoundError") {
      enqueueSnackbar("Mikrofon bulunamadı.", { variant: "error" });
    } else {
      enqueueSnackbar(`Mikrofon hatası: ${err.message}`, { variant: "error" });
    }
    return;
  }

  // Set up real-time audio visualizer
  try {
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;
    audioCtx.createMediaStreamSource(vizStream).connect(analyser);
    s.vizStream = vizStream;
    s.vizAudioCtx = audioCtx;
    s.analyser = analyser;
  } catch {
    vizStream.getTracks().forEach((t) => t.stop());
  }

  GlobalRecognitionManager.get().register(editor);

  const rec: SpeechRecognitionInstance = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "tr-TR";
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    s.recording = true;
    s.anchor = s.textarea.value;
    updateMicUI(s, true);
    drawWave(s);
  };

  rec.onresult = (event: SpeechRecognitionEvent) => {
    let interim = "";
    let final = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    if (final) {
      const sep = s.anchor && !s.anchor.endsWith(" ") ? " " : "";
      s.anchor = s.anchor + sep + final;
      s.textarea.value = s.anchor;
    } else if (interim) {
      const sep = s.anchor && !s.anchor.endsWith(" ") ? " " : "";
      s.textarea.value = s.anchor + sep + interim;
    }
  };

  rec.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === "aborted" || event.error === "no-speech") return;
    enqueueSnackbar(`Ses algılama hatası: ${event.error}`, { variant: "error" });
    stopRecording(editor);
  };

  rec.onend = () => {
    if (s.recording) stopRecording(editor);
  };

  s.recognition = rec;
  try {
    rec.start();
  } catch {
    enqueueSnackbar("Ses kaydı başlatılamadı.", { variant: "error" });
    stopRecording(editor);
  }
}

// ── AI Panel ──────────────────────────────────────────────────────────────────
function toggleAiPanel(editor: SpeechTextEditor, s: EditorState, forceClose = false): void {
  s.aiPanelVisible = forceClose ? false : !s.aiPanelVisible;
  s.aiPanel.style.display = s.aiPanelVisible ? "flex" : "none";
  Object.assign(s.aiBtn.style, {
    color: s.aiPanelVisible ? _primaryMain : "#6b7280",
    background: s.aiPanelVisible ? _primaryLight : "#ffffff",
  });

  // Reposition with new height
  const TD = (editor as any)._visibleTD?.();
  if (TD) applyOverlayPosition(editor, s, TD);
}

async function runAiPrompt(editor: SpeechTextEditor, s: EditorState, instruction: string): Promise<void> {
  const text = s.textarea.value.trim();
  if (!text) {
    enqueueSnackbar("Önce metin girin.", { variant: "warning" });
    return;
  }
  const user = _userGetter?.();
  if (!user?.token) {
    enqueueSnackbar("Oturum bilgisi bulunamadı.", { variant: "error" });
    return;
  }

  s.aiLoading = true;
  s.aiResultText.textContent = "FasAI çalışıyor...";
  s.aiApplyBtn.style.display = "none";
  s.pendingAiResult = "";

  // Disable prompt buttons during loading
  const btns = s.aiPanel.querySelectorAll<HTMLButtonElement>(".ai-prompt-btn");
  btns.forEach((b) => { b.disabled = true; b.style.opacity = "0.5"; });

  try {
    const result = await enhanceText(user, text, instruction);
    s.pendingAiResult = result;
    s.aiResultText.textContent = result;
    s.aiApplyBtn.style.display = "inline-flex";
  } catch {
    s.aiResultText.textContent = "Hata oluştu, tekrar deneyin.";
  } finally {
    s.aiLoading = false;
    btns.forEach((b) => { b.disabled = false; b.style.opacity = "1"; });
  }
}

// ── Editor class ──────────────────────────────────────────────────────────────
export class SpeechTextEditor extends BaseEditor {
  static EDITOR_TYPE = "speech-text";

  init(): void {
    const container = document.createElement("div");
    container.setAttribute("data-hot-floating-editor", "1");
    Object.assign(container.style, {
      position: "fixed",
      zIndex: "99999",
      display: "none",
      flexDirection: "column",
      background: "#ffffff",
      border: `2px solid ${_primaryMain}`,
      borderRadius: "6px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
    });

    container.addEventListener("mousedown", (e) => e.stopPropagation());
    container.addEventListener("click", (e) => e.stopPropagation());

    // ── Textarea ──
    const textarea = document.createElement("textarea");
    Object.assign(textarea.style, {
      flex: "1",
      border: "none",
      outline: "none",
      resize: "none",
      padding: "8px 10px",
      fontSize: "13px",
      lineHeight: "1.6",
      background: "transparent",
      color: "#111111",
      fontFamily: "inherit",
      boxSizing: "border-box",
      overflowY: "auto",
      minHeight: "0",
    });

    // ── AI Panel ──
    const aiPanel = document.createElement("div");
    Object.assign(aiPanel.style, {
      display: "none",
      flexDirection: "column",
      borderTop: `1px solid ${_primaryLight}`,
      background: _primaryLight,
      padding: "8px 10px",
      gap: "6px",
      flexShrink: "0",
      overflow: "hidden",
    });

    // Prompt buttons row
    const promptRow = document.createElement("div");
    Object.assign(promptRow.style, { display: "flex", gap: "6px", flexWrap: "wrap" });

    AI_PROMPTS.forEach((p) => {
      const btn = document.createElement("button");
      btn.className = "ai-prompt-btn";
      btn.textContent = p.label;
      Object.assign(btn.style, {
        fontSize: "11px",
        padding: "3px 10px",
        border: `1px solid ${_primaryMain}`,
        borderRadius: "12px",
        background: _primaryLight,
        color: _primaryMain,
        cursor: "pointer",
        fontWeight: "500",
        lineHeight: "1.6",
        outline: "none",
        transition: "background 0.12s",
      });
      btn.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const st = getState(this);
        if (st && !st.aiLoading) void runAiPrompt(this, st, p.instruction);
      });
      promptRow.appendChild(btn);
    });

    // Result area (scrollable)
    const aiResultText = document.createElement("div");
    Object.assign(aiResultText.style, {
      flex: "1",
      fontSize: "11.5px",
      color: "#374151",
      lineHeight: "1.6",
      overflowY: "auto",
      maxHeight: "110px",
      minHeight: "60px",
      padding: "4px 2px",
      background: "transparent",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      userSelect: "none",
    });
    aiResultText.textContent = "Bir seçenek seçin...";

    // Kullan button row
    const kullanRow = document.createElement("div");
    Object.assign(kullanRow.style, { display: "flex", justifyContent: "flex-end" });

    const aiApplyBtn = document.createElement("button");
    aiApplyBtn.textContent = "Kullan";
    Object.assign(aiApplyBtn.style, {
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "11px",
      padding: "0 14px",
      height: "26px",
      border: `1px solid ${_primaryMain}`,
      borderRadius: "13px",
      background: _primaryLight,
      color: _primaryMain,
      cursor: "pointer",
      fontWeight: "600",
      outline: "none",
      lineHeight: "1",
      boxSizing: "border-box",
    });
    aiApplyBtn.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
    aiApplyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const st = getState(this);
      if (st && st.pendingAiResult) {
        st.textarea.value = st.pendingAiResult;
        st.anchor = st.pendingAiResult;
        st.pendingAiResult = "";
        st.aiResultText.textContent = "Uygulandı ✓";
        st.aiApplyBtn.style.display = "none";
        toggleAiPanel(this, st, true);
        requestAnimationFrame(() => {
          st.textarea.focus();
          const len = st.textarea.value.length;
          st.textarea.setSelectionRange(len, len);
        });
      }
    });

    kullanRow.appendChild(aiApplyBtn);
    aiPanel.appendChild(promptRow);
    aiPanel.appendChild(aiResultText);
    aiPanel.appendChild(kullanRow);

    // ── Toolbar ──
    const toolbar = document.createElement("div");
    Object.assign(toolbar.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 8px",
      borderTop: "1px solid #e5e7eb",
      height: `${TOOLBAR_H}px`,
      flexShrink: "0",
      gap: "8px",
      background: "#f9fafb",
    });

    const hint = document.createElement("span");
    hint.textContent = "Enter: tamamla  •  Shift+Enter: yeni satır  •  Esc: iptal";
    Object.assign(hint.style, {
      fontSize: "10px",
      color: "#6b7280",
      userSelect: "none",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      flexShrink: "1",
    });

    const btnGroup = document.createElement("div");
    Object.assign(btnGroup.style, { display: "flex", alignItems: "center", gap: "5px", flexShrink: "0" });

    const statusEl = document.createElement("span");
    statusEl.textContent = "● Dinliyor";
    Object.assign(statusEl.style, {
      display: "none",
      fontSize: "10px",
      fontWeight: "600",
      color: _primaryMain,
      whiteSpace: "nowrap",
    });

    const waveCanvas = document.createElement("canvas");
    waveCanvas.width = 50;
    waveCanvas.height = 20;
    Object.assign(waveCanvas.style, {
      display: "none",
      flexShrink: "0",
      verticalAlign: "middle",
    });
    const waveCtx = waveCanvas.getContext("2d");

    const makeIconBtn = (icon: string, title: string) => {
      const b = document.createElement("button");
      Object.assign(b.style, {
        width: "26px",
        height: "26px",
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        borderRadius: "50%",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        color: "#6b7280",
        outline: "none",
        flexShrink: "0",
        boxSizing: "border-box",
        transition: "background 0.15s, color 0.15s",
      });
      b.setAttribute("tabindex", "-1");
      b.setAttribute("type", "button");
      b.title = title;
      b.innerHTML = icon;
      return b;
    };

    const aiBtn = document.createElement("button");
    Object.assign(aiBtn.style, {
      width: "30px",
      height: "30px",
      border: "none",
      background: "white",
      borderRadius: "50%",
      cursor: "pointer",
      padding: "0",
      outline: "none",
      flexShrink: "0",
      overflow: "hidden",
      boxSizing: "border-box",
      position: "relative",
    });
    aiBtn.setAttribute("tabindex", "-1");
    aiBtn.setAttribute("type", "button");
    aiBtn.title = "FasAI ile Geliştir";

    const aiBtnIframe = document.createElement("iframe");
    aiBtnIframe.src = "https://widget.galichat.com/chat/6691wb9cakfml2mjro2x19";
    aiBtnIframe.scrolling = "no";
    Object.assign(aiBtnIframe.style, {
      pointerEvents: "none",
      border: "0",
      width: "63px",
      height: "63px",
      transform: "scale(0.476)",
      transformOrigin: "top left",
      position: "absolute",
      top: "0",
      left: "0",
    });
    aiBtn.appendChild(aiBtnIframe);

    const micBtn = makeIconBtn(ICON_MIC, "Sesle Yaz");

    btnGroup.appendChild(statusEl);
    btnGroup.appendChild(waveCanvas);
    btnGroup.appendChild(aiBtn);
    btnGroup.appendChild(micBtn);
    toolbar.appendChild(hint);
    toolbar.appendChild(btnGroup);

    container.appendChild(textarea);
    container.appendChild(aiPanel);
    container.appendChild(toolbar);
    document.body.appendChild(container);

    const state: EditorState = {
      container,
      textarea,
      micBtn,
      statusEl,
      waveCanvas,
      waveCtx,
      analyser: null,
      vizStream: null,
      vizAudioCtx: null,
      animFrameId: null,
      aiBtn,
      aiPanel,
      aiResultText,
      aiApplyBtn,
      aiLoading: false,
      aiPanelVisible: false,
      pendingAiResult: "",
      recognition: null,
      recording: false,
      anchor: "",
      scrollHandler: null,
      hotScrollables: [],
    };
    stateMap.set(this, state);

    // Mic events
    micBtn.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
    micBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const st = getState(this);
      if (!st) return;
      if (st.recording) stopRecording(this);
      else void startRecording(this);
    });

    // AI button events
    aiBtn.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
    aiBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const st = getState(this);
      if (st) toggleAiPanel(this, st);
    });

    textarea.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        const st = getState(this);
        if (st?.aiPanelVisible) { toggleAiPanel(this, st, true); return; }
        (this as any).finishEditing(true);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        (this as any).finishEditing(false);
      } else if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        (this as any).finishEditing(false);
      }
    });
  }

  open(): void {
    const s = getState(this);
    if (!s) return;

    const TD = this._visibleTD();
    if (!TD) return;

    applyOverlayPosition(this, s, TD);
    s.container.style.display = "flex";
    s.anchor = s.textarea.value;

    const handler = () => {
      const td = this._visibleTD();
      if (!td) { (this as any).finishEditing(false); return; }
      const rect = td.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
        (this as any).finishEditing(false);
        return;
      }
      applyOverlayPosition(this, s, td);
    };
    s.scrollHandler = handler;
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler, { passive: true });

    const hot = (this as any).hot ?? (this as any).hotInstance;
    const root: Element | undefined = hot?.rootElement;
    s.hotScrollables = root ? Array.from(root.querySelectorAll(".wtHolder")) : [];
    s.hotScrollables.forEach((el) => el.addEventListener("scroll", handler, { passive: true }));
  }

  _visibleTD(): HTMLElement | null {
    const hot = (this as any).hot ?? (this as any).hotInstance;
    const row: number = (this as any).row;
    const col: number = (this as any).col;
    return (
      (hot?.getCell(row, col, true) as HTMLElement | null) ??
      ((this as any).TD as HTMLElement | null)
    );
  }

  close(): void {
    const s = getState(this);
    if (!s) return;
    stopRecording(this);
    toggleAiPanel(this, s, true);
    s.aiResultText.textContent = "Bir seçenek seçin...";
    s.pendingAiResult = "";
    s.aiApplyBtn.style.display = "none";
    s.container.style.display = "none";
    if (s.scrollHandler) {
      window.removeEventListener("scroll", s.scrollHandler, true);
      window.removeEventListener("resize", s.scrollHandler);
      s.hotScrollables.forEach((el) => el.removeEventListener("scroll", s.scrollHandler!));
      s.scrollHandler = null;
      s.hotScrollables = [];
    }
  }

  getValue(): string {
    return getState(this)?.textarea.value ?? "";
  }

  setValue(newValue: string): void {
    const s = getState(this);
    if (!s) return;
    s.textarea.value = String(newValue ?? "");
    s.anchor = s.textarea.value;
  }

  focus(): void {
    const s = getState(this);
    if (!s) return;
    requestAnimationFrame(() => {
      s.textarea.focus();
      const len = s.textarea.value.length;
      s.textarea.setSelectionRange(len, len);
    });
  }

  stopRecording(): void {
    stopRecording(this);
  }

  destroy(): void {
    const s = getState(this);
    if (!s) return;
    stopRecording(this);
    if (s.container.parentNode) s.container.parentNode.removeChild(s.container);
    stateMap.delete(this);
  }
}
