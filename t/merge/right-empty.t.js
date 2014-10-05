#!/usr/bin/env node

require('./proof')(3, function (step, assert) {
    var strata = new Strata({ directory: tmp, leafSize: 3, branchSize: 3 })
    step(function () {
        serialize(__dirname + '/fixtures/merge.before.json', tmp, step())
    }, function () {
        strata.open(step())
    }, function () {
        strata.mutator('c', step())
    }, function (cursor) {
        step(function () {
            cursor.indexOf('c', step())
        }, function (index) {
            cursor.remove(index, step())
        }, function () {
            cursor.indexOf('d', step())
        }, function (index) {
            cursor.remove(index, step())
        }, function () {
            cursor.unlock(step())
        })
    }, function () {
        gather(strata, step())
    }, function (records) {
        assert(records, [ 'a', 'b' ], 'records')

        strata.balance(step())
    }, function () {
        vivify(tmp, step())
        load(__dirname + '/fixtures/right-empty.after.json', step())
    }, function (actual, expected) {
        assert.say(expected)
        assert.say(actual)

        assert(actual, expected, 'merge')
    }, function () {
        gather(strata, step())
    }, function (records) {
        assert(records, [ 'a', 'b' ], 'merged')
    }, function() {
        strata.close(step())
    })
})
