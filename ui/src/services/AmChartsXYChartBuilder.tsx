import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);
// This hides the amcharts logo from the chart - by license this is only
// allowed if appropriate attribution is provided for amcharts somewhere
// obvious on the page
am4core.addLicense("ch-custom-attribution");

export default class AmChartsXYChartBuilder {
    chart: am4charts.XYChart;

    constructor(chartElementName: string) {
        this.chart = am4core.create(chartElementName, am4charts.XYChart)
        this.chart.paddingRight = 20;
        
        // Add a date-based X axis
        let dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
    
        // Setup a Y axis based on values
        let valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        if (valueAxis.tooltip) {
            valueAxis.tooltip.disabled = true;
        }
        valueAxis.renderer.minWidth = 35;

        // Add a cursor
        this.chart.cursor = new am4charts.XYCursor();
        this.chart.cursor.xAxis = dateAxis;
        this.chart.paddingLeft = 0;

        // Add a legend and customize it
        this.chart.legend = new am4charts.Legend();
        this.chart.legend.useDefaultMarker = true;
        this.chart.legend.fontSize = 12;
        this.chart.legend.maxHeight = 40;
        this.chart.legend.scrollable = true;
        this.chart.legend.itemContainers.template.paddingTop = 2;
        this.chart.legend.itemContainers.template.paddingBottom = 2;
        this.chart.legend.labels.template.paddingTop = 3;
        this.chart.legend.markers.template.valign = "middle";
        this.chart.legend.markers.template.width = 8;
        this.chart.legend.markers.template.height = 8;
        let marker: any = this.chart.legend.markers.template.children.getIndex(0);
        if (marker) {
            marker.cornerRadius(4, 4, 4, 4);
        }
    }

    addTitle(title: string) {
        let chartTitle = this.chart.titles.create();
        chartTitle.text = title;
        chartTitle.align = "left"
        chartTitle.fontWeight = "600";
        chartTitle.marginBottom = 20;
        chartTitle.paddingLeft = 10;
    }

    buildChartSeries(data: any, xKey: string) {
        Object.keys(data).forEach((dataKey: string) => {
            if (dataKey === xKey) return;
            let series = this.chart.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = xKey;
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
    }

    setInitialData(data: any, xKey: string) {
        this.chart.data = [data];
        this.buildChartSeries(data, xKey);
    }
}