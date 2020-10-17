

var data = [{
          "name": "R",
          "value": 1,
  },
      {
          "name": "Javascript",
          "value": 0.7,
  },
      {
          "name": "Python",
          "value": 0.5,
  },
      {
          "name": "SCSS",
          "value": 0.4,
  },
      {
          "name": "HTML",
          "value": 0.35,
  },
      {
          "name": "CSS",
          "value": 0.2,
  },
      {
          "name": "Dockerfile",
          "value": 0.05,
  }];

//sor bars based on value
data = data.sort(function (a,b) {
	return d3.ascending()
})


const margin = { top: 50, right: 100, bottom: 50, left: 150 };

// the exact dimensions of 400 x 400
// will only be used for the initial render
// but the width to height proportion 
// will be preserved as the chart is resized
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select('#chart')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .call(responsivefy) //call fuild svg function
  .append('g')
    .attr('transform',`translate(${margin.left},${margin.top})`);

//x scaling
const xScale = d3.scaleLinear()
  .domain([0, d3.max(data, d=>d.value)])
  .range([0, width]);

//y scaling
const yScale = d3.scaleBand()
  .domain(d3.range(data.length))
  .rangeRound([0, height])
  .padding(0.4);

// y axis and labels
const yAxis = g => g
    .attr('transform', `translate(-15,0)`)
    .call(d3.axisLeft(yScale).tickFormat(i => data[i].name).tickSize(0)) //label replace with data.name
    .call(g=>g.select('.domain').remove())//axis line remove
    .attr('color', 'lightgray')
    .attr('font-size', 16);

// data format
const format = d3.format('.0%');

// make rectangle
svg.selectAll('rect')
  .data(data)
  .enter()
    .append('rect')
    .attr('x', d=>xScale(d))
    .attr('y', (d,i)=>yScale(i))
    .attr('height', yScale.bandwidth())
    .attr('width', 0)
    .style('fill', 'rgb(255,219,219)')
    .attr('rx', 8)
    .attr('id','rectid');

//init controller
const controller = new ScrollMagic.Controller();
const sectionOneScene = new ScrollMagic.Scene({
  triggerElement: '#rectid',
  reverse: false,
  offset: 100})
  .setClassToggle('#rectid', 'rectclass')
  .on('enter', (e)=>{
    svg.selectAll('#rectid')
      .transition()
        .duration(700)
        .attr('width', d=>xScale(d.value)-xScale(0));
  })
  .triggerHook(1.8)
  .addTo(controller);

// make y label
svg.append('g')
  .call(yAxis)

// add text at right side
svg.append("g")
      .attr("fill", "lightgray")
      .attr("text-anchor", "start")
      .attr("font-family", "sans-serif")
      .attr("font-size", 14)
    .selectAll("text")
    .data(data)
    .join("text")
      .attr("x",0)
      .attr("y", (d, i) => yScale(i) + yScale.bandwidth() / 2)
      .attr('opacity', 0)
      .attr('id', 'textid');

const sectionTwoScene = new ScrollMagic.Scene({
  triggerElement: '#textid',
  reverse: false,
  offset: 100})
  .setClassToggle('#textid', 'textclass')
  .on('enter', (e)=>{
    svg.selectAll('#textid')
      .transition()
        .duration(700)
        .attr("x", d => xScale(d.value))
        .attr("dy", "0.35em")
        .attr("dx", 10)
        .text(d => format(d.value))
        .attr('opacity',1);
  })
  .triggerHook(1.8)
  .addTo(controller);


//fluid svg function
function responsivefy(svg) {
  // container will be the DOM element the svg is appended to
  // we then measure the container and find its aspect ratio
  const container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style('width'), 10),
      height = parseInt(svg.style('height'), 10),
      aspect = width / height;

  // add viewBox attribute and set its value to the initial size
  // add preserveAspectRatio attribute to specify how to scale
  // and call resize so that svg resizes on inital page load
  svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMid')
      .call(resize);

  // add a listener so the chart will be resized when the window resizes
  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on('resize.' + container.attr('id'), resize);

  // this is the code that actually resizes the chart
  // and will be called on load and in response to window resize
  // gets the width of the container and proportionally resizes the svg to fit
  function resize() {
      const targetWidth = parseInt(container.style('width'));
      svg.attr('width', targetWidth);
      svg.attr('height', Math.round(targetWidth / aspect));
  }
}
