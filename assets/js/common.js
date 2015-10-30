/**
 *  The first JS file to be loaded. Takes care of setting up all of the
 *  required paths
 */

// configure RequireJS
requirejs.config({
	baseURL: "assets/js",
	paths: {
		// global application object
		app: 'app',
		// app libraries
		adminLib: 'lib/pagesLib/adminLib',
		// The libraries to be used
		jquery: [
			'//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery',
			// if the CDN location fails, load from this location
			'lib/jquery-1.11.3'
		],
		jqueryUI: [
			'//ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui',
			// '//code.jquery.com/ui/1.11.4/jquery-ui.min',
			// if the CDN location fails, load from this location
			'lib/jquery-ui'
		],
		validate: [
			'//cdn.jsdelivr.net/jquery.validation/1.14.0/jquery.validate',
			// if the CDN location fails, load from this location
			'lib/jquery.validate'
		],
		// plugins
		livequery: 'lib/jquery.livequery',
		flipclock: 'lib/flipclock',
		cookie: 'lib/jquery-cookie',
		steps: 'lib/jquery.steps',
		// jqGrid: 'lib/jquery.jqgrid.min',
		// jqGrid: '//cdnjs.cloudflare.com/ajax/libs/jqgrid/4.6.0/js/jquery.jqGrid.min',
		blockUI: 'lib/jquery.blockUI',
		avatar: 'lib/avatar',
		// locale for grid
		jqGrid: ['//cdnjs.cloudflare.com/ajax/libs/jqgrid/4.6.0/js/i18n/grid.locale-en',
			'lib/grid.locale-en'],
		gridCss: '//cdnjs.cloudflare.com/ajax/libs/jqgrid/4.6.0/css/ui.jqgrid.css'

	},
	shim: {
		jquery: {
			exports: '$'
		},
		jqueryUI: {
			exports: '$',
			deps: ['jquery']
		},
		jqGrid: {
			deps: ['//ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.js',
				 '//cdnjs.cloudflare.com/ajax/libs/jqgrid/4.6.0/js/jquery.jqGrid.src.js']
		}

	}
});
