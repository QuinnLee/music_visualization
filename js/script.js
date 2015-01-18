d3.json('/data/notes.json', function(error, json) {
  var midiDefinition = {
    "octave": { "1":24, "2":36, "3":48, "4":60, "5": 72, "6":84, "7":96 },
    "step": { "C":0, "D":2, "E":4, "F":5, "G":7, "A":9, "B":11 }
  }

  json.forEach(function(datum) {
    var pitch = datum.pitch;
    datum.duration = +datum.duration || 0;
    var midiNumber = datum.rest ? 0 : this.octave[pitch.octave] + this.step[pitch.step];
    datum.midiNumber = datum.alter ? midiNumber + parseInt(datum.alter) : midiNumber;
  }, midiDefinition);

  new NoteScatterPlot('#note-scatter-plot').data(json).render()
});

function NoteScatterPlot(selector) {
  var _chart = {};
  var data;

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var notes = { 0:"C", 1:"C#", 2:"D", 3:"D#", 4:"E", 5:"F", 6:"F#", 7:"G", 8:"G#",  9:"A", 10:"A#", 11: "B" };

  //create scales
  // y is note
  // x is length
  var yScale = d3.scale
    .linear()
    .range([height, 0])
    .domain([48, 88])
    .clamp(true);

  var xScale = d3.scale
    .log(12)
    .range([0, width])
    .domain([4, 64])
    .clamp(true);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .tickValues(["0", "6", "8", "9", "12", "24", "48", "96", "144"])
    .tickFormat(function(d) {
      return d;
    });

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('right')
    .tickSize(width + margin.right)
    .tickValues([53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83])
    .tickFormat(function(d) {
      return notes[d % 12];
    });

   _chart.svg = d3.select(selector).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  _chart.chart = _chart.svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  _chart.data = function(d) {
    if(arguments.length){
      data = d; return _chart;
    }
    else { return data; }
  }

  _chart.render = function(d){
    _chart.chart.append('g')
      .attr("class", "y axis")
      .call(yAxis)
      .call(function (g) {
        g.selectAll("text")
        .attr("x", -25)
        .attr("dy", 2);
      })
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", -26)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Note");

    _chart.chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height+ ')')
      .call(xAxis)
      .append('text')
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Duration");

    var legend = _chart.chart.append('g')
      .attr("class", "legend")
      .attr('transform', 'translate(0,375)')
      .attr("height", 50)
      .attr("width", 100);

    legend.selectAll('g')
      .data([{ "color": "black", "name": "rests"},{ "color": "red", "name": "slurs"},{ "color": "steelblue", "name": "notes"}])
      .enter()
      .append('g')
      .each(function(d, i) {
        var g = d3.select(this);
        g.append("rect")
          .attr("x", 20)
          .attr("y", i*20)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", d.color)
          .style('opacity', 0.5)
        g.append("text")
          .attr("x", 40 )
          .attr("y", i * 20 + 9)
          .attr("height",30)
          .attr("width",100)
          .text(d.name);
      });

    _chart.draw();

    return _chart;
  }

 _chart.draw = function() {
      _chart.chart.selectAll('.dot')
      .data(data)
      .enter().append("circle")
      .attr("r", 4)
      .attr('class','dot')
      .style('opacity', '0.1')
      .style('fill',function(d) {
        if (d.midiNumber === 0 ) {
          return 'black';
        } else if (d.duration == 0) {
          return 'red'
        } else {
          return 'steelblue'
        }
      })
      .attr("cy", function(d) { return yScale(d.midiNumber); })
      .attr("cx", function(d) { return xScale(d.duration); })
  };

  return _chart;
}
