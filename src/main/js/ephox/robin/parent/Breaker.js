define(
  'ephox.robin.parent.Breaker',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct'
  ],

  function (Arr, Fun, Option, Struct) {
    var bisect = function (universe, parent, child) {
      var children = universe.property().children(parent);
      var index = Arr.findIndex(children, Fun.curry(universe.eq, child));
      return index > -1 ? Option.some({
        before: Fun.constant(children.slice(0, index)),
        after: Fun.constant(children.slice(index + 1))
      }) : Option.none();
    };

    var unsafeBreakAt = function (universe, parent, parts) {
      var second = universe.create().clone(parent);
      universe.insert().appendAll(second, parts.after());
      universe.insert().after(parent, second);
      return second;
    };

    /**
     * Move everything after child in the parent element into a clone of the parent (placed after parent).
     */
    var breakAt = function (universe, parent, child) {
      var parts = bisect(universe, parent, child);
      return parts.map(function (ps) {
        return unsafeBreakAt(universe, parent, ps);
      });
    };


    /*
     * Using the breaker, break from the child up to the top element defined by the predicate.
     * It returns three values:
     *   first: the top level element that completed the break
     *   second: the optional element representing second part of the top-level split if the breaking completed successfully to the top
     *   splits: a list of (Element, Element) pairs that represent the splits that have occurred on the way to the top.
     */
    var breakPath = function (universe, item, isTop, breaker) {
      var result = Struct.immutable('first', 'second', 'splits');

      var next = function (child, group, splits) {
        var fallback = result(child, Option.none(), splits);
        // Found the top
        if (isTop(child)) return result(child, group, splits);
        else {
          return universe.property().parent(child).fold(function () {
            return fallback;
          }, function (parent) {
            var second = breaker(universe, parent, child);
            // Store the splits up the path break.
            var extra = second.fold(Fun.constant([]), function (sec) {
              return [{ first: Fun.constant(parent), second: Fun.constant(sec) }];
            });

            // THIS NEEDS TO BE INVESTIGATED ... second.getOr(parent) works for one of the tests, but will break others.
            return next(parent, second, splits.concat(extra));
          });
        }
      };

      return next(item, Option.none(), []);
    };

    return {
      breakAt: breakAt,
      breakPath: breakPath
    };
  }
);
