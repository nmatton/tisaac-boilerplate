========
Overview
========
This is base overview of the boilerplate.


JS module
---------

Core module
~~~~~~~~~~~

The ``Core`` module contains essential functions for the frontend, including basic animations, helper functions, and more.

Player module
~~~~~~~~~~~~~

The ``Player`` module offers functions to interact with player data, such as retrieving the player's color, name, and managing player-specific templates.

Modal module
~~~~~~~~~~~~~

The ``Modal`` module provides a modal window that can be used to display messages, confirmation dialogs, configuration panel, etc.


PHP module
----------

<Here will be added a general diagram of class used on PHP side>

description of how it's organized and the `Core` part

CachedDB_Manager
~~~~~~~~~~~~~~~~

This class is used to manage the database connection and cache the results of the queries.

QueryBuilder
~~~~~~~~~~~~

This class is used to build SQL queries in a more readable and efficient way.

CachedPiece
~~~~~~~~~~~

This class is used to manage the pieces of the game, manage storage and Casting

Collection
~~~~~~~~~~

This class is used to manage collections of objects, with methods to filter, sort, and manipulate the collection.

Log
~~~

This class is used to log the history of the game and handle a complete Undo system.
It includes a move by move and complete turn undo.
It also enables to log "checkpoints", which are undoable states of the game.

utils
~~~~~

This class is used to store utility functions that are used in the game.