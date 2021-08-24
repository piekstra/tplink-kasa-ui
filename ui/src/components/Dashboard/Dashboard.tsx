import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid, { GridSpacing } from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

import CurrentPower from 'src/components/CurrentPower/CurrentPower'
import DayPower from 'src/components/DayPower/DayPower'
import MonthPower from 'src/components/MonthPower/MonthPower'

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
  })
);

// TODO support login / auth capability and account view to see current Kasa credentials or change them
export default function Dashboard() {
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [refreshInterval, setRefreshInterval] = React.useState('60');
  const [devicesLikeInputValue, setDevicesLikeInputValue] = React.useState('Miner');
  const [devicesLike, setDevicesLike] = React.useState('Miner');
  const [spacing] = React.useState<GridSpacing>(1);
  const classes = useStyles();

  const handleRefreshChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoRefresh(event.target.checked);
  };

  const handleRefreshIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRefreshInterval(event.target.value);
  };

  const handleDevicesLikeInputValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDevicesLikeInputValue(event.target.value);
  };

  // Only update the chart data filter when the input field loses focus
  const handleDevicesLikeChange = () => {
    setDevicesLike(devicesLikeInputValue);
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={spacing}>
        <Grid item xs={12} container justify="flex-end" alignItems="center">
          <FormControl>
            <InputLabel htmlFor="standard-adornment-amount">Devices Like</InputLabel>
            <Input
              id="devices-like"
              value={devicesLikeInputValue}
              onChange={handleDevicesLikeInputValueChange}
              onBlur={handleDevicesLikeChange}
            />
          </FormControl>
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
            control={<Switch color="primary" checked={autoRefresh} onChange={handleRefreshChange} />}
            label="Auto Refresh"
            labelPlacement="top"
          />
        </Grid>
        <Grid item xs={12} sm={10} md={6} lg={6}>
          <Paper className={classes.paper3}>
            <DayPower deviceAlias={devicesLike} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={10} md={6} lg={6}>
          <Paper className={classes.paper3}>
            <CurrentPower
              autoRefresh={autoRefresh}
              refreshInterval={parseInt(refreshInterval, 10) * 1000}
              deviceAlias={devicesLike}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={10} md={6} lg={6}>
          <Paper className={classes.paper3}>
            <MonthPower deviceAlias={devicesLike} />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
