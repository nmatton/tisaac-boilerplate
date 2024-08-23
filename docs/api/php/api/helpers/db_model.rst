DB_Model
========

:Qualified name: ``FOO\Helpers\DB_Model``

.. php:class:: DB_Model

  .. php:method:: public __call ($method, $args)

    :param $method:
    :param $args:

  .. php:method:: public __construct ($row)

    Fill in class attributes based on DB entry

    :param $row:

  .. php:method:: public getStaticData ()


  .. php:method:: public getUiData () -> array

    Returns an array of all attributes and their values, including static attributes, for UI data.

    :returns: array -- An array of all attributes and their values, including static attributes, for UI data.

  .. php:method:: public jsonSerialize ()

    Return an array of attributes


  .. php:method:: private DB ()

    Private DB call


  .. php:method:: private getPrimaryFieldValue ()

    Get the DB primary row according to attributes mapping (property $this->primary in child class)


