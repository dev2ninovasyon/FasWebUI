import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import DosyaTable from "./DosyaTable";
import { renderWithProviders } from "@/test/test-utils";
import { getDosyaBilgileri } from "@/api/Dosya/DosyaBilgileri";

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

type TestRow = {
  id: number;
  adi: string;
  olusturulmaTarihi: string;
  durum: string;
  progress?: number;
};

const StatefulDosyaTable = ({
  initialRows = baseRows,
  fileType = "E-DefterKebir",
}: {
  initialRows?: TestRow[];
  fileType?: string;
}) => {
  const [rows, setRows] = React.useState<TestRow[]>(initialRows);

  return (
    <DosyaTable
      rows={rows}
      fetchedData={null}
      fileType={fileType}
      dosyaYuklendiMi={true}
      setRows={(nextRows) => setRows(nextRows)}
      setDosyaYuklendiMi={vi.fn()}
    />
  );
};

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

  it("formats upload timestamp with hour and minute", async () => {
    vi.mocked(getDosyaBilgileri).mockResolvedValue([
      {
        id: 10,
        adi: "6640804404-202403-K-000000.xml",
        olusturulmaTarihi: "2026-03-06T15:15:42",
        durum: "Tamamlandı",
        progress: 100,
      },
    ] as any);

    renderWithProviders(<StatefulDosyaTable initialRows={[]} />);

    expect(await screen.findByText("06.03.2026 15:15")).toBeInTheDocument();
  });
});
