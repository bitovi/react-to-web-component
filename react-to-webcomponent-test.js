import QUnit from "steal-qunit";
import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import PreactCompat from "preact-compat";
import stache from "can-stache";
import stacheBindings from "can-stache-bindings";


stache.addBindings(stacheBindings);

import reactToWebComponent from "./react-to-webcomponent";

QUnit.module("react-to-webcomponent");


QUnit.test("basics with react", function(assert) {
	class Welcome extends React.Component {
		render() {
			return <h1>Hello, {
				this.props.name
			}< /h1>;
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

});

QUnit.test("works with attributes set with propTypes", function(assert) {
	class Greeting extends React.Component {
		render() {
			return <h1 >Hello, {
				this.props.name
			}< /h1>;
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
		console.error = oldError;
	}
	fixture.appendChild(myGreeting);



	fixture.innerHTML = "<my-greeting name='Christopher'></my-greeting>";

	assert.equal(fixture.firstElementChild.innerHTML, "<h1>Hello, Christopher</h1>");



});

QUnit.test("works with no propTypes", function(assert) {
	class Greeting extends React.Component {
		render() {
			return <h1>Hello, unnamed user</h1>;
		}
	}

	var MyGreeting = reactToWebComponent(Greeting, React, ReactDOM)

	customElements.define("my-plain-greeting", MyGreeting);

	var fixture = document.getElementById("qunit-fixture");

	var myGreeting = new MyGreeting();

	fixture.appendChild(myGreeting);

	fixture.innerHTML = "<my-plain-greeting></my-plain-greeting>";

	assert.equal(fixture.firstElementChild.innerHTML, "<h1>Hello, unnamed user</h1>");

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
})

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
