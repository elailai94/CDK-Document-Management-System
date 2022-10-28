import PropTypes from "prop-types";
import React from "react";
import Typography from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2),
  },
}));

function MetadataItem({ title, value }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography className={classes.pos} color="textSecondary">
        {title}
      </Typography>
      <Typography variant="body2" component="p">
        {value}
      </Typography>
    </div>
  );
}

MetadataItem.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

export default MetadataItem;
