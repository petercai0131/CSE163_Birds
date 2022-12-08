// Variable Initializations
const geoJSONfile = "world-continents.json";
const datafile = "newbirddata.csv";
const githubLink = "https://petercai0131.github.io/CSE163_Birds/";

const width = 900;
const height = 900;

const continentToName = {
  "NA": "North America",
  "SA": "South America",
  "EU": "Europe",
  "AF": "Africa",
  "AS": "Asia",
  "OC": "Oceania",
}
let birdList = [];
let rootName = "";
const options = [
  "", "color", "order", "family", "general_name",
  "habitat", "food", "nesting", "behavior", "conservation",
]
const optionToName = {
  "": "",
  "color": "Color",
  "order": "Order",
  "family": "Family",
  "general_name": "General Name",
  "habitat": "Habitat",
  "food": "Food",
  "nesting": "Nesting",
  "behavior": "Behavior",
  "conservation": "Conservation",
}
let sunburstOrder = ["family", "color"];
let singleBird = "";

// Creating divs
const root = d3.select("body").append("div")
  .attr("id", "root");
const titleDiv = root.append("div")
  .attr("id", "titleDiv");
const centerDiv = root.append("div")
  .attr("id", "centerDiv")
  .style("display", "flex")
  .style("justify-content", "space-evenly");
const leftDiv = centerDiv.append("div")
  .attr("id", "leftDiv")
  .style("width", "300px");
// const arrowDiv = centerDiv.append("div")
//   .attr("id", "arrowDiv");
const mainDiv = centerDiv.append("div")
  .attr("id", "mainDiv")
  .attr("width", width)
  .attr("height", height)
  .style("display", "flex")
  .style("justify-content", "space-evenly")
  .style("align-items", "center");
const rightDiv = centerDiv.append("div")
  .attr("id", "rightDiv")
  .style("width", "300px");
const creditsDiv = root.append("div")
  .attr("id", "creditsDiv");

// Data Parsing
const birdMap = new Map();
const propertyNames = ["image", "color", "scientific_name", "order", "family",
  "general_name", "habitat", "food", "nesting", "behavior", "conservation",
  "aab_description"];
const locationToBird = new Map(); // Location: [Bird1, Bird2, ...]
d3.csv(datafile, (d) => {
  // birdMap
  const properties = {};
  for (let i = 0; i < propertyNames.length; i++) {
    properties[propertyNames[i]] = d[propertyNames[i]];
  }
  birdMap.set(d["real_name"], properties);

  // locationToBird
  const locations = d["location"].split(",");
  for (let i = 0; i < locations.length; i++) {
    if (!locationToBird.get(locations[i])) {
      locationToBird.set(locations[i], []);
    }
    locationToBird.get(locations[i]).push(d["real_name"]);
  }
}).then(() => {
  title("Birds and Locations");
  credits(githubLink);
  handleToGeomap();
});

// ____________________________________________________________________________
//
// HANDLE CLICKS
// ____________________________________________________________________________
function handleToSunburst(birdList, rootName, divID = "mainDiv") {
  d3.select(`#${divID}`).html(null);
  createLeftPanel();

  drawSunburst(birdList, rootName, divID);
}

function handleUpdateSunburst(birdList, rootName, divID = "mainDiv") {
  d3.select(`#${divID}`).html(null);
  drawSunburst(birdList, rootName, divID);
}

function handleToGeomap(divID = "mainDiv") {
  d3.select(`#${divID}`).html(null);
  d3.select("#leftDiv").html(null);
  d3.select("#rightDiv").html(null);

  geomap(divID);
}

function handleSingleBird(birdName = singleBird, divID = "rightDiv") {
  d3.selectAll(".geomapHidden2").style("opacity", "1");

  d3.select(`#${divID}`).html(null);
  createBirdOverview(birdName, divID);
}

