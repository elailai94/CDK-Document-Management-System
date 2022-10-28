import { CardContent, Typography } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  metadataContainer: {
    marginTop: theme.spacing(2),
  },
}));

function MetadataSection({ title, children }) {
  const classes = useStyles();

  return (
    <CardContent>
      <Typography gutterBottom variant="h6" component="h3">
        {title}
      </Typography>
      <div className={classes.metadataContainer}>
        {children}
      </div>
    </CardContent>
  );
}

MetadataSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default MetadataSection;
