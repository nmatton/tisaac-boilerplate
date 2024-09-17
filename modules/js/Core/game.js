var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var debug = isDebug ? console.info.bind(window.console) : function () {};

/**
 * Retrieves the full matrix transformation of an element.
 * If no element is provided, returns a new identity matrix.
 *
 * @param {Element} element - The element to retrieve the matrix transformation from.
 * @returns {DOMMatrix} The full matrix transformation of the element.
 */
function getFullMatrix(element) {
  if (!element) return new DOMMatrix();
  const css = getComputedStyle(element).transform;
  const matrix = new DOMMatrix(css);
  return getFullMatrix(element.offsetParent).multiply(matrix);
}

define(['dojo', 'dojo/_base/declare', g_gamethemeurl + 'modules/js/vendor/nouislider.min.js', 'ebg/core/gamegui'], (
  dojo,
  declare,
  noUiSlider,
) => {
  return declare('customgame.game', ebg.core.gamegui, {
    /*
     * Constructor
     */
    constructor() {
      this._notifications = [];
      this._activeStates = [];
      this._connections = [];
      this._selectableNodes = [];
      this._activeStatus = null;
      this._helpMode = false;
      this._dragndropMode = false;
      this._customTooltipIdCounter = 0;
      this._registeredCustomTooltips = {};

      this._notif_uid_to_log_id = {};
      this._notif_uid_to_mobile_log_id = {};
      this._last_notif = null;
      dojo.place('loader_mask', 'overall-content', 'before');
      dojo.style('loader_mask', {
        height: '100vh',
        position: 'fixed',
      });
    },

    /**
     * Displays a message and logs it as an error if the type is 'error'.
     *
     * @param {string} msg - The message to be displayed.
     * @param {string} type - The type of the message.
     * @returns {any} - The result of calling the inherited function.
     */
    showMessage(msg, type) {
      if (type == 'error') {
        console.error(msg);
      }
      return this.inherited(arguments);
    },

    /**
     * Returns whether the game is in fast mode (meaning that animations are disabled for fast replay).
     *
     * see this blog post for more information: https://bga-devs.github.io/blog/posts/a-real-fast-replay-mode/
     *
     * @returns {boolean} True if the game is in fast mode, false otherwise.
     */
    isFastMode() {
      return this.instantaneousMode;
    },

    /**
     * Sets the mode to instantaneous.
     */
    setModeInstataneous() {
      if (this.instantaneousMode == false) {
        this.instantaneousMode = true;
        dojo.style('leftright_page_wrapper', 'display', 'none');
        dojo.style('loader_mask', 'display', 'block');
        dojo.style('loader_mask', 'opacity', 1);
      }
    },

    /**
     * Unsets the instantaneous mode.
     */
    unsetModeInstantaneous() {
      if (this.instantaneousMode) {
        this.instantaneousMode = false;
        dojo.style('leftright_page_wrapper', 'display', 'block');
        dojo.style('loader_mask', 'display', 'none');
        this.updateLayout();
      }
    },

    /**
     * [Undocumented] Override BGA framework functions to call onLoadingComplete when loading is done
     */
    setLoader(value, max) {
      this.inherited(arguments);
      if (!this.isLoadingComplete && value >= 100) {
        this.isLoadingComplete = true;
        this.onLoadingComplete();
      }
    },

    /**
     * Callback function called when loading is complete.
     */
    onLoadingComplete() {
      debug('Loading complete');
    },

    /**
     * Setup:
     */
    setup(gamedatas) {
      // Create a new div for buttons to avoid BGA auto clearing it
      dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
      dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');

      this.attachRegisteredTooltips();

      this.setupNotifications();
      this.initPreferences();
      dojo.connect(this.notifqueue, 'addToLog', () => {
        this.checkLogCancel(this._last_notif == null ? null : this._last_notif.msg.uid);
        this.addLogClass();
        this.attachRegisteredTooltips();
      });
    },

    /**
     * Detect if spectator or replay
     */
    isReadOnly() {
      return this.isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
    },

    /**
     * Make an AJAX call with automatic lock
     */
    takeAction(action, data, check = true, checkLock = true) {
      if (check && !this.checkAction(action)) return false;
      if (!check && checkLock && !this.checkLock()) return false;
      // Stop any ongoing timed button
      this.stopActionTimer();

      data = data || {};
      if (data.lock === undefined) {
        data.lock = true;
      } else if (data.lock === false) {
        delete data.lock;
      }
      return new Promise((resolve, reject) => {
        this.ajaxcall(
          '/' + this.game_name + '/' + this.game_name + '/' + action + '.html',
          data,
          this,
          (data) => resolve(data),
          (isError, message, code) => {
            if (isError) reject(message, code);
          },
        );
      });
    },

    /**
     * onEnteringState:
     * 	this method is called each time we are entering into a new game state.
     *
     * params:
     *  - str stateName : name of the state we are entering
     *  - mixed args : additional information
     */
    onEnteringState(stateName, args) {
      debug('Entering state: ' + stateName, args);
      if (this.isFastMode() && ![].includes(stateName)) return;

      if (args.args && args.args.descSuffix) {
        this.changePageTitle(args.args.descSuffix);
      }

      if (args.args && args.args.optionalAction) {
        let base = args.args.descSuffix ? args.args.descSuffix : '';
        this.changePageTitle(base + 'skippable');
      }

      if (!this._inactiveStates.includes(stateName) && !this.isCurrentPlayerActive()) return;

      // Undo last steps
      if (args.args && args.args.previousSteps) {
        args.args.previousSteps.forEach((stepId) => {
          let logEntry = $('logs').querySelector(`.log.notif_newUndoableStep[data-step="${stepId}"]`);
          if (logEntry) this.onClick(logEntry, () => this.undoToStep(stepId));

          logEntry = document.querySelector(`.chatwindowlogs_zone .log.notif_newUndoableStep[data-step="${stepId}"]`);
          if (logEntry) this.onClick(logEntry, () => this.undoToStep(stepId));
        });
      }

      // Restart turn button
      if (args.args && args.args.previousChoices && args.args.previousChoices >= 1 && !args.args.automaticAction) {
        if (args.args && args.args.previousSteps) {
          let lastStep = Math.max(...args.args.previousSteps);
          if (lastStep > 0)
            this.addDangerActionButton(
              'btnUndoLastStep',
              _('Undo last step'),
              () => this.undoToStep(lastStep),
              'restartAction',
            );
        }

        // Restart whole turn
        this.addDangerActionButton(
          'btnRestartTurn',
          _('Restart turn'),
          () => {
            this.stopActionTimer();
            this.takeAction('actRestart');
          },
          'restartAction',
        );
      }

      // Call appropriate method
      var methodName = 'onEnteringState' + stateName.charAt(0).toUpperCase() + stateName.slice(1);
      if (this[methodName] !== undefined) this[methodName](args.args);
    },

    onAddingNewUndoableStepToLog(notif) {
      if (!$(`log_${notif.logId}`)) return;
      let stepId = notif.msg.args.stepId;
      $(`log_${notif.logId}`).dataset.step = stepId;
      if ($(`dockedlog_${notif.mobileLogId}`)) $(`dockedlog_${notif.mobileLogId}`).dataset.step = stepId;

      if (
        this.gamedatas &&
        this.gamedatas.gamestate &&
        this.gamedatas.gamestate.args &&
        this.gamedatas.gamestate.args.previousSteps &&
        this.gamedatas.gamestate.args.previousSteps.includes(parseInt(stepId))
      ) {
        this.onClick($(`log_${notif.logId}`), () => this.undoToStep(stepId));

        if ($(`dockedlog_${notif.mobileLogId}`))
          this.onClick($(`dockedlog_${notif.mobileLogId}`), () => this.undoToStep(stepId));
      }
    },

    onEnteringStateConfirmTurn(args) {
      this.addPrimaryActionButton('btnConfirmTurn', _('Confirm'), () => {
        this.stopActionTimer();
        this.takeAction('actConfirmTurn');
      });

      const OPTION_CONFIRM = 103;
      let n = args.previousChoices;
      let timer = Math.min(10 + 2 * n, 20);
      this.startActionTimer('btnConfirmTurn', timer, this.prefs[OPTION_CONFIRM].value);
    },

    undoToStep(stepId) {
      this.stopActionTimer();
      this.checkAction('actRestart');
      this.takeAction('actUndoToStep', { stepId }, false);
    },

    notif_clearTurn(n) {
      debug('Notif: restarting turn', n);
      this.cancelLogs(n.args.notifIds);
    },

    notif_refreshUI(n) {
      debug('Notif: refreshing UI', n);
      ['meeples', 'players', 'cards', 'tiles'].forEach((value) => {
        // update the array to your needs
        this.gamedatas[value] = n.args.datas[value];
      });

      // call the setup function to update the UI
      //this.setupCards();
      //this.setupMeeples();
      //this.setupTiles();

      // destroy potential element added to the DOM with previous undone steps
      if (this.gamedatas.optionCardsVisibility == 0) {
        document.querySelectorAll('.completed-orders .foo-card.back-card').forEach((oCard) => {
          this.destroy(oCard);
        });
      }

      // reset counters and other player specific UI elements
      this.forEachPlayer((player) => {
        let pId = player.id;
        this.scoreCtrl[pId].toValue(player.score);
        /*
        this._counters[pId].worker.toValue(player.workers);
        this._counters[pId].money.toValue(player.money);

        $(`playerpanel-${player.id}`).dataset.y = player.resLevel;

        if (this.gamedatas.optionCardsVisibility == 0 && pId != this.player_id) {
          for (let i = 0; i < player.ordersDone; i++) {
            $(`completed-orders-${player.id}`).insertAdjacentHTML(
              `beforeend`,
              `<div class="coalbaron-card back-card"><div class="coalbaron-card-inner"></div></div>`,
            );
          }
        }
        */
      });
    },

    /**
     * onLeavingState:
     * 	this method is called each time we are leaving a game state.
     *
     * params:
     *  - str stateName : name of the state we are leaving
     */
    onLeavingState(stateName) {
      debug('Leaving state: ' + stateName);
      if (this.isFastMode()) return;
      this.clearPossible();

      // Call appropriate method
      var methodName = 'onLeavingState' + stateName.charAt(0).toUpperCase() + stateName.slice(1);
      if (this[methodName] !== undefined) this[methodName]();
    },

    /**
     * Clears the title bar by removing action buttons and emptying specific elements.
     */
    clearTitleBar() {
      this.removeActionButtons();
      this.empty('customActions');
      this.empty('restartAction');
      this.empty('anytimeActions');
      $('gameaction_status').innerHTML = '';
      $('pagemaintitletext').innerHTML = '';
    },

    /**
     * Clears any pre-animation setup.
     */
    clearPreAnimation() {},

    /**
     * Clears the possible selections and resets the game state.
     */
    clearPossible() {
      this.clearTitleBar();

      this._connections.forEach(dojo.disconnect);
      this._connections = [];
      this._selectableNodes.forEach((node) => {
        if ($(node)) dojo.removeClass(node, 'selectable selected');
      });
      this._selectableNodes = [];
      dojo.query('.unselectable').removeClass('unselectable');
      dojo.query('.selected').removeClass('selected');
    },

    /**
     * Empties the specified container by removing all child nodes and closing any associated tooltips.
     *
     * @param {HTMLElement} container - The container element to be emptied.
     */
    empty(container) {
      container = $(container);
      if (!container) return;
      container.childNodes.forEach((node) => {
        if (this.tooltips[node.id]) {
          this.tooltips[node.id].close();
          delete this.tooltips[node.id];
        }
      });
      container.innerHTML = '';
    },

    /**
     * Check change of activity
     *
     *
     * @param {string} stateName
     * @param {object} args
     */
    onUpdateActionButtons(stateName, args) {
      let status = this.isCurrentPlayerActive();
      if (status != this._activeStatus) {
        debug('Update activity: ' + stateName, status);
        this._activeStatus = status;

        // Call appropriate method
        var methodName = 'onUpdateActivity' + stateName.charAt(0).toUpperCase() + stateName.slice(1);
        if (this[methodName] !== undefined) this[methodName](args, status);
      }
    },

    /*
     * setupNotifications
     */

    /**
     * Returns the visible title container element.
     *
     * @returns {HTMLElement} The visible title container element.
     */
    getVisibleTitleContainer() {
      function isVisible(elem) {
        return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
      }

      if (isVisible($('pagemaintitletext'))) {
        return $('pagemaintitletext');
      } else {
        return $('gameaction_status');
      }
    },

    /**
     * Sets up the notifications for the game.
     */
    setupNotifications() {
      console.log(this._notifications);
      this._notifications.forEach((notif) => {
        var functionName = 'notif_' + notif[0];

        let wrapper = (args) => {
          let msg = this.formatString(this.format_string_recursive(args.log, args.args));
          if (msg != '') {
            this.clearTitleBar();
            $('gameaction_status').innerHTML = msg;
            $('pagemaintitletext').innerHTML = msg;
          }
          this.clearPreAnimation();
          let timing = this[functionName](args);
          if (timing === undefined) {
            if (notif[1] === undefined) {
              console.error(
                "A notification don't have default timing and didn't send a timing as return value : " + notif[0],
              );
              return;
            }

            // Override default timing by 1 in case of fast replay mode
            timing = this.isFastMode() ? 0 : notif[1];
          }

          if (timing !== null) {
            this.notifqueue.setSynchronousDuration(timing);
          }
        };

        dojo.subscribe(notif[0], this, wrapper);

        if (notif[2] != undefined) {
          this.notifqueue.setIgnoreNotificationCheck(notif[0], notif[2]);
          this.notifqueue.setSynchronous(notif[0], notif[1]); // Ignorable notif must have a default timing
        } else {
          this.notifqueue.setSynchronous(notif[0]);
        }
      });

      // Load production bug report handler
      dojo.subscribe('loadBug', this, (n) => this.notif_loadBug(n));

      this.notifqueue.setSynchronousDuration = (duration) => {
        setTimeout(() => dojo.publish('notifEnd', null), duration);
      };
    },

    /**
     * Ends the notification and sets the synchronous duration.
     * @function endNotif
     * @memberof game
     * @returns {void}
     */
    endNotif() {
      this.notifqueue.setSynchronousDuration(this.isFastMode() ? 0 : 100);
    },

    /**
     * Load production bug report handler
     */
    notif_loadBug(n) {
      let self = this;
      function fetchNextUrl() {
        var url = n.args.urls.shift();
        console.log('Fetching URL', url, '...');
        // all the calls have to be made with ajaxcall in order to add the csrf token, otherwise you'll get "Invalid session information for this action. Please try reloading the page or logging in again"
        self.ajaxcall(
          url,
          {
            lock: true,
          },
          self,
          function (success) {
            console.log('=> Success ', success);

            if (n.args.urls.length > 1) {
              fetchNextUrl();
            } else if (n.args.urls.length > 0) {
              //except the last one, clearing php cache
              url = n.args.urls.shift();
              dojo.xhrGet({
                url: url,
                headers: {
                  'X-Request-Token': bgaConfig.requestToken,
                },
                load: function (success) {
                  console.log('Success for URL', url, success);
                  console.log('Done, reloading page');
                  window.location.reload();
                },
                handleAs: 'text',
                error: function (error) {
                  console.log('Error while loading : ', error);
                },
              });
            }
          },
          function (error) {
            if (error) console.log('=> Error ', error);
          },
        );
      }
      console.log('Notif: load bug', n.args);
      fetchNextUrl();
    },

    /**
     * Add a timer on an action button :
     * params:
     *  - buttonId : id of the action button
     *  - time : time before auto click
     *  - pref : 0 is disabled (auto-click), 1 if normal timer, 2 if no timer and show normal button
     */
    startActionTimer(buttonId, time, pref, autoclick = false) {
      var button = $(buttonId);
      var isReadOnly = this.isReadOnly();
      if (button == null || isReadOnly || pref == 2) {
        debug('Ignoring startActionTimer(' + buttonId + ')', 'readOnly=' + isReadOnly, 'prefValue=' + pref);
        return;
      }

      // If confirm disabled, click on button
      if (pref == 0) {
        if (autoclick) button.click();
        return;
      }

      this._actionTimerLabel = button.innerHTML;
      this._actionTimerSeconds = time;
      this._actionTimerFunction = () => {
        var button = $(buttonId);
        if (button == null) {
          this.stopActionTimer();
        } else if (this._actionTimerSeconds-- > 1) {
          button.innerHTML = this._actionTimerLabel + ' (' + this._actionTimerSeconds + ')';
        } else {
          debug('Timer ' + buttonId + ' execute');
          button.click();
          this.stopActionTimer();
        }
      };
      this._actionTimerFunction();
      this._actionTimerId = window.setInterval(this._actionTimerFunction.bind(this), 1000);
      debug('Timer #' + this._actionTimerId + ' ' + buttonId + ' start');
    },

    /**
     * Stops the action timer.
     */
    stopActionTimer() {
      if (this._actionTimerId != null) {
        debug('Timer #' + this._actionTimerId + ' stop');
        window.clearInterval(this._actionTimerId);
        delete this._actionTimerId;
      }
    },

    /**
     * Play a given sound that should be first added in the tpl file
     */
    playSound(sound, playNextMoveSound = true) {
      playSound(sound);
      playNextMoveSound && this.disableNextMoveSound();
    },

    /**
     * Resets the page title to the one define in the gamestate description/descriptionmyturn
     */
    resetPageTitle() {
      this.changePageTitle();
    },

    /**
     * Change the page title based on "description" inserted in gamestate
     *
     * @param {string} suffix
     * @param {bool} save
     * @returns void
     */
    changePageTitle(suffix = null, save = false) {
      if (suffix == null) {
        suffix = 'generic';
      }

      if (!this.gamedatas.gamestate['descriptionmyturn' + suffix]) return;

      if (save) {
        this.gamedatas.gamestate.descriptionmyturngeneric = this.gamedatas.gamestate.descriptionmyturn;
        this.gamedatas.gamestate.descriptiongeneric = this.gamedatas.gamestate.description;
      }

      this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate['descriptionmyturn' + suffix];
      if (this.gamedatas.gamestate['description' + suffix])
        this.gamedatas.gamestate.description = this.gamedatas.gamestate['description' + suffix];
      this.updatePageTitle();
    },

    /**
     * Remove non standard zoom property
     */
    onScreenWidthChange() {
      dojo.style('page-content', 'zoom', '');
      dojo.style('page-title', 'zoom', '');
      dojo.style('right-side-first-part', 'zoom', '');
    },

    /**
     * Adds a *primary* (blue/gray) action button on the action button custom zone
     *
     * It uses a custom div to avoid BGA auto clearing it on game state change
     *
     * @param {string} id - The ID of the button.
     * @param {string} text - The text to display on the button.
     * @param {Function} callback - The callback function to execute when the button is clicked.
     * @param {string} [zone='customActions'] - The zone where the button should be added. Defaults to 'customActions'.
     */
    addSecondaryActionButton(id, text, callback, zone = 'customActions') {
      if (!$(id)) this.addActionButton(id, text, callback, zone, false, 'gray');
    },

    /**
     * Adds a *Danger* (red) action button on the action button custom zone
     *
     * It uses a custom div to avoid BGA auto clearing it on game state change
     *
     * @param {string} id - The ID of the button.
     * @param {string} text - The text to display on the button.
     * @param {Function} callback - The callback function to execute when the button is clicked.
     * @param {string} [zone='customActions'] - The zone where the button should be added. Defaults to 'customActions'.
     */
    addDangerActionButton(id, text, callback, zone = 'customActions') {
      if (!$(id)) this.addActionButton(id, text, callback, zone, false, 'red');
    },

    /**
     * Clears the action buttons.
     */
    clearActionButtons() {
      dojo.empty('customActions');
    },

    /*
     * Preference polyfill
     */
    /**
     * Sets the preference value
     *
     * @param {number} number - The number of the preference.
     * @param {any} newValue - The new value for the preference.
     *
     * Note: This function might needs to be deprecated with the new BGA framework.
     */
    setPreferenceValue(number, newValue) {
      var optionSel = 'option[value="' + newValue + '"]';
      dojo
        .query(
          '#preference_control_' + number + ' > ' + optionSel + ', #preference_fontrol_' + number + ' > ' + optionSel,
        )
        .attr('selected', true);
      var select = $('preference_control_' + number);
      if (dojo.isIE) {
        select.fireEvent('onchange');
      } else {
        var event = document.createEvent('HTMLEvents');
        event.initEvent('change', false, true);
        select.dispatchEvent(event);
      }
    },

    /**
     * Initializes the preferences observer.
     *
     * @returns {void}
     *
     * Note: This function might needs to be deprecated with the new BGA framework.
     */
    initPreferencesObserver() {
      dojo.query('.preference_control, preference_fontrol').on('change', (e) => {
        var match = e.target.id.match(/^preference_[fc]ontrol_(\d+)$/);
        if (!match) {
          return;
        }
        var pref = match[1];
        var newValue = e.target.value;
        this.prefs[pref].value = newValue;
        if (this.prefs[pref].attribute) {
          $('ebd-body').setAttribute('data-' + this.prefs[pref].attribute, newValue);
        }

        $('preference_control_' + pref).value = newValue;
        if ($('preference_fontrol_' + pref)) {
          $('preference_fontrol_' + pref).value = newValue;
        }
        data = { pref: pref, lock: false, value: newValue, player: this.player_id };
        this.takeAction('actChangePref', data, false, false);
        this.onPreferenceChange(pref, newValue);
      });
    },

    /**
     * Checks the consistency of preferences.
     *
     * @param {Array} backPrefs - The array of preference information.
     *
     * Note: This function might needs to be deprecated with the new BGA framework.
     */
    checkPreferencesConsistency(backPrefs) {
      backPrefs.forEach((prefInfo) => {
        let pref = prefInfo.pref_id;
        if (this.prefs[pref] != undefined && this.prefs[pref].value != prefInfo.pref_value) {
          data = { pref: pref, lock: false, value: this.prefs[pref].value, player: this.player_id };
          this.takeAction('actChangePref', data, false, false);
        }
      });
    },

    /**
     * Handles the change of a preference.
     *
     * @param {string} pref - The preference that has changed.
     * @param {any} newValue - The new value of the preference.
     *
     *  Note: This function might needs to be deprecated with the new BGA framework.
     */
    onPreferenceChange(pref, newValue) {},

    /**
     * Initializes the preferences for the game.
     *
     * This method attaches data attributes on the overall-content div based on the preferences.
     * It also creates local preferences if the game is not read-only and there are local preferences available.
     * The method sets up preference observers and checks the consistency of preferences.
     * Finally, it calls the setupSettings method.
     *
     *  Note: This function might needs to be deprecated with the new BGA framework.
     */
    initPreferences() {
      // Attach data attribute on overall-content div
      Object.keys(this.prefs).forEach((prefId) => {
        let pref = this.prefs[prefId];
        if (pref.attribute) {
          $('ebd-body').setAttribute('data-' + pref.attribute, pref.value);
        }
      });

      if (!this.isReadOnly() && this.gamedatas.localPrefs) {
        // Create local prefs
        Object.keys(this.gamedatas.localPrefs).forEach((prefId) => {
          let pref = this.gamedatas.localPrefs[prefId];
          pref.id = prefId;
          let selectedValue = this.gamedatas.prefs.find((pref2) => pref2.pref_id == pref.id).pref_value;
          pref.value = selectedValue;
          this.prefs[prefId] = pref;
          if (pref.attribute) {
            $('ebd-body').setAttribute('data-' + pref.attribute, selectedValue);
          }
          this.place('tplPreferenceSelect', pref, 'local-prefs-container');
        });
      }

      this.initPreferencesObserver();
      if (!this.isReadOnly()) {
        this.checkPreferencesConsistency(this.gamedatas.prefs);
      }

      this.setupSettings();
    },

    /**
     * Template for a preference select element.
     *
     * @param {Object} pref - The preference object.
     * @returns {string} The rendered HTML string.
     */
    tplPreferenceSelect(pref) {
      let values = Object.keys(pref.values)
        .map(
          (val) =>
            `<option value='${val}' ${pref.value == val ? 'selected="selected"' : ''}>${_(
              pref.values[val].name,
            )}</option>`,
        )
        .join('');

      return `
        <div class="preference_choice">
          <div class="row-data row-data-large">
            <div class="row-label">${this.formatString(_(pref.name))}</div>
            <div class="row-value">
              <select id="preference_control_${
                pref.id
              }" class="preference_control game_local_preference_control" style="display: block;">
                ${values}
              </select>
            </div>
          </div>
        </div>
      `;
    },

    onPreferenceChange(pref, newValue) {},

    /************************
     ******* SETTINGS ********
     ************************/
    /**
     * Checks if the current environment is mobile.
     * @returns {boolean} True if the current environment is mobile, false otherwise.
     */
    isMobile() {
      return $('ebd-body').classList.contains('mobile_version');
    },

    /**
     * Sets up the game settings window (cog icon on top of player panels) which opens a modal with settings.
     */
    setupSettings() {
      dojo.connect($('show-settings'), 'onclick', () => this.toggleSettings());
      this.addTooltip('show-settings', '', _('Display some settings about the game.'));
      let container = $('settings-controls-container');

      if (this.getSettingsSections) {
        this._settingsSections = this.getSettingsSections();
        dojo.place(`<div id='settings-controls-header'></div><div id='settings-controls-wrapper'></div>`, container);
        Object.keys(this._settingsSections).forEach((sectionName, i) => {
          dojo.place(
            `<div id='settings-section-${sectionName}' class='settings-section'></div>`,
            'settings-controls-wrapper',
          );
          let div = dojo.place(`<div>${this._settingsSections[sectionName]}</div>`, 'settings-controls-header');
          let openSection = () => {
            dojo.query('#settings-controls-header div').removeClass('open');
            div.classList.add('open');
            dojo.query('#settings-controls-wrapper div.settings-section').removeClass('open');
            $(`settings-section-${sectionName}`).classList.add('open');
          };
          div.addEventListener('click', openSection);
          if (i == 0) {
            openSection();
          }
        });
      }

      this.settings = {};
      this._settingsConfig = this.getSettingsConfig();
      Object.keys(this._settingsConfig).forEach((settingName) => {
        let config = this._settingsConfig[settingName];
        let localContainer = container;
        if (config.section) {
          localContainer = $(`settings-section-${config.section}`);
        }

        if (config.type == 'pref') {
          if (config.local == true && this.isReadOnly()) {
            return;
          }
          // Pref type => just move the user pref around
          dojo.place($('preference_control_' + config.prefId).parentNode.parentNode, localContainer);
          return;
        }

        let suffix = settingName.charAt(0).toUpperCase() + settingName.slice(1);
        let defaultValue =
          typeof config.default === 'function' ? config.default(this.isMobile(), this.isTouchDevice) : config.default;
        let value = this.getConfig(this.game_name + suffix, defaultValue);
        this.settings[settingName] = value;

        // Slider type => create DOM and initialize noUiSlider
        if (config.type == 'slider') {
          this.place('tplSettingSlider', { desc: config.name, id: settingName }, localContainer);
          config.sliderConfig.start = [value];
          noUiSlider.create($('setting-' + settingName), config.sliderConfig);
          $('setting-' + settingName).noUiSlider.on('slide', (arg) =>
            this.changeSetting(settingName, parseInt(arg[0])),
          );
        } else if (config.type == 'multislider') {
          this.place('tplSettingSlider', { desc: config.name, id: settingName }, localContainer);
          config.sliderConfig.start = value;
          noUiSlider.create($('setting-' + settingName), config.sliderConfig);
          $('setting-' + settingName).noUiSlider.on('slide', (arg) => this.changeSetting(settingName, arg));
        }

        // Select type => create a select
        else if (config.type == 'select') {
          config.id = settingName;
          this.place('tplSettingSelect', config, localContainer);
          $('setting-' + settingName).addEventListener('change', () => {
            let newValue = $('setting-' + settingName).value;
            this.changeSetting(settingName, newValue);
            if (config.attribute) {
              $('ebd-body').setAttribute('data-' + config.attribute, newValue);
            }
          });
        }
        // Switch type => create a select
        else if (config.type == 'switch') {
          config.id = settingName;
          this.place('tplSettingSwitch', config, localContainer);
          $('setting-' + settingName).addEventListener('change', () => {
            let newValue = $('setting-' + settingName).checked ? 1 : 0;
            this.changeSetting(settingName, newValue);
            if (config.attribute) {
              $('ebd-body').setAttribute('data-' + config.attribute, newValue);
            }
          });
        }

        if (config.attribute) {
          $('ebd-body').setAttribute('data-' + config.attribute, value);
        }
        this.changeSetting(settingName, value);
      });
    },

    /**
     * Changes the value of a game setting and performs necessary actions.
     *
     * @param {string} settingName - The name of the setting to be changed.
     * @param {any} value - The new value for the setting.
     * @returns {void}
     */
    changeSetting(settingName, value) {
      let suffix = settingName.charAt(0).toUpperCase() + settingName.slice(1);
      this.settings[settingName] = value;
      localStorage.setItem(this.game_name + suffix, value);
      let methodName = 'onChange' + suffix + 'Setting';
      if (this[methodName]) {
        this[methodName](value);
      }
    },

    /**
     * Generates a setting slider HTML template.
     *
     * @param {Object} setting - The setting object.
     * @param {string} setting.id - The ID of the setting.
     * @param {string} setting.desc - The description of the setting.
     * @returns {string} The generated HTML template.
     */
    tplSettingSlider(setting) {
      return `
      <div class='row-data row-data-large' data-id='${setting.id}'>
        <div class='row-label'>${setting.desc}</div>
        <div class='row-value slider'>
          <div id="setting-${setting.id}"></div>
        </div>
      </div>
      `;
    },

    /**
     * Generates the HTML template for a setting switch.
     *
     * @param {Object} setting - The setting object.
     * @param {string} setting.id - The ID of the setting.
     * @param {string} setting.name - The name of the setting.
     * @returns {string} The HTML template for the setting switch.
     */
    tplSettingSwitch(setting) {
      return `
      <div class='row-data row-data-large row-data-switch' data-id='${setting.id}'>
        <div class='row-label'>${_(setting.name)}</div>
        <div class='row-value'>
          <label class="switch" for="setting-${setting.id}">
            <input type="checkbox" id="setting-${setting.id}" ${
        this.settings[setting.id] == 1 ? 'checked="checked"' : ''
      } />
            <div class="slider round"></div>
          </label>
        </div>
      </div>
      `;
    },

    /**
     * Generates a setting select template.
     *
     * @param {Object} setting - The setting object.
     * @returns {string} - The generated template.
     */
    tplSettingSelect(setting) {
      let values = Object.keys(setting.values)
        .map(
          (val) =>
            `<option value='${val}' ${this.settings[setting.id] == val ? 'selected="selected"' : ''}>${_(
              setting.values[val],
            )}</option>`,
        )
        .join('');

      return `
        <div class="preference_choice" data-id='${setting.id}'>
          <div class="row-data row-data-large">
            <div class="row-label">${_(setting.name)}</div>
            <div class="row-value">
              <select id="setting-${
                setting.id
              }" class="preference_control game_local_preference_control" style="display: block;">
                ${values}
              </select>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Toggles the settings modal.
     */
    toggleSettings() {
      if (!this._settingsModal) return;

      this._settingsModal.show();
      /*
      dojo.toggleClass('settings-controls-container', 'settingsControlsHidden');

      // Hacking BGA framework
      if (dojo.hasClass('ebd-body', 'mobile_version')) {
        dojo.query('.player-board').forEach((elt) => {
          if (elt.style.height != 'auto') {
            dojo.style(elt, 'min-height', elt.style.height);
            elt.style.height = 'auto';
          }
        });
      }
      */
    },

    /**
     * Calculates the scale of an element based on its transform property.
     * @param {string} id - The ID of the element.
     * @returns {number} The scale of the element.
     */
    getScale(id) {
      let transform = dojo.style(id, 'transform');
      if (transform == 'none') return 1;

      var values = transform.split('(')[1];
      values = values.split(')')[0];
      values = values.split(',');
      let a = values[0];
      let b = values[1];
      return Math.sqrt(a * a + b * b);
    },

    /**
     * Waits for a specified amount of time.
     * @param {number} n - The duration to wait in milliseconds.
     * @returns {Promise<void>} - A promise that resolves after the specified duration.
     */
    wait(n) {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), n);
      });
    },

    /**
     * Positions the given mobile object directly at the specified coordinates.
     *
     * @param {HTMLElement} mobileObj - The mobile object to be positioned.
     * @param {number} x - The x-coordinate to position the object at.
     * @param {number} y - The y-coordinate to position the object at.
     */
    positionObjectDirectly(mobileObj, x, y) {
      // do not remove this "dead" code some-how it makes difference
      dojo.style(mobileObj, 'left'); // bug? re-compute style
      // console.log("place " + x + "," + y);
      dojo.style(mobileObj, {
        left: x + 'px',
        top: y + 'px',
      });
      dojo.style(mobileObj, 'left'); // bug? re-compute style
    },

    /**
     * Wrap a node inside a flip container to trigger a flip animation before replacing with another node
     *
     * @param {HTMLElement} target - The target node to be replaced.
     * @param {HTMLElement} newNode - The new node to replace the target with.
     * @param {number} [duration=1000] - The duration of the flip animation in milliseconds.
     */
    flipAndReplace(target, newNode, duration = 1000) {
      // Fast replay mode
      if (this.isFastMode()) {
        dojo.place(newNode, target, 'replace');
        return;
      }

      return new Promise((resolve, reject) => {
        // Wrap everything inside a flip container
        let container = dojo.place(
          `<div class="flip-container flipped">
            <div class="flip-inner">
              <div class="flip-front"></div>
              <div class="flip-back"></div>
            </div>
          </div>`,
          target,
          'after',
        );
        dojo.place(target, container.querySelector('.flip-back'));
        dojo.place(newNode, container.querySelector('.flip-front'));

        // Trigget flip animation
        container.offsetWidth;
        dojo.removeClass(container, 'flipped');

        // Clean everything once it's done
        setTimeout(() => {
          dojo.place(newNode, container, 'replace');
          resolve();
        }, duration);
      });
    },

    /**
     * Return a span with a colored 'You' as HTML string
     *
     * @returns {string} - The HTML string with the colored 'You' span.
     */
    coloredYou() {
      var color = this.gamedatas.players[this.player_id].color;
      var color_bg = '';
      if (this.gamedatas.players[this.player_id] && this.gamedatas.players[this.player_id].color_back) {
        color_bg = 'background-color:#' + this.gamedatas.players[this.player_id].color_back + ';';
      }
      var you =
        '<span style="font-weight:bold;color:#' +
        color +
        ';' +
        color_bg +
        '">' +
        __('lang_mainsite', 'You') +
        '</span>';
      return you;
    },

    /**
     * Returns a colored player name.
     *
     * @param {string} name - The name of the player.
     * @returns {string} The colored player name.
     */
    coloredPlayerName(name) {
      const player = Object.values(this.gamedatas.players).find((player) => player.name == name);
      if (player == undefined) return '<!--PNS--><span class="playername">' + name + '</span><!--PNE-->';

      const color = player.color;
      const color_bg = player.color_back
        ? 'background-color:#' + this.gamedatas.players[this.player_id].color_back + ';'
        : '';
      return (
        '<!--PNS--><span class="playername" style="color:#' + color + ';' + color_bg + '">' + name + '</span><!--PNE-->'
      );
    },

    /**
     * Overwrite the BGA method to allow to more player coloration than player_name and player_name2
     *
     * @param {string} log - The log message.
     * @param {object} args - The arguments to be formatted.
     * @returns {string} The formatted string.
     */
    format_string_recursive(log, args) {
      try {
        if (log && args) {
          //          if (args.msgYou && args.player_id == this.player_id) log = args.msgYou;

          let player_keys = Object.keys(args).filter((key) => key.substr(0, 11) == 'player_name');
          player_keys.forEach((key) => {
            args[key] = this.coloredPlayerName(args[key]);
          });

          //          args.You = this.coloredYou();
        }
      } catch (e) {
        console.error(log, args, 'Exception thrown', e.stack);
      }

      return this.inherited(arguments);
    },

    /**
     * Place a template inside a container
     *
     * @param {string} tplMethodName - The name of the template method.
     * @param {object} object - The object to be passed to the template.
     * @param {string} container - The container where the template should be placed.
     * @param {string} [position=null] - The position where the template should be placed. (string refers to "replace", "last" (default), etc.; number refers to the n-th child)
     */
    place(tplMethodName, object, container, position = null) {
      if ($(container) == null) {
        console.error('Trying to place on null container', container, tplMethodName, object);
        return;
      }

      if (this[tplMethodName] == undefined) {
        console.error('Trying to create a non-existing template', tplMethodName);
        return;
      }

      return dojo.place(this[tplMethodName](object), container, position);
    },

    /**
     * Helper to work with local storage
     *
     * @param {string} value - The value to get from local storage.
     * @param {any} v - The default value to return if the value is not found in local storage.
     * @returns {any} The value from local storage or the default value.
     */
    getConfig(value, v) {
      return localStorage.getItem(value) == null || isNaN(localStorage.getItem(value))
        ? v
        : localStorage.getItem(value);
    },

    /**********************
     ****** HELP MODE ******
     **********************/
    /**
     * Toggle help mode
     */
    toggleHelpMode(b) {
      if (b) this.activateHelpMode();
      else this.desactivateHelpMode();
    },

    /**
     * Activates the help mode.
     */
    activateHelpMode() {
      this._helpMode = true;
      dojo.addClass('ebd-body', 'help-mode');
      this._displayedTooltip = null;
      document.body.addEventListener('click', this.closeCurrentTooltip.bind(this));
    },

    /**
     * Deactivates the help mode.
     */
    desactivateHelpMode() {
      this.closeCurrentTooltip();
      this._helpMode = false;
      dojo.removeClass('ebd-body', 'help-mode');
      document.body.removeEventListener('click', this.closeCurrentTooltip.bind(this));
    },

    /**
     * Closes the current tooltip.
     */
    closeCurrentTooltip() {
      if (this._showTooltipTimeout != null) clearTimeout(this._showTooltipTimeout);

      if (this._displayedTooltip == null) return;
      else {
        this._displayedTooltip.close();
        this._displayedTooltip = null;
      }
    },

    /**
     * Custom connect that keep track of all the connections
     *  and wrap clicks to make it work with help mode
     *
     * @param {HTMLElement} node - The node to connect.
     * @param {string} action - The action to connect.
     * @param {Function} callback - The callback function to execute.
     */
    connect(node, action, callback) {
      this._connections.push(dojo.connect($(node), action, callback));
    },

    /**
     * Handles the click event on a given node.
     *
     * @param {HTMLElement} node - The node to attach the click event to.
     * @param {Function} callback - The callback function to be executed on click.
     * @param {boolean} [temporary=true] - Indicates whether the click event should be temporary or not.
     * @returns {void}
     */
    onClick(node, callback, temporary = true) {
      let safeCallback = (evt) => {
        evt.stopPropagation();
        if (this.isInterfaceLocked()) return false;
        if (this._helpMode) return false;
        callback(evt);
      };

      if (temporary) {
        this.connect($(node), 'click', safeCallback);
        dojo.removeClass(node, 'unselectable');
        dojo.addClass(node, 'selectable');
        this._selectableNodes.push(node);
      } else {
        dojo.connect($(node), 'click', safeCallback);
      }
    },

    /**
     * Tooltip to work with help mode
     */
    registerCustomTooltip(html, id = null) {
      id = id || this.game_name + '-tooltipable-' + this._customTooltipIdCounter++;
      this._registeredCustomTooltips[id] = html;
      return id;
    },

    /**
     * Attaches registered tooltips to the elements.
     */
    attachRegisteredTooltips() {
      Object.keys(this._registeredCustomTooltips).forEach((id) => {
        if ($(id)) {
          this.addCustomTooltip(id, this._registeredCustomTooltips[id], { forceRecreate: true });
        }
      });
      this._registeredCustomTooltips = {};
    },

    /**
     * Adds a custom tooltip to the specified element.
     *
     * @param {string} id - The ID of the element to attach the tooltip to.
     * @param {string|Function} html - The HTML content or a function that returns the HTML content of the tooltip.
     * @param {Object} [config={}] - The configuration options for the tooltip.
     * @param {number} [config.delay=400] - The delay in milliseconds before showing the tooltip.
     * @param {boolean} [config.midSize=true] - Whether to apply the "midSizeDialog" class to the tooltip content.
     * @param {boolean} [config.forceRecreate=false] - Whether to force recreate the tooltip if it already exists.
     * @param {boolean} [config.openOnClick=false] - Whether to open the tooltip on click instead of hover.
     */
    addCustomTooltip(id, html, config = {}) {
      config = Object.assign(
        {
          delay: 400,
          midSize: true,
          forceRecreate: false,
          openOnClick: false,
        },
        config,
      );

      // Handle dynamic content out of the box
      let getContent = () => {
        let content = typeof html === 'function' ? html() : html;
        if (config.midSize) {
          content = '<div class="midSizeDialog">' + content + '</div>';
        }
        return content;
      };

      if (this.tooltips[id] && !config.forceRecreate) {
        this.tooltips[id].getContent = getContent;
        return;
      }

      let tooltip = new dijit.Tooltip({
        //        connectId: [id],
        getContent,
        position: this.defaultTooltipPosition,
        showDelay: config.delay,
      });
      this.tooltips[id] = tooltip;
      dojo.addClass(id, 'tooltipable');
      dojo.place(
        `<div class='help-marker'>
          <svg><use href="#help-marker-svg" /></svg>
        </div>`,
        id,
      );

      dojo.connect($(id), 'click', (evt) => {
        if (!this._helpMode && !config.openOnClick) {
          tooltip.close();
        } else {
          evt.stopPropagation();

          if (tooltip.state == 'SHOWING') {
            this.closeCurrentTooltip();
          } else {
            this.closeCurrentTooltip();
            tooltip.open($(id));
            this._displayedTooltip = tooltip;
          }
        }
      });

      tooltip.showTimeout = null;
      dojo.connect($(id), 'mouseenter', (evt) => {
        evt.stopPropagation();
        if (!this._helpMode && !this._dragndropMode) {
          if (this._showTooltipTimeout != null) clearTimeout(this._showTooltipTimeout);

          this._showTooltipTimeout = setTimeout(() => {
            if ($(id)) {
              tooltip.open($(id));
              this._displayedTooltip = tooltip;
            }
          }, config.delay);
        }
      });

      dojo.connect($(id), 'mouseleave', (evt) => {
        evt.stopPropagation();
        if (!this._helpMode && !this._dragndropMode) {
          tooltip.close();
          if (this._showTooltipTimeout != null) clearTimeout(this._showTooltipTimeout);
        }
      });
    },

    /**
     * Destroys the given element.
     *
     * @param {HTMLElement} elem - The element to be destroyed.
     * @returns {void}
     */
    destroy(elem) {
      if (!elem) return;

      if (this.tooltips[elem.id]) {
        this.tooltips[elem.id].destroy();
        delete this.tooltips[elem.id];
      }

      elem.remove();
    },

    /**
     * [Undocumented] Called by BGA framework on any notification message
     * Handle cancelling log messages for restart turn (Undo)
     *
     * @param {Object} msg - The notification message.
     */
    onPlaceLogOnChannel(msg) {
      var currentLogId = this.notifqueue.next_log_id;
      var currentMobileLogId = this.next_log_id;
      var res = this.inherited(arguments);
      this._notif_uid_to_log_id[msg.uid] = currentLogId;
      this._notif_uid_to_mobile_log_id[msg.uid] = currentMobileLogId;
      this._last_notif = {
        logId: currentLogId,
        mobileLogId: currentMobileLogId,
        msg,
      };
      return res;
    },

    /**
     * cancelLogs:
     *   strikes all log messages related to the given array of notif ids
     *
     * @param {Array} notifIds - The array of notification IDs to cancel.
     */
    checkLogCancel(notifId) {
      if (this.gamedatas.canceledNotifIds != null && this.gamedatas.canceledNotifIds.includes(notifId)) {
        this.cancelLogs([notifId]);
      }
    },

    /**
     * Cancels logs based on the provided notification IDs.
     *
     * @param {Array} notifIds - An array of notification IDs.
     */
    cancelLogs(notifIds) {
      notifIds.forEach((uid) => {
        if (this._notif_uid_to_log_id.hasOwnProperty(uid)) {
          let logId = this._notif_uid_to_log_id[uid];
          if ($('log_' + logId)) dojo.addClass('log_' + logId, 'cancel');
        }
        if (this._notif_uid_to_mobile_log_id.hasOwnProperty(uid)) {
          let mobileLogId = this._notif_uid_to_mobile_log_id[uid];
          if ($('dockedlog_' + mobileLogId)) dojo.addClass('dockedlog_' + mobileLogId, 'cancel');
        }
      });
    },

    /**
     * Adds a log class to the element based on the last notification.
     * If the last notification is null, the function returns early.
     * The log class is determined by the type of the notification message.
     * If the type is 'history_history', the original type is used instead.
     * If an element with the log ID exists, it adds the appropriate notification class.
     * It also calls the corresponding 'onAdding<Type>ToLog' method if it exists.
     * If an element with the mobile log ID exists, it adds the appropriate notification class.
     */
    addLogClass() {
      if (this._last_notif == null) return;

      let notif = this._last_notif;
      let type = notif.msg.type;
      if (type == 'history_history') type = notif.msg.args.originalType;

      if ($('log_' + notif.logId)) {
        dojo.addClass('log_' + notif.logId, 'notif_' + type);

        var methodName = 'onAdding' + type.charAt(0).toUpperCase() + type.slice(1) + 'ToLog';
        if (this[methodName] !== undefined) this[methodName](notif);
      }
      if ($('dockedlog_' + notif.mobileLogId)) {
        dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
      }
    },

    /**
     * Own counter implementation that works with replay
     *
     * @param {string} id - The ID of the counter.
     * @param {number} [defaultValue=0] - The default value of the counter.
     * @param {string} [linked=null] - The ID of the linked counter.
     */
    createCounter(id, defaultValue = 0, linked = null) {
      if (!$(id)) {
        console.error('Counter : element does not exist', id);
        return null;
      }

      let game = this;
      let o = {
        span: $(id),
        linked: linked ? $(linked) : null,
        targetValue: 0,
        currentValue: 0,
        speed: 100,
        getValue() {
          return this.targetValue;
        },
        setValue(n) {
          this.currentValue = +n;
          this.targetValue = +n;
          this.span.innerHTML = +n;
          this.span.dataset.counter = +n;
          if (this.linked) this.linked.innerHTML = +n;
        },
        toValue(n) {
          if (game.isFastMode()) {
            this.setValue(n);
            return;
          }

          this.targetValue = +n;
          if (this.currentValue != n) {
            this.span.classList.add('counter_in_progress');
            setTimeout(() => this.makeCounterProgress(), this.speed);
          }
        },
        goTo(n, anim) {
          if (anim) this.toValue(n);
          else this.setValue(n);
        },
        incValue(n) {
          let m = +n;
          this.toValue(this.targetValue + m);
        },
        makeCounterProgress() {
          if (this.currentValue == this.targetValue) {
            setTimeout(() => this.span.classList.remove('counter_in_progress'), this.speed);
            return;
          }

          let step = Math.ceil(Math.abs(this.targetValue - this.currentValue) / 5);
          this.currentValue += (this.currentValue < this.targetValue ? 1 : -1) * step;
          this.span.innerHTML = this.currentValue;
          this.span.dataset.counter = this.currentValue;
          if (this.linked) this.linked.innerHTML = this.currentValue;
          setTimeout(() => this.makeCounterProgress(), this.speed);
        },
      };
      o.setValue(defaultValue);
      return o;
    },

    /****************
     ***** UTILS *****
     ****************/
    /**
     * Iterates over each player in the game and executes the provided callback function.
     *
     * @param {Function} callback - The callback function to be executed for each player.
     */
    forEachPlayer(callback) {
      Object.values(this.gamedatas.players).forEach(callback);
    },

    /**
     * Retrieves the arguments of the current game state.
     *
     * @returns {any} The arguments of the current game state.
     */
    getArgs() {
      return this.gamedatas.gamestate.args;
    },

    /**
     * Sets the client state with the given name, description, and arguments.
     *
     * @param {string} name - The name of the client state.
     * @param {string} description - The description of the client state.
     * @param {any[]} args - The arguments of the client state.
     */
    clientState(name, descriptionmyturn, args) {
      this.setClientState(name, {
        descriptionmyturn,
        args,
      });
    },

    /**
     * Replaces placeholders in a string with corresponding values.
     *
     * @param {string} str - The string containing placeholders.
     * @param {Object} subst - The object containing key-value pairs to replace the placeholders.
     * @returns {string} - The modified string with placeholders replaced.
     */
    strReplace(str, subst) {
      return dojo.string.substitute(str, subst);
    },

    /**
     * Adds a cancel state button.
     *
     * @param {string} [text=null] - The text to display on the button. If not provided, the default text "Cancel" will be used.
     * @returns {void}
     */
    addCancelStateBtn(text = null) {
      if (text == null) {
        text = _('Cancel');
      }

      this.addSecondaryActionButton('btnCancel', text, () => this.clearClientState(), 'restartAction');
    },

    /**
     * Clears the client state by restoring the server game state.
     */
    clearClientState() {
      //this.clearPossible();
      this.restoreServerGameState();
    },

    /**
     * use the BGA framework "format_string_recursive" method to translate a string or object.
     *
     * @param {string|object} t - The string or object to be translated.
     * @returns {string} The translated string.
     */
    translate(t) {
      if (typeof t === 'object') {
        return this.format_string_recursive(_(t.log), t.args);
      } else {
        return this.format_string_recursive(_(t), {});
      }
    },

    /**
     * Formats a string recursively.
     *
     * @param {string} log - The string to format.
     * @param {any[]} args - The arguments to replace in the string.
     * @returns {string} The formatted string.
     */
    fsr(log, args) {
      return this.format_string_recursive(log, args);
    },

    /**
     * Handles the selection of elements based on the provided options.
     *
     * @param {Object} options - The configuration options for the selection.
     * @param {Array} options.elements - The elements to be selected from.
     * @param {number} options.n - The number of elements to be selected.
     * @param {boolean} options.autoConfirm - Determines if the selection should be automatically confirmed.
     * @param {string} options.confirmText - The text for the confirm button.
     * @param {boolean} options.confirmBtn - Determines if the confirm button should be displayed.
     * @param {string} options.cancelText - The text for the cancel button.
     * @param {boolean} options.cancelBtn - Determines if the cancel button should be displayed.
     * @param {Function} options.callback - The callback function to be executed when the selection is confirmed.
     * @param {Function} options.updateCallback - The callback function to be executed when the selection is updated.
     * @param {boolean} options.upTo - Determines if the selection can be up to the specified number.
     * @param {boolean} options.canPass - Determines if a pass action button should be displayed.
     * @param {Function} options.passCallback - The callback function to be executed when the pass action button is clicked.
     * @param {string} options.btnContainer - The ID of the container element for the action buttons.
     * @param {string} options.class - The CSS class to be applied to the selected elements.
     * @param {Array} options.preselectedElements - The elements that are preselected.
     */
    onSelectN(options) {
      let config = Object.assign(
        {
          elements: [],
          n: 0,
          autoConfirm: false,
          confirmText: _('Confirm'),
          confirmBtn: true,
          cancelText: _('Cancel'),
          cancelBtn: true,
          callback: null,
          updateCallback: null,
          upTo: false,
          canPass: false,
          passCallback: null,
          btnContainer: 'customActions',
          class: '',
          preselectedElements: null,
        },
        options,
      );

      let elemIds = Object.keys(config.elements);
      let selectedElements = config.preselectedElements ? [...config.preselectedElements] : [];
      let updateStatus = () => {
        if ($('btnConfirmChoice')) $('btnConfirmChoice').remove();
        if (
          ((config.upTo === false && selectedElements.length == config.n) ||
            (config.upTo === true && selectedElements.length <= config.n)) &&
          config.confirmBtn
        ) {
          let otherElems = elemIds.filter((id) => !selectedElements.includes(id));
          if (config.autoConfirm) {
            config.callback(selectedElements, otherElems);
            return;
          } else {
            this.addPrimaryActionButton(
              'btnConfirmChoice',
              config.confirmText,
              () => config.callback(selectedElements, otherElems),
              config.btnContainer,
            );
          }
        }

        if ($('btnCancelChoice')) $('btnCancelChoice').remove();
        if (selectedElements.length > 0 && config.cancelBtn) {
          this.addSecondaryActionButton(
            'btnCancelChoice',
            _('Cancel'),
            () => {
              selectedElements = [];
              updateStatus();
            },
            config.btnContainer,
          );
        }

        elemIds.forEach((id) => {
          let elt = config.elements[id];
          let selected = selectedElements.includes(id);
          elt.classList.toggle('selected', selected);
          if (config.class != '') elt.classList.toggle(config.class, selected);
          elt.classList.toggle('selectable', selected || selectedElements.length < config.n);
        });

        if (config.updateCallback !== null) {
          config.updateCallback(selectedElements);
        }
      };

      if ($('btnPass')) $('btnPass').remove();
      if (config.canPass) {
        this.addSecondaryActionButton('btnPass', _('Pass action'), () => config.passCallback(), config.btnContainer);
      }

      Object.keys(config.elements).forEach((id) => {
        let elt = config.elements[id];

        this.onClick(elt, () => {
          let index = selectedElements.findIndex((t) => t == id);

          if (index === -1) {
            if (selectedElements.length >= config.n) return;
            selectedElements.push(id);
          } else {
            selectedElements.splice(index, 1);
          }
          updateStatus();
        });
      });

      updateStatus();
    },

    //////////////////////////
    //  ____  _ _     _
    // / ___|| (_) __| | ___
    // \___ \| | |/ _` |/ _ \
    //  ___) | | | (_| |  __/
    // |____/|_|_|\__,_|\___|
    //////////////////////////

    // FIX PLACE ON OBJECT BGA FUNCTION SO THAT IT TAKES SCALE INTO ACCOUNT
    /**
     * Places a mobile object on a target object.
     *
     * @param {Element|string} t - The mobile object to be placed. It can be either an element or a selector string.
     * @param {Element} i - The target object on which the mobile object will be placed.
     */
    placeOnObject(t, i) {
      null === t && console.error('placeOnObject: mobile obj is null');
      null === i && console.error('placeOnObject: target obj is null');
      if ('string' == typeof t) var n = $(t);
      else n = t;
      const fullMatrix = getFullMatrix($(t));
      var o = this.disable3dIfNeeded(),
        a = dojo.position(i),
        s = dojo.position(t),
        r = dojo.style(t, 'left'),
        l = dojo.style(t, 'top'),
        d = {
          x: (a.x - s.x + (a.w - s.w) / 2) / fullMatrix.a,
          y: (a.y - s.y + (a.h - s.h) / 2) / fullMatrix.d,
        },
        c = this.getAbsRotationAngle(n.parentNode),
        h = this.vector_rotate(d, c);
      r += h.x;
      l += h.y;
      dojo.style(t, 'top', l + 'px');
      dojo.style(t, 'left', r + 'px');
      this.enable3dIfNeeded(o);
    },

    // FIX SLIDE TO OBJECT BGA FUNCTION SO THAT IT TAKES SCALE INTO ACCOUNT
    /**
     * Slides an object to a target object.
     *
     * @param {HTMLElement|string} t - The mobile object or its selector.
     * @param {HTMLElement} i - The target object.
     * @param {number} [n=500] - The duration of the slide animation in milliseconds.
     * @param {number} [o=0] - The delay before starting the slide animation in milliseconds.
     * @returns {dojo.Animation} - The slide animation.
     */
    slideToObject(t, i, n, o) {
      null === t && console.error('slideToObject: mobile obj is null');
      null === i && console.error('slideToObject: target obj is null');
      if ('string' == typeof t) var a = $(t);
      else a = t;
      var s = this.disable3dIfNeeded(),
        r = dojo.position(i),
        l = dojo.position(t);
      void 0 === n && (n = 500);
      void 0 === o && (o = 0);
      if (this.instantaneousMode) {
        o = Math.min(1, o);
        n = Math.min(1, n);
      }
      const fullMatrix = getFullMatrix($(t));
      var d = dojo.style(t, 'left'),
        c = dojo.style(t, 'top'),
        h = {
          x: (r.x - l.x + (r.w - l.w) / 2) / fullMatrix.a,
          y: (r.y - l.y + (r.h - l.h) / 2) / fullMatrix.d,
        },
        u = this.getAbsRotationAngle(a.parentNode),
        p = this.vector_rotate(h, u);
      d += p.x;
      c += p.y;
      this.enable3dIfNeeded(s);
      var m = dojo.fx.slideTo({
        node: t,
        top: c,
        left: d,
        delay: o,
        duration: n,
        unit: 'px',
      });
      null !== s && (m = this.transformSlideAnimTo3d(m, a, n, o, p.x, p.y));
      return m;
    },

    // CHANGE PARENT ALLOWS TO CHANGE AN OBJECT ATTACH WITHOUT CHANGING ITS POS
    /**
     * Moves the specified mobile object to a new parent element and updates its position.
     *
     * @param {string|HTMLElement} mobile - The mobile object to be moved. Can be either a string representing the ID of the element or the element itself.
     * @param {string|HTMLElement} new_parent - The new parent element where the mobile object will be attached. Can be either a string representing the ID of the element or the element itself.
     * @param {string} [relation='last'] - The relation of the mobile object to the new parent element. Defaults to 'last'.
     * @returns {Object} - The updated box object containing the left, top, width, and height properties of the mobile object.
     */
    changeParent(mobile, new_parent, relation) {
      if (mobile === null) {
        console.error('attachToNewParent: mobile obj is null');
        return;
      }
      if (new_parent === null) {
        console.error('attachToNewParent: new_parent is null');
        return;
      }
      if (typeof mobile == 'string') {
        mobile = $(mobile);
      }
      if (typeof new_parent == 'string') {
        new_parent = $(new_parent);
      }
      if (typeof relation == 'undefined') {
        relation = 'last';
      }
      var src = dojo.position(mobile);
      dojo.style(mobile, 'position', 'absolute');
      dojo.place(mobile, new_parent, relation);
      var tgt = dojo.position(mobile);
      var box = dojo.marginBox(mobile);
      var cbox = dojo.contentBox(mobile);

      const fullMatrix = getFullMatrix($(mobile));
      var left = box.l + (src.x - tgt.x) / fullMatrix.a;
      var top = box.t + (src.y - tgt.y) / fullMatrix.d;
      // var left = box.l + (src.x - tgt.x);
      // var top = box.t + (src.y - tgt.y);

      dojo.style(mobile, 'left'); // Force recompute style
      dojo.style(mobile, {
        left: left + 'px',
        top: top + 'px',
      });
      dojo.style(mobile, 'left');

      box.l += box.w - cbox.w;
      box.t += box.h - cbox.h;
      return box;
    },

    /**
     * Slides a mobile element to a target element with optional configuration options.
     *
     * @param {HTMLElement} mobileElt - The mobile element to slide.
     * @param {HTMLElement} targetElt - The target element to slide to.
     * @param {Object} options - The configuration options for the slide animation.
     * @param {number} options.duration - The duration of the slide animation in milliseconds. Default is 800.
     * @param {number} options.delay - The delay before starting the slide animation in milliseconds. Default is 0.
     * @param {boolean} options.destroy - Whether to destroy the mobile element after sliding. Default is false.
     * @param {boolean} options.attach - Whether to attach the mobile element to the target element after sliding. Default is true.
     * @param {boolean} options.changeParent - Whether to change the parent of the mobile element during sliding to avoid zIndex issue. Default is true.
     * @param {HTMLElement} options.animationParent - The parent element for the slide animation. Default is null.
     * @param {Object} options.pos - The position to slide the mobile element to. Default is null.
     * @param {string} options.className - The class name to add to the mobile element during sliding. Default is 'moving'.
     * @param {HTMLElement} options.from - The starting element for the slide animation. Default is null.
     * @param {boolean} options.clearPos - Whether to clear the position of the mobile element after sliding. Default is true.
     * @param {HTMLElement} options.beforeBrother - The sibling element to place the target element before. Default is null.
     * @param {HTMLElement} options.to - The target element to slide to. Default is null.
     * @param {boolean} options.phantom - Whether to create a phantom element during sliding. Default is true.
     * @returns {Promise} A promise that resolves when the slide animation is complete.
     */
    slide(mobileElt, targetElt, options = {}) {
      let config = Object.assign(
        {
          duration: 800,
          delay: 0,
          destroy: false,
          attach: true,
          changeParent: true, // Change parent during sliding to avoid zIndex issue
          animationParent: null,
          pos: null,
          className: 'moving',
          from: null,
          clearPos: true,
          beforeBrother: null,
          to: null,

          phantom: true,
        },
        options,
      );
      config.phantomStart = config.phantomStart || config.phantom;
      config.phantomEnd = config.phantomEnd || config.phantom;

      // Mobile elt
      mobileElt = $(mobileElt);
      let mobile = mobileElt;
      // Target elt
      targetElt = $(targetElt);
      let targetId = targetElt;
      const newParent = config.attach ? targetId : $(mobile).parentNode;

      // Handle fast mode
      if (this.isFastMode() && (config.destroy || config.clearPos)) {
        if (config.destroy) dojo.destroy(mobile);
        else dojo.place(mobile, targetElt);

        return new Promise((resolve, reject) => {
          resolve();
        });
      }

      let container = config.animationParent ? config.animationParent : 'game_play_area';

      // Handle phantom at start
      if (config.phantomStart && config.from == null) {
        mobile = dojo.clone(mobileElt);
        dojo.attr(mobile, 'id', mobileElt.id + '_animated');
        dojo.place(mobile, container);
        dojo.style(mobile, 'position', 'absolute');
        this.placeOnObject(mobile, mobileElt);
        dojo.addClass(mobileElt, 'phantom');
        config.from = mobileElt;
      }

      // Handle phantom at end
      if (config.phantomEnd) {
        targetId = dojo.clone(mobileElt);
        dojo.attr(targetId, 'id', mobileElt.id + '_afterSlide');
        dojo.addClass(targetId, 'phantom');
        if (config.beforeBrother != null) {
          dojo.place(targetId, config.beforeBrother, 'before');
        } else {
          dojo.place(targetId, targetElt);
        }
      }

      dojo.style(mobile, 'zIndex', 5000);
      dojo.addClass(mobile, config.className);
      if (config.changeParent) {
        this.changeParent(mobile, container);
        //        this.changeParent(targetId, container);
      }

      if (config.from != null) this.placeOnObject(mobile, config.from);
      return new Promise((resolve, reject) => {
        const animation =
          config.pos == null
            ? this.slideToObject(mobile, config.to || targetId, config.duration, config.delay)
            : this.slideToObjectPos(
                mobile,
                config.to || targetId,
                config.pos.x,
                config.pos.y,
                config.duration,
                config.delay,
              );

        dojo.connect(animation, 'onEnd', () => {
          dojo.style(mobile, 'zIndex', null);
          dojo.removeClass(mobile, config.className);
          if (config.phantomStart) {
            dojo.place(mobileElt, mobile, 'replace');
            dojo.removeClass(mobileElt, 'phantom');
            mobile = mobileElt;
          }
          if (config.destroy) {
            if (this.tooltips[mobile.id]) {
              this.tooltips[mobile.id].close();
              delete this.tooltips[mobile.id];
            }
            dojo.destroy(mobile);
            resolve();
            return;
          }
          if (config.changeParent || config.attach) {
            if (config.phantomEnd) dojo.place(mobile, targetId, 'replace');
            else this.changeParent(mobile, newParent);
          }
          if (config.clearPos && !config.destroy) dojo.style(mobile, { top: null, left: null, position: null });
          resolve();
        });
        animation.play();
      });
    },
  });
});
