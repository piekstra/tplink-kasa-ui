import { makeStyles, createStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import React, { useState, useEffect } from 'react';
import Header from 'src/components/Header/Header';
import Dashboard from 'src/components/Dashboard/Dashboard';
import ApiConfigService from 'src/services/ApiConfigService';
import Authentication from 'src/components/Authentication';

const useStyles = makeStyles(() =>
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('access_token'));

  useEffect(() => {
    fetch(`${ApiConfigService.ROOT_PATH}/time`)
      .then((res) => res.json())
      .then((data) => {
        setCurrentTime(data.time);
      });
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(!!localStorage.getItem('access_token'));
  };

  return (
    <div>
      {!isAuthenticated && <Authentication handleAuthenticated={handleAuthenticated} />}
      {isAuthenticated && (
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
      )}
    </div>
  );
}

export default App;
