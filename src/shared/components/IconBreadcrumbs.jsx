import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  link: {
    display: "flex",
    color: "inherit",
  },
  icon: {
    marginRight: theme.spacing(0.5),
    width: 20,
    height: 20,
  },
}));

const IconBreadcrumbs = ({ paths, separator }) => {
  const classes = useStyles();

  return (
    <Breadcrumbs separator={separator} aria-label="breadcrumb" style={{ marginBottom: "10px" }}>
      {paths.map((path, idx, arr) => {
        if (arr.length - 1 === idx) {
          return (
            <Typography color="textPrimary" className={classes.link} key={path.id}>
              <path.icon className={classes.icon} />
              {path.name}
            </Typography>
          );
        }

        return (
          <Link to={path.to} className={classes.link} key={path.id}>
            <path.icon className={classes.icon} />
            {path.name}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default IconBreadcrumbs;
