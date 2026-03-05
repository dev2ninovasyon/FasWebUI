import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import DosyaTable from "./DosyaTable";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("notistack", () => ({
  useSnackbar: () => ({
    enqueueSnackbar: vi.fn(),
    closeSnackbar: vi.fn(),
  }),
}));

vi.mock("@/api/Dosya/DosyaBilgileri", () => ({
  getDosyaBilgileri: vi.fn(async () => []),
  deleteDosyaBilgisiMultiple: vi.fn(async () => true),
  getDefterYuklemeLoglari: vi.fn(async () => ""),
}));

const baseRows = [
  {
    id: 1,
    adi: "6640804404-202401-K-000000.xml",
    olusturulmaTarihi: "01.01.2024",
    durum: "Tamamlandı",
    progress: 100,
  },
  {
    id: 2,
    adi: "6640804404-202402-K-000000.xml",
    olusturulmaTarihi: "01.02.2024",
    durum: "Tamamlandı",
    progress: 100,
  },
];

describe("DosyaTable month filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows month options with numeric prefix", async () => {
    renderWithProviders(
      <DosyaTable
        rows={baseRows}
        fetchedData={null}
        fileType="E-DefterKebir"
        dosyaYuklendiMi={true}
        setRows={vi.fn()}
        setDosyaYuklendiMi={vi.fn()}
      />
    );

    const aySelect = screen.getByLabelText("Ay");
    fireEvent.mouseDown(aySelect);

    expect(await screen.findByRole("option", { name: "01-Ocak" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "02-Şubat" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "12-Aralık" })).toBeInTheDocument();
  });

  it("filters uploaded rows by selected month", async () => {
    renderWithProviders(
      <DosyaTable
        rows={baseRows}
        fetchedData={null}
        fileType="E-DefterKebir"
        dosyaYuklendiMi={true}
        setRows={vi.fn()}
        setDosyaYuklendiMi={vi.fn()}
      />
    );

    expect(screen.getByText("202401-K-000000.xml")).toBeInTheDocument();
    expect(screen.getByText("202402-K-000000.xml")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByLabelText("Ay"));
    fireEvent.click(await screen.findByRole("option", { name: "02-Şubat" }));

    await waitFor(() => {
      expect(screen.queryByText("202401-K-000000.xml")).not.toBeInTheDocument();
    });
    expect(screen.getByText("202402-K-000000.xml")).toBeInTheDocument();
  });
});
