"use client";

export type TestResultStatus = "PASS" | "FAIL";

export type TestResultDto = {
  test: string;
  status: TestResultStatus;
};

const mockResults: TestResultDto[] = [
  { test: "Amortisman_Hesaplama", status: "PASS" },
  { test: "EnflasyonDuzeltme", status: "PASS" },
  { test: "KrediHesaplama", status: "FAIL" },
  { test: "KurFarkiOrnekFisler", status: "PASS" },
  { test: "DonusumMizanKonsolidasyon", status: "PASS" },
  { test: "BeklenenKrediZarari", status: "FAIL" },
  { test: "CekSenetReeskont", status: "PASS" },
  { test: "KidemTazminatiTfrs", status: "PASS" },
];

export async function getTestResults(): Promise<TestResultDto[]> {
  return Promise.resolve(mockResults);
}
