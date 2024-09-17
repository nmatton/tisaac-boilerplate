Log Module
==========


The Log class is a crucial component for managing game state changes and enabling undo functionality.
It's designed to record changes in the database, allowing the game to revert to previous states when needed.
Associated methods are available to revert changes, replay logs, and manage log entries.

Key Features:

    1. Logging database changes
    2. Creating checkpoints
    3. Undoing actions
    4. Managing game turns

.. note::

    The current Log class only work for single active player states. It does not support multi-active player states natively but you can extended to support it ;)
    However, game flows that switch between multiple active players can still use the Log class by disabling logging during the multi-active players states.

Setup
-----

In order to record the games changes, the Log class wil need to be linked to a specific database table.

Those lines needs to be present in the ``dbmodel.sql`` file (already present in the boilerplate code):

.. code-block:: sql

    CREATE TABLE IF NOT EXISTS `log` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `move_id` int(10) NOT NULL,
    `table` varchar(32) NOT NULL,
    `primary` varchar(32) NOT NULL,
    `type` varchar(32) NOT NULL,
    `affected` JSON,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ALTER TABLE `gamelog` ADD `cancel` TINYINT(1) NOT NULL DEFAULT 0;

the Log class uses a GameState Label and is initialized at the game class constructor.

.. code-block:: php

    self::initGameStateLabels([
      'logging' => 10,
      # ... other game state labels
    ]);

As the setup of a game includes a lot of setup, therefore, you need to enable the logging only once everything is set up and first player will play.

In the setupNewGame method, you can enable the logging by setting the game state to ``true``.

.. code-block:: php

    $this->setGameStateInitialValue('logging', true);

You are ready to start logging the game state changes !

Overview
--------

This diagram shows the complete logic of the Log class and Undo mechanism.
Its purpose is to give you a high-level overview and a visual way to facilitate understanding of the Undo, described in the following sections.

.. note::

    You can zoom/pan the diagram to see more details.

.. mermaid:: LogSeqDiagram.mmd
    :zoom: 0.8

Here's a high-level description:


    - The concept of ``checkpoint`` refers to a step in the game flow that cannot be reverted.
    - Each time a player takes an action, a ``step`` is added to the log, allowing the game to revert to a previous state.
    - The Log class records all changes to the database, including ``checkpoints`` and ``steps``. The latters are "special" entries in the table that serves to identify the key points where the DB needs/can to be "reverted".
    - Notifications are sent to the UI to give information of the undoable steps (``newUndoableStep``), usefull to add a "Undo Last Step" button, and to refresh the UI with the "reverted" state (``refreshUI``).
    - All DB updates needs to pass by the Manager class (ultimately using the QueryBuilder class) to be logged by the Log class.
    


Usage
-----

With their default properties, the DB_Models and DB_Managers (including Pieces) have the logging process enabled.
It means that any change to the database (update, insert, deletion) will be logged for potential undo.

.. warning::

    If you plan to use the Log Module, all database interactions should be done through the DB_Models, DB_Managers, Pieces or ultimately the QueryBuilder class.
    Otherwise, the changes will not be logged and the undo functionality will not work. (or you need to manually log the changes)

In order to work with the Log class, the following elements are added to the game structure (included in the boilerplate code):

    1. **Confirmation states**: Two game states (``confirmChoices`` and ``confirmTurn``) are added to ``states.inc.php``.
    2. **ConfirmUndoTrait.php**: A trait that adds the arg and st method for the confirmation states and two methods for logging steps and checkpoints.
    3. **Notifications**: A set of notifications to pass information to the front-end.
    4. **JS helpers**: A set of JavaScript functions to handle the confirmation states, manage log entries and updates the game User Inteface.


Confirmation States
~~~~~~~~~~~~~~~~~~~

Two game states are added to the game states list in ``states.inc.php``:

    - ``confirmChoices``: A confirmation state for the player to confirm their choices to allow step by step undo. This step is skipped if the player has no choice to make. For example, when some private information were revealed or if it is a single action turn.
    - ``confirmTurn``: A confirmation state for the player to confirm their turn.

