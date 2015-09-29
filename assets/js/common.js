/**
 *  The first JS file to be loaded. Takes care of setting up all of the 
 *  required paths
 */

// configure RequireJS
requirejs.config({
	baseURL: "assets/js",
	paths: {
		// The libraries to be used
		jquery: [
			'//code.jquery.com/jquery-1.11.3.min',
			// if the CDN location fails, load from this location
			'lib/jquery-1.11.3'
		],
		jqueryUI: [
			'//code.jquery.com/ui/1.11.4/jquery-ui.min',
			// if the CDN location fails, load from this location
			'lib/jquery-ui'
		],
		validate: [
			'//ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate',
			// if the CDN location fails, load from this location
			'lib/jquery.validate'	
		],
		flipclock: 'lib/flipclock',
		app: 'app'
	}
})