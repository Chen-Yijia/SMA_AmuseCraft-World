class GraphPlotter {
  /**
   * The id of the window to insert graph
   *
   */
  constructor() {}

  plotTest() {
    var TESTER = document.getElementById("tester");

    Plotly.newPlot(
      TESTER,
      [
        {
          x: [1, 2, 3, 4, 5],
          y: [1, 2, 4, 8, 16],
        },
      ],
      {
        margin: { t: 30 },
        plot_bgcolor: "'rgba(0,0,0,0)'",
        paper_bgcolor: "#FFF3",
      },
      { showSendToCloud: true }
    );
  }

  /**
   * Heatmap on the number of times hit each tile
   * @param {string} div_id
   * @param {{x: number[],y: number[]}} heatmap_data
   */
  plotRoadHeatmap(div_id, heatmap_data) {
    // var x = [];
    // var y = [];
    // for (var i = 0; i < 500; i++) {
    //   x[i] = Math.floor(15 * Math.random());
    //   y[i] = Math.floor(15 * Math.random());
    // }

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