Associated actions related to these states are ``actConfirmTurn`` and ``actRestart``.

Let's see how  to work with these actions.

ConfirmUndoTrait.php
~~~~~~~~~~~~~~~~~~~~

The ConfirmUndoTrait.php includes the main logic that can be reused in your game logic.
It includes the arg and st methods for the confirmation states and two methods for logging steps and checkpoints:

        - ``addCheckpoint(?int $state)``: Creates a new checkpoint. A checkpoint is a state that cannot be reverted, for example after that some secret information are revealed.
        - ``addStep()``: Logs a step to allow undo step-by-step.

.. note::

    Add a ``addCheckpoint()`` every time that actions cannot be undone. It includes at the start of a player turn !

The ``addCheckpoint`` method takes an optionnal parameter that is the current state of the game (the id of the state defined in ``states.inc.php``), but it is not actually really used in the current boilerplate implementation.

Typical usage of the ``addStep()`` is to use it everytime that a player makes a choice (takes an action). Important to note that the ``addStep()`` method needs to be called **before** that any changes to DB related to that action is made.
Best practice is to call it at the start of the action method, right after the ``checkAction`` method, if you have one.


Notifications
~~~~~~~~~~~~~

Several notification are added to the boilerplate to handle the undo feature. However, only two of them requires your attention as they needs to be updated with some game-specific logic.

    - ``refreshUI($datas)``: Notifies the UI with the new game state. It typically takes the ``getAllDatas()`` results as parameter then filter out the actual data needed for the UI before sending it.
    - ``refreshHand($player, $hand)``: Same as ``refreshUI($datas)`` but for private data. For example, if a player play a card face down, the information is still secret to other players but needs to be added back to the player hand.

JS helpers
~~~~~~~~~~

Again, multiple additions are made on the JavaScript side, here are the most important ones:

    - Added buttons:
        "Restart Turn" and "Undo last step" buttons are added to the game interface if the "previousSteps" argument is present in the sate args  (and not an empty array).
        The "Restart Turn" button is only added if there are more than one step to undo. A "Confirm" button is also added.
    - Confirmation user preference : 
        Players can choose to automatically confirm their turn or with a timer.
    - Log entries:
        The log entries are automatically updated in the game interface by striking out the steps that have been undone.
    - Refresh UI: 
        The ``refreshUI`` ``refreshHand`` ntoficiation needs to be handled. **This is where you will update the game interface with the new game state.**

For the latter point, you will need to update the ``notif_refreshUI`` and ``notif_refreshHand`` methods to handle the game-specific data that needs to be updated in the game interface.
A skeleton of these method are present in the boilerplate code with some comments to help you understand what needs to be done.
It is best practice to design your "setup" method to work with an updated gamedatas object.
Typically, you will need to update the game interface with the new game state, destroy potential element added to the DOM with previous undone steps, and update counters (like player score, resources, etc.).

.. note::

    This JS-related part is not represented in the diagram

Undo Mechanism
--------------

Here are some key methods that are used to manage the undo mechanism if you want to dig deeper into the Log class:

    - ``enable()``: Enables logging functionality (same as ``$this->setGameStateInitialValue('logging', true);``).
    - ``disable()``: Disables logging functionality (same as ``$this->setGameStateInitialValue('logging', false);``).
    - ``checkpoint()``: Creates a new checkpoint. A checkpoint is a state that cannot be reverted, for example after that some secret information are revealed.
    - ``step()``: Logs a step to allow undo step-by-step.
    - ``undoTurn()``: Reverts all changes to the last checkpoint or start of turn.
    - ``undoToStep(stepId)``: Reverts to a specific step.
    - ``revertTo(id)``: Reverts all logged changes up to a specific ID (mostly for debug purpose)
    - ``addEntry($entry)``: Logs a change to the database (if you need to log a change manually).

With the above methods, you have all the tools to set to custom your undo mechanism.

