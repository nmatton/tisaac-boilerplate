CachedPiece Module
=====================

The Pieces class (and its cached variant CachedPieces) is a generic class designed to manage game pieces in your adaptation.
It provides a structured way to handle game elements like cards, tokens, or any other game-specific items.


The main purposes of this class are:

    1. To provide a standardized way of interacting with game pieces across different games.
    2. To abstract database operations, making it easier to manage game elements.
    3. To offer utility methods for common game piece operations.

The CachedPieces class extends the Pieces class and adds caching functionality to reduce the number of database queries.
Therefore, the :code:`CachedPieces` class is to be used for your game adaptation.

The Pieces (and therefore CachedPieces) class is an extension of the :hoverxref:`Manager class<phpmodules/cachedb_manager:CachedDB_Manager>` and inherits its database connection and query methods.

**Key Features**

    - Database Integration: The class interfaces with the game's database, handling CRUD operations for game pieces.
    - Custom fields: You can add custom fields to the game pieces to have additional information.
    - Casting : You can cast the game pieces to a specific class to add custom methods and properties (relates to the :hoverxref:`Manager/Model pattern<manager_model_pattern>`).
    - Caching: The CachedPieces class caches game pieces to reduce the number of database queries.
    - Utility Methods: The class provides utility methods for common game piece operations (getters & setters, (auto)shuffling, etc.).

Usage
-----

Typically, you would create a specific class for each type of game piece (e.g., Cards, Tokens) that extends either Pieces or CachedPieces.
As for the :hoverxref:`Manager/Model pattern<manager_model_pattern>`, you will have a class for the model (e.g., Cards), extending the :code:`DB_Model` class and a class for the manager (e.g., CardsManager) (this one, extending the :code:`CachedPieces` class).

Setup
~~~~~

To use the CachedPieces class, you need to setup the database table first.

Here is the typical structure to be added to your :code:`dbmodel.sql` file:

