<?php

namespace FOO\States;

use FOO\Helpers\Log;
use FOO\Managers\Players;
use FOO\Core\Notifications;
use FOO\Core\Globals;
use FOO\Managers\Cards;
use FOO\Managers\Tiles;

trait ConfirmUndoTrait
{
    public function addCheckpoint($state)
    {
        Globals::setChoices(0);
        Log::checkpoint($state);
    }

    public function addStep()
    {
        $stepId = Log::step($this->gamestate->state_id());
        Notifications::newUndoableStep(Players::getCurrent(), $stepId);
        Globals::incChoices();
    }

    function stConfirmChoices()
    {
        $this->gamestate->nextState('');
    }

    public function argsConfirmTurn()
    {
        $data = [
            'previousSteps' => Log::getUndoableSteps(),
            'previousChoices' => Globals::getChoices(),
        ];
        return $data;
    }

    public function stConfirmTurn()
    {
        $player = Players::getActive();
        if (Globals::getChoices() == 0 || $player->getPref(OPTION_CONFIRM) == OPTION_CONFIRM_DISABLED) {
            $this->actConfirmTurn(true);
        }
    }

    public function actConfirmTurn($auto = false)
    {
        if (!$auto) {
            self::checkAction('actConfirmTurn');
        }
        // you might want to add some game-specific logic here like preparation for the next turn

        $this->gamestate->nextState('confirm');
    }


    public function actRestart()
    {
        self::checkAction('actRestart');
        Log::undoTurn();
    }

    public function actUndoToStep($stepId)
    {
        self::checkAction('actRestart');
        Log::undoToStep($stepId);
    }
}
