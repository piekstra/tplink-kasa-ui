import { useEffect, useRef } from 'react'
import useInterval from '../../services/useInterval'
import DevicePowerManager from '../../services/DevicePowerManager'
import './CurrentPower.css';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);
// This hides the amcharts logo from the chart - by license this is only
// allowed if appropriate attribution is provided for amcharts somewhere
// obvious on the page
am4core.addLicense("ch-custom-attribution");

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
            let chart = am4core.create("chartdiv", am4charts.XYChart)
            chart.paddingRight = 20;
            chart.data = [initialPowerData];
        
            let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.grid.template.location = 0;
        
            let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            if (valueAxis.tooltip) {
                valueAxis.tooltip.disabled = true;
            }
            valueAxis.renderer.minWidth = 35;
            
            Object.keys(chart.data[0]).forEach((dataKey: string) => {
                if (dataKey === 'timestamp') return;
                let series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.dateX = "timestamp";
                series.name = dataKey;
                series.dataFields.valueY = dataKey;
                series.tooltipText = "[#000]{name}: {valueY}[/]";
                if (series.tooltip) {
                    series.tooltip.background.fill = am4core.color("#FFF");
                    series.tooltip.getStrokeFromObject = true;
                    series.tooltip.background.strokeWidth = 3;
                    series.tooltip.getFillFromObject = false;
                }
                series.fillOpacity = 0.6;
                series.strokeWidth = 2;
                series.stacked = true;
            })            

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.xAxis = dateAxis;
            chart.paddingLeft = 0;

            // Add a legend and customize it
            chart.legend = new am4charts.Legend();
            chart.legend.useDefaultMarker = true;
            chart.legend.fontSize = 12;
            chart.legend.maxHeight = 40;
            chart.legend.scrollable = true;
            chart.legend.itemContainers.template.paddingTop = 2;
            chart.legend.itemContainers.template.paddingBottom = 2;
            chart.legend.labels.template.paddingTop = 3;
            chart.legend.markers.template.valign = "middle";
            chart.legend.markers.template.width = 8;
            chart.legend.markers.template.height = 8;
            let marker: any = chart.legend.markers.template.children.getIndex(0);
            if (marker) {
                marker.cornerRadius(4, 4, 4, 4);
            }
        
            chartStateHolder.current = chart;
        
            return () => {
              chart.dispose();
            };
        })
    }, [props.deviceAlias]);

    return (
        <div className="chart" id="chartdiv">
        </div>
    );
}
