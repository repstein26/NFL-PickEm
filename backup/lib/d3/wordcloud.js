
var container = "svg";

var w = 400;
var h = 400;



var wordSize;
var layout;

function generate() {
	//wordSize = d3.select("#fontSize").property("value");
	wordSize = 12;
	var str = d3.select("#input").property("value");



	var list = str.split(/[\s.,]+/);

	result = { };
	for(i = 0; i < list.length; ++i) {
		if(!result[list[i]])
			result[list[i]] = 0;
		++result[list[i]];
	}

	var newList = _.uniq(list);



	var frequency_list = [];
	var len = newList.length;
	for (var i = 0; i < len; i++) {

		var temp = newList[i];
		frequency_list.push({
			text : temp,
			freq : result[newList[i]],
			time : 0 
		});
 
	}
	frequency_list.sort(function(a,b) { return parseFloat(b.freq) - parseFloat(a.freq) } );  
 
 
	for(var t = 0 ; t < len ; t++)
	{
	var addTime = (100 * t) +500;
	frequency_list[t].time=addTime;
	}


		for(i in frequency_list){
			if(frequency_list[i].freq*wordSize > 160)	
				wordSize = 3;
		}
		
		
var sizeScale = d3.scale.linear()
                       .domain([0, d3.max(frequency_list, function(d) { return d.freq} )])
                                        .range([10, 95]); // 95 because 100 was causing stuff to be missing

	
		layout = d3.layout.cloud().size([w, h])
        .words(frequency_list)
        .padding(5)
	    .rotate(function() { return ~~(Math.random() * 2) * 90; })
	    .font("Impact")
	    .fontSize(function(d) { return sizeScale(d.freq); })
		  .on("end",draw)
		  .start();
    }
	
	function deepCopy(oldValue) { 
  var newValue
  strValue = JSON.stringify(oldValue)
  return newValue = JSON.parse(strValue)
}
	

	
function draw(words) {
	var fill = d3.scale.category20();

		d3.select(container).remove();

        //d3.select("#wordclouddiv").append(container)
		d3.selectAll('.wordcloud').append(container)
        .attr("width", "100%")
        .attr("height",  "100%") 
		
	     	.append("g")
        .attr("transform", "translate(" + [w/2, h/2] + ")")
      	.selectAll("text")
        .data(deepCopy(words))
      	.enter().append("text")
		  
		.transition()
		.duration(function(d) { return d.time}  )
		.attr('opacity', 1)
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
          .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
		.attr("transform", function(d) {
          return "rotate(" + d.rotate + ")";
        })
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });

}
	

               