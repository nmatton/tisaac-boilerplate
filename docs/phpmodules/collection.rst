Collection Module
=================

The Collection class extends the built-in ArrayObject class and provides additional methods for working with a set of objects with standardized methods.
It's designed to make it easier to manipulate, filter, and transform sets of data, especially when dealing with database results or DB_Model objects.

The Collection class is commonly used as a return type for methods in classes like ``DB_Manager``, ``CachedDB_Manager``, and others.
Therefore, collection are typically created from methods that return multiple objects or array from a database query.
The typical format is close to an associative array, with the keys being the object IDs and the values being the objects or DB results themselves.
Values of each element in the collection depends on the casting method provided by the class that created the collection.

Is it possible to create a Collection object directly.

For example:

.. code-block:: php

    public static function getPlaces($player)
    {
        $collection = new Collection();
        foreach (array_keys(self::getMissionsDatas()) as $mid) {
            $collection[$mid] = self::getMission($mid, $player);
        }
        return $collection;
    }

In CachedDB_Manager, CachedPieces and its subclasses:

    Methods like ``getAll(),`` ``get(),`` ``getMany()`` often return Collection objects.
    These collections typically contain database records or game objects.

Once you have a Collection object, you can use its various methods to manipulate and extract data.
    Here are some key methods and their usage:

- ``getIds()``: Returns an array of all IDs in the collection.

.. code-block:: php

    $playerIds = $players->getIds();

- ``empty()``: Returns true if the collection is empty.

.. code-block:: php

    if ($cards->empty()) {
        // No cards in the collection
    }

- ``first()`` and ``last()``: Get the first or last element in the collection.

.. code-block:: php

    $firstCard = $cards->first();
    $lastCard = $cards->last();

-  ``has($key)``: Checks if a specific **key** exists in the collection, like an ID.

.. code-block:: php

    if ($cards->has($cardId)) {
        // Card exists in the collection
    }

- ``includes()``: Check if the collection includes a specific **value**.

.. code-block:: php

    if ($cards->includes($card)) {
        // Card exists in the collection
    }

- ``rand()``: Returns a random element from the collection.

.. code-block:: php

    $randomCard = $cards->rand();

- ``toArray()`` and ``toAssoc()``: Convert the collection to a regular array or associative array.

.. code-block:: php

    $cardArray = $cards->toArray();
    $cardAssoc = $cards->toAssoc();

- ``map($func)``: Apply a function to each element and return a new collection.

.. code-block:: php

    $playerNames = $players->map(
        function($player) { return $player->getName(); }
        );

- ``filter($func)``: Filter the collection based on a function.

.. code-block:: php

    $activePlayers = $players->filter(
        function($player) { return $player->isActive(); }
        );

- ``reduce($func, $init)``: Reduce the collection to a single value.

.. code-block:: php

    $totalScore = $players->reduce(
        function($carry, $player) { return $carry + $player->getScore(); },
        0
        );
    
- ``limit($n)``: Limit the collection to a certain number of items.

.. code-block:: php

    $firstCards = $cards->limit(10);

- ``ui()`` and ``uiAssoc()``: Get UI data for all elements in the collection. Elements of the collection must be objects that implement the ``getUiData()`` method.

.. code-block:: php

    $cardUI = $cards->ui();
    $cardUIAssoc = $cards->uiAssoc();

- ``merge($collection)``: Merge another collection into the current collection.

.. code-block:: php

    $allCards = $cards->merge($extraCards); // $extraCards is another Collection object

- ``where($field, $value)``: Filter the collection based on a field value.

.. code-block:: php

    $activePlayers = $players->where('status', 'active');

.. note::

    This method filters the collection of objects, returning only those where the specified field matches the given value.
    If the value is an array, it checks if the field's value is in the array. If the value contains a wildcard ('%'),
    it performs a "like" match. If the value is null, the original collection is returned unfiltered.

- ``whereNull($field, $value)``: Filters the collection, returning objects where the specified field is null.

.. code-block:: php

    $activePlayers = $players->whereNull('status');


- ``orderBy($field, $asc = 'ASC')``: Sort the collection by a field.

.. code-block:: php

    $sortedPlayers = $players->orderBy('score', 'DESC');

- ``update($field, $value)``: Update a field in all objects in the collection.

.. code-block:: php

    $players->update('status', 'active');


These methods can be chained together for more complex operations:

.. code-block:: php

    $topActivePlayerNames = $players
    ->filter(function($player) { return $player->isActive(); })
    ->orderBy('score', 'DESC')
    ->limit(3)
    ->map(function($player) { return $player->getName(); });