.. code-block:: sql

    CREATE TABLE IF NOT EXISTS `cards` (
    `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT, -- mandatory field
    `card_location` varchar(32) NOT NULL, -- mandatory field
    `card_state` int(10) DEFAULT 0, -- mandatory field
    `value` int(10) NOT NULL, -- extra field
    `color` int(10) NOT NULL, -- extra field
    PRIMARY KEY (`card_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

You can add additional fields to the table as needed.
For example, a more complete table structure might look like this:

.. code-block:: sql

    CREATE TABLE IF NOT EXISTS `meeples` (
        `meeple_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
        `meeple_location` varchar(32) NOT NULL,
        `meeple_state` int(10),
        `type` varchar(32),
        `arg` varchar(32),
        `player_id` int(10) NULL,
        `x` int(1) NULL COMMENT '0, 1 or 2',
        `y` int(1) NULL COMMENT '0, 1 or 2',
        PRIMARY KEY (`meeple_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


Properties
~~~~~~~~~~

As for another Manager class, you will need to create a class that extends the CachedPieces class.
The CachedPieces includes properties as follows:

    - :code:`$table` (string): The name of the database table.
    - :code:`$primary` (string): The name of the primary key field. Default is 'id'.
    - :code:`$prefix` (string): the prefix for the "standard" database fields (id, location, state). Default is :code:`piece_`. In the setup example above, the prefix is :code:`card_` for the cards table and :code:`meeple_` for the meeples table.
    - :code:`$custom_fields` (array): An array of custom fields that are added to the table.
    - :code:`$autoIncrement` (boolean): Indicates whether the primary key is auto-incrementing while creating the pieces. Default is **true**.
    - :code:`$autoreshuffle` (boolean): Indicates whether the pieces are automatically reshuffled when the deck is empty. Default is **false**.
    - :code:`$autoreshuffleListener` (array): Callback to a method called when an autoreshuffle occurs. format is :code:`['obj' => object, 'method' => method_name]` Default is **null**.
    - :code:`$autoreshuffleCustom` (array): Defines custom reshuffle behavior for specific locations. format is :code:`$autoreshuffleCustom = ['deck' => 'discard'];`, where 'deck' is the location to be reshuffled and 'discard' is the location where the cards are picked from. Default is **null**.
    - :code:`$autoremovePrefix` (boolean): If true, the prefix is removed from column names when returning data. default is **true**.


Here is an example of those properties in a Cards class:

.. code-block:: php

    class Cards extends CachedPieces
    {
        protected static $table = 'cards;
        protected static $prefix = 'card_';
        protected static $autoIncrement = true;
        protected static $autoremovePrefix = true;
        protected static $autoreshuffle = true;
        protected static $autoreshuffleListener = ['obj' => 'Cards', 'method' => 'onDeckReshuffle']; // Callback to a method called when an autoreshuffle occurs
        protected static $autoreshuffleCustom = ['deck' => 'discard'];
        protected static $customFields = ['value','color'];

        public static function onDeckReshuffle($location)
        {
            // Add any game-specific logic here
        }
    }
    
.. note::

    The :code:`$autoreshuffleListener` property might need to be fixed by using :code:`call_user_func` or :code:`$obj::$method($fromLocation)` instead of :code:`$obj->$method($fromLocation)` in :code:`reformDeckFromDiscard()` method of :code:`CachedPieces`.

Casting
~~~~~~~

As for a Manager class, a :code:`cast()` method can be added to the class to cast the pieces to a specific class or format.

Two typical scenario can be encoutered:

    1. You want to cast the pieces to a specific format to add custom properties.
    2. You want to cast the pieces to a specific class to add custom methods and properties.

1. Casting to a specific format:

This is the most obvious case, where you want to add custom or computed properties to the pieces and make sure that they are always present.

For example with the Cards class, you might want to split the ``location`` field into two fields ``location`` and ``pId`` (player id):

.. code-block:: php

    class Cards extends CachedPieces
    {
        #... properties and methods
        protected static function cast($card)
        {
            $locations = explode('_', $card['location']);
            return [
            'id' => $card['id'],
            'location' => $locations[0],
            'value' => $card['value'],
            'color' => $card['color'],
            'pId' => $locations[1] ?? null,
            ];
        }
        #...
    }

2. Casting to a specific class:

This is a more advanced case where your Pieces manager will return instances of a specific class depending on some conditions.

Typical usage is a deck of cards that have specific habilities or effect on the game. You will prefer to implement a specific class for each type of card.

For example, you might have a class for each type of card (e.g., AttackCard, DefenseCard, etc.):

.. code-block:: php

    class Cards extends CachedPieces
    {
        #... properties and methods
        protected static function cast($card)
        {
            $types = ['A' => 'Pink', 'B' => 'Green', 'C' => 'Yellow', 'D' => 'Blue', 'E' => 'Red'];
            if ($card['type'] == 'AttackCard') {
                $type = $types[$card['arg'][1]];
                $class = '\FOO\Models\\AttackCards\\' . $type;
                return new $class($card);
            }
            $class = '\FED\Models\\' . ($classes[$card['type']] ?? 'DefenseCard');
            return new $class($card);
        }
        #...
    }

In this example, we have AttackCard of different types (A, B, C, D, E) that have different properties and methods.
We also have DefenseCard that is the default class for all other types of cards.
Depending on the fetched card, the cast method will return an instance of the appropriate class.

Pieces creation
~~~~~~~~~~~~~~~

This part is basically done at the game setup, where all elements of the game is created and stored in the database.

The ::code:`CachedPieces` class provides a method to createpieces in the database : :php:meth:`FOO\\Helpers\\CachedPieces\\CachedPieces::create()`

Let's have a look to it:

  .. php:staticmethod:: public static create ($pieces[, $globalLocation, $globalState, $globalId])

    :param array $pieces: An array of pieces to create. Each piece is an associative array with details of the piece.
    :param string $globalLocation: The location where the pieces are created.
      Default: ``null``
    :param int $globalState: The state of the pieces.
      Default: ``null``
    :param string $globalId: Used when auto-incrementing is disabled: Unique id for the pieces. Use ``{INDEX}`` in the string to replace it with the index of the piece.
      Default: ``null``
    :returns: array -- An array of the created pieces with their id.

The $pieces array should be an array of associative arrays, each representing a piece to be created.
Each piece can have the following fields:

    - :code:`id` (string): Optional. The unique alphanum and underscore id. Use ``{INDEX}`` in the string to replace it with the index of the piece. For example : ``'card_{INDEX}_Pink'``.
    - :code:`nbr` (int): Optional. Number of tokens with this id, optional default is 1. If nbr >1 and id does not have id with {INDEX} it will throw an exception
    - :code:`nbrStart` (int): Optional. if the indexing does not start at 0 for the auto-incrementing id
    - :code:`location` (string): Mandatory if ``$globalLocation`` is not set. The location of the piece. only alphanum and underscore.
    - :code:`state` (int): Optional. The state of the piece. if not specified and ``$token_state_global`` is not specified auto-increment is used
    - :code:`custom fields`: Any custom fields you have added to the table.

Here is an example of how to create a deck of cards:

.. code-block:: php

    $cards = [
        ['id' => 'card_{INDEX}_Pink', 'nbr' => 5, 'value' => 1, 'color' => 1],
        ['id' => 'card_{INDEX}_Green', 'nbr' => 5, 'value' => 2, 'color' => 2],
        ['id' => 'card_{INDEX}_Yellow', 'nbr' => 5, 'value' => 3, 'color' => 3],
        ['id' => 'card_{INDEX}_Blue', 'nbr' => 5, 'value' => 4, 'color' => 4],
        ['id' => 'card_{INDEX}_Red', 'nbr' => 5, 'value' => 5, 'color' => 5],
    ];

    Cards::create($cards, 'deck', 0);

This will create 25 cards in the ``deck``, with 5 cards of each color, all with state ``0``.

If you need to create a single piece, you can use the :php:meth:`FOO\\Helpers\\CachedPieces\\CachedPieces::singleCreate()` method. However, it is better practice to create all possible pieces at once during the game setup (except for rare cases).

Operations
~~~~~~~~~~

The CachedPieces class provides several operations for managing game pieces.
For the **getters**, ``$raiseExceptionIfNotEnough`` raise an exception if the piece is not found for the methods that are supposed to return piece(s).

For the shuffle and getExtremePosition methods, which are usefull for deck management, the "location" of the card in the deck is the ``state`` of the card with the "bottom" of the deck at the minimum state and the "top" of the deck at the maximum state.

Here's an overview of the main operations available:

Getters:
    - :code:`getAll(): Collection`: Retrieves all pieces.
    - :code:`get(int|string $id, bool $raiseExceptionIfNotEnough = true): mixed|Collection`: Retrieves one or multiples piece by its ID.
    - :code:`getMany(array|int $ids, bool $raiseExceptionIfNotEnough = true): Collection`: Retrieves multiple pieces by their IDs.
    - :code:`getSingle(array|int $id, bool $raiseExceptionIfNotEnough = true): mixed|null`: Retrieves a single piece by its ID. 
    - :code:`getState(array|int $id): int`: Gets the state of a piece.
    - :code:`getLocation(array|int $id); string`: Gets the location of a piece.
    - :code:`getExtremePosition(bool $getMax, string $location,?int $id): int`: Gets the extreme (max or min) state of pieces in a location. can be filtered by id.
    - :code:`getTopOf(string $location, int $n = 1, bool $returnValueIfOnlyOneRow = true)`: Gets the top n pieces from a location.
    - :code:`getInLocation(string|array $location, ?int $state, ?array $orderBy): Collection`: Gets pieces in a specific location and optionally with a specific state. If the location is an array, it is imploded using underscores
    - :code:`getInLocationOrdered(string $location, ?mixed $state): Collection`: Gets the pieces in a specific location in an ascending manner by state.
    - :code:`countInLocation(string $location, ?mixed $state): int`: Counts pieces in a location (filtered by state if provided).


Setters:
    - :code:`setState(int $id, int $state): array`: Sets the state of a piece.
    - :code:`move(int|array ids, string location, ?int state)`: Moves piece(s) to a new location and optionally sets a new state.
    - :code:`moveAllInLocation(string $fromLocation, string $toLocation, ?mixed $fromState, int $toState=0): mixed`: Moves all pieces from one location to another.
    - :code:`moveAllInLocationKeepState(string $fromLocation, string $toLocation): void`: Moves all pieces keeping their original state.

.. warning::

    The :code:`moveAllInLocation` method will move all pieces from one location to another and reset their state to 0 (or specified value)
    If you need to move pieces with a specific state, you should use the :code:`moveAllInLocationKeepState` method.


Deck Operations:
    - :code:`pickForLocation(int $nbr, string $fromLocation, string $toLocation, int $state=0, bool $deckReform=true): Collection`: Picks pieces from one location and moves them to another.
    - :code:`pickOneForLocation(string $fromLocation, string $toLocation, int $state = 0, bool $deckReform = true): mixed`: Picks one item from the given location and moves it to another location.
    - :code:`reformDeckFromDiscard(string $fromLocation)`: Reforms a deck from a discard pile. Uses the autoreshuffleCustom property if defined.
    - :code:`shuffle(string $location)`: Shuffles pieces in a location.


Positioning:
    - :code:`insertAt($id, string $location, int $state = 0): void`: Inserts a piece at a specific position in a location.
    - :code:`insertOnTop($id, string $location): void`: Inserts a piece on top of a location.
    - :code:`insertAtBottom($id, string $location): void`: Inserts a piece at the bottom of a location.


Creation and Destruction:
    - :code:`create(array $pieces, ?mixed $globalLocation = null, ?mixed $globalState = null, ?mixed $globalId = null): array`: Creates new pieces. See `Pieces creation`_.
    - :code:`singleCreate(string $token): mixed`: Creates a single piece.
    - :code:`destroy(ids)`: Destroys (removes) pieces.


UI data
~~~~~~~

As for all managers, the CachedPieces can implements generic methods to get data for the UI : :hoverxref:`getUiData<manager_getUiData>` 

For example:

.. code-block:: php

    public static function getUiData()
    {
        return self::getAll()
            ->filter(fn($meeple) => $meeple->getLocation() != 'box' && $meeple->getLocation() != 'DISCARD')
            ->toArray();
    }

This method will return all pieces that are not in the box or discard pile.