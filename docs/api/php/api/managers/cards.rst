Cards
=====

Cards: id, value, color pId is stored as second part of the location, eg : table_2322020

:Qualified name: ``FOO\Managers\Cards``
:Extends: :class:`Pieces`

.. php:class:: Cards

  .. php:method:: public getFiltered ($pId[, $location, $type])

    Retrieves filtered data based on the provided parameters.

    :param $pId:
    :param $location:
      Default: ``null``
    :param $type:
      Default: ``null``
    :returns: Collection The filtered data.

  .. php:method:: public getFilteredQuery ($pId[, $location, $type])

    Retrieves a filtered query based on the provided parameters. Many times the DB scheme has a pId and a type extra field, this allow for a shortcut for a query for these case

    :param $pId:
    :param $location:
      Default: ``null``
    :param $type:
      Default: ``null``
    :returns: QueryBuilder The query builder object.

  .. php:method:: public singleCreate ($token) -> int

    Creates a single piece using the provided token.

    :param $token:
    :returns: int -- The ID of the created piece.

  .. php:staticmethod:: public static getById ($id)

    Returns the card with the given ID

    :param $id:

  .. php:staticmethod:: public static getOfPlayer ($pId)

    getOfPlayer: return the cards in the hand of given player

    :param $pId:

  .. php:staticmethod:: public static setupNewGame ($players, $options)

    setupNewGame: create the deck of cards

    :param $players:
    :param $options:

