QueryBuilder Module
===================

Overview
--------

Purpose and Benefits
~~~~~~~~~~~~~~~~~~~~

The QueryBuilder class is designed to:

1. Abstract SQL query construction, reducing the need for raw SQL writing
2. Provide a fluent interface for building queries
3. Implement common database operations (SELECT, INSERT, UPDATE, DELETE)
4. Handle data sanitization to prevent SQL injection
5. Simplify complex query constructions like WHERE clauses and JOINs
6. Offer convenience methods for common operations (e.g., count, min, max)
7. Support logging of database operations

Key Features
~~~~~~~~~~~~

- **Table-centric**: Each QueryBuilder instance is associated with a specific table
- **Chainable methods**: Allows for intuitive query construction
- **Data type handling**: Can cast results to specific object types
- **Flexible WHERE clauses**: Supports various formats and combinations
- **Automatic ID handling**: Often uses a primary key (default 'id') for operations
- **Batch operations**: Supports multiple inserts in one query
- **Query modifiers**: Includes ORDER BY, LIMIT, and OFFSET functionality
- **Aggregation functions**: Provides methods for COUNT, MIN, and MAX operations

Usage
-----

Initialization
~~~~~~~~~~~~~~~~

To start using QueryBuilder, you need to create an :hoverxref:`instance for a specific table <targetQ>`:

The constructor (:php:meth:`FOO\\Helpers\\QueryBuilder\\QueryBuilder::__construct`) takes the table name as mandatory parameters and 3 optionnal parameters: 


1. $cast : the type you want the result to be casted to. Can be a callable (int, str, etc.) , 'object' or a class. Default is null (no casting)
2. $primary : the primary key of the table. Default is 'id'
3. $log : if you want to log the query. Default is false

Example:

.. code-block:: php

    $ships = new QueryBuilder('ships', Ship::class, 'id', true);

In that case, the result of the query will be casted to the Ship class.
Note that in that case, the Ship class must have a constructor that takes an array as parameter, which is the result of the query.

Operations
~~~~~~~~~~

QueryBuilder provides methods for common database operations:

- **SELECT**: Use the `select()` method to specify columns. Select statements can be further refined (see :hoverxref:`complex_select <complex_select>`).
- **INSERT**: Use the `insert()` method to add a new record, or `multipleInsert()` for multiple records.
- **UPDATE**: Use the `update()` method to modify existing records.
- **DELETE**: Use the `delete()` method to remove records.
- **INC**: Use the `inc()` method to increment one or multiple field value.



1. **Simple SELECT query**:

.. code-block:: php

    $attackedShips = $ships
    ->select(['id', 'health', 'position'])
    ->where('status', 'attacked')
    ->orderBy('id', 'ASC')
    ->get();
    
Note that the `get()` method returns a Collection object, which can be further manipulated.
The `getSingle()` method can be used to retrieve a single record.

.. _complex_select:

2. **SELECT with conditions**:

There is a variety of methods to build complex queries with conditions:

- `where()`: Add a WHERE clause to the query.
- `orWhere()`: Add an OR WHERE clause to the query.
- `whereIn()`: Add a WHERE IN clause to the query.
- `whereNotIn()`: Add a WHERE NOT IN clause to the query.
- `whereNull()`: Add a WHERE NULL clause to the query.
- `whereNotNull()`: Add a WHERE NOT NULL clause to the query.
- `orderBy()`: Add an ORDER BY clause to the query.
- `limit()`: Add a LIMIT clause to the query.
- `wherePlayer()`: Add a WHERE clause for a specific player.

The WHERE method
^^^^^^^^^^^^^^^^^

The where method is used to add WHERE clauses to SQL queries. It's designed to be flexible, allowing for various types of condition specifications. The method can be chained multiple times to create complex conditions.

If you check the method's signature, the method doesn't have fixed parameters, instead using `func_get_args()` to handle variable arguments.

Usage Patterns
The `where` method can be called in several ways:

**1. Single Argument (3-Array):**

:code:`->where(['column', 'operator', 'value'])`

The 3-array must be in the form of `['field', 'operator', 'value']`. For example, to retrieve ships with health greater than 50:

.. code-block:: php

    $ships->where(['health', '>', 50]);

**2. Two Arguments:**

:code:`->where('column', 'value')`

This is the most classic way of using it, with the field name and the value, assuming that the operator is `=`. For example, to retrieve ships with health of 50:


.. code-block:: php

    $ships->where('health', 50);


**3. Three Arguments:**

:code:`->where('column', 'operator', 'value')`

This is the most flexible way of using it, with the field name, the operator, and the value. For example, to retrieve ships with health greater than 50:

.. code-block:: php

    $ships->where('health', '>', 50);


Other Methods
^^^^^^^^^^^^^^


For example, to retrieve ships with health greater than 50 and in a specific position:

.. code-block:: php

    $healthyShips = $ships
        ->select(['id', 'name', 'health', 'position'])
        ->where('health', '>', 50)
        ->whereIn('position', ['A1', 'B2', 'C3'])
        ->orderBy('health', 'DESC')
        ->get();

You can chain multiple `where()` conditions to create complex queries. For example, to retrieve active ships being attacked:

.. code-block:: php

    $activeAdmins = $ships
        ->select(['id', 'name', 'health', 'position'])
        ->where('status', 'active')
        ->where('attacked', true)
        ->orderBy('health', 'DESC')
        ->limit(2)
        ->whereNotNull('position')
        ->get();


3. **INSERT operation**:

You can insert a single record using the `insert()` method, or multiple records using `multipleInsert()`:

.. code-block:: php

    $newShip = $ships
        ->insert(['name' => 'Destroyer', 'health' => 100, 'position' => 'A1']);

    # multiple INSERT query
    $values = [
        ['name' => 'Destroyer', 'health' => 100, 'position' => 'A1'],
        ['name' => 'Cruiser', 'health' => 150, 'position' => 'B2'],
        ['name' => 'Submarine', 'health' => 200, 'position' => 'C3']
    ];
    $newShips = $ships
        ->multipleInsert(['name', 'health', 'position'])
        ->values($values);


4. **UPDATE operation**:

You can update records using the `update()` method, which takes an array of fields to update.
You have to call the `run()` method to execute the query.
Not specifying a condition will update all records in the table.

.. code-block:: php

    $ships
        ->update(['status' => 'destroyed', 'health' => 0])
        ->where('status', 'attacked')
        ->run();

You can also use the `inc()` method to increment a field value, using the same syntax as `update()`:

.. code-block:: php

    $ships
        ->inc(['health' => 10])
        ->where('status', 'active')
        ->run();


5. **DELETE operation**:

You can delete records using the `delete()` method, which requires a condition to specify which records to delete.

.. code-block:: 
        
    $ships
        ->delete()
        ->where('status', 'banned')
        ->run();



Other methods exists to perform specific operations:

- **count()**: Count the number of records in the database table.
- **func()**: Retrieve a single value from the database (e.g. COUNT, MAX, MIN).




Best Practices and Considerations
---------------------------------

When using the QueryBuilder module, consider the following best practices:

1. **Use parameter binding**: The QueryBuilder handles this automatically, preventing SQL injection.
2. **Chain methods logically**: Build your query in a logical order for readability.
3. **Use appropriate methods**: Choose specific methods like `whereIn()` or `whereNull()` when applicable.
4. **Understand return types**: Methods like `get()` return collections, while `getSingle()` returns a single record.
5. **Handle potential errors**: Some operations might throw exceptions, so implement proper error handling.



