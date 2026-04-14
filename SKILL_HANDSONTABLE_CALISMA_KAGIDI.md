---
name: handsontable-calisma-kagidi-standartlari
description: Karmaşık denetim çalışma kağıtlarında Handsontable bileşeni kullanılırken uygulanması gereken kompakt görünüm, detay izleme paneli ve performans standartları.
---

# Handsontable Çalışma Kağıdı Tablo Standartları

Bu döküman, denetim sayfalarında kullanılan Handsontable tabanlı çalışma kağıtlarının kullanıcı deneyimini bozmadan (satırların aşırı büyümesi vb.) ve performanslı bir şekilde nasıl yapılandırılacağını açıklar.

## Ne Zaman Kullanılır?

- Çok sütunlu ve satırlı denetim çalışma kağıtlarında.
- Spreadsheet (Excel) benzeri bir veri girişi deneyimi gerektiğinde.
- "Açıklama" veya "Denetim Adımı" gibi uzun metin içerikli hücrelerin olduğu tablolarda.

## 1. Kompakt Hücre Görünümü (Row Height Stability)

Çalışma kağıdı satırlarının içeriğe göre kontrolsüz büyümesini engellemek için şu CSS ve Props kuralları uygulanmalıdır:

### CSS (Box Wrapper İçinde)
```css
"& .htCore td": { 
  verticalAlign: "middle !important", 
  fontSize: "0.85rem",
  whiteSpace: "nowrap !important", // Satırın büyümesini engeller
  textOverflow: "ellipsis",       // Uzun metne üç nokta koyar
  overflow: "hidden"              // Taşan metni gizler
}
```

### HotTable Props
- `rowHeights={40}`: Sabit satır yüksekliği.
- `autoRowSize={false}`: İçeriğe göre otomatik hesaplamayı kapat.

## 2. Detay İzleme Paneli (Selection Viewer)

Hücreler kompakt olduğu için, tıklanan hücrenin tüm içeriği çalışma kağıdının altında ayrı bir panelde gösterilmelidir.

### State ve Hook Yapısı
```typescript
const [selectedCellInfo, setSelectedCellInfo] = useState<{ label: string; value: string } | null>(null);

const handleSelection = useCallback((r: number, c: number) => {
  const hot = hotRef.current?.hotInstance;
  if (hot) {
    const value = hot.getDataAtCell(r, c) || "";
    const label = hot.getColHeader(c) || "";
    setSelectedCellInfo((prev) => {
      if (prev?.label === label && prev?.value === value) return prev; // Değişim yoksa renderi engelle
      return { label, value };
    });
  }
}, []);
```

## 3. Enter ve Çok Satırlı Metin Yönetimi

Açıklama alanlarında Enter tuşunun hücreyi kapatması yerine alt satıra geçmesi (paragraf) için:

### beforeKeyDown Hook
```typescript
const handleKeyDown = useCallback(function(this: any, event: any) {
  if (event.keyCode === 13) { // Enter
    const editor = this.getActiveEditor();
    if (editor && editor.isOpened()) {
      const selected = this.getSelected();
      if (selected && [X, Y].includes(selected[0][1])) { // Belirli sütunlarda
        event.stopImmediatePropagation(); // Handsontable'ın kapatmasını durdur
      }
    }
  }
}, []);
```

## 4. Sonsuz Döngü Koruması (Infinite Loop Prevention)

`@handsontable/react` bileşeni prop değişimlerine çok duyarlıdır. React infinite loop hatasını önlemek için:

1.  **useCallback**: Tüm olay yakalayıcı fonksiyonlar `useCallback` ile sarılmalıdır.
2.  **State Karşılaştırması**: State güncellenmeden önce `prev === next` kontrolü mutlaka yapılmalıdır.
3.  **Ref Kullanımı**: Tablo instance'ına erişmek için mutlaka `useRef` kullanılmalıdır.

## 5. Kaydetmeden Çıkış Uyarısı (Dirty State Tracking)

Çalışma kağıdında yapılan değişikliklerin kaybolmaması için tablonun "kirli" (dirty) olup olmadığı takip edilmeli ve kullanıcı uyarılmalıdır.

### İlk Durumun Tutulması (Snapshot)
```typescript
const initialSnapshot = useRef<string>(""); // Tüm verinin JSON string hali
```

### Değişiklik Takibi
```typescript
const isDirty = useMemo(() => {
  return initialSnapshot.current !== JSON.stringify(rows.map(r => ({ id: r.id, durum: r.durum, tespit: r.tespit })));
}, [rows]);
```

### Tarayıcı ve Navigasyon Koruması
```typescript
useEffect(() => {
  if (!isDirty) return;

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = ""; // Standart tarayıcı uyarısı
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [isDirty]);
```

## 6. Başarı Bildirimi (Snackbar)

Kayıt işlemlerinden sonra sayfa akışını bozmamak için `MUI Alert` yerine `MUI Snackbar` tercih edilmelidir.
