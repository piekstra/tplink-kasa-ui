import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Authentication/unauthenticated-app';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    serverTime: {
      textAlign: 'center',
    },
    amCharts: {
      textAlign: 'center',
    },
  })
);

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const classes = useStyles();

  // const AuthenticatedApp = React.lazy(() => import('./authenticated-app'));
  // const UnauthenticatedApp = React.lazy(() => import('./components/Authentication/unauthenticated-app'));

  // const user = useUser()
  return <Login />;

  useEffect(() => {
    fetch('/api/time')
      .then((res) => res.json())
      .then((data) => {
        setCurrentTime(data.time);
      });
  }, []);

  return (
    <div>
      <CssBaseline />
      <Header />
      <Container maxWidth="xl">
        <Dashboard />
        <p className={classes.serverTime}>The current time is {currentTime}.</p>
        <p className={classes.amCharts}>
          <a href="https://www.amcharts.com/docs/v4/" target="_blank" rel="noreferrer">
            Charts are provided by amCharts 4
          </a>
        </p>
      </Container>
    </div>
  );
}

export default App;
