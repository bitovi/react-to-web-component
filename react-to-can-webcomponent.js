// TODO if ylem hooks branch is ever released, import use-observer from ylem instead.
import useObserver from "./lib/use-observer";
var reactComponentSymbol = Symbol.for("r2wc.reactComponent");
var renderSymbol = Symbol.for("r2wc.reactRender");
var shouldRenderSymbol = Symbol.for("r2wc.shouldRender");

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
	var renderAddedProperties = {isConnected: "isConnected" in HTMLElement.prototype};
	var rendering = false;
	// Create the web component "class"
	var WebComponent = function() {
		var self = Reflect.construct(HTMLElement, arguments, this.constructor);
		return self;
	};


	// Make the class extend HTMLElement
	var targetPrototype = Object.create(HTMLElement.prototype);
	targetPrototype.constructor = WebComponent;

	var ObservedComponent = function(props) {
		useObserver(React);
		return React.createElement(ReactComponent, props);
	};

	// But have that prototype be wrapped in a proxy.
	var proxyPrototype = new Proxy(targetPrototype, {
		has: function (target, key) {
			return key in ReactComponent.propTypes ||
				key in targetPrototype;
		},

		// when any undefined property is set, create a getter/setter that re-renders
		set: function(target, key, value, receiver) {
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
		// Once connected, it will keep updating the innerHTML.
		// We could add a render method to allow this as well.
		this[shouldRenderSymbol] = true;
		this[renderSymbol]();
	};
	targetPrototype.disconnectedCallback = function() {
		this[shouldRenderSymbol] = false;
	};

	targetPrototype[renderSymbol] = function() {
		if (this[shouldRenderSymbol] === true) {
			var data = {};
			Object.keys(this).forEach(function(key) {
				if (renderAddedProperties[key] !== false) {
					data[key] = this[key];
				}
			}, this);
			rendering = true;
			this[reactComponentSymbol] = ReactDOM.render(
				React.createElement(ObservedComponent, data),
				this
			);
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
