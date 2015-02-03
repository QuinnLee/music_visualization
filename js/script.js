var plot;
var midiDefinition = {
  "octave": { "1":24, "2":36, "3":48, "4":60, "5": 72, "6":84, "7":96 },
  "step": { "C":0, "D":2, "E":4, "F":5, "G":7, "A":9, "B":11 }
}

var score = {};
var content = {};

var munger = function(datum) {
  var pitch = datum.pitch;
  datum.duration = +datum.duration || 0;
  var midiNumber = datum.rest ? 0 : this.octave[pitch.octave] + this.step[pitch.step];
  if (!datum.rest) {
    datum.midiNumber = pitch.alter ? midiNumber + parseInt(pitch.alter) : midiNumber;
  } else {
    datum.midiNumber = 'rest';
  }
  if(!datum.duration){
    datum.type = 'slur';
  } else if(datum.rest){
    datum.type = 'rest';
  } else if(datum.chord){
    datum.type = 'chord';
  } else{
    datum.type = 'note';
  }
};

queue()
  .defer(d3.json, '/data/asturias_notes.json')
  .defer(d3.json, '/data/alhambra_notes.json')
  .await(function(error, asturias, alhambra) {
    [asturias, alhambra].forEach(function(notes){
      notes.forEach(munger, midiDefinition)
    });

    content.asturias = {
      "title": "Asturias (Leyenda)",
      "composer": "Isaac Albéniz",
      "video": '<iframe width="300" height="200" src="https://www.youtube.com/embed/KNuMm6UfB6c" frameborder="0" allowfullscreen></iframe>',
      "videoSrc": "https://www.youtube.com/embed/KNuMm6UfB6c",
      "performer": "John Williams",
      "sheetMusic": '<a href="http://www.classicalguitarschool.net/music/1095.pdf">Sheet Music</a>',
      "textOne": "Asturias (Leyenda), named simply Leyenda by its composer, is a musical work written by the Spanish composer Isaac Albéniz.",
      "textTwo": "It was originally written for the piano and set in the key of G minor. It was first published in Barcelona, by Juan Bta. Pujol & Co., in 1892 as the prelude of a three-movement set entitled Chants d'Espagne"
    }
    content.alhambra = {
      "title": "Recuerdos de la Alhambra",
      "composer": "Francisco Tárrega",
      "video": '<iframe width="300" height="200" src="https://www.youtube.com/embed/2rb477dcfXA" frameborder="0" allowfullscreen></iframe>',
      "videoSrc": "https://www.youtube.com/embed/2rb477dcfXA",
      "performer": "Francisco Tárrega",
      "sheetMusic": '<a href="http://imslp.org/wiki/Recuerdos_de_la_Alhambra_%28T%C3%A1rrega,_Francisco%29">Sheet Music</a>',
      "textOne": "Recuerdos de la Alhambra (Memories of the Alhambra) is a classical guitar piece composed in 1896 in Granada by Spanish composer and guitarist Francisco Tárrega. It uses the classical guitar tremolo technique often performed by advanced players.",
      "textTwo":""
    }

    score.asturias = asturias;
    score.alhambra = alhambra;

    plot = new NoteScatterPlot('#note-scatter-plot').data(score.asturias).render();
    setInformation('asturias', content.asturias)
    setInformation('alhambra', content.alhambra)
    next = 'alhambra'
  });

d3.select('.switch').on('click', function(){
  if(next == 'alhambra'){
    plot.data(score.alhambra).draw();
    d3.select("#information."+next).classed('hidden', false)
    d3.select("#information."+next).select('iframe').attr('src', content.alhambra.videoSrc)
    next = 'asturias'
    d3.select("#information."+next).classed('hidden', true);
    d3.select("#information."+next).select('iframe').attr('src', " ")
  } else {
    plot.data(score.asturias).draw();
    d3.select("#information."+next).classed('hidden', false)
    d3.select("#information."+next).select('iframe').attr('src', content.asturias.videoSrc)
    next = 'alhambra'
    d3.select("#information."+next).classed('hidden', true);
    d3.select("#information."+next).select('iframe').attr('src', " ")
  }
});



function setInformation(piece, data) {
  var information = d3.select("#information."+piece)

  information.select('#title')
    .html(data.title);
  information.select('#composer')
    .html(data.composer);
  information.select('#performer')
    .html(data.performer);
  information.select('#video')
    .html(data.video)
  information.select('#sheet-music')
    .html(data.sheetMusic)
  information.select('#textOne')
    .html(data.textOne)
  information.select('#textTwo')
    .html(data.textTwo)
}



