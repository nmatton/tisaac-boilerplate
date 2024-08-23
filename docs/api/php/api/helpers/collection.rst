Collection
==========

:Qualified name: ``FOO\Helpers\Collection``

.. php:class:: Collection

This class extends the Array concept in PHP, providing additional methods to manipulate and filter the collection of objects.

  .. php:method:: public empty () -> bool

    Check if the collection is empty.

    :returns: bool -- True if the collection is empty, false otherwise.

  .. php:method:: public filter ($func)

    Filters the collection using the given callback function.

    :param $func:
    :returns: Collection The filtered collection.

  .. php:method:: public first ()

    Retrieve the first element from the collection, or null if the collection is empty.

    :returns: mixed|null The first element of the collection, or null if the collection is empty.

  .. php:method:: public getIds () -> array

    Retrieves the IDs from the collection.

    :returns: array -- The array of IDs.

  .. php:method:: public has ($key) -> bool

    Check if the collection has a specific key.

    :param $key:
    :returns: bool -- Returns true if the collection has the key, false otherwise.

  .. php:method:: public includes ($t) -> bool

    Check if the collection includes a specific value.

    :param $t:
    :returns: bool -- Returns true if the collection includes the value, false otherwise.

  .. php:method:: public last ()

    Retrieve the last element from the collection, or null if the collection is empty.

    :returns: mixed|null The last element of the collection, or null if the collection is empty.

  .. php:method:: public limit ($n)

    Limits the collection to a specified number of items.

    :param $n:
    :returns: Collection The collection with the limited number of items.

  .. php:method:: public map ($func)

    Applies a callback function to each element of the collection and returns a new collection with the results.

    :param $func:
    :returns: Collection A new collection with the results of the callback function applied to each element.

  .. php:method:: public merge ($collect)

    Returns a new collection that is the result of merging the original collection with the given collection.

    :param $collect:
    :returns: Collection

  .. php:method:: public order ($callback)

    Orders the collection using the given callback.

    :param $callback:
    :returns: Collection The ordered collection.

  .. php:method:: public orderBy ($field[, $asc])

    Sorts the collection by the specified field in ascending or descending order.

    :param $field:
    :param $asc:
      Default: ``'ASC'``
    :returns: Collection The sorted collection.

  .. php:method:: public rand () -> mixed

    Returns a random element from the collection.

    :returns: mixed -- The randomly selected element.

  .. php:method:: public reduce ($func, $init) -> mixed

    Reduces the collection to a single value using a callback function.

    :param $func:
    :param $init:
    :returns: mixed -- The reduced value.

  .. php:method:: public toArray () -> array

    Returns the values of the collection as a numerically indexed array.

    :returns: array -- The values of the collection as a numerically indexed array.

  .. php:method:: public toAssoc () -> array

    Returns the collection as an associative array.

    :returns: array -- The collection as an associative array.

  .. php:method:: public ui () -> array

    This method returns a numerically indexed array with the UI data of each element in the collection. Each element in the collection must implement the getUiData method.

    :returns: array -- An array of UI data of each elements in the collection.

  .. php:method:: public uiAssoc () -> array

    This method returns an associative array with the UI data of each element in the collection. Each element in the collection must implement the getUiData method.

    :returns: array -- An array of UI data of each elements in the collection.

  .. php:method:: public update ($field, $value)

    Updates the specified field of all objects in the collection with the given value.
This method iterates over the collection and updates the specified field of each object with the provided value.

    :param $field:
    :param $value:
    :returns: Collection The collection of objects after the field has been updated.

  .. php:method:: public where ($field, $value)

    Filters the collection based on the specified field and value.
This method filters the collection of objects, returning only those where the specified field matches the given value. If the value is an array, it checks if the field's value is in the array. If the value contains a wildcard (''), it performs a "like" match. If the value is null, the original collection is returned unfiltered.

    :param $field:
    :param $value:
    :returns: Collection A filtered collection of objects based on the field and value criteria.

  .. php:method:: public whereNull ($field)

    Filters the collection, returning objects where the specified field is null.
This method filters the collection of objects, returning only those where the specified field has a null value.

    :param $field:
    :returns: Collection A filtered collection of objects where the specified field is null.

