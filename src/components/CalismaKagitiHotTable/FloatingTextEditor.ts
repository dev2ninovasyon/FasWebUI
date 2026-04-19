// @ts-ignore
import { BaseEditor } from "handsontable/editors";

const EDITOR_MIN_WIDTH = 320;
const EDITOR_HEIGHT = 190;
const TOOLBAR_H = 32;
const VIEWPORT_PAD = 10;
const BOTTOM_PAD = 20;

interface State {
  container: HTMLDivElement;
  textarea: HTMLTextAreaElement;
  scrollHandler: (() => void) | null;
  hotScrollables: Element[];
}

const stateMap = new WeakMap<object, State>();

function getEditorRootRect(editor: FloatingTextEditor): DOMRect | null {
  const hot = (editor as any).hot ?? (editor as any).hotInstance;
  const root = hot?.rootElement as HTMLElement | undefined;
  return root?.getBoundingClientRect?.() ?? null;
}

function applyPosition(editor: FloatingTextEditor, s: State, TD: HTMLElement): void {
  const rect = TD.getBoundingClientRect();
  const rootRect = getEditorRootRect(editor);
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const minLeft = Math.max(VIEWPORT_PAD, rootRect?.left ?? VIEWPORT_PAD);
  const maxRight = Math.min(viewW - VIEWPORT_PAD, rootRect?.right ?? viewW - VIEWPORT_PAD);
  const availableWidth = Math.max(220, maxRight - minLeft);
  const width = Math.max(rect.width, EDITOR_MIN_WIDTH);

  let top = rect.bottom + 4;
  if (top + EDITOR_HEIGHT + BOTTOM_PAD > viewH) {
    top = rect.top - EDITOR_HEIGHT - 4;
  }
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
    height: `${EDITOR_HEIGHT}px`,
  });
}

export class FloatingTextEditor extends BaseEditor {
  static EDITOR_TYPE = "floating-text";

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
      padding: "0 10px",
      borderTop: "1px solid #e5e7eb",
      height: `${TOOLBAR_H}px`,
      flexShrink: "0",
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
    });

    toolbar.appendChild(hint);
    container.appendChild(textarea);
    container.appendChild(toolbar);
    document.body.appendChild(container);

    const state: State = { container, textarea, scrollHandler: null, hotScrollables: [] };
    stateMap.set(this, state);

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
    const s = stateMap.get(this);
    if (!s) return;

    const TD = this._visibleTD();
    if (!TD) return;

    // Position first to avoid flash at old location
    applyPosition(this, s, TD);
    s.container.style.display = "flex";

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
      applyPosition(this, s, td);
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
    const s = stateMap.get(this);
    if (!s) return;
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
    return stateMap.get(this)?.textarea.value ?? "";
  }

  setValue(newValue: string): void {
    const s = stateMap.get(this);
    if (!s) return;
    s.textarea.value = String(newValue ?? "");
  }

  focus(): void {
    const s = stateMap.get(this);
    if (!s) return;
    requestAnimationFrame(() => {
      s.textarea.focus();
      const len = s.textarea.value.length;
      s.textarea.setSelectionRange(len, len);
    });
  }

  destroy(): void {
    const s = stateMap.get(this);
    if (!s) return;
    if (s.scrollHandler) {
      window.removeEventListener("scroll", s.scrollHandler, true);
      window.removeEventListener("resize", s.scrollHandler);
      s.hotScrollables.forEach((el) =>
        el.removeEventListener("scroll", s.scrollHandler!)
      );
    }
    if (s.container.parentNode) s.container.parentNode.removeChild(s.container);
    stateMap.delete(this);
  }
}
