import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid, { GridSpacing } from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { CurrentPower } from '../'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      height: 300,
      width: 450,
      elevation: 3,
    },
    control: {
      padding: theme.spacing(1),
    },
  }),
);

export default function Dashboard() {
  const [spacing] = React.useState<GridSpacing>(1);
  const classes = useStyles();

  return (
    <Grid container className={classes.root} spacing={1} >
      <Grid item xs={12}>
        <Grid container justify="center" spacing={spacing}>
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <Grid key={value} item>
              <Paper className={classes.paper}>
                <CurrentPower />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
