import QUnit from "steal-qunit";
import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import PreactCompat from "preact/compat";
import stache from "can-stache";
import stacheBindings from "can-stache-bindings";
import ObservableObject from "can-observable-object";
import ObservableArray from "can-observable-array";

import reactToWebComponent from "./react-to-can-webcomponent";
stache.addBindings(stacheBindings);


QUnit.module("react-to-can-webcomponent");


QUnit.test("basics with react", function(assert) {
	var mountCount = 0;
	var unmountCount = 0;

	class Welcome extends React.Component {
		componentDidMount() {
			mountCount += 1;
		}
		componentWillUnmount() {
			unmountCount += 1;
		}
		render() {
			return <h1>Hello, {
				this.props.name
			}</h1>;
		}
	}

	class MyWelcome extends reactToWebComponent(Welcome, React, ReactDOM) {}

	customElements.define("my-welcome", MyWelcome);

	var fixture = document.getElementById("qunit-fixture");

	var myWelcome = new MyWelcome();
	fixture.appendChild(myWelcome);

	assert.equal(myWelcome.nodeName, "MY-WELCOME", "able to read nodeName");

	assert.equal(myWelcome.childNodes.length, 1, "able to render something")

	assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, ", "renders the right thing");

	myWelcome.name = "Justin";

	assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, Justin", "can update");
	assert.equal(mountCount, 1, "component has only been mounted once");
	assert.equal(unmountCount, 0, "component has not been unmounted");

});

QUnit.test("works with attributes set with propTypes", function(assert) {
	class Greeting extends React.Component {
		render() {
			return <h1 >Hello, {
				this.props.name
			}</h1>;
		}
	}
	Greeting.propTypes = {
		name: PropTypes.string.isRequired
	};

	var MyGreeting = reactToWebComponent(Greeting, React, ReactDOM)

	customElements.define("my-greeting", MyGreeting);

	var fixture = document.getElementById("qunit-fixture");

	var myGreeting = new MyGreeting();

	var oldError = console.error;
	console.error = function(message) {
		assert.ok(message.includes("required"), "got a warning with required");
		oldError = console.error;
	}
	fixture.appendChild(myGreeting);



	fixture.innerHTML = "<my-greeting name='Christopher'></my-greeting>";

	assert.equal(fixture.firstElementChild.innerHTML, "<h1>Hello, Christopher</h1>");



});

QUnit.test("basics with preact", function(assert){

	class Welcome extends React.Component {
		render() {
			return PreactCompat.createElement("h1",null,[
				"Hello, ",
				this.props.name
			]);
		}
	}

	class MyWelcome extends reactToWebComponent(Welcome, PreactCompat, PreactCompat) {}

	customElements.define("preact-welcome", MyWelcome);

	var fixture = document.getElementById("qunit-fixture");

	var myWelcome = new MyWelcome();
	fixture.appendChild(myWelcome);

	assert.equal(myWelcome.nodeName, "PREACT-WELCOME", "able to read nodeName");

	assert.equal(myWelcome.childNodes.length, 1, "able to render something")

	assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, ", "renders the right thing");

	myWelcome.name = "Justin";

	assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, Justin", "can update");
});

QUnit.test("works within can-stache and can-stache-bindings (propTypes are writable)", function(assert){
	class Welcome extends React.Component {
		render() {
			return <h1>Hello, {
				this.props.user.name
			}</h1>;
		}
	}
	Welcome.propTypes = {
		user: PropTypes.object
	};

	class MyWelcome extends reactToWebComponent(Welcome, React, ReactDOM) {}

	customElements.define("can-welcome", MyWelcome);

	var view = stache("<can-welcome user:from='this.person'/>");
	var frag = view({
		person: {name: "Bohdi"}
	});


	var fixture = document.getElementById("qunit-fixture");
	var myWelcome = frag.firstElementChild;
	fixture.appendChild(frag);

	assert.equal(myWelcome.nodeName, "CAN-WELCOME", "able to read nodeName");

	assert.equal(myWelcome.childNodes.length, 1, "able to render something")

	assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, Bohdi", "can update");
});


QUnit.test("works with nested properties of observable objects and arrays", function(assert) {
	class Welcome extends React.Component {
		render() {
			return <React.Fragment>
				<h1>
					Hello, { this.props.name.full }
				</h1>
				<h1>
					I see you like { this.props.hobbies.join(" and ")}
				</h1>
			</React.Fragment>;
		}
	}

	class MyWelcome extends reactToWebComponent(Welcome, React, ReactDOM) {}
	customElements.define("nested-props-welcome", MyWelcome);

	var fixture = document.getElementById("qunit-fixture");

	var myWelcome = new MyWelcome();
	myWelcome.name = new (class extends ObservableObject {
		get full() {
			return this.first + ' ' + this.last;
		}
	})({
		first: "Justin",
		last: "Meyer",
	});
	myWelcome.hobbies = new ObservableArray([
		"basketball",
		"javascript"
	]);
	fixture.appendChild(myWelcome);
	assert.deepEqual(myWelcome.name.get(), { first: "Justin", last: "Meyer" });

	assert.equal(myWelcome.nodeName, "NESTED-PROPS-WELCOME", "able to read nodeName");
	assert.equal(myWelcome.childNodes.length, 2, "able to render something")
	assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, Justin Meyer", "renders the right thing");
	assert.equal(myWelcome.childNodes[1].innerHTML, "I see you like basketball and javascript", "renders the right array");

	myWelcome.name.first = "Ramiya";
	// Note: myWelcome.hobbies[0] = "school" will not update the view as binding of list-likes
	//   listens for changes on the length.
	myWelcome.hobbies.splice(1, 1, "school");

	assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, Ramiya Meyer", "can update object properties");
	assert.equal(myWelcome.childNodes[1].innerHTML, "I see you like basketball and school", "can update array elements");
});

