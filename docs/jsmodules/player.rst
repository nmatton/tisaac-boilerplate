player module
=============

The Players module refers the the ``Players.js`` file in the ``js`` directory of your game.

This is a suggestion of code organization to gather all the player-related functions in a single file.
You can add other files next to the ``Players.js`` file for your other game components.

This file is included in your ``foogame.js`` file like other componnents.

Extract of the ``foogame.js`` file:

.. code-block:: js

    define([
        'dojo',
        'dojo/_base/declare',
        g_gamethemeurl + 'modules/js/vendor/nouislider.min.js',
        'ebg/core/gamegui',
        'ebg/counter',
        g_gamethemeurl + 'modules/js/Core/game.js', 
        g_gamethemeurl + 'modules/js/Core/modal.js',
        g_gamethemeurl + 'modules/js/Players.js', // <= this is the current module
    ], function (dojo, declare, noUiSlider) {


The Players module typically includes the ``setupPlayers`` function and HTML templates for the player specific elements.