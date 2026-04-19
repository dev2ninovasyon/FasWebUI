import Handsontable from "handsontable";

export const HOT_BASE_ROW_HEIGHT = 72;
export const HOT_TEXT_CELL_MAX_HEIGHT = 52;

export const RISK_COLORS: Record<string, { text: string }> = {
  KRITIK: { text: "#c62828" },
  "KRİTİK": { text: "#c62828" },
  YUKSEK: { text: "#e65100" },
  "YÜKSEK": { text: "#e65100" },
  ORTA: { text: "#f57f17" },
  BILGI: { text: "#1565c0" },
  "BİLGİ": { text: "#1565c0" },
  DUSUK: { text: "#33691e" },
  "DÜŞÜK": { text: "#33691e" },
  DEFAULT: { text: "#333333" },
};

type HtRendererArgs = [any, HTMLTableCellElement, number, number, string | number, any, any];

export function riskRenderer(this: any, ...args: HtRendererArgs) {
  // @ts-ignore
  Handsontable.renderers.TextRenderer.apply(this, args);
  const [, td, , , , value] = args;
  const key = (value || "").toString().trim().toUpperCase();
  const style = RISK_COLORS[key] || RISK_COLORS.DEFAULT;
  td.style.setProperty("color", style.text, "important");
  td.style.setProperty("font-weight", "600", "important");
  td.style.textAlign = "center";
  td.style.fontSize = "0.78rem";
}

export function durumRenderer(this: any, ...args: HtRendererArgs) {
  // @ts-ignore
  Handsontable.renderers.DropdownRenderer.apply(this, args);
  const [, td, , , , value] = args;
  if (value === "Evet") {
    td.style.setProperty("color", "#2e7d32", "important");
    td.style.setProperty("font-weight", "bold", "important");
  } else if (value === "Hayır") {
    td.style.setProperty("color", "#c62828", "important");
    td.style.setProperty("font-weight", "bold", "important");
  } else if (value === "Kapsam Dışı") {
    td.style.setProperty("color", "#757575", "important");
    td.style.setProperty("font-weight", "normal", "important");
    td.style.setProperty("font-style", "italic", "important");
  }
  td.style.textAlign = "center";
}

export function bdsRefRenderer(this: any, ...args: HtRendererArgs) {
  // @ts-ignore
  Handsontable.renderers.TextRenderer.apply(this, args);
  const [, td] = args;
  td.style.setProperty("color", "#0d47a1", "important");
  td.style.fontSize = "0.72rem";
  td.style.fontStyle = "italic";
  td.style.textAlign = "center";
}

export function islemRenderer(this: any, ...args: HtRendererArgs) {
  const [, td, , , , value] = args;
  const text = String(value ?? "");

  td.style.padding = "0";
  td.style.overflow = "hidden";
  td.style.height = `${HOT_BASE_ROW_HEIGHT}px`;
  td.style.maxHeight = `${HOT_BASE_ROW_HEIGHT}px`;
  td.style.verticalAlign = "top";

  td.innerHTML = "";
  const div = document.createElement("div");
  div.className = "ht-cell-clamp";
  div.style.maxHeight = `${HOT_TEXT_CELL_MAX_HEIGHT}px`;
  div.style.whiteSpace = "pre-wrap";
  div.textContent = text;
  if (text) div.title = text;
  td.appendChild(div);
}

export function tespitRenderer(this: any, ...args: HtRendererArgs) {
  const [instance, td, row] = args;

  const tespitValue = instance.getDataAtCell(row, 4) ?? "";
  const durum = instance.getDataAtCell(row, 3) ?? "Evet";
  const evetIcerik = instance.getDataAtCell(row, 7) ?? "";
  const hayirIcerik = instance.getDataAtCell(row, 8) ?? "";

  const displayValue =
    tespitValue && tespitValue.toString().trim() !== ""
      ? tespitValue
      : durum === "Hayır"
        ? hayirIcerik
        : evetIcerik;

  const isPlaceholder = !tespitValue || tespitValue.toString().trim() === "";

  td.style.padding = "0";
  td.style.overflow = "hidden";
  td.style.height = `${HOT_BASE_ROW_HEIGHT}px`;
  td.style.maxHeight = `${HOT_BASE_ROW_HEIGHT}px`;
  td.style.verticalAlign = "top";

  td.innerHTML = "";
  const div = document.createElement("div");
  div.className = "ht-cell-clamp";
  div.style.maxHeight = `${HOT_TEXT_CELL_MAX_HEIGHT}px`;
  div.style.whiteSpace = "pre-wrap";

  if (isPlaceholder) {
    div.style.color = "#999999";
    div.style.fontStyle = "italic";
  }

  const text = String(displayValue ?? "");
  div.textContent = text;
  if (text && !isPlaceholder) div.title = text;
  td.appendChild(div);
}

export function takipRenderer(this: any, ...args: HtRendererArgs) {
  // @ts-ignore
  Handsontable.renderers.TextRenderer.apply(this, args);
  const [, td, , , , value] = args;

  if (value === "Evet") {
    td.innerHTML = "";
    const span = document.createElement("span");
    span.textContent = "TAKIP";
    span.style.backgroundColor = "#ffebee";
    span.style.color = "#c62828";
    span.style.padding = "2px 6px";
    span.style.borderRadius = "4px";
    span.style.fontSize = "0.68rem";
    span.style.fontWeight = "bold";
    span.style.border = "1px solid #ffcdd2";

    td.style.textAlign = "center";
    td.appendChild(span);
  } else {
    td.textContent = "";
  }
}
