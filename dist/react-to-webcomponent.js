/*[process-shim]*/
(function(global, env) {
	// jshint ignore:line
	if (typeof process === "undefined") {
		global.process = {
			argv: [],
			cwd: function() {
				return "";
			},
			browser: true,
			env: {
				NODE_ENV: env || "development"
			},
			version: "",
			platform:
				global.navigator &&
				global.navigator.userAgent &&
				/Windows/.test(global.navigator.userAgent)
					? "win"
					: ""
		};
	}
})(
	typeof self == "object" && self.Object == Object
		? self
		: typeof process === "object" &&
		  Object.prototype.toString.call(process) === "[object process]"
			? global
			: window,
	"development"
);

/*[global-shim-start]*/
(function(exports, global, doEval) {
	// jshint ignore:line
	var origDefine = global.define;

	var get = function(name) {
		var parts = name.split("."),
			cur = global,
			i;
		for (i = 0; i < parts.length; i++) {
			if (!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val) {
		var parts = name.split("."),
			cur = global,
			i,
			part,
			next;
		for (i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if (!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod) {
		if (!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, default: true };
		for (var p in mod) {
			if (!esProps[p]) return false;
		}
		return true;
	};

	var hasCjsDependencies = function(deps) {
		return (
			deps[0] === "require" && deps[1] === "exports" && deps[2] === "module"
		);
	};

	var modules =
		(global.define && global.define.modules) ||
		(global._define && global._define.modules) ||
		{};
	var ourDefine = (global.define = function(moduleName, deps, callback) {
		var module;
		if (typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for (i = 0; i < deps.length; i++) {
			args.push(
				exports[deps[i]]
					? get(exports[deps[i]])
					: modules[deps[i]] || get(deps[i])
			);
		}
		// CJS has no dependencies but 3 callback arguments
		if (hasCjsDependencies(deps) || (!deps.length && callback.length)) {
			module = { exports: {} };
			args[0] = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args[1] = module.exports;
			args[2] = module;
		}
		// Babel uses the exports and module object.
		else if (!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if (deps[1] === "module") {
				args[1] = module;
			}
		} else if (!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if (globalExport && !get(globalExport)) {
			if (useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	});
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function() {
		// shim for @@global-helpers
		var noop = function() {};
		return {
			get: function() {
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load) {
				doEval(__load.source, global);
			}
		};
	});
})(
	{ "react-to-webcomponent": "reactToWebComponent" },
	typeof self == "object" && self.Object == Object
		? self
		: typeof process === "object" &&
		  Object.prototype.toString.call(process) === "[object process]"
			? global
			: window,
	function(__$source__, __$global__) {
		// jshint ignore:line
		eval("(function() { " + __$source__ + " \n }).call(__$global__);");
	}
);

/*react-to-webcomponent@1.5.0#react-to-webcomponent*/
define('react-to-webcomponent', ['exports'], function (exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.default = function (ReactComponent, React, ReactDOM) {
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var renderAddedProperties = { isConnected: 'isConnected' in HTMLElement.prototype };
        var rendering = false;
        var WebComponent = function WebComponent() {
            var self = Reflect.construct(HTMLElement, arguments, this.constructor);
            if (options.shadow) {
                self.attachShadow({ mode: 'open' });
            }
            return self;
        };
        var targetPrototype = Object.create(HTMLElement.prototype);
        targetPrototype.constructor = WebComponent;
        var proxyPrototype = new Proxy(targetPrototype, {
            has: function has(target, key) {
                return key in ReactComponent.propTypes || key in targetPrototype;
            },
            set: function set(target, key, value, receiver) {
                if (rendering) {
                    renderAddedProperties[key] = true;
                }
                if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'symbol' || renderAddedProperties[key] || key in target) {
                    return Reflect.set(target, key, value, receiver);
                } else {
                    define.expando(receiver, key, value);
                }
                return true;
            },
            getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, key) {
                var own = Reflect.getOwnPropertyDescriptor(target, key);
                if (own) {
                    return own;
                }
                if (key in ReactComponent.propTypes) {
                    return {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: undefined
                    };
                }
            }
        });
        WebComponent.prototype = proxyPrototype;
        targetPrototype.connectedCallback = function () {
            this[shouldRenderSymbol] = true;
            this[renderSymbol]();
        };
        targetPrototype[renderSymbol] = function () {
            if (this[shouldRenderSymbol] === true) {
                var data = {};
                Object.keys(this).forEach(function (key) {
                    if (renderAddedProperties[key] !== false) {
                        data[key] = this[key];
                    }
                }, this);
                rendering = true;
                var container = options.shadow ? this.shadowRoot : this;
                this[reactComponentSymbol] = ReactDOM.render(React.createElement(ReactComponent, data), container);
                rendering = false;
            }
        };
        if (ReactComponent.propTypes) {
            WebComponent.observedAttributes = Object.keys(ReactComponent.propTypes);
            targetPrototype.attributeChangedCallback = function (name, oldValue, newValue) {
                this[name] = newValue;
            };
        }
        return WebComponent;
    };
    var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj;
    };
    var reactComponentSymbol = Symbol.for('r2wc.reactComponent');
    var renderSymbol = Symbol.for('r2wc.reactRender');
    var shouldRenderSymbol = Symbol.for('r2wc.shouldRender');
    var define = {
        expando: function expando(receiver, key, value) {
            Object.defineProperty(receiver, key, {
                enumerable: true,
                get: function get() {
                    return value;
                },
                set: function set(newValue) {
                    value = newValue;
                    this[renderSymbol]();
                }
            });
            receiver[renderSymbol]();
        }
    };
});
/*[global-shim-end]*/
(function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
)(typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window);