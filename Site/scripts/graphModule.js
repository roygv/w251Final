var AgIGraph = (function () {

    var myData, myOverviewData, mySeries, myFrom, myUntil, brush, zoom, area, area2, focus,context, x;

    var formatDate = d3.utcFormat("%Y-%m-%dT%H:%M:%SZ");
    var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%SZ");

    var svg = d3.select("#telemetryGraph"),
        margin = {top: 10, right: 0, bottom: 80, left: 50},
        margin2 = {top: +svg.attr("height")-margin.bottom+30, right: 0, bottom: 20, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom;

    var x = d3.scaleUtc().range([0, width]);
    var x2 = d3.scaleUtc().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

    var w = $(window).width();
    var h = $(window).height();

    var padding = {
        x: 10,
        y: 10
    };
    var tooltip = {
        width: $('.tooltip').width(),
        height: $('.tooltip').height()
    };
    var scene = {
        x: margin.left + padding.x,
        y: margin.top + padding.y,
        width: w - (margin.left * 2) - (padding.x * 2),
        height: h - (margin.top * 2) - (padding.y * 2)
    };

    var div = d3.select(".tooltip");

    function updateYaxis() {
        if (myData.length > 0) {
            fullRange = d3.extent(myData, function (d) {
                return +d[1] || 0;
            });
            if (fullRange[0] > 0)
                fullRange[0] = 0;
            y.domain(fullRange);

            focus.select("g.axis--y").data(['g.axis--y'])
                .enter().append('g').attr('class', 'axis axis--y');
            focus.select("g.axis--y").call(yAxis.ticks(8));
        }
    }

    function updateFocus(point, from, until) {
        myFrom = from;
        myUntil = until;
        AgIData.getData(point, from, until, function(error, json) {
            if (error) throw error;
            if ((json.results[0].series) && (myFrom == from) && (myUntil == until)) {
                myData = json.results[0].series[0].values;
                focus.select("path")
                    .datum(myData);
                updateYaxis();
                focus.select(".zoomArea").attr("d", area);
                focus.select(".axis--x").call(xAxis.ticks(5));
            }
        });
    }

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        updateFocus(mySeries, x.domain()[0], x.domain()[1]);
        focus.select(".zoomArea").attr("d", area);
        focus.select(".axis--x").call(xAxis.ticks(5));
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));
    }

    function zoomed(){
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());
        updateFocus(mySeries, x.domain()[0], x.domain()[1]);
        focus.select(".zoomArea").attr("d", area);
        focus.select(".axis--x").call(xAxis.ticks(5));
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }

    function startClean(title) {

                
        svg = d3.select("#telemetryGraph");
        svg.selectAll("*").remove();
                
        brush = d3.brushX()
            .extent([[0, 0], [width, height2]])
            .on("brush end", brushed);

        zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function (d) {
                return x(parseDate(d[0]));
            })
            .y0(height)
            .y1(function (d) {
                return y(+d[1]);
            });

        area2 = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function (d) {
                return x2(parseDate(d[0]));
            })
            .y0(height2)
            .y1(function (d) {
                return y2(+d[1]);
            });

        svg.append("defs").append("clipPath")
            .attr("id", "clipGraph")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        svg.select("defs")
            .append("linearGradient")
            .attr("id","mainGradient").attr("x1","0%").attr("y1","100%").attr("x2","0%").attr("y2","0%")
            .append("stop").attr("class","stop-bottom").attr("offset","5%")
        svg.select("defs linearGradient")
            .append("stop").attr("class","stop-top").attr("offset","95%")

        focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        var txt = d3.select("#graphTitle");
        txt.text(title);

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);
    }

    function updateOverview(error, json) {
        if (error) throw error;
        if (json.results[0].series) {
            myOverviewData = json.results[0].series[0].values;
            x2.domain(d3.extent(myOverviewData, function (d) {
                return parseDate(d[0]);
            }));
            y2.domain([0, d3.max(myOverviewData, function (d) {
                return +d[1] || 0;
            })]);

            context.append("path")
                .datum(myOverviewData)
                .attr("class", "zoomArea")
                .attr("d", area2);

            context.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height2 + ")")
                .call(xAxis2.tickFormat(d3.utcFormat("%b")));

            context.append("g")
                .attr("class", "brush")
                .call(brush)
                .call(brush.move, x.range());

            updateDetails(error, json);
        }
    }

    function updateDetails(error, json) {
        if (error) throw error;

        if (json.results[0].series) {

            myData = json.results[0].series[0].values;
            x.domain(d3.extent(myData, function (d) {
                return parseDate(d[0]);
            }));
            y.domain([0, d3.max(myData, function (d) {
                return +d[1] || 0;
            })]);

            focus.append("path")
                .datum(myData)
                .attr("class", "zoomArea")
                .attr("d", area)
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

            focus.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis.ticks(5));

            focus.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis.ticks(8));

            updateYaxis();

        }
    }

    return {
        init: function(series, label, from, until) {
            mySeries = series;
            myFrom = from;
            myUntil = until;
            startClean(label);
            AgIData.getData(series,from,until,updateOverview);
        }, //init

        updateInterval: function(from, until) {
            myFrom = from;
            myUntil = until;
            x.domain(from, until);
            if (mySeries !== NaN)
                AgIData.getData(mySeries,from,until,function(){
                focus.select(".zoomArea").attr("d", area);
                focus.select(".axis--x").call(xAxis.ticks(5).tickFormat(d3.utcFormat("%m/%d")));
                var s = x2.range();
                svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                   .scale(width / (s[1] - s[0]))
                   .translate(-s[0], 0));
                    }
                );
        }, //updateInterval

        updateSeries: function(series, label) {
            mySeries=series;
            startClean(label);
//            AgIData.getData(series,AgIData.parseDate('2016-08-01T00:00:00Z'),AgIData.parseDate('2017-03-01T00:00:00Z'),updateOverview);
            AgIData.getData(series,AgIData.parseDate('2016-08-01T00:00:00Z'),myUntil,updateOverview);
            x.domain([myFrom, myUntil]);
            updateFocus(mySeries, myFrom, myUntil);
            context.select(".brush").call(brush.move, [myFrom, myUntil]);

        } //updateSeries
    };

})();
now=new Date();
//AgIData.init("http://test1.gvirtsman.com:8086/query?db=w251&q=","roy","Kaftor");
AgIGraph.init('A Gross GN MW','Charge cap.',AgIData.parseDate('2016-08-01T00:00:00Z'),now);

