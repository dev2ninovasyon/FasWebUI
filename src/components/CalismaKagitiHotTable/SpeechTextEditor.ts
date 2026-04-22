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

let _panelOpener: ((payload: { row: number; col: number }) => void) | null = null;
export function setEditorPanelOpener(
  fn: ((payload: { row: number; col: number }) => void) | null
): void {
  _panelOpener = fn;
}

const PREFERRED_MIC_STORAGE_KEY = "fas_preferred_microphone_id";

function getPreferredMicrophoneId(): string {
  try {
    return window.localStorage.getItem(PREFERRED_MIC_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function getPreferredAudioConstraint(): MediaTrackConstraints | boolean {
  const preferredId = getPreferredMicrophoneId();
  return preferredId ? { deviceId: { exact: preferredId } } : true;
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


const ICON_CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
  viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/>
</svg>`;

const ICON_PANEL = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
  viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="16" rx="2"/>
  <path d="M15 4v16"/>
  <path d="M7 8h4"/>
  <path d="M7 12h4"/>
  <path d="M7 16h3"/>
</svg>`;

const ICON_AI = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
  viewBox="0 0 24 24" fill="currentColor">
  <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/>
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

let _micDialogEl: HTMLDivElement | null = null;
let _micDialogInitialized = false;

export async function openMicrophoneSetupDialog(reason?: string): Promise<void> {
  if (typeof document === "undefined") return;

  if (!_micDialogEl) {
    const overlay = document.createElement("div");
    overlay.setAttribute("data-mic-setup-dialog", "1");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100000",
      background: "rgba(15, 23, 42, 0.44)",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
      width: "min(560px, 100%)",
      background: "#ffffff",
      borderRadius: "16px",
      border: "1px solid #dbe3ef",
      boxShadow: "0 20px 60px rgba(15, 23, 42, 0.24)",
      overflow: "hidden",
      fontFamily: "inherit",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "18px 20px 14px",
      borderBottom: "1px solid #e5e7eb",
      background: "#f8fbff",
    });

    const title = document.createElement("div");
    title.textContent = "Mikrofon Testi / Mikrofon Sec";
    Object.assign(title.style, {
      fontSize: "18px",
      fontWeight: "700",
      color: "#0f172a",
    });

    const subtitle = document.createElement("div");
    subtitle.textContent = "Hata alindigi icin acildi. Calisan mikrofonu test edip varsayilan olarak secin.";
    Object.assign(subtitle.style, {
      marginTop: "6px",
      fontSize: "13px",
      color: "#475569",
      lineHeight: "1.5",
    });

    const reasonEl = document.createElement("div");
    reasonEl.setAttribute("data-mic-reason", "1");
    Object.assign(reasonEl.style, {
      marginTop: "8px",
      fontSize: "12px",
      color: "#92400e",
      background: "#fff7ed",
      border: "1px solid #fed7aa",
      borderRadius: "10px",
      padding: "8px 10px",
      display: "none",
    });

    header.appendChild(title);
    header.appendChild(subtitle);
    header.appendChild(reasonEl);

    const body = document.createElement("div");
    Object.assign(body.style, {
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    });

    const selectLabel = document.createElement("label");
    selectLabel.textContent = "Mikrofon";
    Object.assign(selectLabel.style, {
      fontSize: "13px",
      fontWeight: "600",
      color: "#334155",
    });

    const select = document.createElement("select");
    select.setAttribute("data-mic-select", "1");
    Object.assign(select.style, {
      width: "100%",
      marginTop: "8px",
      border: "1px solid #cbd5e1",
      borderRadius: "10px",
      padding: "10px 12px",
      fontSize: "14px",
      color: "#0f172a",
      background: "#ffffff",
    });
    selectLabel.appendChild(select);

    const meterWrap = document.createElement("div");
    Object.assign(meterWrap.style, {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    });

    const meterLabel = document.createElement("div");
    meterLabel.textContent = "Ses Testi";
    Object.assign(meterLabel.style, {
      minWidth: "70px",
      fontSize: "13px",
      fontWeight: "600",
      color: "#334155",
    });

    const meterTrack = document.createElement("div");
    Object.assign(meterTrack.style, {
      flex: "1",
      height: "12px",
      borderRadius: "999px",
      background: "#e2e8f0",
      overflow: "hidden",
      position: "relative",
    });

    const meterFill = document.createElement("div");
    meterFill.setAttribute("data-mic-meter", "1");
    Object.assign(meterFill.style, {
      width: "0%",
      height: "100%",
      borderRadius: "999px",
      background: "linear-gradient(90deg, #0ea5e9, #22c55e)",
      transition: "width 120ms linear",
    });
    meterTrack.appendChild(meterFill);
    meterWrap.appendChild(meterLabel);
    meterWrap.appendChild(meterTrack);

    const info = document.createElement("div");
    info.setAttribute("data-mic-info", "1");
    info.textContent = "Mikrofon listesini yuklemek icin yenileyin veya test yapin.";
    Object.assign(info.style, {
      fontSize: "12px",
      color: "#64748b",
      lineHeight: "1.5",
    });

    const note = document.createElement("div");
    note.textContent = "Not: Tarayici speech motoru genelde varsayilan mikrofonu kullanir. Burada calisan cihazi bulup tarayici veya Windows ses ayarinda varsayilan yapabilirsiniz.";
    Object.assign(note.style, {
      fontSize: "12px",
      color: "#475569",
      lineHeight: "1.5",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "10px 12px",
    });

    const footer = document.createElement("div");
    Object.assign(footer.style, {
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
      padding: "16px 20px 18px",
      borderTop: "1px solid #e5e7eb",
      background: "#fcfdff",
    });

    const leftActions = document.createElement("div");
    Object.assign(leftActions.style, { display: "flex", gap: "8px", flexWrap: "wrap" });

    const refreshBtn = document.createElement("button");
    refreshBtn.textContent = "Listeyi Yenile";
    const testBtn = document.createElement("button");
    testBtn.textContent = "Ses Testi";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Tercihi Kaydet";
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Kapat";

    const secondaryBtnStyle = {
      border: "1px solid #cbd5e1",
      background: "#ffffff",
      color: "#334155",
    };
    const primaryBtnStyle = {
      border: `1px solid ${_primaryMain}`,
      background: _primaryMain,
      color: "#ffffff",
    };

    [refreshBtn, testBtn, closeBtn].forEach((button) => {
      Object.assign(button.style, {
        height: "36px",
        padding: "0 14px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        ...secondaryBtnStyle,
      });
    });
    Object.assign(saveBtn.style, {
      height: "36px",
      padding: "0 14px",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      ...primaryBtnStyle,
    });

    leftActions.appendChild(refreshBtn);
    leftActions.appendChild(testBtn);
    leftActions.appendChild(saveBtn);
    footer.appendChild(leftActions);
    footer.appendChild(closeBtn);

    body.appendChild(selectLabel);
    body.appendChild(meterWrap);
    body.appendChild(info);
    body.appendChild(note);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    _micDialogEl = overlay;

    if (!_micDialogInitialized) {
      let testStream: MediaStream | null = null;
      let testAudioCtx: AudioContext | null = null;
      let testAnalyser: AnalyserNode | null = null;
      let testFrame: number | null = null;

      const stopTest = () => {
        if (testFrame != null) cancelAnimationFrame(testFrame);
        testFrame = null;
        try { testAudioCtx?.close(); } catch { /* noop */ }
        testStream?.getTracks().forEach((track) => track.stop());
        testStream = null;
        testAudioCtx = null;
        testAnalyser = null;
        meterFill.style.width = "0%";
      };

      const renderMeter = () => {
        if (!testAnalyser) return;
        const data = new Uint8Array(testAnalyser.frequencyBinCount);
        testAnalyser.getByteFrequencyData(data);
        const avg = data.reduce((sum, item) => sum + item, 0) / Math.max(1, data.length);
        const pct = Math.min(100, Math.max(4, (avg / 255) * 100));
        meterFill.style.width = `${pct}%`;
        testFrame = requestAnimationFrame(renderMeter);
      };

      const loadDevices = async () => {
        try {
          const exposeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          exposeStream.getTracks().forEach((track) => track.stop());
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputs = devices.filter((device) => device.kind === "audioinput");
          select.innerHTML = "";
          inputs.forEach((device, index) => {
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.textContent = device.label || `Mikrofon ${index + 1}`;
            select.appendChild(option);
          });
          const preferredId = getPreferredMicrophoneId();
          if (preferredId && inputs.some((device) => device.deviceId === preferredId)) {
            select.value = preferredId;
          }
          info.textContent = inputs.length
            ? "Mikrofon listesi hazir. Ses Testi ile cihaz seviyesini kontrol edin."
            : "Kullanilabilir mikrofon bulunamadi.";
        } catch (error: any) {
          info.textContent = `Mikrofon listesi yuklenemedi: ${error?.message ?? "Bilinmeyen hata"}`;
        }
      };

      refreshBtn.addEventListener("click", () => {
        void loadDevices();
      });

      testBtn.addEventListener("click", async () => {
        stopTest();
        const deviceId = select.value;
        try {
          testStream = await navigator.mediaDevices.getUserMedia({
            audio: deviceId ? { deviceId: { exact: deviceId } } : true,
          });
          testAudioCtx = new AudioContext();
          testAnalyser = testAudioCtx.createAnalyser();
          testAnalyser.fftSize = 128;
          testAudioCtx.createMediaStreamSource(testStream).connect(testAnalyser);
          info.textContent = "Ses testi aktif. Konusun veya mikrofona hafifce dokunun.";
          renderMeter();
          window.setTimeout(() => {
            stopTest();
            info.textContent = "Ses testi tamamlandi. Meter hareket ettiyse mikrofon calisiyor.";
          }, 5000);
        } catch (error: any) {
          stopTest();
          info.textContent = `Ses testi basarisiz: ${error?.message ?? "Bilinmeyen hata"}`;
        }
      });

      saveBtn.addEventListener("click", () => {
        try {
          window.localStorage.setItem(PREFERRED_MIC_STORAGE_KEY, select.value || "");
          info.textContent = "Mikrofon tercihi kaydedildi. Gerekirse Windows veya tarayicida varsayilan mikrofonu da buna alin.";
        } catch {
          info.textContent = "Mikrofon tercihi kaydedilemedi.";
        }
      });

      closeBtn.addEventListener("click", () => {
        stopTest();
        overlay.style.display = "none";
      });

      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          stopTest();
          overlay.style.display = "none";
        }
      });

      _micDialogInitialized = true;
      await loadDevices();
    }
  }

  const reasonEl = _micDialogEl.querySelector('[data-mic-reason="1"]') as HTMLDivElement | null;
  if (reasonEl) {
    reasonEl.textContent = reason ?? "";
    reasonEl.style.display = reason ? "block" : "none";
  }
  _micDialogEl.style.display = "flex";
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
  // Only show waveform if we have real analyser data
  if (analyser && recording) {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const step = Math.floor(data.length / barCount);
    for (let i = 0; i < barCount; i++) values.push(data[i * step] / 255);
  } else {
    // Flat line when no audio or not recording
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

  try {
    // Get permission and setup analyser for visualization
    const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: getPreferredAudioConstraint() });
    try {
      s.vizAudioCtx = new AudioContext();
      s.analyser = s.vizAudioCtx.createAnalyser();
      s.analyser.fftSize = 256;
      s.vizAudioCtx.createMediaStreamSource(permissionStream).connect(s.analyser);
      s.vizStream = permissionStream;
    } catch {
      // Analyser setup failed, clean up stream but continue with flat visualization
      permissionStream.getTracks().forEach((track) => track.stop());
      s.vizStream = null;
      s.vizAudioCtx = null;
      s.analyser = null;
    }
  } catch (err: any) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      enqueueSnackbar("Mikrofon izni reddedildi. Adres çubuğundan izin verin.", { variant: "error" });
    } else if (err.name === "NotFoundError") {
      enqueueSnackbar("Mikrofon bulunamadı.", { variant: "error" });
    } else {
      enqueueSnackbar(`Mikrofon hatası: ${err.message}`, { variant: "error" });
    }
    void openMicrophoneSetupDialog("Mikrofon erişimi veya tercih edilen cihaz açılamadı.");
    return;
  }

  GlobalRecognitionManager.get().register(editor);

  const rec: SpeechRecognitionInstance = new SR();
  let hasReceivedResult = false;
  let hasStarted = false;
  let retryCount = 0;
  let restartOnEnd = false;
  const MAX_NO_SPEECH_RETRIES = 2;
  const startTimeout = window.setTimeout(() => {
    if (!hasStarted) {
      enqueueSnackbar("Ses motoru başlatılamadı. Tarayıcıyı ve mikrofon iznini kontrol edin.", { variant: "warning" });
      void openMicrophoneSetupDialog("Ses motoru seçili veya varsayılan mikrofonla başlatılamadı.");
      stopRecording(editor);
    }
  }, 4000);
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "tr-TR";
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    hasStarted = true;
    window.clearTimeout(startTimeout);
    s.recording = true;
    s.anchor = s.textarea.value;
    updateMicUI(s, true);
    drawWave(s); // Analyser already setup in permission stream
  };

  rec.onresult = (event: SpeechRecognitionEvent) => {
    hasReceivedResult = true;
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
    window.clearTimeout(startTimeout);
    if (event.error === "aborted") return;
    if (event.error === "no-speech" && retryCount < MAX_NO_SPEECH_RETRIES) {
      restartOnEnd = true;
      return;
    }
    enqueueSnackbar(`Ses algılama hatası: ${event.error}`, { variant: "error" });
    void openMicrophoneSetupDialog(`Ses algılama hatası: ${event.error}`);
    stopRecording(editor);
  };

  rec.onend = () => {
    window.clearTimeout(startTimeout);
    if (restartOnEnd && retryCount < MAX_NO_SPEECH_RETRIES) {
      restartOnEnd = false;
      retryCount += 1;
      hasStarted = false;
      try {
        rec.start();
        return;
      } catch {
        // fall through
      }
    }
    if (hasStarted && !hasReceivedResult) {
      enqueueSnackbar("Ses algılanamadı. Mikrofon iznini ve cihazı kontrol edin.", { variant: "warning" });
    }
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
    borderColor: s.aiPanelVisible ? _primaryMain : "#e5e7eb",
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
      padding: "2px 8px",
      borderRadius: "4px",
      background: _primaryLight,
    });

    const waveCanvas = document.createElement("canvas");
    waveCanvas.width = 58;
    waveCanvas.height = 20;
    Object.assign(waveCanvas.style, {
      display: "none",
      flexShrink: "0",
      verticalAlign: "middle",
      borderRadius: "999px",
      background: "rgba(0, 116, 186, 0.08)",
      padding: "2px 4px",
    });
    const waveCtx = waveCanvas.getContext("2d");

    const defaultHint = "Enter: tamamla  •  Shift+Enter: yeni satır  •  Esc: iptal";

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

      b.addEventListener("mouseenter", () => {
        hint.textContent = title;
        hint.style.color = _primaryMain;
        hint.style.fontWeight = "600";
      });
      b.addEventListener("mouseleave", () => {
        hint.textContent = defaultHint;
        hint.style.color = "#6b7280";
        hint.style.fontWeight = "normal";
      });

      return b;
    };

    const aiBtn = makeIconBtn(ICON_AI, "FasAI ile Geliştir");

    const panelBtn = makeIconBtn(ICON_PANEL, "Panelde Düzenle");
    const micBtn = makeIconBtn(ICON_MIC, "Sesle Yaz");

    btnGroup.appendChild(statusEl);
    btnGroup.appendChild(waveCanvas);
    btnGroup.appendChild(aiBtn);
    btnGroup.appendChild(panelBtn);
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
      
      // AI paneli açıksa kapat
      if (st.aiPanelVisible) toggleAiPanel(this, st, true);

      if (st.recording) stopRecording(this);
      else void startRecording(this);
    });

    // AI button events
    aiBtn.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
    aiBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const st = getState(this);
      if (!st) return;

      // Ses kaydı varsa durdur (opsiyonel ama iyi bir pratik)
      if (st.recording) stopRecording(this);

      toggleAiPanel(this, st);
    });

    panelBtn.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
    panelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const st = getState(this);
      if (st && st.aiPanelVisible) toggleAiPanel(this, st, true);

      if (_panelOpener) {
        const row = (this as any).row;
        const col = (this as any).col;
        if (typeof row === "number" && typeof col === "number") {
          _panelOpener({ row, col });
        }
      }
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
