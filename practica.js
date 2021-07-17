var height = 500;
var width = 800;
var marginbottom = 100;
var margintop = 20;
var marginright = 50;
var numero = 4;

var svg = d3
  .select("div")
  .attr("class", "svg-container")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr(
    "viewBox",
    `0 0 ${width + marginright} ${height + marginbottom + margintop}`
  )
  .attr("class", " svg-content")
  .append("g")
  .attr("transform", "translate(" + marginright + "," + margintop + ")");

d3.json('practica_airbnb.json')
  .then((featureCollection) => {
      drawMap(featureCollection);
  });

function drawMap(featureCollection) {
  var tooltip = d3.select("div")
  .append('div')
  .attr('class', 'tooltip')
  .style('visibility', 'hidden')
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px");

  var center = d3.geoCentroid(featureCollection); 
  var projection = d3.geoMercator()
      .fitSize([width, height], featureCollection) 
      .center(center)
      .translate([width / 2, height/2 +70]);

  var pathProjection = d3.geoPath().projection(projection);
  var features = featureCollection.features;

  var createdPath = svg.selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', (d) => pathProjection(d))
      .attr("opacity", function(d, i) {
          d.opacity = 1
          return d.opacity
      });

  createdPath.on('click', function(event, d) {
      d.opacity = d.opacity ? 0 : 1;
      d3.select(this).attr('opacity', d.opacity);
      numero=d.properties.cartodb_id;
      d3.json('practica_airbnb.json').then((featureCollection) => {
        drawGraph(featureCollection);
    });
  });

  var price = new Array(128).fill(0);
  var i=0;
  featureCollection.features.forEach((d) => {
    if (d.properties.avgprice===undefined)
    {
    d.properties.avgprice=0;
    }
    price[i]=d.properties.avgprice;
    i=i+1;
  });

  var scaleColor = d3.scaleSequential().domain([0, 280]).interpolator(d3.interpolateCool);
  createdPath.attr('fill', (d) => scaleColor(d.properties.avgprice)).on("mouseover",function(event, d) {    
    d3.select(this)
    tooltip
    .style("left", (event.pageX + 20) + "px")
    .style("top", (event.pageY - 30) + "px")
    .style("visibility", "visible")
    .text(d.properties.name + ": " +
        d.properties.avgprice)
})
.on("mouseout", function() {
  d3.select(this)
  tooltip.style("visibility", "hidden")
});


  
};
var svg2 = d3
  .select("div")
  .attr("class", "svg-container")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox",`0 0 ${width + marginright} ${height + marginbottom + margintop}`)
  .attr("class", " svg-content")
  .append("g")
  .attr("transform", "translate(" + marginright +"," + margintop + ")");

d3.json('practica_airbnb.json').then((featureCollection) => {
    drawGraph(featureCollection);
});

function drawGraph(featureCollection){
  numero=numero-1;
  svg2.selectAll("*").remove();
  svg2.append("text").text(function(d, i) { return featureCollection.features[numero].properties.name;})
  var Ymax = d3.max(featureCollection.features[numero].properties.avgbedrooms, function (d) {
    return d.total;
  });
  var Ymin = d3.min(featureCollection.features[numero].properties.avgbedrooms, function (d) {
    return d.total;
  });

  var scaleY = d3
  .scaleLinear()
  .domain([0, Ymax])
  .range([height / 2, 0]);
  var scaleX = d3.scaleBand().domain(featureCollection.features[numero].properties.avgbedrooms.map(function(d) {
    return d.bedrooms;
})).range([0, width]).padding(0.1);

var axisX = d3.axisBottom(scaleX);
var axisY = d3.axisLeft(scaleY);

svg2.append("text")

svg2
  .append("g")
  .attr("transform", "translate(0,270)")
  .call(axisX);

svg2.append("g").call(axisY).attr("transform", "translate(0,20)");

var rect = svg2
  .selectAll("rect")
  .data(featureCollection.features[numero].properties.avgbedrooms)
  .enter()
  .append("rect")
  .attr("x", function (d) {
    return scaleX(d.bedrooms);
  })
  .attr("y", function (d) {
    return scaleY(0);
  })
  .attr("width", scaleX.bandwidth())
  .attr("height", 0)
  .attr("fill", "rgb(105,179,162)")
  .attr("transform", "translate(0,19.5)");

  rect
  .transition()
  .duration(1000)
  .delay(function (d, i) {
    return i * 200;
  })
  .attr("height", function (d) {
    return height / 2 - scaleY(d.total);
  })
  .attr("y", function (d) {
    return scaleY(d.total);
  });

};