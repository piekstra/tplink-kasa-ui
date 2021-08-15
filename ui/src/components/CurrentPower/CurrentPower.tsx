import React, { useEffect, useRef } from 'react';
import useInterval from 'src/services/useInterval';
import DevicePowerManager from 'src/services/DevicePowerManager';
import AmChartsXYChartBuilder from 'src/services/AmChartsXYChartBuilder';
import './CurrentPower.css';

interface Props {
  autoRefresh: boolean;
  refreshInterval: number;
  deviceAlias: string;
  // eslint-disable-next-line react/require-default-props
  maxDataPoints?: number;
}

// Number of minutes in a day
const DEFAULT_MAX_DATA_POINTS = 1440;
const CHART_TITLE = 'Device Power Current Average kWh';

export default function CurrentPower(props: Props) {
  const chartStateHolder = useRef<any>(null);

  useInterval(() => {
    if (props.autoRefresh) {
      // TODO: handle new devices appearing
      if (chartStateHolder?.current) {
        DevicePowerManager.fetchCurrentPowerData(props.deviceAlias, (currentPowerData) => {
          const maxDataPoints = props.maxDataPoints || DEFAULT_MAX_DATA_POINTS;
          // Remove data points from the start if we are at the max desired points
          chartStateHolder?.current.addData(
            currentPowerData,
            chartStateHolder?.current.data.length > maxDataPoints ? 1 : 0
          );
        });
      }
    }
  }, props.refreshInterval);

  useEffect(() => {
    DevicePowerManager.fetchCurrentPowerData(props.deviceAlias, (initialPowerData) => {
      const chartBuilder = new AmChartsXYChartBuilder('currentpowerchartdiv');
      chartBuilder.addTitle(CHART_TITLE);
      chartBuilder.setFirstDataPoint(initialPowerData, 'date');

      chartStateHolder.current = chartBuilder.chart;

      return () => {
        chartBuilder.chart.dispose();
      };
    });
  }, [props.deviceAlias]);

  return <div className="chart" id="currentpowerchartdiv" />;
}
