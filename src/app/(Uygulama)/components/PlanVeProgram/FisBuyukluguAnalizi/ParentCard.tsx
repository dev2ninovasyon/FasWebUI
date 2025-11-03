"use client";
import React, { useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { Card, CardHeader, CardContent, Divider, Box } from "@mui/material";


type Props = {
  title: string;
  footer?: string | React.ReactNode;
  codeModel?: React.ReactNode;
  children: React.ReactNode;
};

const ParentCard = ({ title, children, footer, codeModel }: Props) => {


  const theme = useTheme();
  const borderColor = theme.palette.divider;

  return (
    <Card
      sx={{
        padding: 0,
      }}

    >
      <CardHeader title={title} action={codeModel} />
      <Divider />

      <CardContent>{children}</CardContent>
      {footer ? (
        <>
          <Divider />
          <Box p={3}>{footer}</Box>
        </>
      ) : (
        ""
      )}
    </Card>
  );
};

export default ParentCard;
