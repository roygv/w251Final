// Creating the autocomplete

$(function(){
  
  function node_structure(d) {
  d.id = +d.id;
  d.value = d.name;
  return d;
  }
  
  d3.csv("data/tree_structure.csv",node_structure,function(error, data){

         $('#search').autocomplete({
                                   lookup: data,
                                   autoSelectFirst: true,
                                   onSelect: function (suggestion) {
                                   var found = suggestion.id;
                                   console.log("search"+found);
                                   updateNode(found);
                                   }
                                   });
         
         });
  
});

// Catches when the search is cleared

$('input[type=search]').on('search', function () {
                           updateNode(-1);
                           });


// Initialization of node number
var node = -1;
//Roy:   document.getElementById('node').innerHTML = node;


// Aggregating all the things which need to happen when the current node is updated

//Roy: can't initialize variables in JS.  function updateNode(node, fromTree = false){
function updateNode(node, fromTree){

    // Updating the name in the search bar
    function node_structure(d) {
        d.id = +d.id;
        d.name = d.name;
        return d;
    }
    d3.csv("data/tree_structure.csv",node_structure,function(error, data){
           var name = "";
           var type = "";
           data.forEach(function(d){
                        if (d.id == node){name = d.name;type = d.type;};
                        });
           $('#search').attr("value",name);
           $('input[name=search]').val(name);
           
           //Updating top left
           //sparkLine.init(name); uncomment and comment the 2 lines below,
           //once the graphs in the top left have been fixed
           txt = d3.select("#summaryMetrics");
           txt.text("Summary Metrics: "+name);
           
           // Updating table
           AgITable.init(type);
           
           });
    
    // Updating the summary
    AgITree.summary(node);
    
    // Updating the tree
    if (!fromTree){AgITree.init(node);}

}
