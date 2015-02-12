(function () {
  'use strict';

  var DI = require('./DI'),
      expect = require('chai').expect;

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
