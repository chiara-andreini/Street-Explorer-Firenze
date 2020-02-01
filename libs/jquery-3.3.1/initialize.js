jQuery(document).ready(function(){
	console.log("initialize plugin");
	
	$('ul').slider({
		speed : 500,
		pause : 4000,
		transition: "slide"
	});
});