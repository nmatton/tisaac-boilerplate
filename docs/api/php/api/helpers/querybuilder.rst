QueryBuilder
============

:Qualified name: ``FOO\Helpers\QueryBuilder``

.. php:class:: QueryBuilder

  .. php:method:: public __construct ($table[, $cast, $primary, $log])

    Constructor for the QueryBuilder class.

    :param $table:
    :param $cast:
      Default: ``null``
    :param $primary:
      Default: ``'id'``
    :param $log:
      Default: ``false``

  .. php:method:: public count ([]) -> int

    Counts the number of records in the database table.

    :param $field:
      Default: ``null``
    :returns: int -- The number of records in the database table.

  .. php:method:: public delete ([])

    Delete a row from the table.

    :param $id:
      Default: ``null``
    :returns: QueryBuilder The QueryBuilder object.

  .. php:method:: public func ($func[, $field]) -> int

    Retrieves a single value from the database (e.g. COUNT, MAX, MIN).
ONLY for unary function : COUNT, MAX, MIN

    :param $func:
    :param $field:
      Default: ``null``
    :returns: int -- The result of the function.

  .. php:method:: public get ([])

    Run a select query and fetch values

    :param $returnValueIfOnlyOneRow:
      Default: ``false``
    :param $debug:
      Default: ``false``
    :returns: Collection|array The fetched values.

  .. php:method:: public getSingle () -> mixed

    Retrieves a single record from the database.

    :returns: mixed -- The retrieved record.

  .. php:method:: public inc ([])

    Inc: $fields array structure is the same as the one for insert, but instead of value to be set, the array contains the offset

    :param $fields:
      Default: ``[]``
    :param $id:
      Default: ``null``
    :returns: QueryBuilder The QueryBuilder object.

  .. php:method:: public insert ([]) -> int

    Single insert, array syntax is [ 'name_of_field' => $value, ... ]

    :param $fields:
      Default: ``[]``
    :param $overwriteIfExists:
      Default: ``false``
    :returns: int -- The ID of the inserted row.

  .. php:method:: public limit ($limit[, $offset])

    Set the limit and offset for the query.

    :param $limit:
    :param $offset:
      Default: ``null``
    :returns: $this The QueryBuilder instance.

  .. php:method:: public max ($field) -> mixed

    Get the maximum value of a specific field in the database.

    :param $field:
    :returns: mixed -- The maximum value of the specified field.

  .. php:method:: public min ($field) -> mixed

    Calculates the minimum value of a specified field.

    :param $field:
    :returns: mixed -- The minimum value of the specified field.

  .. php:method:: public multipleInsert ([])

    Multiple insert, syntax is : ->multipleInsert(['field1', 'field2'])->values([ [1, 'test'], [2, 'tester'], ....]) !!!! each values must have the content in same order as the fields

    :param $fields:
      Default: ``[]``
    :param $overwriteIfExists:
      Default: ``false``
    :returns: QueryBuilder The QueryBuilder object.

  .. php:method:: public orWhere ()

    Adds an "OR" condition to the query's WHERE clause.

    :returns: $this

  .. php:method:: public orderBy ()

    Set the order by clause for the query.

    :returns: $this

  .. php:method:: public run ([]) -> array

    Run the query.

    :param $id:
      Default: ``null``
    :returns: array -- The ids affected rows.

  .. php:method:: public select ($columns)

    Select: fetch rows. Structure is columns is either an array with the name of columns you want to fetch, or an associative array [ 'alias' => 'fieldname'] if you want to use "AS"

    :param $columns:
    :returns: QueryBuilder The QueryBuilder object.

  .. php:method:: public update ([])

    Update: $fields array structure is the same as the one for insert optional parameter $id adds a where clause on primary key

    :param $fields:
      Default: ``[]``
    :param $id:
      Default: ``null``
    :returns: QueryBuilder The QueryBuilder object.

  .. php:method:: public values ([]) -> array

    Set the values for the query.

    :param $rows:
      Default: ``[]``
    :returns: array -- The IDs of the inserted or updated rows.

  .. php:method:: public where ()

    Adds a WHERE clause to the query.

    :returns: $this

  .. php:method:: public whereIn ()

    Add a WHERE IN clause to the query.

    :returns: $this

  .. php:method:: public whereNotIn ()

    Set the "where not in" clause for the query.

    :returns: $this

  .. php:method:: public whereNotNull ($field)

    Adds a WHERE condition to the query to filter out rows where the specified field is not null.

    :param $field:
    :returns: $this The QueryBuilder instance for method chaining.

  .. php:method:: public whereNull ($field)

    Set a "where null" clause for the query.

    :param $field:
    :returns: $this

  .. php:method:: public wherePlayer ($pId)

    Set a WHERE condition to filter results by player ID. (Syntaxic sugar)

    :param $pId:
    :returns: $this The QueryBuilder instance.

  .. php:method:: protected computeWhereClause ($arg)

    Computes the WHERE clause for the query.

    :param $arg:
    :returns: void

  .. php:method:: private assembleQueryClauses ()

    Append all the modifiers to a query in the right order

    :returns: void

  .. php:method:: private protect ($arg) -> mixed

    Protects the given argument to be used in a query.

    :param $arg:
    :returns: mixed -- The protected argument.

