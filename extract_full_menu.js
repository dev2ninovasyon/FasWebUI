const fs = require('fs');
const path = require('path');

/**
 * RADİKAL DÜZELTME: 
 * Regex yerine string tabanlı blok yakalama mantığına geçiliyor.
 * Müşteri Belgeleri enjeksiyonu ve hiyerarşi üretimi devam ediyor.
 */

// 1. Veri Hazırlığı
const denetimDosyaPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\DenetimDosyaBelgeleri.json';
const denetimData = JSON.parse(fs.readFileSync(denetimDosyaPath, 'utf8'));

const urlToRef = new Map();
const nameToFormKodu = new Map();

denetimData.forEach(item => {
    if (item.FormUrl) urlToRef.set(item.FormUrl, item);
    if (item.BelgeAdi && item.FormKodu) {
        const normalizedName = item.BelgeAdi.trim().toLowerCase();
        if (!nameToFormKodu.has(normalizedName)) {
            nameToFormKodu.set(normalizedName, item.FormKodu);
        }
    }
});

const musterBelgeleriChildren = denetimData.filter(item => item.ParentId === 31).map(item => ({
    title: item.BelgeAdi,
    href: item.FormUrl || "#",
    formKodu: item.FormKodu,
    icon: "IconPoint"
}));

// Maddi Doğrulama Prosedürleri (Bobi)
const maddiDogrulamaBobi = [
  { "name": "Finansal Tablolar", "reference": "23CD03-060100-01", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri"] },
  { "name": "Dipnot Açıklamaları", "reference": "23CD03-060100-02", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri"] },
  { "name": "Nakit ve Nakit Benzerleri", "reference": "23CD03-060100-04", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol", "Mutabakatlar(VUK)"] },
  { "name": "Finansal Varlık ve Yatırımlar", "reference": "23CD03-060100-06", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtleri Kontrol"] },
  { "name": "Ticari Alacaklar", "reference": "23CD03-060100-07", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Mutabakatlar(VUK)", "Reeskont Testleri", "Çek Senet Tablosu", "Fatura Testleri", "Şüpheli Alacak Testleri", "Sonraki Dönem Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol", "Hareketsiz Ticari Alacaklar"] },
  { "name": "Ticari Borçlar", "reference": "23CD03-060100-08", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Mutabakatlar(VUK)", "Reeskont Testleri", "Çek Senet Tablosu", "Fatura Testleri", "Sonraki Dönem Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Diğer Alacaklar", "reference": "23CD03-060100-09", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Mutabakatlar(VUK)", "Sonraki Dönem Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Diğer Borçlar", "reference": "23CD03-060100-10", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Mutabakatlar(VUK)", "Sonraki Dönem Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Stoklar", "reference": "23CD03-060100-11", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Mutabakatlar(VUK)", "Sözleşme Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Stok Dönemsellik Testi", "Stoklar Net Gerçekleşebilir Değer", "Dönüşüm Kayıtları Kontrol", "Hareketsiz Stoklar"] },
  { "name": "Ertelenmiş Giderler", "reference": "23CD03-060100-13", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Mutabakatlar(VUK)", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Cari Dönem Vergisiyle İlgili Varlıklar", "reference": "23CD03-060100-14", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Diğer Dönen Duran Varlıklar", "reference": "23CD03-060100-18", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol", "Mutabakatlar(VUK)"] },
  { "name": "Yatırım Amaçlı Gayrimenkuller", "reference": "23CD03-060100-20", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Maddi Duran Varlıklar", "reference": "23CD03-060100-21", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Amortisman Kontrolleri", "Varlık ve Amortisman Özet Tablo", "Değerleme ve Değer Düşüklüğü Kontrolleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Maddi Olmayan Duran Varlıklar", "reference": "23CD03-060100-23", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Amortisman Kontrolleri", "Değerleme ve Değer Düşüklüğü Kontrolleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Özkaynak Yöntemiyle Değerlenen Yatırımlar", "reference": "23CD03-060100-24", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Ertelenen Vergi Varlığı - Yükümlülüğü", "reference": "23CD03-060100-25", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Finansal Borçlar", "reference": "23CD03-060100-26", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Mutabakatlar(VUK)", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol", "Kredi Çalışması"] },
  { "name": "Diğer Finansal Yükümlülükler", "reference": "23CD03-060100-30", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Mutabakatlar(VUK)", "Sözleşme Testleri", "Sonraki Dönem Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Ödenecek Vergi ve Yükümlülükler", "reference": "23CD03-060100-31", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Kısa ve Uzun Vadeli Karşılıklar", "reference": "23CD03-060100-32", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol", "Dava Karşılıkları "] },
  { "name": "Ertelenmiş Gelirler", "reference": "23CD03-060100-33", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Diğer Kısa ve Uzun Vadeli Yükümlülükler", "reference": "23CD03-060100-35", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol", "Kıdem Tazminatı Çalışması"] },
  { "name": "Özkaynaklar", "reference": "23CD03-060100-36", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Hasılat", "reference": "23CD03-060100-38", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Hasılat Dönemsellik Testi", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Satışların Maliyeti", "reference": "23CD03-060100-39", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Sonraki Dönem Testleri", "Maliyet Kontrolleri", "Envanter Kontrolleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Faaliyet Giderleri", "reference": "23CD03-060100-40", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Esas Faaliyetlerden Diğer Gelirler", "reference": "23CD03-060100-42", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Esas Faaliyetlerden Diğer Giderler", "reference": "23CD03-060100-43", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Diğer Faaliyetlerden Gelirler - Giderler", "reference": "23CD03-060100-45", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Finansman Gelirleri", "reference": "23CD03-060100-49", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] },
  { "name": "Finansman Giderleri", "reference": "23CD03-060100-50", "children": ["Risk Tespiti", "Uygulanan Denetim Teknikleri", "Uygulanan Denetim Prosedürleri", "Hesaplara İlişkin Uygulanan Denetim Testleri", "Yabancı Para Testleri", "Örneklem Çalışması", "Önemlilik Çalışması", "Dönüşüm Kayıtları Kontrol"] }
];

function turkishToTitleCase(str) {
    if (!str) return "";
    str = str.normalize('NFC');
    return str.split(' ').map(function(word) {
        if (word === "") return "";
        let lower = word.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
        let firstChar = lower.charAt(0);
        if (firstChar === 'i') firstChar = 'İ';
        else if (firstChar === 'ı') firstChar = 'I';
        else firstChar = firstChar.toUpperCase();
        return (firstChar + lower.slice(1));
    }).join(' ');
}

// 2. Parser Mantığı (Geliştirilmiş)
const menuItemsPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebUI\\src\\app\\(Uygulama)\\components\\Layout\\Vertical\\Sidebar\\MenuItems.ts';
const menuFileContent = fs.readFileSync(menuItemsPath, 'utf8');

function extractMenuTree(content) {
    // Tüm MenuItems.ts dosyasını tek bir string olarak düşünelim ve büyük blokları ayıralım
    const blocks = content.split('rol == undefined');
    // Genellikle ikinci blok (tüm yetkileri içeren) isFasAdmin kontrolü ile biter.
    const fullMenuBlock = blocks[blocks.length - 1];

    if (!fullMenuBlock) return [];

    // Braces ({, }) ve Brackets ([, ]) sayarak en dıştaki nesneleri topla
    let objects = [];
    let bCount = 0; // [ ] count
    let braceCount = 0; // { } count
    let start = -1;
    let inArray = false;

    for (let i = 0; i < fullMenuBlock.length; i++) {
        const char = fullMenuBlock[i];
        if (char === '[') {
            if (bCount === 0) inArray = true;
            bCount++;
        } else if (char === ']') {
            bCount--;
            if (bCount === 0) inArray = false;
        }

        if (inArray) {
            if (char === '{') {
                if (braceCount === 0) start = i;
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0 && start !== -1) {
                    objects.push(fullMenuBlock.substring(start, i + 1));
                    start = -1;
                }
            }
        }
    }

    function parseObj(str) {
        let node = { children: [] };
        
        let titleMatch = str.match(/title:\s*["'`](.*?)["'`],?/);
        if (titleMatch) node.title = titleMatch[1];
        
        let hrefMatch = str.match(/href:\s*["'`](.*?)["'`],?/);
        if (hrefMatch) node.href = hrefMatch[1];
        
        let formMatch = str.match(/formKodu:\s*["'`](.*?)["'`],?/);
        if (formMatch) node.formKodu = formMatch[1];
        
        let iconMatch = str.match(/icon:\s*(\w+)/);
        if (iconMatch) node.icon = iconMatch[1];

        if (str.includes('navlabel: true')) node.isLabel = true;

        // Children tespiti
        let childIdx = str.indexOf('children: [');
        if (childIdx !== -1) {
            let childContent = "";
            let innerBCount = 0;
            for (let j = childIdx + 10; j < str.length; j++) {
                if (str[j] === '[') innerBCount++;
                else if (str[j] === ']') {
                    if (innerBCount === 0) {
                        childContent = str.substring(childIdx + 10, j + 1);
                        break;
                    }
                    innerBCount--;
                }
            }
            if (childContent) {
                // Alt nesneleri ayıkla
                let innerObjs = [];
                let iBrace = 0;
                let iStart = -1;
                for (let k = 0; k < childContent.length; k++) {
                    if (childContent[k] === '{') {
                        if (iBrace === 0) iStart = k;
                        iBrace++;
                    } else if (childContent[k] === '}') {
                        iBrace--;
                        if (iBrace === 0 && iStart !== -1) {
                            innerObjs.push(childContent.substring(iStart, k + 1));
                            iStart = -1;
                        }
                    }
                }
                node.children = innerObjs.map(parseObj);
            }
        }
        return node;
    }

    let tree = objects.map(parseObj);

    function cleanup(nodes) {
        return nodes.filter(n => {
            if (n.isLabel) return false;
            if (!n.title && n.children.length === 0) return false;
            n.children = cleanup(n.children);
            return true;
        });
    }

    return cleanup(tree);
}

const rawTree = extractMenuTree(menuFileContent);

// 3. Nihai Üretim
let globalId = 1;
function generate(nodes, parentId = null, depthPrefix = "", arsivKlasor = "CD") {
    let results = [];
    nodes.forEach((node, index) => {
        const id = globalId++;
        const idxStr = (index + 1).toString().padStart(2, '0');
        
        let dosyaNevi = "";
        let referansNo = null;

        if (!parentId) {
            dosyaNevi = `${arsivKlasor}-${idxStr}.`;
        } else {
            let clean = depthPrefix.replace(/[CS]D-|\./g, "");
            if (clean.length === 2) {
                dosyaNevi = `1.${clean}.00.${idxStr}`;
                referansNo = `-${clean}${idxStr}00-01`.substring(0, 10);
            } else {
                dosyaNevi = `${depthPrefix}${idxStr}`;
            }
        }

        let formKodu = node.formKodu || "";
        const normName = (node.title || "").trim().toLowerCase();
        if (!formKodu && nameToFormKodu.has(normName)) formKodu = nameToFormKodu.get(normName);

        const ref = urlToRef.get(node.href);
        if (ref) {
            if (ref.DosyaNevi) dosyaNevi = ref.DosyaNevi;
            if (ref.ReferansNo) referansNo = ref.ReferansNo;
            if (!formKodu && ref.FormKodu) formKodu = ref.FormKodu;
        }

        results.push({
            "Id": id,
            "DosyaNevi": dosyaNevi,
            "BelgeAdi": turkishToTitleCase(node.title || ""),
            "ReferansNo": referansNo,
            "FormKodu": formKodu,
            "Icon": node.icon || "IconPoint",
            "ParentId": parentId,
            "FormUrl": node.href || "",
            "ArsivKlasorAdi": arsivKlasor + "-" + idxStr,
            "Bobimi": 1,
            "Tfrsmi": 1,
            "ArsivAdi": parentId ? null : turkishToTitleCase(node.title || ""),
            "Sira": index + 1
        });

        let childrenNodes = [...(node.children || [])];

        // MÜŞTERİ altına enjeksiyon
        if ((node.title === "MÜŞTERİ" || node.href === "/Musteri") && musterBelgeleriChildren.length > 0) {
            childrenNodes.push({
                title: "Müşteri Belgeleri",
                href: "/Musteri/MusteriBelgeleri",
                icon: "IconFolderOpen",
                children: musterBelgeleriChildren
            });
        }

        if (node.title === "Maddi Doğrulama Prosedürleri") {
            const mdp = maddiDogrulamaBobi.map(d => ({
                title: d.name,
                href: node.href + "/" + path.basename(d.reference),
                icon: "IconPoint",
                children: d.children.map(c => ({
                    title: c,
                    href: node.href + "/" + path.basename(d.reference) + "/" + slugify(c),
                    icon: "IconPoint",
                    children: []
                }))
            }));
            results = results.concat(generate(mdp, id, dosyaNevi, arsivKlasor));
        } else if (childrenNodes.length > 0) {
            results = results.concat(generate(childrenNodes, id, dosyaNevi, parentId ? arsivKlasor : `CD-${idxStr}`));
        }
    });
    return results;
}

function slugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u').replace(/[şŞ]/g, 's').replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
        .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

const output = generate(rawTree);
fs.writeFileSync('c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json', JSON.stringify(output, null, 2), 'utf8');
console.log(`NihaiMenuler.json güncellendi. Toplam ${output.length} kalem.`);
