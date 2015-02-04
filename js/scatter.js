function NoteScatterPlot(selector) {
  var _chart = {};
  var data;

  var margin = {top: 20, right: 20, bottom: 70, left: 100},
      width = 600 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  var notes = { 0:"C", 1:"", 2:"D", 3:"D#/E♭", 4:"E", 5:"F", 6:"F#/G♭", 7:"G", 8:"G#/A♭",  9:"A", 10:"A#/B♭", 11: "B" };

   _chart.xTicks  = function() { return d3.set(data.map(function(d) { return d.key[1]})).values() }

   _chart.yTicks = function() {
     var extent = [];
     var min = d3.min(data, function(d) { return d.key[2]});
     var max = d3.max(data, function(d) { return d.key[2]});
     for(var i = 1; i < (max-min); i++) { extent.push(min+i); }
     return extent.filter(function(d) {
       var number = parseInt(d) % 12;
       return number == 0 ||  number == 2 || number == 4 || number == 5 || number == 7 || number == 9 || number == 11;
     });
   }

   _chart.yScale = function() {
     var max =  d3.max(data, function(d) { return d.key[2]});
     var min =  d3.set(data.map(function(d) { return d.key[2]})).values()[1] - 5;
     return d3.scale
      .linear()
      .range([height, 0])
      .domain([min, max])
      .clamp(true);
   }

  var xScale = d3.scale
    .log()
    .range([0, width])
    .domain([1, 144])
    .clamp(true);

  _chart.xAxis = function(){
    return d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .tickValues(_chart.xTicks())
    .tickFormat(function(d) {
      return d;
    });
  }

  _chart.yAxis = function(){
    return d3.svg.axis()
    .scale(_chart.yScale())
    .orient('left')
    .tickSize(width + 30)
    .tickValues(_chart.yTicks())
    .tickFormat(function(d) {
      return d == 60 ? "Middle C" : notes[d % 12];
    });
  }

  _chart.typeColorScale = d3.scale.ordinal()
    .domain(['rest', 'slur', 'chord', 'note'])
    .range(['black', '#e34a33', '#2ca25f', '#2b8cbe']);

  _chart.data = function(d) {
    if(arguments.length){
      data = crossfilter(d).dimension(function(d) { return [d.type, d.duration, d.midiNumber]})
      .group()
      .reduceCount()
      .all();
      return _chart;
    } else {
      return data;
    }
  }

  _chart.render = function(){
     _chart.svg = d3.select(selector).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    _chart.chart = _chart.svg.append("g")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" +margin.left+ "," + margin.top + ")");

    _chart.yAxisLabel = _chart.svg.append('g')
      .attr("class", "y axis")
      .attr("transform", "translate("+ (width + margin.left + margin.right)+","+  margin.top + ")")
      .call(_chart.yAxis());

    _chart.xAxisLabel = _chart.svg.append('g')
     .attr('class', 'x axis')
     .attr("transform", "translate(" +margin.left+ "," + (height + margin.top) + ")")
     .call(_chart.xAxis());

    _chart.xAxisLabel.append('text')
      .attr("class", "label")
      .attr("x", width-50)
      .attr("y", -6)
      .text("Duration");

    _chart.draw();
    _chart.legend();
    return _chart;
  }

  _chart.legend = function() {
    var data =  [{ name: 'slur'}, { name: 'note'}, { name: 'chord'}, { name: 'rest'}]
    var legend = _chart.svg.append('g')
      .attr('class', 'legend')
      .attr('width', width)
      .attr('height', margin.bottom)
      .attr("transform", "translate(" +(margin.left + 50)+ "," + (height + margin.bottom) + ")");

    var legends = legend.selectAll('.legends')
      .data(data);

    legends.enter()
      .append('g')
        .attr('width', 20)
        .attr('height', 20)
        .attr('class', 'legends')
        .append('rect')
          .attr('width', 20)
          .attr('height', 20)
          .attr('x', function(d,i) { return i* width / 4; })
          .attr('opacity', 0.6)
          .attr('fill', function(d) { return _chart.typeColorScale(d.name);})

    legends.append('text')
      .text(function(d) { return d.name;})
      .attr('x', function(d,i) { return (i* width / 4) + 30; })
      .attr('y', 11)
  }

  _chart.draw = function() {
    var notes = _chart.chart.selectAll('.note')
      .data(data, function(d,i) { return [d.key[2], d.key[1], i]})

    notes.enter()
      .append("circle")
      .attr("r", 6)
      .attr('class','note')
      .style('opacity', 0.1)
      .style('fill',function(d) {
        return _chart.typeColorScale(d.key[0]);
      })
      .attr("cy", function(d) {
        return  _chart.yScale()(d.key[2]) || _chart.yScale()(0);
      })
      .attr("cx", function(d) { return xScale(d.key[1]); });

    notes.exit()
      .transition()
      .duration(500)
      .ease("linear")
      .style("opacity", "0.0")
      .remove();

    notes.transition()
      .duration(1000)
      .ease("linear")
      .style('opacity', function(d) { return d.value/5;})

    _chart.axis();

     return _chart;
   }

   _chart.axis = function() {
     _chart.xAxisLabel
       .transition()
       .duration(1000)
       .ease("sin-out-in")
       .call(_chart.xAxis());

     _chart.yAxisLabel
      .transition()
      .duration(1000)
      .ease("sin-in-out")
      .call(_chart.yAxis());

     return _chart;
   }

  return _chart;
}
