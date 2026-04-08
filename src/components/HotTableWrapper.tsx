"use client";

import React from "react";
import { HotTable } from "@handsontable/react";
import type { HotTableProps } from "@handsontable/react";
import "@/lib/handsontableSetup";

/**
 * Handsontable Wrapper Component
 * 
 * Bu component, Handsontable kullanımını merkezi bir yerden yönetir.
 * Tüm gerekli stiller ve dil ayarları otomatik olarak yüklenir.
 * 
 * Kullanım:
 * ```tsx
 * import CustomHotTable from "@/components/HotTableWrapper";
 * 
 * <CustomHotTable
 *   ref={hotRef}
 *   data={veriler}
 *   columns={[...]}
 * />
 * ```
 */
interface CustomHotTableProps extends HotTableProps {
  // Gerekirse buraya özel props'lar eklenebilir
}

const CustomHotTable = React.forwardRef<any, CustomHotTableProps>(
  (props, ref) => {
    return <HotTable ref={ref} {...props} />;
  }
);

CustomHotTable.displayName = "CustomHotTable";

export default CustomHotTable;
