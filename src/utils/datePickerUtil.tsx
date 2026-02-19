import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Tooltip } from "@mui/material";
import React from "react";

/**
 * Converts a date string in YYYY-MM-DD format to a dayjs object
 * Used for DatePicker component value
 */
export const parseDate = (dateString: string): Dayjs | null => {
  if (!dateString) return null;
  return dayjs(dateString);
};

/**
 * Converts a dayjs object to YYYY-MM-DD format string
 * Used for API calls and state management
 */
export const formatDateForAPI = (date: Dayjs | null): string => {
  return date ? date.format("YYYY-MM-DD") : "";
};

/**
 * Material-UI DatePicker component with DD/MM/YYYY display format
 * and YYYY-MM-DD internal format for API compatibility
 */
export const CustomDatePicker = ({
  value,
  onChange,
  id,
  disabled = false,
  slotProps = {},
}: {
  value: string;
  onChange: (dateString: string) => void;
  id: string;
  disabled?: boolean;
  slotProps?: any;
}) => {
  return (
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(date) => onChange(formatDateForAPI(date))}
      format="DD/MM/YYYY"
      disabled={disabled}
      slotProps={{
        textField: {
          id,
          fullWidth: true,
          ...slotProps.textField,
        },
        ...slotProps,
      }}
    />
  );
};
