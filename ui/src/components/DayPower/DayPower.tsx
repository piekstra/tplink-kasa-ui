import React, { useEffect, useRef } from 'react';
import DevicePowerManager from 'src/services/DevicePowerManager';
import AmChartsXYChartBuilder from 'src/services/AmChartsXYChartBuilder';
import './DayPower.css';

interface Props {
  deviceAlias: string;
}

const CHART_TITLE = 'Device Power Daily Average kWh';

export default function DayPower(props: Props) {
  const chartStateHolder = useRef<any>(null);

  useEffect(() => {
    DevicePowerManager.fetchDailyPowerData(props.deviceAlias, (dayPowerData, dataKeys) => {
      console.log('GOT DAILY POWER DATA RESPONSE');
      console.log(dataKeys);
      console.log(dayPowerData);
      const chartBuilder = new AmChartsXYChartBuilder('daypowerchartdiv');
      chartBuilder.addTitle(CHART_TITLE);
      chartBuilder.setDataPoints(dayPowerData, 'date', dataKeys);

      chartStateHolder.current = chartBuilder.chart;

      return () => {
        chartBuilder.chart.dispose();
      };
    });
  }, [props.deviceAlias]);

  return <div className="chart" id="daypowerchartdiv" />;
}
