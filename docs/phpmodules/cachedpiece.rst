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


Usage
-----

As for another Manager class, you will need to create a class that extends the CachedPieces class.
The CachedPieces includes properties as follows:

    - :code:`$table` (string): The name of the database table.
    - :code:`$primary` (string): The name of the primary key field. Default is 'id'.
    - :code:`$prefix` (string): the prefix for the "standard" database fields (id, location, state). Default is :code:`piece_`. In the example above, the prefix is :code:`card_` for the cards table and :code:`meeple_` for the meeples table.
    - :code:`$custom_fields` (array): An array of custom fields that are added to the table.
    - :code:`$autoIncrement` (boolean): Indicates whether the primary key is auto-incrementing while creating the pieces. Default is **true**.
    - :code:`$autoreshuffle` (boolean): Indicates whether the pieces are automatically reshuffled when the deck is empty. Default is **false**.
    - :code:`$autoreshuffleListener` (array): Callback to a method called when an autoreshuffle occurs. format is :code:`['obj' => object, 'method' => method_name]` Default is **null**.
    - :code:`$autoreshuffleCustom ` (array): Defines custom reshuffle behavior for specific locations. format is :code:`$autoreshuffleCustom = ['deck' => 'discard'];`, where 'deck' is the location to be reshuffled and 'discard' is the location where the cards are picked from. Default is **null**.
    - :code:`$autoremovePrefix` (boolean): If true, the prefix is removed from column names when returning data. default is **true**.


Here is an example:

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

