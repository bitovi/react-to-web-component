
var stealTools = require("steal-tools");

var globalJS = require("steal-tools/lib/build/helpers/global").js;
var baseNormalize = globalJS.normalize();

stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm",
		main: "react-to-can-webcomponent",
	},
	outputs: {
		"global core": {
			modules: ["react-to-can-webcomponent"],
			format: "global",
			dest: __dirname + "/dist/react-to-can-webcomponent.js",
			removeDevelopmentCode: false,
			useNormalizedDependencies: true,
			exports: {
				"react-to-can-webcomponent": "reactToCanWebComponent"
			},
			normalize: function(depName, depLoad, curName, curLoad, loader){
				return baseNormalize.call(this, depName, depLoad, curName, curLoad, loader, true);
			},
		},
		"+bundled-es core": {
			modules: ["react-to-can-webcomponent"],
			addProcessShim: true,
			dest: __dirname + "/dist/react-to-can-webcomponent.mjs",
			removeDevelopmentCode: false
		},
		"+bundled-es core minified": {
			modules: ["react-to-can-webcomponent"],
			addProcessShim: true,
			minify: true,
			dest: __dirname + "/dist/react-to-can-webcomponent.min.mjs"
		}
	}
}).catch(function(e){

	setTimeout(function(){
		throw e;
	},1);

});
