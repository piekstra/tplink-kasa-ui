/* eslint-disable no-console */
/* eslint-disable no-debugger */
import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
// import ApiConfigService from 'src/services/ApiConfigService';

// interface Token {
//   client: ClientOAuth2;
//   data: Data;
//   tokenType: string;
//   accessToken: string;
//   refreshToken: string;
// }

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  }, // TODO: turn into static image
  image: {
    backgroundImage:
      'url(https://images.unsplash.com/photo-1595285203796-2da1c77274e4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80)',
    backgroundRepeat: 'no-repeat',
    backgroundColor: theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function UnauthenticatedApp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const AUTHORIZATION_URL = `${ApiConfigService.ROOT_PATH}/user/token`;
  // const setSession = (authResult: { tokenType: string; accessToken: string; refreshToken: string }) => {
  //   localStorage.setItem('access_token', authResult.accessToken);
  //   localStorage.setItem('refresh_token', authResult.refreshToken);
  // };

  const attemptLogin = () => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('accept', 'application/json');
    fetch('http://localhost:8000/api/v1/user/token', {
      method: 'POST',
      headers,
      body: `grant_type=&username=${email}&password=${password}`,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then((data) => console.log(data))
      .catch((error) => console.error('There has been a problem with your fetch operation:', error));
  };

  const classes = useStyles();

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              defaultValue="gkeanoxbxcozbewnli@ianvvn.com"
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              defaultValue="asdXUuu86Zbj"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={attemptLogin}
            >
              Sign In
            </Button>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}
