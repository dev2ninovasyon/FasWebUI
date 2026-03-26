const fs = require('fs');
const path = 'c:/Users/lenov/source/repos/dev2ninovasyon/FasWebUI/src/app/(Uygulama)/Musteri/MusteriTanima/MusteriTanima.tsx';
let txt = fs.readFileSync(path, 'utf8');

txt = txt.replace(/<Grid item xs=\{12\} md=\{6\}>/g, '<Grid size={{ xs: 12, md: 6 }}>');
txt = txt.replace(/<Grid item xs=\{12\} sm=\{6\}>/g, '<Grid size={{ xs: 12, sm: 6 }}>');
txt = txt.replace(/<Grid item xs=\{12\}>/g, '<Grid size={{ xs: 12 }}>');

fs.writeFileSync(path, txt);
