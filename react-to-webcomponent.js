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
	var renderAddedProperties = {};
	var rendering = false;
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
			return key in ReactComponent.propTypes ||
				key in targetPrototype;
		},

		// when any undefined property is set, create a getter/setter that re-renders
		set: function(target, key, value, receiver) {
			console.log("set",key, rendering)
			if(rendering) {
				renderAddedProperties[key] = true;
			}

			if (typeof key === "symbol" || renderAddedProperties[key] || key in target) {
				return Reflect.set(target, key, value, receiver);
			} else {
				define.expando(receiver, key, value)
			}
			return true;
		},
		// makes sure the property looks writable
		getOwnPropertyDescriptor: function(target, key){
			var own = Reflect.getOwnPropertyDescriptor(target, key);
			if(own) {
				return own;
			}
			if(key in ReactComponent.propTypes) {
				return { configurable: true, enumerable: true, writable: true, value: undefined };
			}
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
				if (renderAddedProperties[key] !== false) {
					data[key] = this[key];
				}
			}, this);
			rendering = true;
			this[reactComponentSymbol] = ReactDOM.render(React.createElement(ReactComponent, data), this);
			rendering = false;
		}
	};

	// Handle attributes changing
	if (ReactComponent.propTypes) {
		WebComponent.observedAttributes = Object.keys(ReactComponent.propTypes);
		targetPrototype.attributeChangedCallback = function(name, oldValue, newValue) {
			// TODO: handle type conversion
			this[name] = newValue;
		};
	}

	return WebComponent;
}
