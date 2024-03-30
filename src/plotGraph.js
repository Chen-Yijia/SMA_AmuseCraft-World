class GraphPlotter {
  /**
   * The id of the window to insert graph
   *
   */
  constructor() {
    this.colorPalette = [
      "rgba(255, 100, 102, 1)",
      "rgba(100, 200, 102, 1)",
      "rgba(149, 100, 255, 1)",
      "rgba(48, 90, 255, 1)",
      "rgba(255, 200, 100, 1)",
      "rgba(100, 255, 200, 1)",
      "rgba(200, 100, 255, 1)",
      "rgba(255, 150, 50, 1)",
      "rgba(50, 255, 150, 1)",
      "rgba(150, 50, 255, 1)",
      "rgba(255, 0, 255, 1)",
      "rgba(0, 255, 255, 1)",
      "rgba(255, 255, 0, 1)",
      "rgba(0, 255, 0, 1)",
      "rgba(255, 0, 0, 1)",
      "rgba(0, 0, 255, 1)",
      "rgba(255, 128, 0, 1)",
      "rgba(128, 0, 255, 1)",
      "rgba(0, 255, 128, 1)",
      "rgba(128, 255, 0, 1)",
    ];
  }

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

    var trace_all = {
      x: time_data.kid.stayDuration.concat(
        time_data.elder.stayDuration,
        time_data.adult.stayDuration
      ),
      type: "histogram",
      name: "All visitors",
      // histnorm: 'probability density',
      histnorm: "count",
      opacity: 0.5,
      marker: {
        color: "rgba(48, 90, 255, 0.7)",
        line: {
          color: "rgba(48, 90, 255, 1)",
          width: 1,
        },
      },
    };

    var data = [trace_kid, trace_elder, trace_adult, trace_all];

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

  /**
   * Histogram on the money spent in park for each visitor profile
   * @param {string} div_id
   * @param { {
   * kid: number[],
   * elder: number[],
   * adult: number[]
   * }} money_data
   */
  plotVisitorMoneySpentInPark(div_id, money_data) {
    var trace_kid = {
      x: money_data.kid,
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
      x: money_data.elder,
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
      x: money_data.adult,
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

    var trace_all = {
      x: money_data.kid.concat(money_data.elder, money_data.adult),
      type: "histogram",
      name: "All visitors",
      // histnorm: 'probability density',
      histnorm: "count",
      opacity: 0.5,
      marker: {
        color: "rgba(48, 90, 255, 0.7)",
        line: {
          color: "rgba(48, 90, 255, 1)",
          width: 1,
        },
      },
    };

    var data = [trace_kid, trace_elder, trace_adult, trace_all];

    var layout = {
      bargap: 0.05,
      bargroupgap: 0.2,
      barmode: "overlay",
      //   title: "Sampled Results",
      xaxis: { title: "Money Spent in Park" },
      yaxis: { title: "Count" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Time series showing the status of each ride (idle / in operation)
   * @param {string} div_id
   * @param {{
   * ride_name: string,
   * ride_status: {
   * timeStamps: number[],
   * rideStatus: number[]
   * }
   * }[]} ride_status_data
   */
  plotRideStatusTimeSeries(div_id, ride_status_data) {
    var data = [];

    for (let i = 0; i < ride_status_data.length; i++) {
      const ride_status_data_i = ride_status_data[i];
      var trace_i = {
        x: ride_status_data_i.ride_status.timeStamps,
        y: ride_status_data_i.ride_status.rideStatus.map((d) => d + 2 * i),
        mode: "lines",
        name: ride_status_data_i.ride_name,
        line: { shape: "hv", color: this.colorPalette[i] },
        type: "scatter",
      };
      data.push(trace_i);
    }

    var layout = {
      xaxis: { title: "Time" },
      yaxis: { title: "Ride Status" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      legend: {
        traceorder: "reversed",
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Bar chart showing the long run proportion of time being busy (realtime)
   * @param {string} div_id_bar_chart
   * @param {string} div_id_line_chart
   * @param {{
   * ride_name: string,
   * ride_status: {
   * timeStamps: number[],
   * rideStatus: number[]
   * }
   * }[]} ride_status_data
   */
  plotRideProportionBusy(
    div_id_bar_chart,
    div_id_line_chart,
    ride_status_data
  ) {
    /**
     *
     * @param {number[]} time_stamps
     * @param {number[]} ride_status
     * @returns
     */
    function proportionBusyTimeSeries(time_stamps, ride_status) {
      return time_stamps.map((d, i) => {
        var ride_status_slice = [...ride_status].slice(0, i + 1);
        var ride_status_slice_sum = ride_status_slice.reduce(
          (partialSum, a) => partialSum + a,
          0
        );
        return ride_status_slice_sum / d;
      });
    }

    var x = [];
    var y_bar = [];
    var data_line = [];

    for (let i = 0; i < ride_status_data.length; i++) {
      const ride_status_data_i = ride_status_data[i];

      // for bar chart
      x.push(ride_status_data_i.ride_name);

      var sum_status = ride_status_data_i.ride_status.rideStatus.reduce(
        (partialSum, a) => partialSum + a,
        0
      );
      var total_time =
        ride_status_data_i.ride_status.timeStamps[
          ride_status_data_i.ride_status.timeStamps.length - 1
        ];
      y_bar.push(sum_status / total_time);

      // for line chart
      var proportionTimeSeries = proportionBusyTimeSeries(
        ride_status_data_i.ride_status.timeStamps,
        ride_status_data_i.ride_status.rideStatus
      );

      var line_trace_i = {
        x: ride_status_data_i.ride_status.timeStamps,
        y: proportionTimeSeries,
        mode: "lines",
        name: ride_status_data_i.ride_name,
        line: { shape: "spline", color: this.colorPalette[i] },
        type: "scatter",
      };
      data_line.push(line_trace_i);
    }

    var trace_bar = {
      x: x,
      y: y_bar,
      type: "bar",
      text: y_bar.map((d) => d.toFixed(2)),
      textposition: "auto",
      hoverinfo: "none",
      marker: {
        color: "rgba(58,200,225,.5)",
        line: {
          color: "rgb(8,48,107)",
          width: 1.5,
        },
      },
    };

    var data_bar = [trace_bar];

    var layout_bar = {
      yaxis: { title: "Proportion of time the ride being busy" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
    };

    var layout_line = {
      xaxis: { title: "Time" },
      yaxis: { title: "Proportion of time the ride being busy" },
      margin: { t: 10 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
    };

    Plotly.newPlot(div_id_bar_chart, data_bar, layout_bar);
    Plotly.newPlot(div_id_line_chart, data_line, layout_line);
  }

  /**
   * Bar chart showing the long run proportion of time being busy (realtime)
   * @param {string} div_id
   * @param {{
   * ride_name: string,
   * ride_queue: {
   * timeStamps: number[],
   * waitingLength: number[],
   * loadedLength: number[],
   * totalLength: number[]
   * }
   * }[]} ride_queue_data
   */
  plotRideQueueStats(div_id, ride_queue_data) {
    var x = [];
    var y_waiting = [];
    var y_loaded = [];
    var y_total = [];

    ride_queue_data.forEach((ride_queue_data_i) => {
      x.push(ride_queue_data_i.ride_name);

      var sum_waiting = ride_queue_data_i.ride_queue.waitingLength.reduce(
        (partialSum, a) => partialSum + a,
        0
      );

      var sum_loaded = ride_queue_data_i.ride_queue.loadedLength.reduce(
        (partialSum, a) => partialSum + a,
        0
      );

      var sum_total = ride_queue_data_i.ride_queue.totalLength.reduce(
        (partialSum, a) => partialSum + a,
        0
      );

      var total_time =
        ride_queue_data_i.ride_queue.timeStamps[
          ride_queue_data_i.ride_queue.timeStamps.length - 1
        ];

      y_waiting.push(sum_waiting / total_time);
      y_loaded.push(sum_loaded / total_time);
      y_total.push(sum_total / total_time);
    });

    var trace_waiting = {
      x: x,
      y: y_waiting,
      type: "bar",
      name: "Waiting Visitors",
      text: y_waiting.map((d) => d.toFixed(2)),
      textposition: "auto",
      hoverinfo: "none",
      marker: {
        color: "rgba(58,200,225,.5)",
        line: {
          color: "rgb(8,48,107)",
          width: 1.5,
        },
      },
    };

    var trace_loaded = {
      x: x,
      y: y_loaded,
      type: "bar",
      name: "Loaded Visitors",
      text: y_loaded.map((d) => d.toFixed(2)),
      textposition: "auto",
      hoverinfo: "none",
      marker: {
        color: "rgba(144,238,144,.5)",
        line: {
          color: "rgb(34,139,34)",
          width: 1.5,
        },
      },
    };

    var trace_total = {
      x: x,
      y: y_total,
      type: "bar",
      name: "Total Visitors",
      text: y_total.map((d) => d.toFixed(2)),
      textposition: "auto",
      hoverinfo: "none",
      marker: {
        color: "rgba(255,105,180,.5)",
        line: {
          color: "rgb(199,21,133)",
          width: 1.5,
        },
      },
    };

    var data = [trace_waiting, trace_loaded, trace_total];

    var layout = {
      barmode: "group",
      yaxis: { title: "Long Run Average Number of Visitors" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
    };

    Plotly.newPlot(div_id, data, layout);
  }
}
