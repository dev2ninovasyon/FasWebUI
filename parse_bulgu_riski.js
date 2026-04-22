const xlsx = require('xlsx');

const filePath = "C:\\Users\\lenov\\source\\repos\\dev2ninovasyon\\FAS_Bulgu_Riski_v4 23 mart 2026 (1).xlsx";
const workbook = xlsx.readFile(filePath);

console.log("=== KR KONTROLLERİ ===");
const krData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[2]], { defval: "" });
krData.slice(0, 30).forEach((row, i) => {
  const vals = Object.values(row);
  console.log(JSON.stringify(vals));
});
