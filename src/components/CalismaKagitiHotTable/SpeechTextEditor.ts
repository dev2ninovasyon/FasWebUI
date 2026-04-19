import { enqueueSnackbar } from "notistack";
// @ts-ignore
import { BaseEditor } from "handsontable/editors/baseEditor";

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

interface EditorState {
  container: HTMLDivElement;
  textarea: HTMLTextAreaElement;
  micBtn: HTMLButtonElement;
  statusEl: HTMLSpanElement;
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

const EDITOR_MIN_WIDTH = 340;
const EDITOR_TOTAL_HEIGHT = 228;
const TOOLBAR_H = 34;
const VIEWPORT_PAD = 10;
const BOTTOM_PAD = 20;

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
  const width = Math.max(rect.width, EDITOR_MIN_WIDTH);

  let top = rect.bottom + 4;
  if (top + EDITOR_TOTAL_HEIGHT + BOTTOM_PAD > viewH) top = rect.top - EDITOR_TOTAL_HEIGHT - 4;
  top = Math.max(top, VIEWPORT_PAD);

  const clampedWidth = Math.min(width, availableWidth);
  let left = rect.left;
  if (left + clampedWidth > maxRight) {
    left = rect.right - clampedWidth;
  }
  left = Math.max(left, minLeft);
  left = Math.min(left, maxRight - clampedWidth);

  Object.assign(s.container.style, {
    top: `${top}px`,
    left: `${left}px`,
    width: `${clampedWidth}px`,
    height: `${EDITOR_TOTAL_HEIGHT}px`,
  });
}

function updateMicUI(s: EditorState, recording: boolean): void {
  s.micBtn.innerHTML = recording ? ICON_MIC_OFF : ICON_MIC;
  s.micBtn.title = recording ? "Durdurmak için tıklayın" : "Sesle Yaz";
  Object.assign(s.micBtn.style, {
    color: recording ? "#d32f2f" : "#6b7280",
    background: recording ? "rgba(211, 47, 47, 0.12)" : "#ffffff",
  });
  s.statusEl.style.display = recording ? "inline" : "none";
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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
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
      border: "2px solid #2563eb",
      borderRadius: "6px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
    });

    container.addEventListener("mousedown", (e) => e.stopPropagation());
    container.addEventListener("click", (e) => e.stopPropagation());

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
    hint.textContent = "Enter: düzenlemeyi tamamla  •  Shift+Enter: yeni satır  •  Esc: iptal";
    Object.assign(hint.style, {
      fontSize: "10px",
      color: "#6b7280",
      userSelect: "none",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      flexShrink: "1",
    });

    const micGroup = document.createElement("div");
    Object.assign(micGroup.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      flexShrink: "0",
    });

    const statusEl = document.createElement("span");
    statusEl.textContent = "● Dinliyor";
    Object.assign(statusEl.style, {
      display: "none",
      fontSize: "10px",
      fontWeight: "600",
      color: "#ef4444",
      whiteSpace: "nowrap",
    });

    const micBtn = document.createElement("button");
    Object.assign(micBtn.style, {
      width: "24px",
      height: "24px",
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
    micBtn.setAttribute("tabindex", "-1");
    micBtn.setAttribute("type", "button");
    micBtn.title = "Sesle Yaz";
    micBtn.innerHTML = ICON_MIC;

    micGroup.appendChild(statusEl);
    micGroup.appendChild(micBtn);
    toolbar.appendChild(hint);
    toolbar.appendChild(micGroup);
    container.appendChild(textarea);
    container.appendChild(toolbar);
    document.body.appendChild(container);

    const state: EditorState = {
      container,
      textarea,
      micBtn,
      statusEl,
      recognition: null,
      recording: false,
      anchor: "",
      scrollHandler: null,
      hotScrollables: [],
    };
    stateMap.set(this, state);

    micBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    micBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const st = getState(this);
      if (!st) return;
      if (st.recording) stopRecording(this);
      else void startRecording(this);
    });

    textarea.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
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

    // Position first to avoid flash at old location
    applyOverlayPosition(this, s, TD);
    s.container.style.display = "flex";
    s.anchor = s.textarea.value;

    const handler = () => {
      const td = this._visibleTD();
      if (!td) {
        (this as any).finishEditing(false);
        return;
      }
      const rect = td.getBoundingClientRect();
      if (
        rect.bottom < 0 ||
        rect.top > window.innerHeight ||
        rect.right < 0 ||
        rect.left > window.innerWidth
      ) {
        (this as any).finishEditing(false);
        return;
      }
      applyOverlayPosition(this, s, td);
    };
    s.scrollHandler = handler;
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler, { passive: true });

    // HOT's internal scroll containers don't bubble to window — attach directly
    const hot = (this as any).hot ?? (this as any).hotInstance;
    const root: Element | undefined = hot?.rootElement;
    s.hotScrollables = root ? Array.from(root.querySelectorAll(".wtHolder")) : [];
    s.hotScrollables.forEach((el) =>
      el.addEventListener("scroll", handler, { passive: true })
    );
  }

  private _visibleTD(): HTMLElement | null {
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
    s.container.style.display = "none";
    if (s.scrollHandler) {
      window.removeEventListener("scroll", s.scrollHandler, true);
      window.removeEventListener("resize", s.scrollHandler);
      s.hotScrollables.forEach((el) =>
        el.removeEventListener("scroll", s.scrollHandler!)
      );
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
