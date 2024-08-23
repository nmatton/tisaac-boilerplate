Players
=======

:Qualified name: ``FOO\Managers\Players``
:Extends: :class:`CachedDB_Manager`

.. php:class:: Players

  .. php:staticmethod:: public static activeNext () -> int

    This activate next player

    :returns: int -- The ID of the next player

  .. php:staticmethod:: public static changeActive ($pId)

    This allow to change active player

    :param $pId:
    :returns: void

  .. php:staticmethod:: public static count () -> int

    Return the number of players

    :returns: int -- The number of players

  .. php:staticmethod:: public static get ([])

    Returns the Player object for the given player ID

    :param $id:
      Default: ``null``
    :returns: \FOO\Models\Player The player object.

  .. php:staticmethod:: public static getActive ()

    Returns the Player object for the active player

    :returns: \FOO\Models\Player The player object.

  .. php:staticmethod:: public static getActiveId () -> int

    Retrieves the active ID of the player.

    :returns: int -- The active ID of the player.

  .. php:staticmethod:: public static getCurrent ()

    Returns the Player object for the current player Remind to not use this method in multiactive state.

    :returns: \FOO\Models\Player The player object.

  .. php:staticmethod:: public static getCurrentId () -> int

    Retrieves the current ID of the player. Remind to not use this method in multiactive state.

    :returns: int -- The current ID of the player.

  .. php:staticmethod:: public static getNextId ($player) -> int

    Retrieves the next ID for a player.

    :param $player:
    :returns: int -- The ID for the next player.

  .. php:staticmethod:: public static getPrevId ($player) -> int

    Retrieves the previous ID for a player.

    :param $player:
    :returns: int -- The ID for the previous player.

  .. php:staticmethod:: public static getUiData ($pId)

    getUiData : get all ui data of all players

    :param $pId:
    :returns: Collection The ui data of all players as a collection

  .. php:staticmethod:: public static setupNewGame ($players, $options)

    Call this method at game setup from foogame.game.php

    :param $players:
    :param $options:
    :returns: void

