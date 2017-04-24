d3.button = function() {

    var dispatch = d3.dispatch('press', 'release');

    var padding = 5,
        radius = 2,
        stdDeviation = 5,
        offsetX = 2,
        offsetY = 4;

    function my(selection) {
        selection.each(function(d, i) {
            var g = d3.select(this)
                .attr('id', 'd3-button' + i);
            var now=new Date();
            AgIData.getLast(d.series, d3.timeDay.offset(now, -10), now, function(error,json) {
                if (error) throw error;
                if (json.results[0].series) {
                    var data = json.results[0].series[0].values[0][1];
                    d.label = d.label.replace(/:.*/,'');
                    d.label += ': '+d3.format("2.3")(data);
                }
                var text = g.append('text').text(d.label);
                var defs = g.append('defs');
                var bbox = text.node().getBBox();
                var bheight = bbox.height + 2 * padding;
    //            var bwidth = bbox.width + 2 * padding;
                var bwidth = bheight * 6;
                g.attr('transform', 'translate(' + ((d.col-1) * (bwidth+2*radius) + padding) + ','
                        + ((bheight+2*radius)*(d.row - 0.5) + padding) + ')');
                var rect = g.insert('rect', 'text')
                    .attr("x",-padding)
                    .attr("y", bbox.y - padding)
                    .attr("width", bwidth)
                    .attr("height", bheight)
                    .attr('rx', radius)
                    .attr('ry', radius)
                    .on('mouseover', activate)
                    .on('mouseout', deactivate)
                    .on('click', toggle);

                //addShadow.call(g.node(), d, i); Not very pretty
                addGradient.call(g.node(), d, i);
            });
        });
    }

    function addGradient(d, i) {
        var defs = d3.select(this).select('defs');
        var gradient = defs.append('linearGradient')
            .attr('id', 'gradient' + i)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        gradient.append('stop')
            .attr('id', 'gradient-start')
            .attr('offset', '0%');

        gradient.append('stop')
            .attr('id', 'gradient-stop')
            .attr('offset', '100%');

        d3.select(this).select('rect').attr('fill', 'url(#gradient' + i + ")" );
    }

    function addShadow(d, i) {
        var defs = d3.select(this).select('defs');
        var rect = d3.select(this).select('rect').attr('filter', 'url(#dropShadow' + i + ")" );
        var shadow = defs.append('filter')
            .attr('id', 'dropShadow' + i)
            .attr('x', rect.attr('x'))
            .attr('y', rect.attr('y'))
            .attr('width', rect.attr('width') + offsetX)
            .attr('height', rect.attr('height') + offsetY);

        shadow.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2);

        shadow.append('feOffset')
            .attr('dx', offsetX)
            .attr('dy', offsetY);

        var merge = shadow.append('feMerge');

        merge.append('feMergeNode');
        merge.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    function activate() {
        var gradient = d3.select(this.parentNode).select('linearGradient');
        d3.select(this.parentNode).select("rect").classed('active', true);
        if (!gradient.node()) return;
        gradient.select('#gradient-start').classed('active', true);
        gradient.select('#gradient-stop').classed('active', true)
    }

    function deactivate() {
        var gradient = d3.select(this.parentNode).select('linearGradient');
        d3.select(this.parentNode).select("rect").classed('active', false);
        if (!gradient.node()) return;
        gradient.select('#gradient-start').classed('active', false);
        gradient.select('#gradient-stop').classed('active', false);
    }

    function toggle(d, i) {
        if (d3.select(this).classed('pressed')) {
            release.call(this, d, i);
            deactivate.call(this, d, i);
        } else {
            press.call(this, d, i);
            activate.call(this, d, i);
        }
    }

    function press(d, i) {
        dispatch.call('press', this, d, i);
        d3.select(this).classed('pressed', true);
        var shadow = d3.select(this.parentNode).select('filter');
        if (!shadow.node()) return;
        shadow.select('feOffset').attr('dx', 0).attr('dy', 0);
        shadow.select('feGaussianBlur').attr('stdDeviation', 0);
    }

    function release(d, i) {
        dispatch.call('release', this, d, i);
        my.clear.call(this, d, i);
    }

    my.clear = function(d, i) {
        d3.select(this).classed('pressed', false);
        var shadow = d3.select(this.parentNode).select('filter');
        if (!shadow.node()) return;
        shadow.select('feOffset').attr('dx', offsetX).attr('dy', offsetY);
        shadow.select('feGaussianBlur').attr('stdDeviation', stdDeviation);
    };

    my.on = function() {
        var value = dispatch.on.apply(dispatch, arguments);
        return value === dispatch ? my : value;
    };

    return my;
};
