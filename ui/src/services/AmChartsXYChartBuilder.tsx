import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
// eslint-disable-next-line camelcase
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);
// This hides the amcharts logo from the chart - by license this is only
// allowed if appropriate attribution is provided for amcharts somewhere
// obvious on the page
am4core.addLicense('ch-custom-attribution');

// TODO merge tooltips into one view: https://www.amcharts.com/docs/v4/tutorials/multi-series-shared-tooltip-with-colored-bullets/
// TODO Set up a more contrasting, custom, color theme. Current theme is very rainbowy
// TODO set "mock data" for charts so they render something while data is being loaded
// TODO fix x-axis grid width (it gets squished on the current power data for certain date ranges)
// TODO hide legend scrollbar when not needed (may just need slight height adjustments)
export default class AmChartsXYChartBuilder {
  chart: am4charts.XYChart;

  constructor(chartElementName: string) {
    this.chart = am4core.create(chartElementName, am4charts.XYChart);
    this.chart.paddingRight = 20;
    this.chart.paddingLeft = 0;

    this.addXAxis();
    this.addYAxis();
    this.addLegend();
  }

  private addYAxis() {
    const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    if (valueAxis.tooltip) {
      valueAxis.tooltip.disabled = true;
    }
    valueAxis.renderer.minGridDistance = 20;
  }

  private addXAxis() {
    // date-based X axis
    const dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.ticks.template.disabled = true;
    dateAxis.renderer.minGridDistance = 50;
    dateAxis.dateFormatter = new am4core.DateFormatter();
    dateAxis.dateFormats.setKey('day', 'MM-dd');
    dateAxis.periodChangeDateFormats.setKey('day', 'MM-dd');

    // Add a for the dateAxis cursor
    this.chart.cursor = new am4charts.XYCursor();
    this.chart.cursor.xAxis = dateAxis;
  }

  private addLegend() {
    const legend = new am4charts.Legend();
    legend.useDefaultMarker = true;
    legend.fontSize = 12;
    legend.maxHeight = 40;
    legend.scrollable = true;
    legend.itemContainers.template.paddingTop = 2;
    legend.itemContainers.template.paddingBottom = 2;
    legend.labels.template.paddingTop = 3;
    legend.markers.template.valign = 'middle';
    legend.markers.template.width = 8;
    legend.markers.template.height = 8;
    const marker: any = legend.markers.template.children.getIndex(0);
    if (marker) {
      marker.cornerRadius(4, 4, 4, 4);
    }
    this.chart.legend = legend;
  }

  addTitle(title: string) {
    const chartTitle = this.chart.titles.create();
    chartTitle.text = title;
    chartTitle.align = 'left';
    chartTitle.fontWeight = '600';
    chartTitle.marginBottom = 20;
    chartTitle.paddingLeft = 10;
  }

  setFirstDataPoint(data: any, xKey: string) {
    this.chart.data = [data];
    this.buildChartSeries(data, xKey);
  }

  setDataPoints(data: Array<any>, xKey: string, dataKeys: Array<string>) {
    this.chart.data = data;
    this.buildChartSeries(data, xKey, dataKeys);
  }

  private buildChartSeries(data: any, xKey: string, keys?: Array<string>) {
    // Keys will be extracted from the data if not specified
    const dataKeys = keys || Object.keys(data);
    dataKeys.forEach((dataKey: string) => {
      if (dataKey === xKey) return;
      const series = this.chart.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = xKey;
      series.name = dataKey;
      series.dataFields.valueY = dataKey;
      series.tooltipText = '[#000]{name}: {valueY}[/]';
      if (series.tooltip) {
        series.tooltip.background.fill = am4core.color('#FFF');
        series.tooltip.getStrokeFromObject = true;
        series.tooltip.background.strokeWidth = 3;
        series.tooltip.getFillFromObject = false;
      }
      series.fillOpacity = 1.0;
      // series.strokeWidth = 2;
      series.stacked = true;
    });
  }
}