QUnit.test("subproperties update with can-stache and can-stache-bindings", function(assert){
	class Welcome extends React.Component {
		render() {
			return <h1>Hello, {
				this.props.user.name
			}</h1>;
		}
	}
	Welcome.propTypes = {
		user: PropTypes.object
	};

	class MyWelcome extends reactToWebComponent(Welcome, React, ReactDOM) {}

	customElements.define("can-welcome-ii", MyWelcome);

	var view = stache("<can-welcome-ii user:from='this.person'/>");
	var person = new ObservableObject({name: "Bohdi"});
	var frag = view({
		person
	});

	var fixture = document.getElementById("qunit-fixture");
	var myWelcome = frag.firstElementChild;
	fixture.appendChild(frag);

	assert.equal(myWelcome.nodeName, "CAN-WELCOME-II", "able to read nodeName");

	assert.equal(myWelcome.childNodes.length, 1, "able to render something")

	assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, Bohdi", "can update");

	person.name = "Cherif";
	assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, Cherif", "can update");	
});

QUnit.test("sibling subcomponents only update for their own changes", function(assert){
	class Welcome extends React.Component {
		render() {
			return <h1>Hello, {
				this.props.name.first
			}</h1>;
		}
	}
	class Farewell extends React.Component {
		render() {
			return <h1>Goodbye, Mr. {
				this.props.name.last
			}</h1>;
		}
	}

	class HelloGoodbye extends React.Component {
		render() {
			return <section>
				<Welcome name={this.props.name} />
				<Farewell name={this.props.name} />
			</section>
		}
	}

	class MyHelloGoodbye extends reactToWebComponent(HelloGoodbye, React, ReactDOM) {}
	customElements.define("can-hello-goodbye", MyHelloGoodbye);

	var myHelloGoodbye = new MyHelloGoodbye();
	myHelloGoodbye.name = new ObservableObject({
		first: "Justin",
		last: "Meyer",
	});

	var fixture = document.getElementById("qunit-fixture");
	fixture.appendChild(myHelloGoodbye);

	assert.equal(myHelloGoodbye.nodeName, "CAN-HELLO-GOODBYE", "able to read nodeName");
	assert.equal(myHelloGoodbye.childNodes.length, 1, "able to render something");

	assert.equal(myHelloGoodbye.firstElementChild.firstElementChild.innerHTML, "Hello, Justin", "can update");
	assert.equal(myHelloGoodbye.firstElementChild.lastElementChild.innerHTML, "Goodbye, Mr. Meyer", "can update");

	myHelloGoodbye.childNodes[0].firstElementChild.innerHTML = "Hello, Brad";
	myHelloGoodbye.name.last = "Momberger";

	assert.equal(myHelloGoodbye.firstElementChild.firstElementChild.innerHTML, "Hello, Brad", "doesn't rerender for no reason");
	assert.equal(myHelloGoodbye.firstElementChild.lastElementChild.innerHTML, "Goodbye, Mr. Momberger", "rerenders on change");
});

QUnit.test("sibling wrapped components only update with their own changes", function(assert){
	class Welcome extends React.Component {
		render() {
			return <h1>Hello, {
				this.props.name.first
			}</h1>;
		}
	}
	Welcome.propTypes = {
		name: PropTypes.object
	};
	class Farewell extends React.Component {
		render() {
			return <h1>Goodbye, Mr. {
				this.props.name.last
			}</h1>;
		}
	}
	Farewell.propTypes = {
		name: PropTypes.object
	};

	class MyWelcome extends reactToWebComponent(Welcome, React, ReactDOM) {}
	customElements.define("can-welcome-iii", MyWelcome);
	class MyFarewell extends reactToWebComponent(Farewell, React, ReactDOM) {}
	customElements.define("can-farewell", MyFarewell);

	var tmpl = stache(`
		<can-welcome-iii name:from="this" />
		<can-farewell name:from="this" />
	`)
	var vm = new ObservableObject({
		first: "Justin",
		last: "Meyer",
	});
	var frag = tmpl(vm);

	var fixture = document.getElementById("qunit-fixture");
	fixture.appendChild(frag);
	var myWelcome = fixture.firstElementChild;
	var myFarewell = fixture.lastElementChild;

	assert.equal(myWelcome.nodeName, "CAN-WELCOME-III", "able to read nodeName");
	assert.equal(myWelcome.childNodes.length, 1, "able to render something");
	assert.equal(myFarewell.nodeName, "CAN-FAREWELL", "able to read nodeName");
	assert.equal(myFarewell.childNodes.length, 1, "able to render something");

	assert.equal(myWelcome.firstElementChild.innerHTML, "Hello, Justin", "can update");
	assert.equal(myFarewell.firstElementChild.innerHTML, "Goodbye, Mr. Meyer", "can update");

	myWelcome.firstElementChild.innerHTML = "Hello, Brad";
	vm.last = "Momberger";

	assert.equal(myWelcome.firstElementChild.innerHTML, "Hello, Brad", "doesn't rerender for no reason");
	assert.equal(myFarewell.firstElementChild.innerHTML, "Goodbye, Mr. Momberger", "rerenders on change");
});
