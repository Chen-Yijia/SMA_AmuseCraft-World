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
      },
      yaxis: {
        title: "X Axis",
      },
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Bar shart showing the revenue & operational profit per time for the park
   * @param {string} div_id
   * @param {{
   * ride_name: string,
   * ride_revenue: {
   * timeStamps: number[],
   * totalRevenue: number[],
   * revenuePerTime: number[],
   * currentTotalRevenue: number,
   * currentRevenuePerTime: number,
   * }
   * }[]} ride_revenue_data
   * @param {{
   * ride_name: string,
   * ride_profit: {
   * timeStamps: number[],
   * totalProfit: number[],
   * profitPerTime: number[],
   * currentTotalProfit: number,
   * currentProfitPerTime: number,
   * }
   * }[]} ride_profit_data
   * @param {{
   * stand_name: string,
   * stand_revenue: {
   * timeStamps: number[],
   * totalRevenue: number[],
   * revenuePerTime: number[],
   * currentTotalRevenue: number,
   * currentRevenuePerTime: number,
   * }
   * }[]} stand_revenue_data
   * @param {{
   * stand_name: string,
   * stand_profit: {
   * timeStamps: number[],
   * totalProfit: number[],
   * profitPerTime: number[],
   * currentTotalProfit: number,
   * currentProfitPerTime: number,
   * }
   * }[]} stand_profit_data
   */
  plotParkRevenueAndProfitPerTime(
    div_id,
    ride_revenue_data,
    ride_profit_data,
    stand_revenue_data,
    stand_profit_data
  ) {
    var x = ["All Rides", "All Stands", "Whole Park"];
    var ride_revenue = 0;
    var ride_profit = 0;
    var stand_revenue = 0;
    var stand_profit = 0;

    // ride
    for (let i = 0; i < ride_revenue_data.length; i++) {
      const ride_revenue_data_i = ride_revenue_data[i];
      const ride_profit_data_i = ride_profit_data[i];

      ride_revenue += ride_revenue_data_i.ride_revenue.currentRevenuePerTime;
      ride_profit += ride_profit_data_i.ride_profit.currentProfitPerTime;
    }

    // stand
    for (let i = 0; i < stand_revenue_data.length; i++) {
      const stand_revenue_data_i = stand_revenue_data[i];
      const stand_profit_data_i = stand_profit_data[i];

      stand_revenue += stand_revenue_data_i.stand_revenue.currentRevenuePerTime;
      stand_profit += stand_profit_data_i.stand_profit.currentProfitPerTime;
    }

    // park
    var park_revenue = ride_revenue + stand_revenue;
    var park_profit = ride_profit + stand_profit;

    var y_revenue = [ride_revenue, stand_revenue, park_revenue];
    var y_profit = [ride_profit, stand_profit, park_profit];

    var trace_bar_revenue = {
      x: x,
      y: y_revenue,
      type: "bar",
      name: "Revenue",
      text: y_revenue.map((d) => d.toFixed(2)),
      textposition: "auto",
      // hoverinfo: "none",
      marker: {
        color: "rgba(58,200,225,.5)",
        line: {
          color: "rgb(8,48,107)",
          width: 1.5,
        },
      },
    };

    var trace_bar_profit = {
      x: x,
      y: y_profit,
      type: "bar",
      name: "Operation Profit",
      text: y_profit.map((d) => d.toFixed(2)),
      textposition: "auto",
      // hoverinfo: "none",
      marker: {
        color: "rgba(144,238,144,.5)",
        line: {
          color: "rgb(34,139,34)",
          width: 1.5,
        },
      },
    };

    var data_bar = [trace_bar_revenue, trace_bar_profit];

    var layout_bar = {
      barmode: "group",
      yaxis: { title: "Long Run Revenue Per Time" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id, data_bar, layout_bar);
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
      font: {
        size: 8,
      },
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
      font: {
        size: 8,
      },
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
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Bar chart/ line chart showing the long run proportion of time being busy
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
      yaxis: { title: "Long Run Proportion of time the ride being busy" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    var layout_line = {
      xaxis: { title: "Time" },
      yaxis: { title: "Time Average Proportion of time the ride being busy" },
      margin: { t: 10 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
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
      // hoverinfo: "none",
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
      // hoverinfo: "none",
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
      // hoverinfo: "none",
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
      font: {
        size: 8,
      },
      // legend: {
      //   "orientation": "h",
      //   x: 0.5,
      //   y: 1.2,
      // },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Pie chart showing the realtime visitor distribution. (in queue waiting & loaded & others (travelling/in store))
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
   * @param {{
   * stand_name: string,
   * stand_traffic: {
   * timeStamps: number[],
   * currentLoaded: number[],
   * totalTraffic: number[],
   * currentTotalTraffic: number
   * }
   * }[]} stand_traffic_data
   * @param {number} num_visitor_scene
   */
  plotVisitorDistribution(
    div_id,
    ride_queue_data,
    stand_traffic_data,
    num_visitor_scene
  ) {
    var labels = ["Waiting", "Loaded in Rides", "In Stores", "Travelling"];
    var num_waiting = 0;
    var num_loaded = 0;
    var num_store = 0;

    ride_queue_data.forEach((ride_queue_data_i) => {
      var waitingLength = ride_queue_data_i.ride_queue.waitingLength;
      var loadedLength = ride_queue_data_i.ride_queue.loadedLength;
      num_waiting += waitingLength[waitingLength.length - 1];
      num_loaded += loadedLength[loadedLength.length - 1];
    });

    stand_traffic_data.forEach((stand_traffic_data_i) => {
      var standVisitorLength = stand_traffic_data_i.stand_traffic.currentLoaded;
      num_store += standVisitorLength[standVisitorLength.length - 1];
    });

    var num_traveling =
      num_visitor_scene - num_waiting - num_loaded - num_store;

    var values = [num_waiting, num_loaded, num_store, num_traveling];

    var data = [
      {
        type: "pie",
        values: values,
        labels: labels,
        textinfo: "label+percent",
        // textposition: "outside",
        insidetextorientation: "radial",
        automargin: true,
        marker: {
          colors: [
            "rgba(58,200,225,.5)",
            "rgba(255,165,0,.5)",
            "rgba(144,238,144,.5)",
            "rgba(255,105,180,.5)",
          ],
        },
      },
    ];

    var layout = {
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      showlegend: false,
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Bar chart showing the real time total ridership for all rides
   * @param {string} div_id
   * @param {{
   * ride_name: string,
   * ride_ridership: {
   * timeStamps: number[],
   * totalRidership: number[],
   * currentTotalRidership: number,
   * }
   * }[]} ride_ridership_data
   */
  plotRideTotalRidership(div_id, ride_ridership_data) {
    var x = [];
    var y = [];
    for (let i = 0; i < ride_ridership_data.length; i++) {
      const ride_ridership_data_i = ride_ridership_data[i];
      x.push(ride_ridership_data_i.ride_name);
      y.push(ride_ridership_data_i.ride_ridership.currentTotalRidership);
    }

    var trace = {
      x: x,
      y: y,
      type: "bar",
      text: y.map((d) => d.toFixed(0)),
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

    var data = [trace];

    var layout = {
      yaxis: { title: "Total Ridership" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Bar chart showing the real time profit and revenue
   * @param {string} div_id
   * @param {{
   * ride_name: string,
   * ride_revenue: {
   * timeStamps: number[],
   * totalRevenue: number[],
   * revenuePerTime: number[],
   * currentTotalRevenue: number,
   * currentRevenuePerTime: number,
   * }
   * }[]} ride_revenue_data
   * @param {{
   * ride_name: string,
   * ride_profit: {
   * timeStamps: number[],
   * totalProfit: number[],
   * profitPerTime: number[],
   * currentTotalProfit: number,
   * currentProfitPerTime: number,
   * }
   * }[]} ride_profit_data
   */
  plotRideRevenueAndProfit(div_id, ride_revenue_data, ride_profit_data) {
    var x = [];
    var y_revenue = [];
    var y_profit = [];
    var numTotalRides = ride_revenue_data.length;
    for (let i = 0; i < numTotalRides; i++) {
      const ride_revenue_data_i = ride_revenue_data[i];
      const ride_profit_data_i = ride_profit_data[i];

      x.push(ride_revenue_data_i.ride_name);

      y_revenue.push(ride_revenue_data_i.ride_revenue.currentTotalRevenue);
      y_profit.push(ride_profit_data_i.ride_profit.currentTotalProfit);
    }

    var trace_revenue = {
      x: x,
      y: y_revenue,
      type: "bar",
      name: "Total Revenue",
      text: y_revenue.map((d) => d.toFixed(2)),
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

    var trace_profit = {
      x: x,
      y: y_profit,
      type: "bar",
      name: "Total Profit",
      text: y_profit.map((d) => d.toFixed(2)),
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

    var data = [trace_revenue, trace_profit];

    var layout = {
      barmode: "group",
      yaxis: { title: "Ride Total Revenue/ Profit" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Bar chart/ line chart showing the long run revenue per time (realtime)
   * @param {string} div_id_bar_chart
   * @param {string} div_id_line_chart
   * @param {{
   * ride_name: string,
   * ride_revenue: {
   * timeStamps: number[],
   * totalRevenue: number[],
   * revenuePerTime: number[],
   * currentTotalRevenue: number,
   * currentRevenuePerTime: number,
   * }
   * }[]} ride_revenue_data
   * @param {{
   * ride_name: string,
   * ride_profit: {
   * timeStamps: number[],
   * totalProfit: number[],
   * profitPerTime: number[],
   * currentTotalProfit: number,
   * currentProfitPerTime: number,
   * }
   * }[]} ride_profit_data
   */
  plotRideRevenuePerTime(
    div_id_bar_chart,
    div_id_line_chart,
    ride_revenue_data,
    ride_profit_data
  ) {
    var x = [];
    var y_bar = [];
    var y_bar_profit = [];
    var data_line = [];

    for (let i = 0; i < ride_revenue_data.length; i++) {
      const ride_revenue_data_i = ride_revenue_data[i];
      const ride_profit_data_i = ride_profit_data[i];

      // for bar chart
      x.push(ride_revenue_data_i.ride_name);
      y_bar.push(ride_revenue_data_i.ride_revenue.currentRevenuePerTime);
      y_bar_profit.push(ride_profit_data_i.ride_profit.currentProfitPerTime);

      // for line chart
      var line_trace_i = {
        x: ride_revenue_data_i.ride_revenue.timeStamps,
        y: ride_revenue_data_i.ride_revenue.revenuePerTime,
        mode: "lines",
        name: ride_revenue_data_i.ride_name,
        line: { shape: "spline", color: this.colorPalette[i] },
        type: "scatter",
      };
      data_line.push(line_trace_i);
    }

    var trace_bar_revenue = {
      x: x,
      y: y_bar,
      type: "bar",
      name: "Revenue",
      text: y_bar.map((d) => d.toFixed(2)),
      textposition: "auto",
      // hoverinfo: "none",
      marker: {
        color: "rgba(58,200,225,.5)",
        line: {
          color: "rgb(8,48,107)",
          width: 1.5,
        },
      },
    };

    var trace_bar_profit = {
      x: x,
      y: y_bar_profit,
      type: "bar",
      name: "Operation Profit",
      text: y_bar_profit.map((d) => d.toFixed(2)),
      textposition: "auto",
      // hoverinfo: "none",
      marker: {
        color: "rgba(144,238,144,.5)",
        line: {
          color: "rgb(34,139,34)",
          width: 1.5,
        },
      },
    };

    var data_bar = [trace_bar_revenue, trace_bar_profit];

    var layout_bar = {
      barmode: "group",
      yaxis: { title: "Long Run Revenue Per Time" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      // legend: {
      //   // orientation: "h",
      //   // x: 0.5,
      //   // y: 1.2,
      //   // showlegend: false
      // },
      font: {
        size: 8,
      },
    };

    var layout_line = {
      xaxis: { title: "Time" },
      yaxis: { title: "Time Average Revenue Per Time" },
      margin: { t: 10 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id_bar_chart, data_bar, layout_bar);
    Plotly.newPlot(div_id_line_chart, data_line, layout_line);
  }

  /**
   * Time average profit per time (revenue - operational cost) line chart
   * @param {string} div_id
   * @param {{
   * ride_name: string,
   * ride_profit: {
   * timeStamps: number[],
   * totalProfit: number[],
   * profitPerTime: number[],
   * currentTotalProfit: number,
   * currentProfitPerTime: number,
   * }
   * }[]} ride_profit_data
   */
  plotRideProfitPerTime(div_id, ride_profit_data) {
    var data_line = [];

    for (let i = 0; i < ride_profit_data.length; i++) {
      const ride_profit_data_i = ride_profit_data[i];

      var line_trace_i = {
        x: ride_profit_data_i.ride_profit.timeStamps,
        y: ride_profit_data_i.ride_profit.profitPerTime,
        mode: "lines",
        name: ride_profit_data_i.ride_name,
        line: { shape: "spline", color: this.colorPalette[i] },
        type: "scatter",
      };
      data_line.push(line_trace_i);
    }

    var layout_line = {
      xaxis: { title: "Time" },
      yaxis: {
        title: "Time Average Revenue Adjusted for Operational Cost Per Time",
      },
      margin: { t: 10 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id, data_line, layout_line);
  }

  /**
   * Bar chart of the total traffic for stands
   * @param {string} div_id
   * @param {{
   * stand_name: string,
   * stand_traffic: {
   * timeStamps: number[],
   * currentLoaded: number[],
   * totalTraffic: number[],
   * currentTotalTraffic: number
   * }
   * }[]} stand_traffic_data
   */
  plotStandTotalTraffic(div_id, stand_traffic_data) {
    var x = [];
    var y = [];

    for (let i = 0; i < stand_traffic_data.length; i++) {
      const stand_traffic_data_i = stand_traffic_data[i];
      x.push(stand_traffic_data_i.stand_name);
      y.push(stand_traffic_data_i.stand_traffic.currentTotalTraffic);
    }

    var trace = {
      x: x,
      y: y,
      type: "bar",
      text: y.map((d) => d.toFixed(0)),
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

    var data = [trace];

    var layout = {
      yaxis: { title: "Total Customer Traffic" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Bar chart of long run average number of visitors loaded
   * @param {string} div_id
   * @param {{
   * stand_name: string,
   * stand_traffic: {
   * timeStamps: number[],
   * currentLoaded: number[],
   * totalTraffic: number[],
   * currentTotalTraffic: number
   * }
   * }[]} stand_traffic_data
   */
  plotStandLongRunLoaded(div_id, stand_traffic_data) {
    var x = [];
    var y = [];

    stand_traffic_data.forEach((stand_traffic_data_i) => {
      x.push(stand_traffic_data_i.stand_name);

      var sum_loaded = stand_traffic_data_i.stand_traffic.currentLoaded.reduce(
        (partialSum, a) => partialSum + a,
        0
      );

      var total_time =
        stand_traffic_data_i.stand_traffic.timeStamps[
          stand_traffic_data_i.stand_traffic.timeStamps.length - 1
        ];

      y.push(sum_loaded / total_time);
    });

    var trace = {
      x: x,
      y: y,
      type: "bar",
      name: "Number of Loaded Visitors",
      text: y.map((d) => d.toFixed(2)),
      textposition: "auto",
      // hoverinfo: "none",
      marker: {
        color: "rgba(58,200,225,.5)",
        line: {
          color: "rgb(8,48,107)",
          width: 1.5,
        },
      },
    };

    var data = [trace];

    var layout = {
      yaxis: { title: "Long Run Average Number of Visitors Loaded" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id, data, layout);
  }

  /**
   * Bar chart for the long run revenue / operation profit per time
   * @param {string} div_id_bar_chart
   * @param {string} div_id_line_chart_profit
   * @param {string} div_id_line_chart_revenue
   * @param {{
   * stand_name: string,
   * stand_revenue: {
   * timeStamps: number[],
   * totalRevenue: number[],
   * revenuePerTime: number[],
   * currentTotalRevenue: number,
   * currentRevenuePerTime: number,
   * }
   * }[]} stand_revenue_data
   * @param {{
   * stand_name: string,
   * stand_profit: {
   * timeStamps: number[],
   * totalProfit: number[],
   * profitPerTime: number[],
   * currentTotalProfit: number,
   * currentProfitPerTime: number,
   * }
   * }[]} stand_profit_data
   */
  plotStandRevenueAndProfitPerTime(
    div_id_bar_chart,
    div_id_line_chart_revenue,
    div_id_line_chart_profit,
    stand_revenue_data,
    stand_profit_data
  ) {
    var x = [];
    var y_revenue_bar = [];
    var y_profit_bar = [];
    var data_revenue_line = [];
    var data_profit_line = [];

    for (let i = 0; i < stand_revenue_data.length; i++) {
      const stand_revenue_data_i = stand_revenue_data[i];
      const stand_profit_data_i = stand_profit_data[i];

      // for bar chart
      x.push(stand_revenue_data_i.stand_name);
      y_revenue_bar.push(
        stand_revenue_data_i.stand_revenue.currentRevenuePerTime
      );
      y_profit_bar.push(stand_profit_data_i.stand_profit.currentProfitPerTime);

      // for line chart
      var revenue_line_trace_i = {
        x: stand_revenue_data_i.stand_revenue.timeStamps,
        y: stand_revenue_data_i.stand_revenue.revenuePerTime,
        mode: "lines",
        name: stand_revenue_data_i.stand_name,
        line: { shape: "spline", color: this.colorPalette[i] },
        type: "scatter",
      };
      data_revenue_line.push(revenue_line_trace_i);

      var profit_line_trace_i = {
        x: stand_profit_data_i.stand_profit.timeStamps,
        y: stand_profit_data_i.stand_profit.profitPerTime,
        mode: "lines",
        name: stand_profit_data_i.stand_name,
        line: { shape: "spline", color: this.colorPalette[i] },
        type: "scatter",
      };
      data_profit_line.push(profit_line_trace_i);
    }

    var trace_bar_revenue = {
      x: x,
      y: y_revenue_bar,
      type: "bar",
      name: "Revenue",
      text: y_revenue_bar.map((d) => d.toFixed(2)),
      textposition: "auto",
      // hoverinfo: "none",
      marker: {
        color: "rgba(58,200,225,.5)",
        line: {
          color: "rgb(8,48,107)",
          width: 1.5,
        },
      },
    };

    var trace_bar_profit = {
      x: x,
      y: y_profit_bar,
      type: "bar",
      name: "Operation Profit",
      text: y_profit_bar.map((d) => d.toFixed(2)),
      textposition: "auto",
      // hoverinfo: "none",
      marker: {
        color: "rgba(144,238,144,.5)",
        line: {
          color: "rgb(34,139,34)",
          width: 1.5,
        },
      },
    };

    var data_bar = [trace_bar_revenue, trace_bar_profit];

    var layout_bar = {
      barmode: "group",
      yaxis: { title: "Long Run Revenue Per Time" },
      margin: { t: 20 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    var layout_line_revenue = {
      xaxis: { title: "Time" },
      yaxis: { title: "Time Average Revenue Per Time" },
      margin: { t: 10 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    var layout_line_profit = {
      xaxis: { title: "Time" },
      yaxis: { title: "Time Average Operation Profit Per Time" },
      margin: { t: 10 },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 8,
      },
    };

    Plotly.newPlot(div_id_bar_chart, data_bar, layout_bar);
    Plotly.newPlot(
      div_id_line_chart_revenue,
      data_revenue_line,
      layout_line_revenue
    );
    Plotly.newPlot(
      div_id_line_chart_profit,
      data_profit_line,
      layout_line_profit
    );
  }
}
