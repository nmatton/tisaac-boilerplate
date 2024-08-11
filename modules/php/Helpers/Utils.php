<?php

namespace FOO\Helpers;

abstract class Utils extends \APP_DbObject
{
  public static function filter(&$data, $filter)
  {
    $data = array_values(array_filter($data, $filter));
  }

  public static function die($args = null)
  {
    if (is_null($args)) {
      throw new \BgaVisibleSystemException(
        implode('<br>', self::$logmsg)
      );
    }
    throw new \BgaVisibleSystemException(json_encode($args));
  }

  /**
   * Calculates the difference between the values of an array and the values of another array.
   *
   * @param array $data The array to calculate the difference on. This array will be modified.
   * @param array $arr The array to calculate the difference with.
   * @return void
   */
  public static function diff(&$data, $arr)
  {
    $data = array_values(array_diff($data, $arr));
  }

  /**
   * Shuffles the elements of an associative array.
   *
   * @param array $array The array to be shuffled.
   * @return void
   */
  public static function shuffle_assoc(&$array)
  {
    $keys = array_keys($array);
    shuffle($keys);

    foreach ($keys as $key) {
      $new[$key] = $array[$key];
    }

    $array = $new;
    return true;
  }
  /**
   * Removes duplicate values from an array using a custom comparator function.
   *
   * @param array $array The array to remove duplicate values from.
   * @param callable $comparator The function used to compare the values in the array.
   * @return array The array with duplicate values removed.
   */
  function array_unique($array, $comparator)
  {
    $unique_array = [];
    do {
      $element = array_shift($array);
      $unique_array[] = $element;

      $array = array_udiff($array, [$element], $comparator);
    } while (count($array) > 0);

    return $unique_array;
  }
}
