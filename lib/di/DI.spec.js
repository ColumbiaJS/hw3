(function () {
  'use strict';

  var DI = require('./DI'),
      expect = require('chai').expect;

  describe('Modules', function() {
    describe('module loading', function() {

      it('should allow a module to be registered', function() {
        var module = DI.module('module1', []);
        expect(module).to.exist();
      });

      // Angular allows you to overwrite modules that have already been
      // registered with the same name as a module you are registering
      // in a last-in wins fashion
      it('replaces modules with the same name (last in wins)', function() {
        var module1 = DI.module('module', []),
            module2 = DI.module('module', []);
        expect(module1).not.to.equal(module2);
      });

      it('should load multiple modules', function() {
        var moduleA = DI.module('moduleA', []),
            moduleB = DI.module('moduleB', []);

        function aFunc() { return 'Hello from A'; }
        function bFunc() { return 'Hello from B'; }
        moduleA.register('aFunc', aFunc);
        moduleB.register('bFunc', bFunc);

        var injectedIntoA = moduleA.inject(function (aFunc) {
          return aFunc();
        });
        var injectedIntoB = moduleB.inject(function (bFunc) {
          return bFunc();
        });
        var injectedIntoAFromB = moduleA.inject(function (bFunc) {
          return bFunc();
        });
        expect(injectedIntoA()).to.equal('Hello from A');
        expect(injectedIntoB()).to.equal('Hello from B');
      });

      it('should load the required modules of a module', function() {
        var moduleA = DI.module('moduleA', []),
            moduleB = DI.module('moduleB', ['moduleA']);

        function aFunc() { return 'Hello from A'; }
        function bFunc() { return 'Hello from B'; }
        moduleA.register('aFunc', aFunc);
        moduleB.register('bFunc', bFunc);

        var injectedIntoA = moduleA.inject(function (aFunc) {
          return aFunc();
        });
        var injectedIntoB = moduleB.inject(function (bFunc) {
          return bFunc();
        });
        var injectedIntoBFromA = moduleB.inject(function (aFunc) {
          return aFunc();
        });
        expect(injectedIntoA()).to.equal('Hello from A');
        expect(injectedIntoB()).to.equal('Hello from B');
        expect(injectedIntoBFromA()).to.equal('Hello from A');
      });

      // transitive loading of required modules
      it('loads the required modules of a module\'s required modules',
         function() {

        var moduleA = DI.module('moduleA', []),
            moduleB = DI.module('moduleB', ['moduleA']),
            moduleC = DI.module('moduleC', ['moduleB']);

        function aFunc() { return 'Hello from A'; }
        function bFunc() { return 'Hello from B'; }
        function cFunc() { return 'Hello from C'; }
        moduleA.register('aFunc', aFunc);
        moduleB.register('bFunc', bFunc);
        moduleC.register('cFunc', cFunc);

        var injectedIntoA = moduleA.inject(function (aFunc) {
          return aFunc();
        });
        var injectedIntoB = moduleB.inject(function (bFunc) {
          return bFunc();
        });
        var injectedIntoBFromA = moduleB.inject(function (aFunc) {
          return aFunc();
        });
        var injectedIntoCFromA = moduleC.inject(function (aFunc) {
          return aFunc();
        });
        expect(injectedIntoCFromA()).to.equal('Hello from A');
      });

      // does not allow circular registration of dependencies
      it('loads each module only once', function() {
        var moduleA = DI.module('moduleA', ['moduleB']),
            moduleB = DI.module('moduleB', ['moduleA']);
      });
    });
  });

  describe('Inject dependencies', function() {
    function MainCtrl () { return 'MainCtrl called'; }
    function User () { return 'User Service invoked'; }
    function Auth () { return 'Auth service'; }
    function sum (a, b) { return a + b; }
    var app;

    before(function () {
      app = DI.module('app', []);

      app.register('MainCtrl', MainCtrl);
      app.register('User', User);
      app.register('Auth', Auth);
      app.register('sum', sum);
    });

    it('should resolve all dependencies', function () {
      var injectedFunc = app.inject(function (Auth, User, MainCtrl, sum) {
        return [Auth(), User(), MainCtrl(), sum(1, 2)].join(', ');
      });
      expect(injectedFunc()).to.equal(
        'Auth service, User Service invoked, MainCtrl called, 3'
      );
    });

    it('shouldn\'t resolve unregistered dependencies', function () {
      var injectedFuncWithUndefined = app.inject(function (nonExistingVar) {
        return nonExistingVar;
      });
      expect(injectedFuncWithUndefined()).to.equal(undefined);
    });

    it('shouldn\'t pass any dependencies into the function if such ' +
       'dependencies aren\'t specified',
       function () {
      var injectedFuncWithoutDependencies = app.inject(function () {
        return arguments.length;
      });
      expect(injectedFuncWithoutDependencies()).to.equal(0);
    });

    it('shouldn\'t treat the parameters in nested functions as dependencies',
       function () {
      var injectedFuncWithNested = app.inject(function (app, login, Auth) {
        function nested(d, e, f) {}
        var args = Array.prototype.slice.call(arguments, 0);
        return args.length;
      });
      expect(injectedFuncWithNested()).to.equal(3);
    });

    it('should handle dependencies that take their own set of arguments',
        function() {
      function mult (a, b) { return a * b; }
      function subtract(a, b) { return a - b; }
      app.register('mult', mult);
      app.register('subtract', subtract);
      var injectedFunc = app.inject(function (sum, subtract, mult) {
        return subtract(mult(5, 4), sum(5, 4));
      });
      expect(injectedFunc()).to.equal(11);
    });

    describe('Recursive Dependencies', function() {
      it('should handle dependencies with dependencies', function() {
        var injectedFunc = app.inject(function (Auth, User, MainCtrl, sum) {
          return [Auth(), User(), MainCtrl(), sum(1, 2)].join(', ');
        });
        app.register('injectedFunc', injectedFunc);
        var recursiveInjectorFunc = app.inject(function (User, injectedFunc) {
          return [User(), injectedFunc()].join(', ');
        });
        expect(injectedFunc()).to.equal('Auth service, User Service invoked, MainCtrl called, 3');
        expect(recursiveInjectorFunc()).to.equal(
          'User Service invoked, Auth service, User Service invoked, MainCtrl called, 3'
        );
      });
    });
  });
})();
