
function visualize(data_list) {
  let [mean_budget,movie]=data_list
  let scales = make_scales(movie)
  movie = d3.filter(movie, function(d) {
    //return d.budget !== 0 && d.budget !== null && !isNaN(d.budget) && d !== undefined;
    return d.budget > 100;
});
  initialize(movie, scales);
  initialize_line(mean_budget);
}

function nest(data) {
  let result = {}

  let genres = data.map(d => d.genre)
  for (let i = 0; i < genres.length; i++) {
    result[genres[i]] = []
  }

  for (let i = 0; i < data.length; i++) {
    result[data[i].genre].push(data[i])
  }
  return Object.values(result)
}

function initialize(data, scales) {
 
  d3.select("#circles")
    .selectAll("circle")
    .data(data, d => d.name).enter()
    .append("circle")
    .attrs({
      class: "plain",
      cx: d => scales.x(d.budget),
      cy: d => scales.y(d.score),
      fill: d => scales.fill(d.genre)
    })
    .on("mouseover", (ev, d) => mouseover(data,ev, d))
    .on("mouseout", (ev) => mouseout(ev))

  //d3.select("#tooltip").append("text")
  annotations(scales)
}

function initialize_line(data){
  let width = 500
  height = 300
  let scales2 = make_scales2(data)
  draw_line(data, scales2);
  add_axes(scales2);
}

function mouseover(data,ev, d) {
  d3.select("#title").text(d.name)
  d3.select("#genre").text(d.genre)
  d3.select("#year").text(d.year)
  d3.select("#budget").text(d.budget)
  d3.select(ev.target).attr("class", "highlighted")
  let label_data = data.filter(entry => entry.county === d.genre);
  let scales = make_scales2(data)
  let genre=d.genre
  line_highlight(ev,data,genre,scales)
  
}

function line_highlight(ev,data,genre,scales) {
   path_generator = d3.line()
    .x(d => scales.x(d.date))
    .y(d => scales.y(d.unemployment));
    
  d3.select("#series")
    .selectAll("path")
    //.data(data).enter() // no longer add the array
    //.append("path")
    //.attr("d", path_generator)
    .attrs({
      stroke: e => e[0].genre== genre ? "red" : "#a8a8a8",
      "stroke-width": e=> e[0].genre == genre ? 2 : 0.2
    })
    
    d3.select(ev.target).raise()
    
    d3.select("#tooltip text")
    .attr("transform", `translate(800, 100)`)
    .text(genre);
   
   // d3.select("#tooltip text")
   // .attr( "transform" , `translate(900，500)`)
    //.attr("transform", `translate(${scales.x(flat_data[ix].time_of_day) + 5}, ${scales.y(flat_data[ix].Demand) - 5})`)
   // .text(genre)
 
}

function mouseout(ev, d) {
  d3.select(ev.target).attr("class", "plain")
}

function annotations(scales) {
  let x_axis = d3.select("#axes").append("g")
      y_axis = d3.select("#axes").append("g"),
      x_title = d3.select("#axes").append("text"),
      y_title = d3.select("#axes").append("text");

  x_axis.attr("transform", `translate(0, ${height - margins.bottom})`)
    .call(d3.axisBottom(scales.x).ticks(5))
  y_axis.attr("transform", `translate(${margins.left}, 0)`)
    .call(d3.axisLeft(scales.y).ticks(5))

  x_title.text("Budget")
    .attrs({
      class: "label_title",
      transform: `translate(${0.5 * width}, ${height - 0.25 * margins.bottom})`,
    })
  y_title.text("Score")
    .attrs({
      class: "label_title",
      transform: `translate(${0.25 * margins.left}, ${0.5 * height})rotate(-90)`
    });
}

function make_scales(data) {
  return {
    x: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.budget)))
         .range([margins.left, width - margins.right]),
    y: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.score)))
         .range([height - margins.bottom, margins.top]),
    fill: d3.scaleOrdinal()
      .domain([... new Set(data.map(d => d.Genre_Group))])
      .range(d3.schemeSet2)
  }
}

function make_scales2(data) {
  let y_extent= d3.extent(data.map(d => d.budget-5))
      x_extent = d3.extent(data.map(d => d.year));

  return {
    x: d3.scaleLinear()
         .domain(x_extent)
         .range([margins.left, width - margins.right]),
    y: d3.scaleLinear()
         .domain(y_extent)
         .range([height - margins.bottom, margins.top])
  }
}


function draw_line(data, scales) {
 // data = data.filter(d =>!isNaN(d.year))
  data = data.filter(d => !isNaN(parseFloat(d.budget)));
  data = data.filter(d =>d.genre != "Music")
  
  path_generator = d3.line()
    .x(d => scales.x(d.year))
    .y(d => scales.y(d.budget) );
  
    
   // console.log(Object.values(datagrouped))
   let nested=nest(data)
  d3.select("#series")
    .selectAll("path")
    .data(nested).enter() // no longer add the array
    .append("path")
    .attr("d", path_generator)
    .attr("stroke", "#a8a8a8")
    .attr("stroke-width", "3px")
    //do I have to use mouseover here?
}

function add_axes(scales) {
  
  let x_axis = d3.axisBottom()
        .scale(scales.x),
      y_axis = d3.axisLeft()
        .scale(scales.y);

  d3.select("#Line_axes")
    .append("g")
    .attrs({
      id: "x_axis",
      transform: `translate(0,${height - margins.bottom})`
    })
    .call(x_axis);

  d3.select("#Line_axes")
    .append("g")
    .attrs({
      id: "y_axis",
      transform: `translate(${margins.left}, 0)`
    })
    .call(y_axis)
}

 let width = 1200,
     height = 400
 // genres = ["Drama"]
  margins = {left: 70, right: 60, top: 60, bottom: 60};
  
Promise.all([
      d3.csv("mean_budget.csv"),
      d3.csv("movies.csv")
  ]).then(visualize)
  
//d3.csv("mean_budget.csv", d3.autoType)
//  .then(visualize);
