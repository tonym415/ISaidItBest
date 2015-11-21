/**
 *  The first JS file to be loaded. Takes care of setting up all of the
 *  required paths
 */

// configure RequireJS
requirejs.config({
	baseURL: "assets/js",
	waitSeconds: 15,
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
		additional_methods: 'lib/additional-methods',
		// plugins
		livequery: 'lib/jquery.livequery',
		flipclock: 'lib/flipclock',
		cookie: 'lib/jquery-cookie',
		steps: 'lib/jquery.steps',
		blockUI: 'lib/jquery.blockUI',
		avatar: 'lib/avatar',
		tooltipster: 'lib/jquery.tooltipster',
		upload: 'lib/jquery.fileupload',
		bootstrap : [
			// '//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min',
			'lib/bootstrap'
		],
		fileInput : 'lib/fileinput.min',
		jqGrid: [
			// '//cdnjs.cloudflare.com/ajax/libs/jqgrid/4.6.0/js/i18n/grid.locale-en',
			'lib/grid.locale-en'
			],
		jqGridSrc: [//'//cdnjs.cloudflare.com/ajax/libs/jqgrid/4.6.0/js/jquery.jqGrid.src',
			'lib/jquery.jqgrid.src'],
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
		jqGridSrc: {
			exports: 'jqGridSrc',
			deps: ['jquery', 'jqueryUI']
		},
		jqGrid: {
			deps: ['jqueryUI', 'jqGridSrc']
		},
		tooltipster: {
			deps: ['jquery']
		},
		qtip: {
			deps: ['jquery']
		},
		upload: {
			deps: ['jquery', 'jqueryUI']
		},
		bootstrap: {
			deps: ['jquery']
		}
		// additional_methods: {
		// 	deps:['validate']
		// }
	}
});
