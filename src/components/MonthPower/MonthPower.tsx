import React, { useEffect, useRef } from 'react';
import DevicePowerManager from 'src/services/DevicePowerManager';
import AmChartsXYChartBuilder from 'src/services/AmChartsXYChartBuilder';
import 'src/components/MonthPower/MonthPower.css';

interface Props {
  deviceAlias: string;
}

const CHART_TITLE = 'Device Power Monthly Average kWh';

export default function MonthPower(props: Props) {
  const chartStateHolder = useRef<any>(null);

  useEffect(() => {
    DevicePowerManager.fetchMonthlyPowerData(props.deviceAlias, (monthPowerData, dataKeys) => {
      // console.log('GOT MONTHLY POWER DATA RESPONSE');
      // console.log(dataKeys);
      // console.log(monthPowerData);
      const chartBuilder = new AmChartsXYChartBuilder('monthpowerchartdiv');
      chartBuilder.addTitle(CHART_TITLE);
      chartBuilder.setDataPoints(monthPowerData, 'date', dataKeys);

      chartStateHolder.current = chartBuilder.chart;

      return () => {
        chartBuilder.chart.dispose();
      };
    });
  }, [props.deviceAlias]);

  return <div className="chart" id="monthpowerchartdiv" />;
}
