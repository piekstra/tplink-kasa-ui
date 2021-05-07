import { useEffect, useRef } from 'react'
import useInterval from '../../services/useInterval'
import DevicePowerManager from '../../services/DevicePowerManager'
import AmChartsXYChartBuilder from '../../services/AmChartsXYChartBuilder'
import './CurrentPower.css';

interface Props {
    autoRefresh: boolean,
    refreshInterval: number,
    deviceAlias: string,
    maxDataPoints?: number,
}

const DEFAULT_MAX_DATA_POINTS = 10;

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
                })
            }
        }
    }, props.refreshInterval)

    useEffect(() => {    
        DevicePowerManager.fetchCurrentPowerData(props.deviceAlias, (initialPowerData) => {
            let chartBuilder = new AmChartsXYChartBuilder("chartdiv");
            chartBuilder.setInitialData(initialPowerData, "timestamp");
            chartBuilder.addTitle("Current Device Power");
        
            chartStateHolder.current = chartBuilder.chart;
        
            return () => {
                chartBuilder.chart.dispose();
            };
        })
    }, [props.deviceAlias]);

    return (
        <div className="chart" id="chartdiv">
        </div>
    );
}