// ____________________________________________________________________________
//
// TITLE AND CREDITS
// ____________________________________________________________________________
function title(text = "Title", divID = "titleDiv") {
  d3.select(`#${divID}`).append("h1")
    .attr("class", "title")
    .text(text);

  const finalText = [
  "　　Recent studies show that there are 9,956 different species of birds – many more than there are mammals (5,416) or reptiles (842). They range in size from hummingbirds (that weigh less than a tenth of an ounce) to ostriches (that weigh 220-250 pounds) and come in every color imaginable. Their variety is profound. Birds are fascinating creatures that have features unlike other animals. They make incredible bonds with their surroundings and communicate with the environment on levels unrivaled by other species. Their unique anatomies, profound intelligence, and huge diversity make them truly special.","",
  "　　We collected the data of 264 species of birds and their color, food, habitat, scientific classification, and many more qualities, and arranged them into a Sunburst graph for you to look through. Click on a continent to see all the birds that live there, and then select the categories (order matters!) of the Sunburst on the left and enter them with the 'Set Options' button. For example, if you click on South America and set the categories to General Name > Food, you can see that most birds within the same general name share the same diet, whereas if you change the Food category to Nesting, a larger variety will appear within most groups.","",
  "　　You can click on a section of the Sunburst to zoom in, and click on a bird's section to see more details about it. Clicking the center of the Sunburst will zoom out one layer, and clicking outside of it will zoom all the way back out. If you want to go back to the world map from the Sunburst, click on the triangle left of the Sunburst.",
  ];
    
  d3.select(`#${divID}`).append("div")
    .attr("class", "final_text")
    .selectAll("span")
    .data(finalText)
    .enter()
    .append("span")
    .text(function (d) { return d; })
    .append("br");
}

function credits(githubLink, divID = "creditsDiv") {
  const center = d3.select(`#${divID}`).append("div");
  const row = d3.select(`#${divID}`).append("div")
    .style("margin-top", "10px")
    .style("display", "flex")
    .style("justify-content", "space-evenly");

  // Created by
  center.append("div")
    .attr("class", "subtitle")
    .text("Created By:");

  // List of group member names
  const members = [
    "Wen Liao (wliao9@ucsc.edu)",
    "Kayla Zhang (zzhan333@ucsc.edu)",
    "Yongmao Cai (yocai@ucsc.edu)",
    "Sheng Chen (schen272@ucsc.edu)",
    "Alanna Song (azsong@ucsc.edu)",
  ];
  center.append("div")
    .attr("class", "normal_text")
    .selectAll("span")
    .data(members)
    .enter()
    .append("span")
    .text(function (d) { return d; })
    .append("br");

  // Github Link
  center.append("div")
    .attr("class", "subtitle")
    .text("Github Link: ");
  center.append("div")
    .attr("class", "normal_text")
    .append("a")
    .text(githubLink)
    .attr("href", githubLink);

  // Designed for
  center.append("div")
    .attr("class", "subtitle")
    .text("Designed For: ");
  center.append("div")
    .attr("class", "normal_text")
    .text("CSE 163: Data Programming for Visualization, Fall 2022");

  // Files Submitted
  const filesSubmitted = row.append("div");
  filesSubmitted.append("div")
    .attr("class", "subtitle")
    .text("Files Submitted:");
  const files = ["index.html", "birds.js", "birds.css", geoJSONfile, datafile];
  filesSubmitted.append("div")
    .attr("class", "normal_text")
    .selectAll("span")
    .data(files)
    .enter()
    .append("span")
    .text(function (d) { return d; })
    .append("br");

  // Data Sources
  const dataSources = row.append("div");
  dataSources.append("div")
    .attr("class", "subtitle")
    .text("Data Sources:");
  const sources = [
    ["eBird", "https://ebird.org/home"],
    ["All About Birds", "https://www.allaboutbirds.org/"]
  ];
  dataSources.append("div")
    .attr("class", "normal_text")
    .selectAll("a")
    .data(sources)
    .enter()
    .append("a")
    .text(function (d) { return d[0]; })
    .attr("href", function (d) { return d[1]; })
    .append("br");

  // Relevant Visualizations
  const relevantVisualizations = row.append("div");
  relevantVisualizations.append("div")
    .attr("class", "subtitle")
    .text("Relevant Visualizations:");
  const visualizations = [
    ["Chinese History: Rise and Fall", "https://sureshlodha.github.io/CMPS263_Winter2018/CMPS263FinalProjects/ChineseHistory/index.html"],
    ["Endangered Species Spotlight", "https://sureshlodha.github.io/CMPS263_Winter2018/CMPS263FinalProjects/EndangeredSpecies/index.html"]
  ];
  relevantVisualizations.append("div")
    .attr("class", "normal_text")
    .selectAll("a")
    .data(visualizations)
    .enter()
    .append("a")
    .text(function (d) { return d[0]; })
    .attr("href", function (d) { return d[1]; })
    .append("br");

  // Code Sources
  const codeSources = row.append("div");
  codeSources.append("div")
    .attr("class", "subtitle")
    .text("Code Sources:");
  const codes = [
    ["Sunburst", "https://observablehq.com/@d3/sunburst"],
    ["Kavrayskiy VII projection", "https://bl.ocks.org/mbostock/3710082"]
  ];
  codeSources.append("div")
    .attr("class", "normal_text")
    .selectAll("a")
    .data(codes)
    .enter()
    .append("a")
    .text(function (d) { return d[0]; })
    .attr("href", function (d) { return d[1]; })
    .append("br"); 
}

