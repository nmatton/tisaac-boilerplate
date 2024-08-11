<?php

namespace FOO\Helpers;


/**
 * A collection class that extends the built-in ArrayObject class.
 */
class Collection extends \ArrayObject
{
  /**
   * Returns an array of the keys of the collection.
   *
   * @return array An array of the keys of the collection.
   */
  public function getIds()
  {
    return array_keys($this->getArrayCopy());
  }

  /**
   * Returns true if the collection is empty, false otherwise.
   *
   * @return bool True if the collection is empty, false otherwise.
   */
  public function empty()
  {
    return empty($this->getArrayCopy());
  }

  /**
   * Returns the first element of the collection, or null if the collection is empty.
   *
   * @return mixed The first element of the collection, or null if the collection is empty.
   */
  public function first()
  {
    $arr = $this->toArray();
    return isset($arr[0]) ? $arr[0] : null;
  }

  /**
   * Returns a random element from the collection.
   *
   * @return mixed A random element from the collection.
   */
  public function rand()
  {
    $arr = $this->getArrayCopy();
    $key = array_rand($arr, 1);
    return $arr[$key];
  }

  /**
   * Returns the values of the collection as a numerically indexed array.
   *
   * @return array The values of the collection as a numerically indexed array.
   */
  public function toArray()
  {
    return array_values($this->getArrayCopy());
  }

  /**
   * Returns the collection as an associative array.
   *
   * @return array The collection as an associative array.
   */
  public function toAssoc()
  {
    return $this->getArrayCopy();
  }

  /**
   * Returns a new collection that is the result of applying the given function to each element of the original collection.
   *
   * @param callable $func The function to apply to each element of the collection.
   * @return Collection A new collection that is the result of applying the given function to each element of the original collection.
   */
  public function map($func)
  {
    return new Collection(array_map($func, $this->toAssoc()));
  }

  /**
   * Returns a new collection that is the result of merging the original collection with the given collection.
   *
   * @param Collection $arr The collection to merge with the original collection.
   * @return Collection A new collection that is the result of merging the original collection with the given collection.
   */
  public function merge($arr)
  {
    return new Collection($this->toAssoc() + $arr->toAssoc());
  }

  /**
   * Returns the result of applying a function to each element of the collection, using the result of the previous application as the initial value.
   *
   * @param callable $func The function to apply to each element of the collection.
   * @param mixed $init The initial value to use in the reduction.
   * @return mixed The result of applying a function to each element of the collection, using the result of the previous application as the initial value.
   */
  public function reduce($func, $init)
  {
    return array_reduce($this->toArray(), $func, $init);
  }

  /**
   * Returns a new collection that contains only the elements of the original collection for which the given function returns true.
   *
   * @param callable $func The function to use to filter the collection.
   * @return Collection A new collection that contains only the elements of the original collection for which the given function returns true.
   */
  public function filter($func)
  {
    return new Collection(array_filter($this->toAssoc(), $func));
  }

  /**
   * Returns a new collection that contains the first $n elements of the original collection.
   *
   * @param int $n The number of elements to include in the new collection.
   * @return Collection A new collection that contains the first $n elements of the original collection.
   */
  public function limit($n)
  {
    return new Collection(array_slice($this->toAssoc(), 0, $n, true));
  }

  /**
   * Returns true if the collection contains the given element, false otherwise.
   *
   * @param mixed $t The element to search for in the collection.
   * @return bool True if the collection contains the given element, false otherwise.
   */
  public function includes($t)
  {
    return in_array($t, $this->getArrayCopy());
  }

  /**
   * Returns an array of the UI data for each element of the collection.
   *
   * @return array An array of the UI data for each element of the collection.
   */
  public function ui()
  {
    return $this->map(function ($elem) {
      return $elem->getUiData();
    })->toArray();
  }

  /**
   * Returns an associative array of the UI data for each element of the collection.
   *
   * @return array An associative array of the UI data for each element of the collection.
   */
  public function uiAssoc()
  {
    return $this->map(function ($elem) {
      return $elem->getUiData();
    })->toAssoc();
  }
}
