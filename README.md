## HW3: Angular-Style Dependency Injection

<!-- MarkdownTOC -->

- [DUE DATE: Fri, Feb 20 at 11:59 PM](#due-date-fri-feb-20-at-1159-pm)
- [Key Features](#key-features)
  - [Overview](#overview)
  - [Registering modules](#registering-modules)
  - [Registering multiple modules and requiring modules into other modules](#registering-multiple-modules-and-requiring-modules-into-other-modules)
  - [Registering functions on a module and injecting them into other functions](#registering-functions-on-a-module-and-injecting-them-into-other-functions)
  - [The module object](#the-module-object)
- [Hints and Resources](#hints-and-resources)
  - [Hint](#hint)
  - [Resources that can help](#resources-that-can-help)
  - [The Revealing Module Pattern](#the-revealing-module-pattern)

<!-- /MarkdownTOC -->


### DUE DATE: Fri, Feb 20 at 11:59 PM

This time you have a single task - to create your own angular-style dependency-injection system.

To make this task a little more manageable, there are 2 directories inside of the **lib/** folder.  The first, di-simple, is a simplified version of the final system you're going to create and is designed to help you divide up your task into two more manageable stages.  Once you've completed the DI.js in di-simple, you can use your solution as the starting point for the DI.js in the di/ directory.

As per the Angular Docs:

> Dependency Injection (DI) is a software design pattern that deals with how components get hold of their dependencies.

> The Angular injector subsystem is in charge of creating components, resolving their dependencies, and providing them to other components as requested.

If you want to read up a bit more on Angular's dependency injection: https://docs.angularjs.org/guide/di

We're going to implement a simplified version of Angular's dependency injection with the following key features:

### Key Features

#### Overview

#### Registering modules

You can register modules with the dependency injector in the same way that you register modules in Angular.

Whereas in Angular you would create a new module using:

```js
angular.module('someModule', ['someModuleDependency']);
```

here you will create a new module using:

```js
DI.module('someModule', ['someModuleDependency']);
```

You can also set a variable to this newly created module using:

```js
var mod = DI.module('someModule', ['someModuleDependency']);
```

And just like in Angular where you can get a module using:

```js
var mod = angular.module('someModule');
```

without an array, in your DI system you need to be able to get a module with:

```js
var mod = angular.module('someModule');
```

#### Registering multiple modules and requiring modules into other modules

Similarly, you need to be able to register multiple modules and to require modules into other modules by specifying the modules to be required in using an array.


#### Registering functions on a module and injecting them into other functions

The register and inject methods on the module object will be used to register functions with a given module and to then inject those functions into other functions (using the inject() function will return a function with the required dependencies injected into it).

Once your client (in this case the test file) has created a module, they can then register a function with that module using the following syntax:

```js
var module = DI.module('myModule', []);
function funcToRegister() { return 'Hello from my registered function'; }
module.register('funcToRegister', funcToRegister);
```

And, continuing our example, can then inject that function into another function using:

```js
var injectedFunction = module.inject(function (funcToRegister) {
  return funcToRegister();
});
```

Now calling `injectedFunction()` should return `'Hello from my registered function'`.

In other words, once a function is registered with a module, that function can be injected into a new function using the `DI.inject()` method and passing in a function whose parameters are all functions that have been registered with the module you are calling inject on or with any of that module's dependencies.  Calling the `DI.inject()` method will return a function that can be invoked at any time and will make use of the injected functions when called.

The structure of your final solution should be as follows:

The `DI.js` file should export an object with 2 properties, `modules` and `module`.

```js
module.exports = {
  modules: {},
  module: function (name, dependencies) {
    // implement your module function here
  }
};
```

The key to the module function is that when you call it with just a name, it simply returns that module, whereas when you call it with an array of dependencies as a second parameter, it will create that module and return it.  Just like in Angular, in order to create that module you need to pass an array of dependencies as the second parameter.  If the module has no dependencies, you must pass in an empty array (`var mod = DI.module('app', []);`). If a client (that is, someone using your DI system, in this case, the tests) attempts to use the module getter syntax (`var mod = DI.module('nonexistentmod');`), you need to throw an error telling the client that the module doesn't exist.  Since this is a synchronous process, you can simply throw an error:

```js
throw 'Module ' + moduleName + ' is not available';
```

This is the only error you should have to throw in this homework.

#### The module object

Now this is where it gets a little tricky in terms of setup, so follow along closely.  When you create a module, you need to use the revealing module pattern to return your module object, so your code should look something like this:

```js
var module = {
  name: name,
  dependencies: dependencies,
  register: register,
  inject: inject,
  getRegisteredFunc: getRegisteredFunc
};

return module
```

### Hints and Resources

##### Hint

If you haven't realized it yet, in order to complete your dependency injector, you'll need to extract out the functions that your client passes into the inject() method, and that means you'll need to use a regular expression.  In other words, let's say you have a module named 'app' and you have a function AuthService registered on app and another function DataService registered on a module that your app module has declared as a dependency.  When you want to inject that AuthService and that DataService function into another function (perhaps to create a MainCtrl function), you're going to do something like this:

```js
var app = DI.module('app');
var MainCtrl = app.inject(function (AuthService, DataService) {
  // do something with MainCtrl here
  // do something with DataService here
});
```

So how do you know that it's AuthService and DataService that you need to inject?  That's where your regular expression skills come in.

**Please Note:**

The point of this exercise is not to test your regular expression skills.  They're great to have, and I encourage you to spend some time trying to create one that works, but please don't waste hours trying to come up with one.  Feel free to Google around or use StackOverflow or what have you.  Just make sure to reference your source if you do so.

##### Resources that can help

Remember, however, that in order to complete your dependency injection system, you'll need to register that module before you return it, as well as load any of its required dependencies recursively so that you can access any functions that get registered with those modules.

There is a [Codewars kata on Dependency Injection](http://www.codewars.com/kata/dependency-injection) that is a much simpler version of what you have to do here.  On the other side of things, if you're feeling ambitious, you can always check out [injector.js in the Angular source code](https://github.com/angular/angular.js/blob/master/src/auto/injector.js).

If you want a step-by-step guide to building a more complex Dependency Injection system than you have to build here - one that implements nearly all of the Angular DI system, you can read Ch. 10 (Modules and the Injector) of [Tero Parviainen's **Build Your Own Angular**](http://teropa.info/build-your-own-angular).  You don't need to do this, however.

##### The Revealing Module Pattern

I touched on the revealing module pattern briefly in class and in the workshop, and I cover it in greater detail in the following wiki page:

https://github.com/ColumbiaJS/js-course/wiki/The-Module-Pattern

or you can read more at:

http://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript

It's a very simple pattern and it gives you a nice way to organize your code as it gets more complex.
