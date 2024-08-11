<?php

namespace FOO\Helpers;

use FOO\Core\Game;


/**
 * Class DB_Manager
 * This class provides a set of static methods to interact with the database.
 * It extends the APP_DbObject class.
 */
class DB_Manager extends \APP_DbObject
{
  protected static $table = null;
  protected static $primary = null;
  protected static $log = null;

  /**
   * Casts a row to the appropriate type.
   * This method is called by the QueryBuilder class and is inteded to be overriden by subclasses.
   * @param $row The row to cast.
   * @return mixed The casted row. By default, this is the same as the input.
   */
  protected static function cast($row)
  {
    return $row;
  }

  /**
   * Returns a new QueryBuilder instance for the specified table.
   * @param $table The name of the table to query.
   * @return QueryBuilder A new QueryBuilder instance.
   * @throws \feException if the table is not specified.
   */
  public static function DB($table = null)
  {
    if (is_null($table)) {
      if (is_null(static::$table)) {
        throw new \feException(
          'You must specify the table you want to do the query on'
        );
      }
      $table = static::$table;
    }

    $log = null;
    if (static::$log ?? Game::get()->getGameStateValue('logging') == 1) {
      $log = new Log(static::$table, static::$primary);
    }
    return new QueryBuilder(
      $table,
      function ($row) {
        return static::cast($row);
      },
      static::$primary,
      $log
    );
  }

  /**
   * Starts logging database queries.
   */
  public static function startLog()
  {
    static::$log = true;
  }

  /**
   * Stops logging database queries and clears the log.
   */
  public static function stopLog()
  {
    static::$log = false;
    $log = new Log(static::$table, static::$primary);
    $log->clearAll();
  }

  /**
   * Reverts all logged queries.
   */
  public static function revertLogs()
  {
    $log = new Log(static::$table, static::$primary);
    $log->revertAll();
  }
}
