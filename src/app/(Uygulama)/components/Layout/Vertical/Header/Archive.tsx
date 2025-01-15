import React from "react";
import { IconButton, Box, Tooltip } from "@mui/material";

import { IconArchive } from "@tabler/icons-react";

const Archive = () => {
  return (
    <Box>
      <Tooltip title="Arşive Git">
        <IconButton size="large" aria-label="archive button" color="inherit">
          <IconArchive size="20" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Archive;
