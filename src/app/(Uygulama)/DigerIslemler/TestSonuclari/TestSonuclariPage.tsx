"use client";

import { getTestResults, TestResultDto, TestResultStatus } from "@/api/TestSonuclari/TestSonuclari";
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";
import {
  Box,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useDeferredValue, useEffect, useState } from "react";

type StatusFilter = "ALL" | TestResultStatus;
type SortField = "test" | "status";
type SortDirection = "asc" | "desc";

const statusColorMap: Record<TestResultStatus, "success" | "error"> = {
  PASS: "success",
  FAIL: "error",
};

function sortRows(rows: TestResultDto[], field: SortField, direction: SortDirection) {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];
    return leftValue.localeCompare(rightValue, "tr") * multiplier;
  });
}

export default function TestSonuclariPage() {
  const [rows, setRows] = useState<TestResultDto[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortField, setSortField] = useState<SortField>("test");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const deferredSearchText = useDeferredValue(searchText);

  useEffect(() => {
    let active = true;

    getTestResults().then((response) => {
      if (!active) {
        return;
      }

      setRows(response);
    });

    return () => {
      active = false;
    };
  }, []);

  const normalizedSearch = deferredSearchText.trim().toLocaleLowerCase("tr");
  const filteredRows = sortRows(
    rows.filter((row) => {
      const statusMatches = statusFilter === "ALL" || row.status === statusFilter;
      const textMatches =
        normalizedSearch.length === 0 ||
        row.test.toLocaleLowerCase("tr").includes(normalizedSearch);
      return statusMatches && textMatches;
    }),
    sortField,
    sortDirection
  );

  const totalCount = rows.length;
  const passCount = rows.filter((row) => row.status === "PASS").length;
  const failCount = rows.filter((row) => row.status === "FAIL").length;
  const successRate = totalCount === 0 ? 0 : Math.round((passCount / totalCount) * 100);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BlankCard>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Toplam Test
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {totalCount}
              </Typography>
            </CardContent>
          </BlankCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BlankCard>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Basarili
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {passCount}
              </Typography>
            </CardContent>
          </BlankCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BlankCard>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Basarisiz
              </Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {failCount}
              </Typography>
            </CardContent>
          </BlankCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <BlankCard>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Basari Orani
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                %{successRate}
              </Typography>
            </CardContent>
          </BlankCard>
        </Grid>
      </Grid>

      <BlankCard>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Test adina gore ara"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="test-status-filter-label">Durum</InputLabel>
              <Select
                labelId="test-status-filter-label"
                label="Durum"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <MenuItem value="ALL">Tumu</MenuItem>
                <MenuItem value="PASS">PASS</MenuItem>
                <MenuItem value="FAIL">FAIL</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </BlankCard>

      <BlankCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === "test"}
                    direction={sortField === "test" ? sortDirection : "asc"}
                    onClick={() => handleSort("test")}
                  >
                    Test
                  </TableSortLabel>
                </TableCell>
                <TableCell width="180">
                  <TableSortLabel
                    active={sortField === "status"}
                    direction={sortField === "status" ? sortDirection : "asc"}
                    onClick={() => handleSort("status")}
                  >
                    Durum
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow hover key={`${row.test}-${row.status}`}>
                  <TableCell>{row.test}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={statusColorMap[row.status]}
                      size="small"
                      sx={{ fontWeight: 700, minWidth: 72 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Box py={4}>
                      <Typography color="text.secondary" align="center">
                        Filtreye uygun test sonucu bulunmuyor.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </BlankCard>
    </Stack>
  );
}
