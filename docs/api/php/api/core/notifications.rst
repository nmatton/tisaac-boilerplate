Notifications
=============

:Qualified name: ``FOO\Core\Notifications``

.. php:class:: Notifications

  .. php:staticmethod:: public static cardPlaced ($player, $card, $side[, $silent])

    :param $player:
    :param $card:
    :param $side:
    :param $silent:
      Default: ``false``

  .. php:staticmethod:: public static clearTurn ($player, $notifIds)

    :param $player:
    :param $notifIds:

  .. php:staticmethod:: public static longMessage ($txt[, $args])

    :param $txt:
    :param $args:
      Default: ``[]``

  .. php:staticmethod:: public static message ($txt[, $args])

    :param $txt:
    :param $args:
      Default: ``[]``

  .. php:staticmethod:: public static messageTo ($player, $txt[, $args])

    :param $player:
    :param $txt:
    :param $args:
      Default: ``[]``

  .. php:staticmethod:: public static newUndoableStep ($player, $stepId)

    :param $player:
    :param $stepId:

  .. php:staticmethod:: public static playerAction ($currentPlayer, $task)

    :param $currentPlayer:
    :param $task:

  .. php:staticmethod:: public static refreshHand ($player, $hand)

    :param $player:
    :param $hand:

  .. php:staticmethod:: public static refreshUI ($datas)

    :param $datas:

  .. php:staticmethod:: public static resetCache ()


  .. php:staticmethod:: public static updateIfNeeded ()


