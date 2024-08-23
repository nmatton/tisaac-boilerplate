define(['dojo', 'dojo/_base/declare'], (dojo, declare) => {
  return declare('foogame.players', null, {
    // Utils to iterate over players array/object
    forEachPlayer(callback) {
      Object.values(this.gamedatas.players).forEach(callback);
    },

    /**
     * Retrieves the color of a player based on their player ID.
     *
     * @param {number} pId - The player ID.
     * @returns {string} The color of the player.
     */
    getPlayerColor(pId) {
      return this.gamedatas.players[pId].color;
    },

    /**
     * Sets up the players and their cards.
     */
    setupPlayers() {
      this.forEachPlayer((player) => {
        this.place('tplPlayerHand', player, 'main-container');

        player.cards.forEach((card) => {
          this.place('tplCard', card, 'player-hand-' + player.id);
          this.addCustomTooltip(`card-${card.id}`, () => {
            return _('This is a dynamic content that also support safe/help mode');
          });
        });
      });
    },

    /**
     * Generates the HTML template for a player's hand.
     *
     * @param {Object} player - The player object.
     * @param {string} player.name - The name of the player.
     * @param {string} player.color - The color of the player.
     * @param {number} player.id - The ID of the player.
     * @returns {string} The HTML template for the player's hand.
     */
    tplPlayerHand(player) {
      return `
        <div class='player-container' style='border-color:#${player.color}'>
          <div class='player-name' style='color:#${player.color}'>${player.name}</div>
          <div class='player-hand' id="player-hand-${player.id}"></div>
        </div>
      `;
    },

    /**
     * Generates a card template.
     *
     * @param {Object} card - The card object.
     * @param {number} card.id - The ID of the card.
     * @param {string} card.color - The color of the card.
     * @param {string} card.value - The value of the card.
     * @returns {string} The generated card template.
     */
    tplCard(card) {
      return `
        <div id='card-${card.id}' class='foo-card'>
          <div class='foo-card-fixed-size' data-color='${card.color}' data-value='${card.value}'></div>
        </div>
      `;
    },
  });
});
