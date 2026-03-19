const fs = require('fs');

const nihaiPath = 'c:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FasWebAPI\\Data\\JsonFiles\\NihaiMenuler.json';
let data = JSON.parse(fs.readFileSync(nihaiPath, 'utf8'));

// 1. Müşteri Belgeleri kaydını bul
const mb = data.find(r => r.BelgeAdi === 'Müşteri Belgeleri' && r.FormUrl === '/Musteri/MusteriBelgeleri');
if (!mb) { console.error('Müşteri Belgeleri bulunamadı!'); process.exit(1); }
console.log(`Müşteri Belgeleri bulundu: Id=${mb.Id}, ParentId=${mb.ParentId}`);

const oldMBId = mb.Id;

// 2. Müşteri Belgeleri'ni kök menü yap
mb.ParentId = null;
mb.FormUrl = '/MusteriBelgeleri';
mb.ArsivKlasorAdi = 'CD-05';
mb.ArsivAdi = 'Müşteri Belgeleri';
mb.Icon = 'IconFileDescription';

// 3. Müşteri Belgeleri'nin çocukları zaten ParentId=oldMBId'ye bağlı, değişiklik yok
const musteriBelgeleriChildren = data.filter(r => r.ParentId === oldMBId);
console.log(`Müşteri Belgeleri çocukları: ${musteriBelgeleriChildren.length}`);

// 4. Müşteri'nin (ParentId=null, /Musteri) Sira değerini bul
const musteri = data.find(r => r.BelgeAdi === 'Müşteri' && r.ParentId === null);
console.log(`Müşteri kök menü: Id=${musteri.Id}, Sira=${musteri.Sira}`);

// 5. Müşteri Belgeleri kaydını kökler arasına (Müşteri'nin yanına) taşı
// Önce mevcut pozisyondan çıkar
data = data.filter(r => r.Id !== oldMBId);

// Çocukları da geçici olarak çıkar
const mbChildren = data.filter(r => r.ParentId === oldMBId);
data = data.filter(r => r.ParentId !== oldMBId);

// Müşteri'nin indexini bul ve Müşteri Belgeleri + çocuklarını Müşteri'den sonra ekle
const musteriIdx = data.findIndex(r => r.Id === musteri.Id);
data.splice(musteriIdx + 1, 0, mb, ...mbChildren);

// 6. Kök menü Sira değerlerini düzenle: Müşteri Belgeleri'nin Sira'sı uygun olsun
// Kök menüleri Müşteri Belgeleri'ni dahil edecek şekilde yeniden sırala
const rootItems = data.filter(r => r.ParentId === null);
rootItems.forEach((r, i) => { r.Sira = i + 1; });

// 7. Müşteri Belgeleri çocuklarının Sira'sı zaten doğru (1-34)
// Kontrol et
const mbFinal = data.find(r => r.BelgeAdi === 'Müşteri Belgeleri' && r.ParentId === null);
console.log(`Müşteri Belgeleri artık kök: Id=${mbFinal?.Id}, Sira=${mbFinal?.Sira}`);

// 8. Müşteri altındaki Sira'ları düzelt (Müşteri Belgeleri artık orada yok)
const musteriChildren = data.filter(r => r.ParentId === musteri.Id);
musteriChildren.forEach((r, i) => { r.Sira = i + 1; });
console.log(`Müşteri altında kalan çocuklar: ${musteriChildren.length}`);
musteriChildren.forEach(r => console.log(`  ${r.Id}. ${r.BelgeAdi} | Sira:${r.Sira}`));

// 9. Kaydet
fs.writeFileSync(nihaiPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nTamamlandı! Toplam ${data.length} kayıt.`);
