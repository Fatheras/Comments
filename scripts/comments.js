var getComments = () => {
  debugger;
  $.getJSON( "/getComments", function( json ) {
    debugger;
    console.log( "JSON Data: " + json);
  console.log( "JSON Data: " + json.comments[ 3 ].name );
  return json.comments;
 });
}

var comments = getComments();//our comments
