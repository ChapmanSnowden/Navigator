var w = 1000;
var h = 490;

$.ajaxSetup({
  timeout: '6000'
});

function getCountriesAndNids() {
    url = '/terms_by_parent/';
    result = {};
    $.ajax({
        async: false,
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(o){
            result = o;
         },
         error: function (xhr, ajaxOptions, thrownError){
             console.log(thrownError);
         }
    });
    return result;
};



function getStreamGraph(x) {

  var n = x.length, // number of layers
      m = x[0].length, // number of samples per layer
      color = d3.interpolateRgb("#C8F099", "#31A635");

  var mx = m - 1,
      my = d3.max(data0, function(d) {
        return d3.max(d, function(d) {
          return d.y0 + d.y;
        });
      });

  var area = d3.svg.area()
    .x(function(d) { return d.x * w / mx; })
    .y0(function(d) { return h - d.y0 * h / my; })
    .y1(function(d) { return h - (d.y + d.y0) * h / my; }); 

  var vis = d3.select("#chart-goes-here")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  vis.selectAll("path")
    .data(data0)
    .enter().append("path")
    .style("fill", function() { return color(Math.random()); })
    .attr("d", area);
 
  showChart();
  hideLoadingGif();

}



function transition(x) {

  h = 490;
  
  color = d3.interpolateRgb("#C8F099", "#31A635");

  mx = m - 1,
  my = d3.max(data1, function(d) {
    return d3.max(d, function(d) {
      return d.y0 + d.y;
      });
    });

  var area = d3.svg.area()
    .x(function(d) { return d.x * w / mx; })
    .y0(function(d) {
      if (my >= 6) 
      return h - d.y0 * h / my;
      else
      my = 5;
      h = 310;
      return h - d.y0 * h / my;  
    })
    .y1(function(d) { return h - (d.y + d.y0) * h / my; });

  d3.select("svg").selectAll("path")
    .data(x)
    .enter().insert("path")
    .style("fill", function() { return color(Math.random()); })
    .attr("d", area);

  d3.selectAll("path")
    .data(function() {
    var d = data1; 
    data1 = data0;
    return data0 = d;
    })
    .transition()
    .duration(2500)
    .attr("d", area);
    hideLoadingGif();
    showChartTitle();

};


function streamGraphTheData(data_array) {
  var x = new Array(data_array.length);
  for (var i = 0; i < data_array.length; i++) {
    x[i] = new Array(data_array[0].length);
    for (var j = 0; j < data_array[0].length; j++) {
      x[i][j] = '';
    }
  }

$.map(data_array, function(arr, index) {
  $.map(arr, function(stuff, year){
    x[index][year] = {x : year, y : stuff};
  });
  return x;
});
return x;
}




function hideChartTitle() {
$('#chart #chart-title').fadeOut("slow");
};

function hideLoadingGif() {
$('.side-things img').fadeOut("slow");
};

function hideReset() {
$('#reset-btn').fadeOut("slow");
};



function showChart() {
$('#chart').fadeIn("slow");
};

function showChartTitle() {
$('#chart #chart-title').fadeIn("slow");
};

function showLoadingGif() {
$('.side-things img').fadeIn("slow");
};

function showReset() {
$('#reset-btn').fadeIn("slow");
};





jQuery(document).ready(function($) {
  
  alldatasetssurl = '/all_datasets_by_year/';
  all_datasets_array = {};
  all_types_array = {};
  
  $.ajax({
    async: true,
    type: 'GET',
    url: alldatasetssurl,
    dataType: 'json',
    success: function(all_datasets_and_labels){
      all_datasets_array = all_datasets_and_labels["all_datasets"];
      all_types_array = all_datasets_and_labels["all_labels"]
      x = streamGraphTheData(all_datasets_array);
      data0 = d3.layout.stack().offset("silhouette")(x);        
      getStreamGraph(x);
    },
    error: function (xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });
  
  countries = $.map(getCountriesAndNids(), function(val, index) {
    return val[0];
  })
  
  $('#countrybox').typeahead({
    source: countries,
    items: 5,
  });

  $("#countryform").submit(function() {

    showLoadingGif();
    hideChartTitle();	

    $.map(getCountriesAndNids(), function(val, index) {

      if (val[0] == $("input:first").val()) {
        countrytitle = val[0];
        countrynid = val[1];	
        url = '/streamgraph/' + countrynid + '/'; 

        $.ajax({
          async: true,
          type: 'GET',
          url: url,
          context: 'graphdata',
          dataType: 'json',
          success: function(datasets_and_labels){        
            datasets_array = datasets_and_labels["datasets"];
            labels_array = datasets_and_labels["labels"];
            x = streamGraphTheData(datasets_array);
	    n = datasets_array.length, // number of layers
            m = datasets_array[0].length, // number of samples per layer
            $("#chart-title h1").text(countrytitle); 
            data1 = d3.layout.stack().offset("silhouette")(x);
	    d3.selectAll("path").data(x).exit().remove();
	    transition(data1);
            showReset();
          },
          error: function (xhr, timeout, thrownError){
            console.log(thrownError);
	    hideLoadingGif(); 
           }
        });

      }
    });
    return false;
  });

  $("#reset-button").submit(function() {

    hideChartTitle();
    x = streamGraphTheData(all_datasets_array);
    n = all_datasets_array.length, // number of layers
    m = all_datasets_array[0].length, // number of samples per layer
    $("#chart-title h1").text("All Datasets"); 
    data1 = d3.layout.stack().offset("silhouette")(x); 
    transition(x);
    hideReset();
    return false; 

  });

});


//d3.selectAll("path").on("mouseout", function() {
//this.style.stroke="none"
//});

//d3.selectAll("path").on("mouseover", function() {
//this.style.stroke="rgb(113, 224, 252)";
//this.style.strokeWidth="3px";
/*});*/
