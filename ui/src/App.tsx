import { useState, useEffect } from 'react';
import './App.css';
import { DashboardDrawer } from './components'

function App() {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    fetch('/api/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);

  return (
    <div className="App">
      <DashboardDrawer />
      <p className="ServerTime">The current time is {currentTime}.</p>
    </div>
  );
}

export default App;
