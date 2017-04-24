var sparkLine = (function () {
    var width = 300;
    var height = 120, titleHeight = 20, axisHeight = 20;

    var x = d3.scaleTime().range([0, width - 50]);
    var y = d3.scaleLinear().range([height - axisHeight - 4, titleHeight]);
    var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%SZ");
    var formatDate = d3.timeFormat("%m/%d/%Y");
    var formatTime = d3.timeFormat("%H:%M:%S");
    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    var line = d3.area()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.date); })
        .y0(height-axisHeight)
        .y1(function(d) { return y(d.value); });

    var w = $(window).width();
    var h = $(window).height();
    var margin = {
        x: 10,
        y: 10
    };
    var padding = {
        x: 10,
        y: 10
    };
    var tooltip = {
        width: $('.tooltip').width(),
        height: $('.tooltip').height()
    };
    var scene = {
        x: margin.x + padding.x,
        y: margin.y + padding.y,
        width: w - (margin.x * 2) - (padding.x * 2),
        height: h - (margin.y * 2) - (padding.y * 2)
    };

    var div = d3.select(".tooltip");
    // var div = d3.select("body")
    //         .append("div")
    //         .attr("class","tooltip")
    //         .style("position", "absolute")
    //         .style("z-index", "10")
    //         // .style("visibility", "hidden")
    //         .text("a simple tooltip");

     function positionTooltip(mouse, scene, tooltip)
        {
            //Distance of element from the right edge of viewport
            if (scene.width - (mouse.x + tooltip.width) < 20)
            { //If tooltip exceeds the X coordinate of viewport
                mouse.x = mouse.x - tooltip.width - 20;
            }
            //Distance of element from the bottom of viewport
            if (scene.height - (mouse.y + tooltip.height) < 20)
            { //If tooltip exceeds the Y coordinate of viewport
                mouse.y = mouse.y - tooltip.height - 20;
            }
            return {
                top: mouse.y,
                left: mouse.x
            };
        }

    return {
        init: function(metric, title, id) {
            //AgIData.getData("MARIAH T2 Base Point ", d3.timeHour.offset(now, -6), AgIData.parseDate('2017-04-07T00:00:00Z'),now,function(error, json) {
            // AgIData.getData("Unit 2 net MW", AgIData.parseDate('2017-04-14T00:00:00Z'),now,function(error, json) {
            AgIData.getLast(metric, d3.timeDay.offset(now, -10), now, function(error,json) {
                if (error) throw error;
                if (json.results[0].series) {
                    var data = json.results[0].series[0].values[0][0];
                    var last = AgIData.parseDate(data);
                    AgIData.getData(metric, d3.timeHour.offset(last, -6), last, function (error, json) {

                        if (error) throw error;
                        if (json.results[0].series) {
                            var data = json.results[0].series[0].values;
                            sparkLine.draw(0, title, id, data);
                            // sparkLine.draw(0,'Battery SoC(%)','#powerSummary', data);
                        }
                    });
                }});
        },

        update: function(node) {
            var now=new Date();
            var fromDate=d3.timeDay.offset(now, -1); // One day back
            d3.select("#summaryMetrics")
              .text("Summary Metrics: "+node);

            AgIData.getData("2 Base Point", fromDate, now, function(error, json) {
                if (error) throw error;
                if (json.results[0].series) {
                    var data = json.results[0].series[0].values;
                    sparkLine.redraw(0,'Battery charge (%)','#powerSummary1', data);
                    // sparkLine.redraw(0,'Battery SoC(%)','#powerSummary', data);
                }

                AgIData.getData("A Gross GN MW", fromDate, now, function(error, json) {
                    if (error) throw error;
                    if (json.results[0].series) {
                        var data = json.results[0].series[0].values;
                        sparkLine.redraw(0,'Power output (kW)','#powerSummary2', data);
                        // sparkLine.draw(0,'Real Power(kW)','#powerSummary', data);
                    }

                    AgIData.getData("2 LMP",fromDate ,now, function(error, json) {
                        if (error) throw error;
                        if (json.results[0].series) {
                            var data = json.results[0].series[0].values;
                            sparkLine.redraw(0,'Market price ($)','#powerSummary3', data);
                            // sparkLine.draw(0,'Real Power(kW)','#powerSummary', data);
                        }
                    });
                });
            });
        },
        draw: function(position, title, elemId, data) {
            len = data.length;
            data.forEach(function(d) {
                d.date = AgIData.parseDate(d[0]);
                d.value = +d[1];
            });
            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain(d3.extent(data, function(d) { return d.value; }));

            var svg = d3.select(elemId)
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(40,'+ (position * height) +')'); // position is always 0... curious
            // .attr('transform', 'translate('+position * height+',50)');

            svg.append('rect')
                .attr("class", "sparkback")
                .attr("width", width-1)
                .attr("height", height-1);
            svg.append('path')
                .datum(data)
                .attr('class', 'sparkline')
                .attr('d', line)
                .on("mouseover", function(d)
                    {
                        div.transition().duration(200).style("opacity", 1);
                        var coords = d3.mouse(this);
                        var date = formatDate(x.invert(coords[0]));
                        var time = formatTime(x.invert(coords[0]));
                        div.html(date+'<br/>'+time+'<br/>'+d3.format("2.3")(y.invert(coords[1])))
                           .style("left", function()
                        {
                            var pos = positionTooltip(
                                {
                                    x: d3.event.pageX,
                                    y: d3.event.pageY
                                }, scene, tooltip);
                            return (pos.left + 10) + 'px';
                        }).style("top", function()
                        {
                            var pos = positionTooltip(
                                {
                                    x: d3.event.pageX,
                                    y: d3.event.pageY
                                }, scene, tooltip);
                            return (pos.top - 10) + 'px';
                        });
                    })
                .on("mousemove", function(d){
                    var coords = d3.mouse(this);
                    var date = formatDate(x.invert(coords[0]));
                    var time = formatTime(x.invert(coords[0]));
                    div.html(date+'<br/>'+time+'<br/>'+d3.format("2.3")(y.invert(coords[1])))
                        .style("left", function()
                        {
                            var pos = positionTooltip(
                                {
                                    x: d3.event.pageX,
                                    y: d3.event.pageY
                                }, scene, tooltip);
                            return (pos.left + 10) + 'px';
                        })
                        .style("top", function()
                        {
                            var pos = positionTooltip(
                                {
                                    x: d3.event.pageX,
                                    y: d3.event.pageY
                                }, scene, tooltip);
                            return (pos.top - 10) + 'px';
                     // svg.select('circle')
                     //     .attr('cx', x.invert(coords[0]));
                         // .attr('cy', y(data[len-1].value))
                });})
                .on("mouseout", function(d){
                    div.transition().duration(500).style("opacity", 0);
                });
            svg.append('circle')
                .attr('class', 'sparkcircle')
                .attr('cx', x(data[len-1].date))
                .attr('cy', y(data[len-1].value))
                .attr('r', 1.5);
            svg.append('text')
                .attr('class', 'sparktitle')
                .text(title+': '+d3.format("2.3")(data[len-1].value))
                .attr('text-anchor','top')
                .attr('transform', 'translate(50,5)');
            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + (height - axisHeight) + ")")
                .call(xAxis.ticks(4));
            svg.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis.ticks(4));

            if (y.domain()[0] < 0)
                svg.append('line')
                    .attr("x1","0%")
                    .attr("y1",y(0))
                    .attr("x2","100%")
                    .attr("y2",y(0))
                    .attr("style","stroke:#AFAFAF;stroke-width:0.5")
        },
        redraw: function(position, title, elemId, data) {
                len = data.length;
                data.forEach(function(d) {
                    d.date = AgIData.parseDate(d[0]);
                    d.value = +d[1];
                });
                x.domain(d3.extent(data, function(d) { return d.date; }));
                y.domain(d3.extent(data, function(d) { return d.value; }));

                var svg = d3.select(elemId);

                svg.select('path')
                    .datum(data)
                    .attr('class', 'sparkline')
                    .attr('d', line);
                svg.select('circle')
                    .attr('cx', x(data[len-1].date))
                    .attr('cy', y(data[len-1].value));
                svg.select('text')
                    .text(title+': '+d3.format("2.3")(data[len-1].value));
                svg.select(".axis axis--x")
                    .call(xAxis.ticks(4));
                svg.select(".axis axis--y")
                    .call(yAxis.ticks(4));

                svg.select('line').remove();
                if (y.domain()[0] < 0)
                    svg.append('line')
                        .attr("x1","0%")
                        .attr("y1",y(0))
                        .attr("x2","100%")
                        .attr("y2",y(0))
                        .attr("style","stroke:#AFAFAF;stroke-width:0.5")
            }
    }}
)();

var now=new Date();
txt = d3.select("#summaryMetrics");
txt.text("Summary Metrics: Site");

var svg = d3.selectAll('#powerSummary svg #powerSummary1').remove();
var svg = d3.selectAll('#powerSummary svg #powerSummary2').remove();
var svg = d3.selectAll('#powerSummary svg #powerSummary3').remove();

sparkLine.init("unit 4 net (OC)",'Battery charge (%)','#powerSummary1');
sparkLine.init("A Gross GN MW", 'Power output (kW)','#powerSummary2');
sparkLine.init("2 LMP", 'Market price ($)','#powerSummary3');
