#!/usr/bin/env node

require("./proof")(4, function (async, ok, equal, Strata, tmp, deepEqual, say, die) {
  var strata, cadence = require("cadence"), purge, count = 0;

  purge = cadence(function (report) {
    ok(report({}).cache.length > 2, "unpurged");
    strata.purge(0);
    equal(2, report({}).cache.length, "purged");
  });

  function tracer (trace, callback) {
    switch (trace.type) {
    case "reference":
      if (++count == 2) {
        purge(trace.report, callback);
      } else {
        callback();
      }
      break;
    default:
      say(trace.type);
      callback();
    }
  }

  async(function (serialize) {

    serialize(__dirname + '/fixtures/tree.before.json', tmp, async());

  }, function () {

    strata = new Strata(tmp, { leafSize: 3, branchSize: 3, tracer: tracer });
    strata.open(async());

  }, function () {

    strata.mutator('h', async());

  }, function (cursor) {

    async(function () {

      cursor.indexOf('h', async());

    }, function (index) {

      cursor.remove(index, async());

    }, function () {

      cursor.indexOf('i', async());

    }, function (index) {

      cursor.remove(index, async());
      cursor.unlock();

    });
  }, function () {

    strata.mutator('e', async());

  }, function (cursor) {

    async(function () {

      cursor.indexOf('e', async());

    }, function (index) {

      cursor.remove(index, async());

    }, function () {

      cursor.indexOf('g', async());

    }, function (index) {

      cursor.remove(index, async());
      cursor.unlock();

    });
  }, function (gather) {

    gather(async, strata);

  }, function (records) {

    deepEqual(records, [ 'a', 'b', 'c', 'd',  'f', 'j', 'k', 'l', 'm', 'n' ], 'records');
    strata.balance(async());

  }, function (load) {

    load(__dirname + '/fixtures/tree.after.json', async());

  }, function (expected, objectify) {

    objectify(tmp, async());

  }, function (actual, expected, say) {

    deepEqual(actual, expected, 'merge');

    strata.close(async());

  });
});
