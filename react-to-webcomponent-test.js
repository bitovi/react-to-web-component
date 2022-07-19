import QUnit from "steal-qunit";

import React from 'react';
import * as ReactDOM from 'react-dom/client';

import PropTypes from 'prop-types';

import stache from "can-stache";
import stacheBindings from "can-stache-bindings";


stache.addBindings(stacheBindings);

import reactToWebComponent from "react-to-webcomponent";

QUnit.module("react-to-webcomponent");


QUnit.test("basics with react", function (assert) {
	const done = assert.async();

	function Welcome({ name }) {
		return (
			<h1>Hello, {name}</h1>
		)
	}

	const MyWelcome = reactToWebComponent(Welcome, React, ReactDOM);
	customElements.define("my-welcome", MyWelcome);

	var fixture = document.getElementById("qunit-fixture");

	var myWelcome = new MyWelcome();
	fixture.appendChild(myWelcome);

	setTimeout(() => {
		assert.equal(myWelcome.nodeName, "MY-WELCOME", "able to read nodeName");

		assert.equal(myWelcome.childNodes.length, 1, "able to render something");

		assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, ", "renders the right thing");

		myWelcome.name = "Justin";

		setTimeout(() => {
			assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, Justin", "can update");
			done();
		}, 0);
	}, 0);
});

QUnit.test("works with attributes set with propTypes", function (assert) {
	const done = assert.async();

	function Greeting({ name }) {
		return (
			<h1>Hello, {name}</h1>
		);
	}

	Greeting.propTypes = {
		name: PropTypes.string.isRequired
	};

	const MyGreeting = reactToWebComponent(Greeting, React, ReactDOM)

	customElements.define("my-greeting", MyGreeting);

	var fixture = document.getElementById("qunit-fixture");

	var myGreeting = new MyGreeting();

	console.error = function (...messages) {
		assert.ok(
			messages.some(message => message.includes("required")),
			"got a warning with required"
		);
	}

	fixture.appendChild(myGreeting);
	fixture.innerHTML = "<my-greeting name='Christopher'></my-greeting>";

	setTimeout(() => {
		assert.equal(fixture.firstElementChild.innerHTML, "<h1>Hello, Christopher</h1>");
		done();
	}, 0);
});



QUnit.test("works within can-stache and can-stache-bindings (propTypes are writable)", function (assert) {
	const done = assert.async();

	function Welcome({ user }) {
		return (
			<h1>Hello, {user.name}</h1>
		)
	}
	
	Welcome.propTypes = {
		user: PropTypes.object
	};

	const MyWelcome = reactToWebComponent(Welcome, React, ReactDOM);

	customElements.define("can-welcome", MyWelcome);

	var view = stache("<can-welcome user:from='this.person'/>");
	var frag = view({
		person: { name: "Bohdi" }
	});

	var fixture = document.getElementById("qunit-fixture");
	var myWelcome = frag.firstElementChild;
	fixture.appendChild(frag);

	setTimeout(() => {
		assert.equal(myWelcome.nodeName, "CAN-WELCOME", "able to read nodeName");

		assert.equal(myWelcome.childNodes.length, 1, "able to render something")

		assert.equal(myWelcome.childNodes[0].innerHTML, "Hello, Bohdi", "can update");

		done();
	}, 0);
});


QUnit.test("works with shadow DOM `options.shadow === true`", function (assert) {
	const done = assert.async();

	function Welcome({ name }) {
		return (
			<h1>Hello, {name}</h1>
		)
	}

	Welcome.propTypes = {
		user: PropTypes.string
	};

	const MyWelcome = reactToWebComponent(Welcome, React, ReactDOM, { shadow: true });

	customElements.define("my-shadow-welcome", MyWelcome);

	var fixture = document.getElementById("qunit-fixture");

	var myWelcome = new MyWelcome();
	fixture.appendChild(myWelcome);

	setTimeout(() => {
		assert.true(myWelcome.shadowRoot !== undefined, "shadow DOM is attached");

		assert.equal(myWelcome.shadowRoot.children.length, 1, "able to render something in shadow DOM");

		var child = myWelcome.shadowRoot.childNodes[0];
		assert.equal(child.tagName, "H1", "renders the right tag name");
		assert.equal(child.innerHTML, "Hello, ", "renders the right content");

		myWelcome.name = "Justin";
		child = myWelcome.shadowRoot.childNodes[0];

		setTimeout(() => {
			assert.equal(child.innerHTML, "Hello, Justin", "can update");
			done();
		}, 0);
	}, 0);
});

QUnit.test('It works without shadow option set to "true"', function (assert) {
	const done = assert.async();

	function Welcome({ name }) {
		return (
			<h1>Hello, {name}</h1>
		)
	}
	
	Welcome.propTypes = {
		user: PropTypes.string
	};

	const MyWelcome = reactToWebComponent(Welcome, React, ReactDOM);

	customElements.define("my-noshadow-welcome", MyWelcome);

	var fixture = document.getElementById("qunit-fixture");

	var myWelcome = new MyWelcome();
	fixture.appendChild(myWelcome);

	setTimeout(() => {
		assert.true(myWelcome.shadowRoot === null, "shadow DOM is not attached");
		done();
	}, 0);
});

QUnit.test('It works with dashed attributes styled set to "true"', function (assert) {
	const done = assert.async();

	function Greeting({ camelCaseName }) {
		return (
			<h1>Hello, {camelCaseName}</h1>
		)
	}

	Greeting.propTypes = {
		camelCaseName: PropTypes.string.isRequired
	};

	var MyGreeting = reactToWebComponent(Greeting, React, ReactDOM, { dashStyleAttributes: true })

	customElements.define("my-dashed-style-greeting", MyGreeting);

	var fixture = document.getElementById("qunit-fixture");

	var myGreeting = new MyGreeting();

	console.error = function (...messages) {
		assert.ok(
			messages.some(message => message.includes("required")),
			"got a warning with required"
		);
	}
	fixture.appendChild(myGreeting);

	fixture.innerHTML = 
	"<my-dashed-style-greeting camel-case-name='Christopher'></my-dashed-style-greeting>";

	setTimeout(() => {
		assert.equal(fixture.firstElementChild.innerHTML, "<h1>Hello, Christopher</h1>");
		done();
	}, 0);
});

QUnit.test("mounts and unmounts underlying react component", function (assert) {
	const done = assert.async();
	assert.expect(2);

	class RCom extends React.Component {
		componentDidMount () {
			assert.ok(true, "mounted")
		}

		componentWillUnmount () {
			assert.ok(true, "unmounted")
		}

		render () {
			return <h1>Hello, Goodbye</h1>;
		}
	}

	class WebCom extends reactToWebComponent(RCom, React, ReactDOM) {}
	customElements.define("mount-unmount", WebCom);
	var webCom = new WebCom();

	var fixture = document.getElementById("qunit-fixture");

	setTimeout(() => {
		fixture.appendChild(webCom);

		setTimeout(() => {
			fixture.removeChild(webCom);
			done();
		}, 0)
	}, 0);
	
	
});
