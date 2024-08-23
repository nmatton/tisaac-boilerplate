Log
===

Class that allows to log DB change: useful for undo feature
Associated DB table : id int(10) unsigned NOT NULL AUTO_INCREMENT, move_id int(10), table varchar(32) NOT NULL, primary varchar(32) NOT NULL, type varchar(32) NOT NULL, affected JSON,

:Qualified name: ``FOO\Helpers\Log``

.. php:class:: Log

  .. php:method:: public checkpoint () -> int

    Create a new checkpoint : anything before that checkpoint cannot be undo (unless in studio)

    :returns: int -- 

  .. php:method:: public clearUndoableStepNotifications ([])

    Extract and remove all notifications of type 'newUndoableStep' in the gamelog

    :param $clearAll:
      Default: ``false``
    :returns: void

  .. php:method:: public disable ()

    Disables the logging functionality.


  .. php:method:: public enable ()

    Enable the logging functionality.


  .. php:method:: public getCanceledNotifIds () -> array

    Get all cancelled notifs IDs from BGA gamelog, used for styling the notifications on page reload

    :returns: array -- The notification IDs of the cancelled notifications.

  .. php:method:: public getLastCheckpoint ([]) -> mixed

    Retrieves the last checkpoint.

    :param $includeEngineStarts:
      Default: ``false``
    :returns: mixed -- The last checkpoint.

  .. php:method:: public getUndoableSteps ([]) -> mixed

    Retrieves the undoable steps.

    :param $onlyIds:
      Default: ``true``
    :returns: mixed -- Returns the undoable steps or their IDs based on the $onlyIds parameter.

  .. php:method:: public revertTo ($id)

    Revert all the logged changes up to an id

    :param $id:

  .. php:method:: public startEngine ()

    Log the start of engine to allow "restart turn"


  .. php:method:: public step () -> int

    Logs a step to allow undo step-by-step

    :returns: int -- 

  .. php:method:: public undoToStep ($stepId)

    Revert to a given step (checking first that it exists)

    :param $stepId:

  .. php:method:: public undoTurn ()

    Revert all the way to the last checkpoint or the last start of turn


  .. php:method:: protected extractNotifIds ($notifications) -> array

    Extracts the notification IDs from the given notifications.

    :param $notifications:
    :returns: array -- The extracted notification IDs.

  .. php:staticmethod:: public static addEntry ($entry)

    Add an entry

    :param $entry:

  .. php:staticmethod:: public static invalidate ()


