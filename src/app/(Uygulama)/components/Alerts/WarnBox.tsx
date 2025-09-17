import * as React from "react";
import { Grid, Paper, Typography } from "@mui/material";

interface Props {
  warn: string[];
  noMargin?: boolean;
}

const WarnBox = ({ warn, noMargin = false }: Props) => {
  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12} lg={12}>
          <Paper
            elevation={2}
            sx={{
              p: 1,
              mb: noMargin ? 0 : 2,
              borderRadius: 1,
              backgroundColor: "warning.light",
            }}
          >
            {warn.map((warnMessage, index) => (
              <Typography
                key={index}
                variant="body1"
                sx={{ color: "warning.dark" }}
              >
                - {warnMessage}
              </Typography>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default WarnBox;
