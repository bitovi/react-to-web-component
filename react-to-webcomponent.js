var reactComponentSymbol = Symbol.for("r2wc.reactComponent");
var renderSymbol = Symbol.for("r2wc.reactRender");

var define = {
	// Creates a getter/setter that re-renders everytime a property is set.
	expando: function(receiver, key, value) {
		Object.defineProperty(receiver, key, {
			enumerable: true,
			get: function() {
				return value;
			},
			set: function(newValue) {
				value = newValue;
				this[renderSymbol]();
				return true;
			}
		});
		receiver[renderSymbol]();
	}
}

export default function(ReactComponent, React, ReactDOM) {

	// Create the web component "class"
	var WebComponent = function() {
		var self = Reflect.construct(HTMLElement, arguments, this.constructor);
		return self;
	};


	// Make the class extend HTMLElement
	var targetPrototype = Object.create(HTMLElement.prototype);
	targetPrototype.constructor = WebComponent;

	// But have that prototype be wrapped in a proxy.
	var proxyPrototype = new Proxy(targetPrototype, {
		has: function (target, key) {
			return key in ReactComponent.propTypes;
		},

		// when any undefined property is set, create a getter/setter that re-renders
		set: function(target, key, value, receiver) {
			if (typeof key === "symbol" || key === "_reactRootContainer" || key in target) {
				return Reflect.set(target, key, value, receiver);
			} else {
				define.expando(receiver, key, value)
			}
			return true;
		}
	});
	WebComponent.prototype = proxyPrototype;

	// Setup lifecycle methods
	targetPrototype.connectedCallback = function() {
		this[renderSymbol]();
	};
	targetPrototype[renderSymbol] = function() {
		if (this.isConnected) {
			var data = {};
			Object.keys(this).forEach(function(key) {
				if (key !== "_reactRootContainer") {
					data[key] = this[key];
				}
			}, this);
			this[reactComponentSymbol] = ReactDOM.render(React.createElement(ReactComponent, data), this)
		}
	};

	// Handle attributes changing
	if (ReactComponent.propTypes) {
		WebComponent.observedAttributes = Object.keys(ReactComponent.propTypes);
		targetPrototype.attributeChangedCallback = function(name, oldValue, newValue) {
			// TODO: handle type conversion
			this[name] = newValue;
		};

		var setAttribute = targetPrototype.setAttribute;
		targetPrototype.setAttribute = function (name, val) {
			if (typeof val === "string") {
				setAttribute.apply(this, arguments);
			} else {
				targetPrototype.attributeChangedCallback.call(this, name, undefined, val);
			}
		};
	}

	return WebComponent;
}
