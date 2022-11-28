let test = "test string";
let testobject = {"name": "bird", "children":[]};

const datafile = "birddata.csv";
let birdList = [];
create();

function create() {
  d3.select("#my_dataviz").html(null);
  // Size ?
  var width = 1200;
  var height = 900;

  // Prepare our physical space
  var g = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .select("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // // The svg
  // var svg = d3.select("#my_dataviz")
  //   .append("svg")
  //   .attr("width", width)
  //   .attr("height", height);

  const dataMap = new Map();

  const locationToBird = new Map();
  d3.csv(datafile, (d) => {
    const colors = d["color"].split(","); // arr
    const family = d["Family"].split(","); // str
    const value = {"colors": colors, "family": family};
    dataMap.set(d["real_name"], value)

    const locations = d["location"].split(",");
    for (let i = 0; i < locations.length; i++) {
      if (!locationToBird.get(locations[i])) {
        locationToBird.set(locations[i], []);
      }
      locationToBird.get(locations[i]).push(d["real_name"]);
    }
  }).then(() => {
    console.log(locationToBird);
    createGeomap();
    d3.select("#my_dataviz").append("div").append("g").append("svg")
      .attr("id", "sunburst");

    // const birdList = [
    //   "Alder Flycatcher", "American Avocet", "American Crow", "American Goldfinch",
    //   "Ash-throated Flycatcher", "Black Phoebe", "Eastern Kingbird",
    //   "Gray-crowned Rosy-Finch", "Common Redpoll"
    // ]
    // const birdList = [
    //   "American Goldfinch", "Gray-crowned Rosy-Finch", "Common Redpoll"
    // ]
    // const birdList = locationToBird.get("AF");
    
    // console.log("CREATE MAP FOR SUNBURST");
    // console.log(createMapForSunburst(birdList, "family", []));
    if (birdList.length > 0) {
      const sunburstJSONdata = createSunburstJSON(birdList);
      drawSunburst(sunburstJSONdata);
    }
  });


function createSunburstJSON(birdList, datamap = dataMap) {
  // Family
  const familyChildren = [];
  const familyMap = createMapForSunburst(birdList, "family");
  // console.log(familyMap);
  for (const [family, familyBirdList] of Object.entries(familyMap)) {
    // console.log(family);
    // console.log(familyBirdList); // NEW keyArr

    // Colors
    const colorChildren = createColorChildren(familyBirdList, []);
    ///////

    familyChildren.push({"name": family, "children": colorChildren});

  }
  // console.log("familyChildren");
  // console.log(familyChildren);

  const sunburstData = {"name": "root", "children": familyChildren}
  return sunburstData;
}

// returns children array
function createColorChildren(keyArr, exemptValues, datamap = dataMap) {
  const colorChildren = [];
  const colorMap = createMapForSunburst(keyArr, "colors", exemptValues);
  for (const [color, colorBirdList] of Object.entries(colorMap)) {
    console.log(colorBirdList);
    const newExemptValues = exemptValues;
    exemptValues.push(color);
    const continueBirdList = [];

    // Checking for leaf nodes
    const leafChildren = [];
    for (bird of colorBirdList) {
      const birdAllColors = datamap.get(bird)["colors"];
      const noColorsLeft = birdAllColors.every(
        (val) => newExemptValues.includes(val));
      if (noColorsLeft) {
        // console.log("No colors left: " + bird);
        leafChildren.push({"name": bird, "size": 1})
      } else {
        continueBirdList.push(bird);
      }
    }
    console.log('leafChildren');
    console.log(leafChildren);
    const treeChildren = createColorChildren(continueBirdList, newExemptValues);
    const subChildren = leafChildren.concat(treeChildren);

    colorChildren.push({"name": color, "children": subChildren});
  }
  return colorChildren;
}

// creates {value : [key(s)]} map
function createMapForSunburst(keyArr, valueName,
    exemptValues = [],
    datamap = dataMap) {
  console.log(`CREATE MAP: ${valueName}`);
  let map = {};
  for (key of keyArr) {
    for (value of datamap.get(key)[valueName]) {
      if (!exemptValues.includes(value)) {
        if (!map[value]) {
          map[value] = [];
        }
        map[value].push(key);
      }
    }
  }
  console.log(map);
  return map;
}

function drawSunburst(data) {
  d3.select("body").append("div");
  Sunburst(data, {
    value: d => d.size, // size of each node (file); null for internal nodes (folders)
    label: d => d.name, // display name for each cell
    title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}\n${n.value.toLocaleString("en")}`, // hover text
    // link: (d, n) => n.children
    //   ? `https://github.com/prefuse/Flare/tree/master/flare/src/${n.ancestors().reverse().map(d => d.data.name).join("/")}`
    //   : `https://github.com/prefuse/Flare/blob/master/flare/src/${n.ancestors().reverse().map(d => d.data.name).join("/")}.as`,
    width: 850,
    height: 850
  })
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sunburst
function Sunburst(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
  path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
  id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
  parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
  children, // if hierarchical data, given a d in data, returns its children
  value, // given a node d, returns a quantitative value (for area encoding; null for count)
  sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
  label, // given a node d, returns the name to display on the rectangle
  title, // given a node d, returns its hover text
  link, // given a node d, its link (if any)
  linkTarget = "_blank", // the target attribute for links (if any)
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  margin = 1, // shorthand for margins
  marginTop = margin, // top margin, in pixels
  marginRight = margin, // right margin, in pixels
  marginBottom = margin, // bottom margin, in pixels
  marginLeft = margin, // left margin, in pixels
  padding = 1, // separation between arcs
  radius = Math.min(width - marginLeft - marginRight, height - marginTop - marginBottom) / 2, // outer radius
  color = d3.interpolateRainbow, // color scheme, if any
  fill = "#ccc", // fill for arcs (if no color encoding)
  fillOpacity = 0.6, // fill opacity for arcs
} = {}) {

  // If id and parentId options are specified, or the path option, use d3.stratify
  // to convert tabular data to a hierarchy; otherwise we assume that the data is
  // specified as an object {children} with nested objects (a.k.a. the “flare.json”
  // format), and use d3.hierarchy.
  const root = path != null ? d3.stratify().path(path)(data)
      : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
      : d3.hierarchy(data, children);

  // Compute the values of internal nodes by aggregating from the leaves.
  value == null ? root.count() : root.sum(d => Math.max(0, value(d)));

  // Sort the leaves (typically by descending value for a pleasing layout).
  if (sort != null) root.sort(sort);

  // Compute the partition layout. Note polar coordinates: x is angle and y is radius.
  d3.partition().size([2 * Math.PI, radius])(root);

  // Construct a color scale.
  if (color != null) {
    color = d3.scaleSequential([0, root.children.length - 1], color).unknown(fill);
    root.children.forEach((child, i) => child.index = i);
  }

  // Construct an arc generator.
  const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - padding);

  const svg = d3.select("#sunburst").raise()
      .attr("viewBox", [
        (marginRight - marginLeft - width / 2),
        marginBottom - marginTop - height / 2,
        width,
        height
      ])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle");

  const cell = svg
    .selectAll("a")
    .data(root.descendants())
    .join("a")
      .attr("xlink:href", link == null ? null : d => link(d.data, d))
      .attr("target", link == null ? null : linkTarget);

  cell.append("path")
      .attr("d", arc)
      .attr("fill", color ? d => color(d.ancestors().reverse()[1]?.index) : fill)
      .attr("fill-opacity", fillOpacity);

  if (label != null) cell
    .filter(d => (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10)
    .append("text")
      .attr("transform", d => {
        if (!d.depth) return;
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.32em")
      .text(d => label(d.data, d));

  if (title != null) cell.append("title")
      .text(d => title(d.data, d));

  return svg.node();
}


function createGeomap() {
  var width = 1000;
  var height = 700;

  //var color = d3.scaleOrdinal(d3.schemeCategory20);
  var color = d3.scaleThreshold()
  .domain([1, 500, 1000, 2000, 2500, 3000, 3500, 4000])
  .range(d3.schemeOrRd[9]);
    
    
  var graticule = d3.geoGraticule();
  var svg = d3.select("#my_dataviz").append("svg")
    .attr("id", "geomap")
    .attr("width", width)
    .attr("height", height);

  var g = svg.append("g");

  //https://bl.ocks.org/mbostock/3710082
  var projection = d3.geoKavrayskiy7()
  .scale(170)
  .translate([width / 2, height / 2])
  .precision(.1)
  .rotate([-11,0]);

  var path = d3.geoPath().projection(projection);

  svg.append("defs").append("path")
  .datum({type: "Sphere"})
  .attr("id", "sphere")
  .attr("d", path);

  svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

  svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);


  //var data = "https://piwodlaiwo.github.io/topojson//world-continents.json";

  var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);
    
  var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

  g.selectAll("rect")
    .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      }))
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", function(d) { return x(d[0]); })
      .attr("width", function(d) { return x(d[1]) - x(d[0]); })
      .attr("fill", function(d) { return color(d[0]); });
  g.append("text")
      .attr("class", "caption")
      .attr("x", x.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Number of spieces in continent");
  g.call(d3.axisBottom(x)
      .tickSize(13)
      .tickValues(color.domain()))
    .select(".domain")
      .remove();
    
  d3.json("world-continents.json").then(function(topology) {
    var continents = topojson.feature(topology, topology.objects.continent).features;
    
    //tooltip
    var tip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      
    var centroids = continents.map(function (d){
      return projection(d3.geoCentroid(d))
    });
    
    svg.selectAll(".continent")
        .data(continents)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("title", function(d,i) { 
          return d.properties.continent;
        })
  //      .style("fill", function(d, i) { return color(i); })
        .style("fill", function(d,i) { return color(d.properties.number); })
        .on("click", function(d, i) {
          birdList = locationToBird.get(d.properties.continent);
          tip.style("opacity", 0)
          create();
          // console.log(d);
          // console.log(d.properties.continent + " " + d.properties.number);
        })
        //Tooltip
        .on("mousemove", function(d) {
          tip.style("opacity", 1)
          .html("Continent: " + d.properties.continent +
                "<br>Spieces: " + d.properties.number)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px")
        })
        .on("mouseout", function(d) {
          tip.style("opacity", 0)
        });

    
      svg.selectAll(".name").data(centroids)
            .enter().append("text")
          .attr("x", function (d){ return d[0]; })
          .attr("y", function (d){ return d[1]; })
              .style("fill", "black")
          .attr("text-anchor", "middle")
          .text(function(d,i) {
            return continents[i].properties.continent;
          });
    
  })
}
}