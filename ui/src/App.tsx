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
      <p className="AmCharts">
        <a href="https://www.amcharts.com/docs/v4/" target="_blank" rel="noreferrer">
          Charts are provided by amCharts 4
        </a>
      </p>
    </div>
  );
}

export default App;