// ____________________________________________________________________________
//
// LEFT AND RIGHT PANELS
// ____________________________________________________________________________
function createLeftPanel(divID = "leftDiv") {
  const left = d3.select(`#${divID}`)
    .style("display", "flex")
    .style("flex-direction", "row")
    .style("justify-content", "space-between");
  
  left.append("div")
    .attr("id", "sunburstOptionsDiv");
  left.append("div")
    .attr("id", "arrowDiv");
  
  dropdownMenus();
  arrowPanel();
}

function dropdownMenus(order = sunburstOrder, propOptions = options, divID = "sunburstOptionsDiv") {
  const main = d3.select(`#${divID}`)
    .attr("class", "geomapHidden3")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "center");

  main.append("div")
    .text("Sunburst Category Options:");

  const numOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  main.append("div")
    .attr("class", "dropdownMenus")
    .selectAll("div")
    .data(numOptions)
    .enter()
    .append("div")
      .text(function (d, i) {return `${i+1}. `;})
      .style("margin-top", "2px")
      .style("margin-bottom", "2px")
    .append("select")
      .attr("id", function (d) { return `dropdown${d}`; })
      .attr("name", function (d) { return `dropdown${d}`; })
      .selectAll("option")
      .data(propOptions)
      .enter()
      .append("option")
      .attr("value", function (d) { return d; })
      .text(function (d) { return optionToName[d]; });

  main.append("button")
    .text("Set Options")
    .style("margin-top", "2px")
    .on("click", function () {
      const newOrder = [];
      for (let i = 0; i < 9; i++) {
        let val = d3.select(`#dropdown${i}`).node().value;
        if (val.length > 0 && !newOrder.includes(val)) {
          newOrder.push(val);
        }
      }
      if (newOrder.length > 0) {
        sunburstOrder = newOrder;
      }
      handleUpdateSunburst(birdList, rootName);
    });
}

function arrowPanel(divID = "arrowDiv") {
  d3.select(`#${divID}`)
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "space-around");
  const backButton = d3.select(`#${divID}`).append("div")
    .append("svg")
    .attr("class", "geomapHidden")
    .attr("width", "20")
    .attr("height", "20")
    .on("click", function () { handleToGeomap() });
  backButton.append("polygon")
    .attr("points", "0,10 20,0 20,20")
    .attr("fill", "#777777");

}

