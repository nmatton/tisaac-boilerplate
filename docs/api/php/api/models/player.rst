Player
======

:Qualified name: ``FOO\Models\Player``
:Extends: :class:`DB_Model`

.. php:class:: Player

  .. php:method:: public __call ($method, $args)

    :param $method:
    :param $args:

  .. php:method:: public __construct ($row)

    Fill in class attributes based on DB entry

    :param $row:

  .. php:method:: public getCards ()


  .. php:method:: public getId ()


  .. php:method:: public getPref ($prefId)

    :param $prefId:

  .. php:method:: public getStaticData ()


  .. php:method:: public getUiData () -> array

    Returns an array of all attributes and their values, including static attributes, for UI data.

    :returns: array -- An array of all attributes and their values, including static attributes, for UI data.

  .. php:method:: public jsonSerialize ([])

    :param $currentPlayerId:
      Default: ``null``

