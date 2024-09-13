CachedPieces
============

:Qualified name: ``FOO\Helpers\CachedPieces``
:Extends: :class:`DB_Manager`

.. php:namespace:: FOO\Helpers\CachedPieces
.. php:class:: CachedPieces

  .. php:staticmethod:: public static DB ([])

    :param $table:
      Default: ``null``

  .. php:staticmethod:: public static checkId (&$id[, $like])

    :param &$id:
    :param $like:
      Default: ``false``

  .. php:staticmethod:: public static checkIdArray ($arr)

    :param $arr:

  .. php:staticmethod:: public static checkLocation (&$location[, $like])

    :param &$location:
    :param $like:
      Default: ``false``

  .. php:staticmethod:: public static checkPosInt ($n)

    :param $n:

  .. php:staticmethod:: public static checkState ($state[, $canBeNull])

    :param $state:
    :param $canBeNull:
      Default: ``false``

  .. php:staticmethod:: public static countInLocation ($location[, $state]) -> int

    Counts the number of items in a specific location.

    :param $location:
    :param $state:
      Default: ``null``
    :returns: int -- The number of items in the specified location.

  .. php:method:: public static create ($pieces[, $globalLocation, $globalState, $globalId])

    :param $pieces:
    :param $globalLocation:
      Default: ``null``
    :param $globalState:
      Default: ``null``
    :param $globalId:
      Default: ``null``

  .. php:staticmethod:: public static destroy ($ids)

    :param $ids:

  .. php:staticmethod:: public static fetchIfNeeded ()


  .. php:staticmethod:: public static get ($id[, $raiseExceptionIfNotEnough])

    Retrieves a piece by its ID.

    :param $id:
    :param $raiseExceptionIfNotEnough:
      Default: ``true``
    :returns: mixed|Collection The retrieved piece if only one is found, or a Collection of pieces if multiple are found.

  .. php:staticmethod:: public static getAll ()

    Get all the pieces


  .. php:staticmethod:: public static getExtremePosition ($getMax, $location) -> mixed

    Retrieves the extreme position based on the given parameters.

    :param $getMax:
    :param $location:
    :returns: mixed -- The extreme position value.

  .. php:staticmethod:: public static getFiltered ($pId[, $location, $type])

    Retrieves filtered data based on the provided parameters.

    :param $pId:
    :param $location:
      Default: ``null``
    :param $type:
      Default: ``null``
    :returns: Collection The filtered data.

  .. php:staticmethod:: public static getInLocation ($location[, $state])

    Return all pieces in specific location note: if "order by" is used, result object is NOT indexed by ids

    :param $location:
    :param $state:
      Default: ``null``
    :returns: Collection The pieces in the specified location.

  .. php:staticmethod:: public static getInLocationOrdered ($location[, $state])

    Retrieves the items in a specific location in an ascending manner.

    :param $location:
    :param $state:
      Default: ``null``
    :returns: Collection The items in the specified location.

  .. php:staticmethod:: public static getMany ($ids[, $raiseExceptionIfNotEnough])

    Retrieves multiple pieces by their IDs.

    :param $ids:
    :param $raiseExceptionIfNotEnough:
      Default: ``true``
    :returns: Collection The retrieved pieces.

  .. php:staticmethod:: public static getSelectQuery ()


  .. php:staticmethod:: public static getSelectWhere ([])

    :param $id:
      Default: ``null``
    :param $location:
      Default: ``null``
    :param $state:
      Default: ``null``

  .. php:staticmethod:: public static getSingle ($id[, $raiseExceptionIfNotEnough]) -> mixed

    Retrieves a single piece by its ID. If multiple pieces are found with the same ID, it returns null.

    :param $id:
    :param $raiseExceptionIfNotEnough:
      Default: ``true``
    :returns: mixed -- The retrieved piece if found, or null if not found.

  .. php:staticmethod:: public static getTopOf ($location[, $n]) -> mixed

    Retrieves the top Pieces from a specified location.

    :param $location:
    :param $n:
      Default: ``1``
    :returns: mixed -- The top rows from the specified location.

  .. php:staticmethod:: public static insertAtBottom ($id, $location)

    :param $id:
    :param $location:

  .. php:staticmethod:: public static insertOnTop ($id, $location)

    :param $id:
    :param $location:

  .. php:staticmethod:: public static invalidate ()


  .. php:staticmethod:: public static move ($ids, $location[, $state])

    :param $ids:
    :param $location:
    :param $state:
      Default: ``0``

  .. php:staticmethod:: public static moveAllInLocation ($fromLocation, $toLocation[, $fromState, $toState])

    :param $fromLocation:
    :param $toLocation:
    :param $fromState:
      Default: ``null``
    :param $toState:
      Default: ``0``

  .. php:staticmethod:: public static moveAllInLocationKeepState ($fromLocation, $toLocation)

    Move all pieces from a location to another location arg stays with the same value

    :param $fromLocation:
    :param $toLocation:

  .. php:staticmethod:: public static pickForLocation ($nbr, $fromLocation, $toLocation[, $state, $deckReform])

    :param $nbr:
    :param $fromLocation:
    :param $toLocation:
    :param $state:
      Default: ``0``
    :param $deckReform:
      Default: ``true``

  .. php:staticmethod:: public static pickOneForLocation ($fromLocation, $toLocation[, $state, $deckReform])

    :param $fromLocation:
    :param $toLocation:
    :param $state:
      Default: ``0``
    :param $deckReform:
      Default: ``true``

  .. php:staticmethod:: public static reformDeckFromDiscard ($fromLocation)

    :param $fromLocation:

  .. php:staticmethod:: public static setState ($id, $state)

    :param $id:
    :param $state:

  .. php:staticmethod:: public static shuffle ($location)

    :param $location:

  .. php:staticmethod:: public static singleCreate ($token)

    :param $token:

  .. php:staticmethod:: public static where ($field, $value)

    :param $field:
    :param $value:

