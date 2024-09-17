Utils module
============

The ``Utils`` class serves as a collection of static utility methods that perform common operations or provide helper functions for various tasks in the game.
The Utils class is typically used in other classes and game logic files when you need to perform common operations.
You can call its methods directly without instantiating the class, as they are all static methods :

.. code-block:: php

    Utils::methodName($args);

The key methods implemented in this boilerplate are:

    - Error Handling: It provides methods for throwing exceptions and terminating game execution.
    - Array Manipulation: Several methods for working with arrays, including filtering, random selection, and searching.
    - Game-specific Helpers: Methods for handling resources and formatting strings.
    - Miscellaneous Helpers: Methods for waiting, positioning objects, and performing animations.

Check this page for a complete list of methods and their usage : :hoverxref:`here<api-php-helpers-utils>`