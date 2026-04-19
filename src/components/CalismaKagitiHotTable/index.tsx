"use client";

import React, { useCallback, useEffect } from "react";
import { HotTable } from "@handsontable/react";
import type { HotTableProps } from "@handsontable/react";
import "@/lib/handsontableSetup";
import { HOT_BASE_ROW_HEIGHT } from "./renderers";
import { setEditorUserGetter, setEditorPrimaryColor } from "./SpeechTextEditor";
import { store } from "@/store/storeConfig";
import { useTheme } from "@mui/material/styles";

export interface CalismaKagitiHotTableProps extends Omit<HotTableProps, "data"> {
  /**
   * Tablo verisi. Dizi içinde dizi formatında olmalı (array of arrays).
   * ÖNEMLI: üst bileşende useMemo ile sabitlenmeli — aksi hâlde her render'da
   * HotTable veriyi sıfırlar ve kullanıcı değişiklikleri kaybolur.
   *
   * @example
   * const hotData = useMemo(() => rows.map(r => [r.id, r.deger, ...]), [rows]);
   */
  data: any[][];

  /**
   * Enter tuşunda yeni satır eklenecek sütun indeksleri (0 tabanlı).
   * Yalnızca düzenlenebilir (readOnly olmayan) sütunlar için kullanın.
   *
   * @example
   * editableColumnIndices={[4]} // 5. sütunda Enter → yeni satır
   */
  editableColumnIndices?: number[];

  /**
   * Tablo yüksekliği. Varsayılan: "calc(100vh - 340px)"
   */
  height?: string | number;

  /**
   * Satır yüksekliği (piksel). Varsayılan: 72
   * autoRowSize devre dışı bırakıldığından tüm satırlar bu yükseklikte olur.
   */
  rowHeight?: number;
}

/**
 * CalismaKagitiHotTable
 *
 * Çalışma kağıdı sayfaları için standart Handsontable sarmalayıcı.
 * - ht-theme-horizon teması, tr-TR dili, non-commercial lisans otomatik uygulanır
 * - Zebra (striped) satırlar global.css üzerinden gelir
 * - autoRowSize kapalı: sabit rowHeight ile satırlar tıklanabilir kalır
 * - editableColumnIndices ile belirtilen sütunlarda Enter → yeni satır ekler
 *
 * Hazır renderer'ları da bu paketten import edin:
 *   import { riskRenderer, durumRenderer, bdsRefRenderer, tespitRenderer, RISK_COLORS }
 *     from "@/components/CalismaKagitiHotTable/renderers";
 */
const CalismaKagitiHotTable = React.forwardRef<any, CalismaKagitiHotTableProps>(
  (
    {
      data,
      editableColumnIndices = [],
      height = "calc(100vh - 340px)",
      rowHeight = HOT_BASE_ROW_HEIGHT,
      afterBeginEditing,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    useEffect(() => {
      setEditorUserGetter(() => store.getState().userReducer);
      setEditorPrimaryColor(theme.palette.primary.main, theme.palette.primary.light);
    }, [theme.palette.primary.main, theme.palette.primary.light]);

    // ── Enter → yeni satır (afterBeginEditing) ─────────────────────────────
    const handleAfterBeginEditing = useCallback(
      function (this: any, _row: number, col: number) {
        // Dışarıdan gelen afterBeginEditing callback'ini her zaman çağır
        if (typeof afterBeginEditing === "function") {
          (afterBeginEditing as Function).call(this, _row, col);
        }

        if (!editableColumnIndices.includes(col)) return;

        const editor = this.getActiveEditor();
        const textarea: HTMLTextAreaElement | null = editor?.TEXTAREA ?? null;
        if (!textarea) return;

        const onKeyDown = (e: KeyboardEvent) => {
          if (
            e.key === "Enter" &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey &&
            !e.shiftKey
          ) {
            e.stopPropagation();
            e.preventDefault();
            const start = textarea.selectionStart ?? textarea.value.length;
            const end = textarea.selectionEnd ?? textarea.value.length;
            textarea.value =
              textarea.value.substring(0, start) +
              "\n" +
              textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 1;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
          }
        };

        textarea.addEventListener("keydown", onKeyDown, true);
        textarea.addEventListener(
          "blur",
          () => textarea.removeEventListener("keydown", onKeyDown, true),
          { once: true }
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [editableColumnIndices, afterBeginEditing]
    );

    return (
      <HotTable
        ref={ref}
        className="ht-theme-horizon"
        licenseKey="non-commercial-and-evaluation"
        language="tr-TR"
        autoRowSize={false}
        rowHeights={rowHeight}
        height={height}
        stretchH="last"
        filters={true}
        columnSorting={true}
        contextMenu={{
          items: {
            row_above: { name: "Üste Satır Ekle" },
            row_below: { name: "Alta Satır Ekle" },
            remove_row: { name: "Satırı Sil" },
            separator: "---------",
            undo: { name: "Geri Al" },
            redo: { name: "İleri Al" },
            separator2: "---------",
            make_read_only: { name: "Salt Okunur Yap" },
            alignment: { name: "Hizalama" },
            copy: { name: "Kopyala" },
            cut: { name: "Kes" },
          },
        }}
        manualColumnMove={true}
        manualRowMove={true}
        manualColumnResize={true}
        manualRowResize={true}
        {...rest}
        data={data}
        afterBeginEditing={handleAfterBeginEditing}
      />
    );
  }
);

CalismaKagitiHotTable.displayName = "CalismaKagitiHotTable";

export default CalismaKagitiHotTable;
export { HOT_BASE_ROW_HEIGHT, HOT_TEXT_CELL_MAX_HEIGHT, RISK_COLORS } from "./renderers";
export { riskRenderer, durumRenderer, bdsRefRenderer, tespitRenderer, islemRenderer, takipRenderer } from "./renderers";
export { SpeechTextEditor } from "./SpeechTextEditor";
export { FloatingTextEditor } from "./FloatingTextEditor";
