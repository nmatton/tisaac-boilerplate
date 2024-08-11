<?php

namespace FOO\Helpers;

/**
 * Represents a collection of elements.
 *
 * @package Helpers
 */
class Collection extends \ArrayObject
{
  /**
   * Retrieves the IDs from the collection.
   *
   * @return array The array of IDs.
   */
  public function getIds()
  {
    return array_keys($this->getArrayCopy());
  }

  /**
   * Check if the collection is empty.
   *
   * @return bool True if the collection is empty, false otherwise.
   */
  public function empty()
  {
    return empty($this->getArrayCopy());
  }

  /**
   * Retrieve the first element from the collection, or null if the collection is empty.
   *
   * @return mixed|null The first element of the collection, or null if the collection is empty.
   */
  public function first()
  {
    $arr = $this->toArray();
    return isset($arr[0]) ? $arr[0] : null;
  }

  /**
   * Returns a random element from the collection.
   *
   * @return mixed The randomly selected element.
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
   * Applies a callback function to each element of the collection and returns a new collection with the results.
   *
   * @param callable $func The callback function to apply to each element.
   * @return Collection A new collection with the results of the callback function applied to each element.
   */
  public function map($func): Collection
  {
    return new Collection(array_map($func, $this->toAssoc()));
  }

  /**
   * Returns a new collection that is the result of merging the original collection with the given collection.
   *
   * @param Collection $collect The collection to merge with the original collection.
   * @return Collection
   */
  public function merge($collect): Collection
  {
    return new Collection($this->toAssoc() + $collect->toAssoc());
  }

  /**
   * Reduces the collection to a single value using a callback function.
   *
   * @param callable $func The callback function to apply to each element in the collection.
   *                       The function should accept two arguments: the accumulated value and the current element.
   *                       It should return the updated accumulated value.
   * @param mixed $init The initial value for the reduction.
   * @return mixed The reduced value.
   */
  public function reduce($func, $init)
  {
    return array_reduce($this->toArray(), $func, $init);
  }

  /**
   * Filters the collection using the given callback function.
   *
   * @param callable $func The callback function used to filter the collection.
   * @return Collection The filtered collection.
   */
  public function filter($func): Collection
  {
    return new Collection(array_filter($this->toAssoc(), $func));
  }

  /**
   * Limits the collection to a specified number of items.
   *
   * @param int $n The maximum number of items to include in the collection.
   * @return Collection The collection with the limited number of items.
   */
  public function limit($n): Collection
  {
    return new Collection(array_slice($this->toAssoc(), 0, $n, true));
  }

  /**
   * Check if the collection includes a specific value.
   *
   * @param mixed $t The value to check for inclusion.
   * @return bool Returns true if the collection includes the value, false otherwise.
   */
  public function includes($t): bool
  {
    return in_array($t, $this->getArrayCopy());
  }

  /**
   * This method returns a numerically indexed array with the UI data of each element in the collection.
   * Each element in the collection must implement the getUiData method.
   *
   * @return array An array of UI data of each elements in the collection.
   * 
   * see also : uiAssoc() method for an associative array
   */
  public function ui(): array
  {
    return $this->map(function ($elem) {
      return $elem->getUiData();
    })->toArray();
  }

  /**
   * This method returns an associative array with the UI data of each element in the collection.
   * Each element in the collection must implement the getUiData method.
   *
   * @return array An array of UI data of each elements in the collection.
   * 
   * see also : ui() method for a numerically indexed array
   */
  public function uiAssoc(): array
  {
    return $this->map(function ($elem) {
      return $elem->getUiData();
    })->toAssoc();
  }

  /**
   * Orders the collection using the given callback.
   *
   * @param callable $callback The callback function used for ordering the collection.
   * @return Collection The ordered collection.
   */
  public function order($callback): Collection
  {
    $t = $this->getArrayCopy();
    \uasort($t, $callback);
    return new Collection($t);
  }
}
