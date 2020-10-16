var stealTools = require("steal-tools");

var globalJS = require("steal-tools/lib/build/helpers/global").js;
var baseNormalize = globalJS.normalize();

stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm",
		main: "react-to-webcomponent",
	},
	outputs: {
		"global core": {
			modules: ["react-to-webcomponent"],
			format: "global",
			dest: __dirname + "/dist/react-to-webcomponent.js",
			removeDevelopmentCode: false,
			useNormalizedDependencies: true,
			exports: {
				"react-to-webcomponent": "reactToWebComponent"
			},
			normalize: function(depName, depLoad, curName, curLoad, loader){
				return baseNormalize.call(this, depName, depLoad, curName, curLoad, loader, true);
			},
		}
	}
}).catch(function(e){

	setTimeout(function(){
		throw e;
	},1);

});
