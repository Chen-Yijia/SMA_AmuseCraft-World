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
        // title: {
        //   text: "X Axis",
        //   font: {
        //     family: "Courier New, monospace",
        //     size: 18,
        //     color: "#7f7f7f",
        //   },
        // },
        // range: [0, 15],
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }
}
