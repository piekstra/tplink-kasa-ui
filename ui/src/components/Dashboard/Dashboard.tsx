import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid, { GridSpacing } from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import { CurrentPower } from '../'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    margin: {
      margin: theme.spacing(1),
    },
    intervalInput: {
      width: 120,
      marginLeft: theme.spacing(3),
    },
    paper: {
      height: 300,
      width: 450,
      elevation: 3,
    },
    paper2: {
      height: 300,
      width: '50%',
      elevation: 3,
    },
    paper3: {
      height: 300,
      elevation: 3,
    },
    control: {
      padding: theme.spacing(1),
    },
  }),
);

export default function Dashboard() {
  const [autoRefresh, setAutoRefresh] = React.useState(false)
  const [refreshInterval, setRefreshInterval] = React.useState('60')
  const [spacing] = React.useState<GridSpacing>(1);
  const classes = useStyles();

  const handleRefreshChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoRefresh(event.target.checked);
  };

  const handleRefreshIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRefreshInterval(event.target.value)
  }

  return (
    <Grid container className={classes.root} spacing={spacing} >
      <Grid item xs={12} container justify="flex-end" alignItems="center">
        <FormControl className={classes.intervalInput}>
          <InputLabel htmlFor="standard-adornment-amount">Refresh Interval</InputLabel>
          <Input
            id="refresh-interval"
            type="number"
            value={refreshInterval}
            endAdornment={<InputAdornment position="end">sec</InputAdornment>}
            onChange={handleRefreshIntervalChange}
          />
        </FormControl>
        <FormControlLabel
          control={
            <Switch 
              color="primary" 
              checked={autoRefresh}
              onChange={handleRefreshChange}
            />
          }
          label="Auto Refresh"
          labelPlacement="top"
        />
      </Grid>
      <Grid item xs={12} sm={10} md={6} lg={6}>
        <Paper className={classes.paper3}>
          <CurrentPower 
            autoRefresh={autoRefresh} 
            refreshInterval={parseInt(refreshInterval)*1000} 
            deviceAlias="Miner" 
            maxDataPoints={10}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}
