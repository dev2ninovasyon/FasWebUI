import { renderWithProviders } from "@/test/test-utils";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TestSonuclariPage from "./TestSonuclariPage";

vi.mock("@/api/TestSonuclari/TestSonuclari", () => ({
  getTestResults: vi.fn().mockResolvedValue([
    { test: "Amortisman_Hesaplama", status: "PASS" },
    { test: "EnflasyonDuzeltme", status: "PASS" },
    { test: "KrediHesaplama", status: "FAIL" },
  ]),
}));

describe("TestSonuclariPage", () => {
  it("renders summary cards and table rows", async () => {
    renderWithProviders(<TestSonuclariPage />);

    expect(await screen.findByText("Toplam Test")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Amortisman_Hesaplama")).toBeInTheDocument();
    expect(screen.getByText("KrediHesaplama")).toBeInTheDocument();
  });

  it("filters rows by search text and status", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestSonuclariPage />);

    await screen.findByText("Amortisman_Hesaplama");

    await user.type(screen.getByLabelText("Test adina gore ara"), "Kredi");
    expect(screen.getByText("KrediHesaplama")).toBeInTheDocument();
    expect(screen.queryByText("Amortisman_Hesaplama")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Test adina gore ara"));
    await user.click(screen.getByLabelText("Durum"));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByText("FAIL"));

    expect(screen.getByText("KrediHesaplama")).toBeInTheDocument();
    expect(screen.queryByText("EnflasyonDuzeltme")).not.toBeInTheDocument();
  });
});
