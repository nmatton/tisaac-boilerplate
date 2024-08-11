<?php

namespace FOO\Core;

use FOO\Managers\Players;
use FOO\Helpers\Utils;
use FOO\Core\Globals;

class Notifications
{

  /*****************************
   **** GAME SPECIFIC METHODS ****
   ******************************/

  /* Example */
  public static function playerAction($currentPlayer, $task)
  {
    $data = array_merge($task, [
      'player' => $currentPlayer,
      'task' => $task->getId(),
      'task_name' => $task->getTitle(),
    ]);
    $data['i18n'] = ['task_name'];
    $msg = clienttranslate('${player_name} did the task ${task_name}');
    self::notifyAll('playerAction', $msg, $data);
  }
  /*************************
   **** GENERIC METHODS ****
   *************************/
  protected static function notifyAll($name, $msg, $data)
  {
    self::updateArgs($data);
    Game::get()->notifyAllPlayers($name, $msg, $data);
  }

  protected static function notify($player, $name, $msg, $data)
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::updateArgs($data);
    Game::get()->notifyPlayer($pId, $name, $msg, $data);
  }

  public static function message($txt, $args = [])
  {
    self::notifyAll('message', $txt, $args);
  }

  public static function messageTo($player, $txt, $args = [])
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::notify($pId, 'message', $txt, $args);
  }

  /*********************
   **** UPDATE ARGS ****
   *********************/
  /*
   * Automatically adds some standard field about player and/or card to the args
   * (to avoid having to do it manually in each notification)
   * example : 
   * when you want to use the ${player_name} variable in a notification, you can just pass the player object in the args and use it in the message like this :
   * 
   * $data = ['player' => $currentPlayer,...]
   * $msg = clienttranslate('${player_name} do action Y');
   * self::notifyAll('playerAction', $msg, $data);
   * 
   * You can do the same for many other purposes and update the args in this function (examples with card and task are commented)
   * 
   */
  protected static function updateArgs(&$args)
  {
    if (isset($args['player'])) {
      $args['player_name'] = $args['player']->getName();
      $args['player_id'] = $args['player']->getId();
      unset($args['player']);
    }
    // if (isset($args['card'])) {
    //   $c = isset($args['card']) ? $args['card'] : $args['task'];
    //
    //   $args['value'] = $c['value'];
    //   $args['value_symbol'] = $c['value']; // The substitution will be done in JS format_string_recursive function
    //   $args['color'] = $c['color'];
    //   $args['color_symbol'] = $c['color']; // The substitution will be done in JS format_string_recursive function
    // }

    // if (isset($args['task'])) {
    //   $c = $args['task'];
    //   $args['task_desc'] = $c->getText();
    //   $args['i18n'][] = 'task_desc';
    //
    //   if (isset($args['player_id'])) {
    //     $args['task'] = $args['task']->jsonSerialize($args['task']->getPId() == $args['player_id']);
    //   }
    // }
  }
}
