Utils
=====

.. _api-php-helpers-utils:

:Qualified name: ``FOO\Helpers\Utils``

.. php:class:: Utils

This class provides a set of utility methods that can be used for various purposes, not designed for a specific class.

  .. php:method:: public array_unique ($array, $comparator) -> array

    Removes duplicate values from an array using a custom comparator function.

    :param $array:
    :param $comparator:
    :returns: array -- The array with duplicate values removed.

  .. php:method:: public search ($array, $test)

    Searches for a specific value in an array.

    :param $array:
    :param $test:
    :returns: mixed|false The key of the found element, or false if not found.

  .. php:method:: public static die ([])

    This method is used to terminate the game execution with optional args to display in the message. (useful for debugging)

    :param $args:
      Default: ``null``
    :returns: void

  .. php:method:: public static diff (& $data, $arr)

    Calculates the difference between the values of an array and the values of another array.

    :param & $data:
    :param $arr:
    :returns: void

  .. php:method:: public static filter (& $data, $filter)

    Filters the given data based on the provided filter.

    :param & $data:
    :param $filter:
    :returns: void

  .. php:method:: public static rand ($array[, $n])

    Generates a random element(s) from the given array.

    :param $array:
    :param $n:
      Default: ``1``
    :returns: mixed|array|null The random element(s) from the array, or null if the array is empty.

  .. php:method:: public static reduceResources ($meeples)

    :param $meeples:

  .. php:method:: public static resourcesToStr ($resources[, $keepZero]) -> string

    Converts an array of resources to a string representation to be displayed in the UI.

The format of the string is as follows:


Example usage: Utils::resourcesToStr(["GOLD" => 1]) // Output: "<GOLD:1>"

    :param $resources:
    :param $keepZero:
      Default: ``false``
    :returns: string -- The string representation of the resources.

  .. php:method:: public static shuffle_assoc (& $array) -> bool

    Shuffles the elements of an associative array.

    :param & $array:
    :returns: bool -- True on success, void on failure.

  .. php:method:: public static splitPositiveNegativeValues ($inputArray) -> array

    Splits an array of values into positive and negative arrays.

    :param $inputArray:
    :returns: array -- An array containing two arrays: the positive values and the negative values.

  .. php:method:: public static throwInvalidUserAction ($msg)

    Throws an exception for an invalid user action. Typically used when a user tries to perform an action they are not allowed to.

    :param $msg:
    :returns: void

  .. php:method:: public static topological_sort ($nodeids, $edges) -> array

    Performs a topological sort on a set of nodes using the given edges.

    :param $nodeids:
    :param $edges:
    :returns: array -- The sorted array of node IDs.

