Pieces
======

:Qualified name: ``FOO\Helpers\Pieces``
:Extends: :class:`DB_Manager`

.. php:class:: Pieces

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

  .. php:staticmethod:: public static DB ([])

    :param $table:
      Default: ``null``

  .. php:staticmethod:: public static checkId (& $id[, $like])

    :param & $id:
    :param $like:
      Default: ``false``

  .. php:staticmethod:: public static checkIdArray ($arr)

    :param $arr:

  .. php:staticmethod:: public static checkLocation (& $location[, $like])

    :param & $location:
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

  .. php:staticmethod:: public static create ($pieces[, $globalLocation, $globalState, $globalId]) -> array

    Creates a new piece.
This method inserts new records in the database. Generically speaking you should only be calling during setup with some rare exceptions.
Pieces is an array with at least the following fields: [ [ "id" => <unique id> // This unique alphanum and underscore id, use {INDEX} to replace with index if 'nbr' > 1, i..e "meeple_{INDEX}_red" "nbr" => <nbr> // Number of tokens with this id, optional default is 1. If nbr >1 and id does not have {INDEX} it will throw an exception "nbrStart" => <nbr> // Optional, if the indexing does not start at 0 "location" => <location> // Optional argument specifies the location, alphanum and underscore "state" => <state> // Optional argument specifies integer state, if not specified and $token_state_global is not specified auto-increment is used

    :param $pieces:
    :param $globalLocation:
      Default: ``null``
    :param $globalState:
      Default: ``null``
    :param $globalId:
      Default: ``null``
    :returns: array -- The created pieces ids

  .. php:staticmethod:: public static get ($id[, $raiseExceptionIfNotEnough])

    Retrieves a piece by its ID.

    :param $id:
    :param $raiseExceptionIfNotEnough:
      Default: ``true``
    :returns: mixed|Collection The retrieved piece if only one is found, or an collection of pieces if multiple are found.

  .. php:staticmethod:: public static getAll ()

    Get all the pieces


  .. php:staticmethod:: public static getExtremePosition ($getMax, $location[, $id]) -> mixed

    Retrieves the extreme position based on the given parameters.

    :param $getMax:
    :param $location:
    :param $id:
      Default: ``null``
    :returns: mixed -- The extreme position value.

  .. php:staticmethod:: public static getInLocation ($location[, $state, $orderBy])

    Retrieves pieces in a specific location.

    :param $location:
    :param $state:
      Default: ``null``
    :param $orderBy:
      Default: ``null``
    :returns: Collection The restulting pieces as a collection

  .. php:staticmethod:: public static getInLocationOrdered ($location[, $state])

    Retrieves the items in a specific location in an ascending manner.

    :param $location:
    :param $state:
      Default: ``null``
    :returns: Collection The items in the specified location.

  .. php:staticmethod:: public static getInLocationQ ($location[, $state, $orderBy])

    Retrieves the query object for a (set of) piece in a specific location.

    :param $location:
    :param $state:
      Default: ``null``
    :param $orderBy:
      Default: ``null``
    :returns: QueryBuilder The query builder object.

  .. php:staticmethod:: public static getLocation ($id) -> mixed

    Retrieves the location for a given ID.

    :param $id:
    :returns: mixed -- The location associated with the given ID.

  .. php:staticmethod:: public static getMany ($ids[, $raiseExceptionIfNotEnough])

    Retrieves multiple pieces by their IDs.

    :param $ids:
    :param $raiseExceptionIfNotEnough:
      Default: ``true``
    :returns: Collection The retrieved pieces.

  .. php:staticmethod:: public static getSelectQuery ()

    Return the basic select query fetching basic fields and custom fields

    :returns: QueryBuilder The query builder object.

  .. php:staticmethod:: public static getSelectWhere ([])

    Append the basic select query with a where clause Retrieves a select query with optional WHERE conditions.

    :param $id:
      Default: ``null``
    :param $location:
      Default: ``null``
    :param $state:
      Default: ``null``
    :returns: QueryBuilder The query builder object.

  .. php:staticmethod:: public static getSingle ($id[, $raiseExceptionIfNotEnough]) -> mixed

    Retrieves a single piece by its ID. If multiple pieces are found with the same ID, it returns null.

    :param $id:
    :param $raiseExceptionIfNotEnough:
      Default: ``true``
    :returns: mixed -- The retrieved piece if found, or null if not found.

  .. php:staticmethod:: public static getState ($id) -> mixed

    Retrieves the state for a given ID.

    :param $id:
    :returns: mixed -- The state corresponding to the given ID.

  .. php:staticmethod:: public static getTopOf ($location[, $n, $returnValueIfOnlyOneRow]) -> mixed

    Retrieves the top Pieces from a specified location.

    :param $location:
    :param $n:
      Default: ``1``
    :param $returnValueIfOnlyOneRow:
      Default: ``true``
    :returns: mixed -- The top rows from the specified location.

  .. php:staticmethod:: public static getUpdateQuery ([])

    Retrieves the update query for the specified IDs, location, and state.

    :param $ids:
      Default: ``[]``
    :param $location:
      Default: ``null``
    :param $state:
      Default: ``null``
    :returns: QueryBuilder The query builder object.

  .. php:staticmethod:: public static insertAt ($id, $location[, $state])

    Inserts a piece at a specific location. Used to move a card to a specific location where card are ordered. If location_arg place is already taken, increment all tokens after location_arg in order to insert new card at this precise location

    :param $id:
    :param $location:
    :param $state:
      Default: ``0``

  .. php:staticmethod:: public static insertAtBottom ($id, $location)

    Inserts a piece at the bottom of a location.

    :param $id:
    :param $location:
    :returns: void

  .. php:staticmethod:: public static insertOnTop ($id, $location)

    Inserts an element on top of a given location.

    :param $id:
    :param $location:
    :returns: void

  .. php:staticmethod:: public static move ($ids, $location[, $state]) -> array

    Moves one (or many) pieces to the given location with an given state.

    :param $ids:
    :param $location:
    :param $state:
      Default: ``0``
    :returns: array -- 

  .. php:staticmethod:: public static moveAllInLocation ($fromLocation, $toLocation[, $fromState, $toState]) -> mixed

    Moves all pieces from one location to another. !!! state is reset to 0 or specified value !!! if "fromLocation" and "fromState" are null: move ALL cards to specific location

    :param $fromLocation:
    :param $toLocation:
    :param $fromState:
      Default: ``null``
    :param $toState:
      Default: ``0``
    :returns: mixed -- 

  .. php:staticmethod:: public static moveAllInLocationKeepState ($fromLocation, $toLocation)

    Moves all pieces in a given location to another location while keeping their state.

    :param $fromLocation:
    :param $toLocation:
    :returns: void

  .. php:staticmethod:: public static pickForLocation ($nbr, $fromLocation, $toLocation[, $state, $deckReform])

    Pick the first "$nbr" pieces on top of specified deck and place it in target location Return pieces infos or void array if no card in the specified location

    :param $nbr:
    :param $fromLocation:
    :param $toLocation:
    :param $state:
      Default: ``0``
    :param $deckReform:
      Default: ``true``
    :returns: mixed|array pieces infos or void array if no card in the specified location

  .. php:staticmethod:: public static pickOneForLocation ($fromLocation, $toLocation[, $state, $deckReform]) -> mixed

    Picks one item from the given location and moves it to another location.

    :param $fromLocation:
    :param $toLocation:
    :param $state:
      Default: ``0``
    :param $deckReform:
      Default: ``true``
    :returns: mixed -- The picked item.

  .. php:staticmethod:: public static reformDeckFromDiscard ($fromLocation)

    Reform a location from another location when enmpty

    :param $fromLocation:
    :returns: void

  .. php:staticmethod:: public static setState ($id, $state) -> array

    Set the state of a specific ID.

    :param $id:
    :param $state:
    :returns: array -- 

  .. php:staticmethod:: public static shuffle ($location)

    Shuffle pieces of a specified location, result of the operation will changes state of the piece to be a position after shuffling

    :param $location:
    :returns: void