function createBirdOverview(birdName = singleBird, divID = "rightDiv", width = 300, datamap = birdMap) {
  birdProps = datamap.get(birdName);
  const main = d3.select(`#${divID}`)
    .attr("class", "geomapHidden2")
    .style("overflow", "hidden")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "flex-start");// "space-around");

  const headInfo = main.append("div");
  const birdTitle = headInfo.append("h3")
    .attr("class", "subtitle")
    .text(birdName);

  const birdImage = headInfo.append("img")
    .attr("src", birdProps.image)
    .attr("alt", birdName)
    .attr("width", width);

  const information = main.append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "space-between")
    .style("margin-top", "10px");
  const leftInfo = information.append("div")
    .style("font-style", "italic");
  leftInfo.append("div")
    .text(`Scientific Name: ${birdProps.scientific_name}`);
  leftInfo.append("div")
    .text(`Order: ${birdProps.order}`);
  leftInfo.append("div")
    .text(`Family: ${birdProps.family}`);

  const table = main.append("div").append("table")
    .style("margin-top", "10px");
  const rowProps = ["Habitat", "Food", "Nesting", "Behavior", "Conservation"];
  for (rowProp of rowProps) {
    const row = table.append("tr");
    row.append("td")
      .text(rowProp)
      .style("font-weight", "bold");
    row.append("td")
      .text(":");
    row.append("td")
      .text(birdProps[rowProp.toLowerCase()]);
  }
  const description = main.append("div")
    .attr("width", width)
    .style("overflow", "hidden")
    .style("margin-top", "10px")
    .append("span")
      .text(birdProps.aab_description)
      .style("word-wrap", "break-word");



  (function () {

    var context = new AudioContext();
    var analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    ("#player").bind('canplay', function () {
      var source = context.createMediaElementSource(this);
      source.connect(analyser);
      analyser.connect(context.destination);
    });

    var width = 800,
      height = 600,
      barPadding = 0;

    var svg = d3.select('#visualiser')
      .append('svg')
      .attr('width', width)
      .attr('height', height);


    var update = function (data) {

      rect = svg.selectAll('rect')
        .data(data)

      rect.enter().append('rect');

      rect.attr('width', function () {
        return width / data.length - barPadding;
      })
        .attr('height', function (d) {
          return d * 1000;
        })
        .attr('x', function (d, i) {
          return i * width / data.length;
        })
        .attr('y', function (d) {
          return height - d;
        })
        .attr('fill', function (d) {
          return "rgb(0, 0, " + (d * 10) + ")";
        });

    };
    update(frequencyData);
    d3.timer(function () {
      analyser.getByteFrequencyData(frequencyData);
      update(frequencyData);
    });
  });
}

// ____________________________________________________________________________
//
// SUNBURST
// ____________________________________________________________________________

function drawSunburst(list = birdList, root, divID = "sunburstDiv") {
  if (list.length === 0) { return; }
  // sunburstDiv.html(null);
  const sunburstJSONdata = createSunburstJSON(list, root, sunburstOrder)
  Sunburst(sunburstJSONdata, {
    divID: divID,
    value: d => d.size, // size of each node (file); null for internal nodes (folders)
    label: d => d.name, // display name for each cell
    title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}\n${n.value.toLocaleString("en")}`, // hover text
    width: 700,
    height: 700
  })
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sunburst
function Sunburst(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
  divID = "sunburstDiv",
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
  // Tooltip
  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

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

  const maxRadius = (Math.min(width, height) / 2) - 5;

  const formatNumber = d3.format(',d');

  const x = d3.scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

  const y = d3.scaleSqrt()
    .range([maxRadius * .1, maxRadius]);

  const partition = d3.partition();

  const arc = d3.arc()
    .startAngle(d => x(d.x0))
    .endAngle(d => x(d.x1))
    .innerRadius(d => Math.max(0, y(d.y0)))
    .outerRadius(d => Math.max(0, y(d.y1)));

  const middleArcLine = d => {
    const halfPi = Math.PI / 2;
    const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

    const middleAngle = (angles[1] + angles[0]) / 2;
    const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
    if (invertDirection) { angles.reverse(); }

    const path = d3.path();
    path.arc(0, 0, r, angles[0], angles[1], invertDirection);
    return path.toString();
  };

  const textFits = d => {
    const CHAR_SPACE = 0.5;

    const deltaAngle = x(d.x1) - x(d.x0);
    const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
    const perimeter = r * deltaAngle;

    return d.data.name.length * CHAR_SPACE < perimeter;
  };

  const svg = d3.select(`#${divID}`).append('svg')
    .raise()
    .attr("viewBox", [
      (marginRight - marginLeft - width / 2),
      marginBottom - marginTop - height / 2,
      width,
      height
    ])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-size", 12)
    .attr("text-anchor", "middle")
    .on('click', () => focusOn()); // Reset zoom on canvas click


  const slice = svg.selectAll('g.slice')
    .data(partition(root).descendants());

  slice.exit().remove();

  const newSlice = slice.enter()
    .append('g').attr('class', 'slice')
    .on('click', d => {
      d3.event.stopPropagation();
      if (d.children) {
        focusOn(d);
      }
    });

  // newSlice.append('title')
  //   .text(d => d.data.name + '\n' + formatNumber(d.value));

  newSlice.append('path')
    .attr('class', 'main-arc')
    .attr("fill-opacity", fillOpacity)

    .attr("fill", color ? d => color(d.ancestors().reverse()[1]?.index) : fill)
    .attr('d', arc)
    .on("click", function (d, i) {
      if (!d.children) {
        singleBird = d.data.name;
        handleSingleBird(singleBird);
      }
    })
    // Tooltip
    .on("mousemove", function (d) {
      tooltip.style("opacity", 1)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
      if (d.children) {
        tooltip
          .html("Category: " + d.data.name +
          "<br>Spieces: " + formatNumber(d.value));
      } else {
        tooltip
          .html(d.data.name)
        tooltip.append("div")
          .append("img")
            .attr("src", birdMap.get(d.data.name).image)
            .attr("width", 200);
      }
    })
    .on("mouseout", function (d) {
      tooltip.style("opacity", 0)
    });

  newSlice.append('path')
    .attr('class', 'hidden-arc')
    .attr('id', (_, i) => `hiddenArc${i}`)
    .attr('d', middleArcLine);

  const text = newSlice.append('text')
    .attr('display', d => textFits(d) ? null : 'none');

  // Add white contour

  text.append('textPath')
    .attr('startOffset', '50%')
    .attr('xlink:href', (_, i) => `#hiddenArc${i}`)
    .text(d => d.data.name);

  function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
    // Reset to top-level if no data point specified

    const transition = svg.transition()
      .duration(750)
      .tween('scale', () => {
        const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0, 1]);
        return t => { x.domain(xd(t)); y.domain(yd(t)); };
      });

    transition.selectAll('path.main-arc')
      .attrTween('d', d => () => arc(d));

    transition.selectAll('path.hidden-arc')
      .attrTween('d', d => () => middleArcLine(d));

    transition.selectAll('text')
      .attrTween('display', d => () => textFits(d) ? null : 'none');

    moveStackToFront(d);

    //

    function moveStackToFront(elD) {
      svg.selectAll('.slice').filter(d => d === elD)
        .each(function (d) {
          this.parentNode.appendChild(this);
          if (d.parent) { moveStackToFront(d.parent); }
        })
    }
  }

  //**************************
  // Construct an arc generator.

  /****************** */
}

// ____________________________________________________________________________
//
// ARRAY -> SUNBURST JSON (HELPER FUNCTIONS)
// ____________________________________________________________________________

function createSunburstJSON(birdList, rootName, propertyOrder,
  datamap = birdMap) {
  const children = recurSunburstJSON(birdList, propertyOrder, datamap);
  const sunburstData = { "name": rootName, "children": children }
  return sunburstData;
}

function recurSunburstJSON(keyArr, propertyOrder, datamap = birdMap) {
  const children = [];
  const newPropertyOrder = JSON.parse(JSON.stringify(propertyOrder));
  const property = newPropertyOrder[0];
  newPropertyOrder.shift();
  const propertyMap = createMapForSunburst(keyArr, property, datamap);
  for (const [prop, propBirdList] of Object.entries(propertyMap)) {
    let subChildren = [];

    // If leaf nodes
    if (newPropertyOrder.length === 0) {
      for (bird of propBirdList) {
        subChildren.push({ "name": bird, "size": 1 })
      }
    } else {
      subChildren = recurSunburstJSON(propBirdList, newPropertyOrder, datamap);
    }

    children.push({ "name": prop, "children": subChildren });
  }
  return children;
}

// Creates {value : [key(s)]} map
function createMapForSunburst(keyArr, valueName,
  datamap = birdMap) {
  let map = {};
  for (key of keyArr) {
    const value = datamap.get(key)[valueName];
    if (!map[value]) {
      map[value] = [];
    }
    map[value].push(key);
  }
  return map;
}

// ____________________________________________________________________________
//
// GEOMAP
// ____________________________________________________________________________

function geomap(
  divID = "geomapDiv",
  width = 900,
  height = 550,
  geoJSON = geoJSONfile,
) {

  // var color = d3.scaleOrdinal(d3.schemeCategory20);
  var color = d3.scaleThreshold()
    .domain([1, 500, 1000, 2000, 2500, 3000, 3500, 4000])
    .range(d3.schemeOrRd[9]);

  // var graticule = d3.geoGraticule();
  var svg = d3.select(`#${divID}`).append("svg").raise()
    .attr("viewBox", [
      0,
      0,
      width,
      height
    ])
    .attr("id", "geomap")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(20, 0)")
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-size", 12)
    .attr("text-anchor", "middle");

  // var g = svg.append("g");

  // https://bl.ocks.org/mbostock/3710082
  var projection = d3.geoKavrayskiy7()
    .scale(170)
    .translate([width / 2.1, height / 1.6])
    .precision(.1)
    .rotate([-11, 0]);

  // Map
  var path = d3.geoPath().projection(projection);

  // ?
  svg.append("defs").append("path")
    .datum({ type: "Sphere" })
    .attr("id", "sphere")
    .attr("d", path);

  // Outline
  // svg.append("use")
  //   .attr("class", "stroke")
  //   .attr("xlink:href", "#sphere");

  // Grid
  // svg.append("path")
  //   .datum(graticule)
  //   .attr("class", "graticule")
  //   .attr("d", path);

  mapLegend(svg, color);

  d3.json(geoJSON).then(function (world) {
    var continents = topojson.feature(world, world.objects.continent).features;

    // Tooltip
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)

    // Drawing continents
    svg.selectAll(".continent")
      .data(continents)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("title", function (d, i) { return d.properties.continent; })
      .style("fill", function (d, i) { return color(d.properties.number); })
      .on("click", function (d, i) {
        birdList = locationToBird.get(d.properties.continent);
        rootName = continentToName[d.properties.continent];
        tooltip.style("opacity", 0)
        handleToSunburst(birdList, rootName);
      })
      //Tooltip
      .on("mousemove", function (d) {
        tooltip.style("opacity", 1)
          .html("Continent: " + continentToName[d.properties.continent] +
            "<br>Spieces: " + d.properties.number)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px")
      })
      .on("mouseout", function (d) {
        tooltip.style("opacity", 0)
      });

    // Locations of centers of continents
    var centroids = continents.map(function (d) {
      return projection(d3.geoCentroid(d))
    });

    // Writing continent names
    svg.selectAll(".name")
      .data(centroids)
      .enter()
      .append("text")
      .attr("x", function (d) { return d[0]; })
      .attr("y", function (d) { return d[1]; })
      .style("fill", "black")
      .attr("text-anchor", "middle")
      .text(function (d, i) {
        return continentToName[continents[i].properties.continent];
      });
  })
}

function mapLegend(mapSVG, color) {
  var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);

  var g = mapSVG.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

  g.selectAll("rect")
    .data(color.range().map(function (d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function (d) { return x(d[0]); })
    .attr("width", function (d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function (d) { return color(d[0]); });

  g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Number of Species");

  g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickValues(color.domain()))
    .attr("transform", "translate(-150,40)")
    .select(".domain")
    .remove();
}
