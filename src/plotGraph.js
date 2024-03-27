class GraphPlotter {
  /**
   * The id of the window to insert graph
   *
   */
  constructor() {}

  /**
   * Heatmap on the number of times hit each tile
   * @param {string} div_id
   * @param {{x: number[],y: number[]}} heatmap_data
   */
  plotRoadHeatmap(div_id, heatmap_data) {
    var data = [
      {
        x: heatmap_data.y,
        y: heatmap_data.x,
        type: "histogram2d",
        colorscale: "Greens",
        autocolorscale: false,
      },
    ];

    var layout = {
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      xaxis: {
        title: "Y Axis",
        // title: {
        //   text: "Y Axis",
        //   font: {
        //     family: "Courier New, monospace",
        //     size: 18,
        //     color: "#7f7f7f",
        //   },
        // },
        // range: [0, 15],
      },
      yaxis: {
        title: "X Axis",
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Histogram on the time in park for each visitor profile
   * @param {string} div_id
   * @param {{
   * kid: {enterTime: number[], leaveTime: number[], stayDuration: number[]},
   * elder: {enterTime: number[], leaveTime: number[], stayDuration: number[]},
   * adult: {enterTime: number[], leaveTime: number[], stayDuration: number[]},
   * }} time_data
   */
  plotVisitorTimeInPark(div_id, time_data) {
    var trace_kid = {
      x: time_data.kid.stayDuration,
      type: "histogram",
      name: "Kid",
      // histnorm: 'probability density',
      histnorm: "count",
      opacity: 0.5,
      marker: {
        color: "rgba(255, 100, 102, 0.7)",
        line: {
          color: "rgba(255, 100, 102, 1)",
          width: 1,
        },
      },
    };

    var trace_elder = {
      x: time_data.elder.stayDuration,
      type: "histogram",
      name: "Elder",
      // histnorm: 'probability density',
      histnorm: "count",
      opacity: 0.5,
      marker: {
        color: "rgba(100, 200, 102, 0.7)",
        line: {
          color: "rgba(100, 200, 102, 1)",
          width: 1,
        },
      },
    };

    var trace_adult = {
      x: time_data.adult.stayDuration,
      type: "histogram",
      name: "Adult",
      // histnorm: 'probability density',
      histnorm: "count",
      opacity: 0.5,
      marker: {
        color: "rgba(149, 100, 255, 0.7)",
        line: {
          color: "rgba(149, 100, 255, 1)",
          width: 1,
        },
      },
    };

    var data = [trace_kid, trace_elder, trace_adult];

    var layout = {
      bargap: 0.05,
      bargroupgap: 0.2,
      barmode: "overlay",
      //   title: "Sampled Results",
      xaxis: { title: "Time Spent in Park" },
      yaxis: { title: "Count" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
    };

    Plotly.newPlot(div_id, data, layout);
  }
}
