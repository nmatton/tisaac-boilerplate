<?php

namespace FOO\States;

use FOO\Core\Notifications;
use FOO\Helpers\Utils;
use FOO\Managers\Cards;
use FOO\Managers\Players;
use FOO\Core\Globals;

trait PlayerTurnTrait
{
  public function stPlayerTurn() {}

  public function argPlayerTurn()
  {
    return [
      'cardPlayed' => []
    ];
  }

  public function actPlayCard($cardId, $side)
  {
    //** sanity checks
    // check that the action is allowed
    self::checkAction('actPlayCard');
    // get card
    $card = Cards::getById($cardId);
    $card->placeOnBoard($side);

    // notify the player that the card has been placed
    $currentPlayer = Players::getCurrent();
    Notifications::cardPlaced($currentPlayer, $card, $side);
    // set card placed in globals
    Globals::setCardPlaced(true);
  }
}
