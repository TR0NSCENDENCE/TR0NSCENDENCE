import asyncio
import json
import math

from asgiref.sync import async_to_sync, sync_to_async
from users.models import User
from autobahn.exception import Disconnected
from random import random

from ..models import GameInstance
from .settings import DEFAULTS
from .player import Player, Side
from .ball import Ball

CLOSE_CODE_ERROR = 3000
CLOSE_CODE_OK = 3001

TICK_RATE = 75
PULLING_RATE = 10

class GameState():

    # Attributes:
    #   instance: GameInstance
    #   finished: Boolean
    #   has_round_ended: Boolean
    #   players: tuple[Player, Player]
    #   ball: Ball

    def __init__(self, instance: GameInstance):
        self.__instance = instance
        self.__finished = False
        self.__has_round_ended = False
        self.__players = [ Player(Side.ONE), Player(Side.TWO) ]
        self.__ball = Ball()
        self.__reset_game_state()

    def player_connect(self, player: User, consumer):
        if self.__instance.player_one == player:
            self.__players[0].connect(player, consumer)
        if self.__instance.player_two == player:
            self.__players[1].connect(player, consumer)

    def player_disconnect(self, player: User):
        if self.__instance.player_one == player:
            self.__players[0].disconnect()
        if self.__instance.player_two == player:
            self.__players[1].disconnect()

    async def player_receive_json(self, consumer, json_data):
        for player in self.__players:
            if player.is_consumer(consumer):
                player.receive(json_data)

    async def __players_send_json(self, data):
        try:
            for player in self.__players:
                if player.is_connected():
                    await player.send(data)
        except Disconnected:
            pass

    def __players_connected(self):
        return all(player.is_connected() for player in self.__players)

    def __running(self):
        return self.__players_connected() and not self.__finished

    def __instance_ingame(self):
        self.__log('In-game !')
        self.__instance.state = 'IG'
        self.__instance.save()

    def __instance_finished(self):
        self.__log('Game finished !')
        self.__instance.state = 'FD'
        self.__instance.save()

    def __instance_winner(self, player: User):
        self.__log(f'Winner: {player.username}' if player else 'Tie')
        self.__instance.winner = player
        self.__instance.player_one_score = self.__players[0].get_score()
        self.__instance.player_two_score = self.__players[1].get_score()
        self.__instance.save()
        async_to_sync(self.__players_send_json)({
            'type': 'winner',
            'winner_id': player.pk if player else -1
        })

    async def __close_consumers(self, close_code=None):
        for player in self.__players:
            if player.is_connected():
                await player.close_consumer(close_code)

    #==========================================================================#
    # Pure game logic
    #==========================================================================#

    def __log(self, *args):
        RED = '\033[0;31m'
        BLUE = '\033[0;34m'
        RESET = '\033[0m'
        message = f'{RED}[{BLUE}GI#{self.__instance.uuid}{RED}]{RESET}'
        print(message, *args)

    async def __wait_for_players(self):
        self.__log("Waiting for player to connect...")
        while not self.__players_connected():
            await asyncio.sleep(1. / PULLING_RATE)

    async def __update_consumers(self):
        await self.__players_send_json({
            'type': 'sync',
            'state': {
                'ball': self.__ball.as_json(),
                'paddle_1': self.__players[0].as_json(),
                'paddle_2': self.__players[1].as_json()
            }
        })

    async def __update_score(self):
        await self.__players_send_json({
            'type': 'score',
            'scores': {
                'p1': self.__players[0].get_score(),
                'p2': self.__players[1].get_score()
            }
        })

    async def __counter(self):
        await self.__players_send_json({'type': 'counter_start'})
        await asyncio.sleep(3)
        await self.__players_send_json({'type': 'counter_stop'})

    def __reset_game_state(self, loser_id=1):
        for player in self.__players:
            player.reset()
        self.__ball.reset(loser_id)

    def __round_end(self, loser_id):
        winner_player = self.__players[1 - loser_id]
        winner_player.increase_score()
        if winner_player.get_score() == DEFAULTS['game']['win_score']:
            self.__winner = winner_player.get_user()
            self.__finished = True
        else:
            self.__has_round_ended = True

    def __handle_physics(self):
        def on_lose(loser_id):
            self.__round_end(loser_id)
            self.__reset_game_state(loser_id)

        for player in self.__players:
            player.update_position()
        self.__ball.update(self.__players, on_lose)

    async def __logic(self):
        self.__handle_physics()
        await self.__update_consumers()
        if self.__has_round_ended:
            self.__has_round_ended = False
            await self.__update_score()
            await self.__counter()
        else:
            await asyncio.sleep(1. / TICK_RATE)

    async def game_loop(self):
        await self.__wait_for_players()
        await sync_to_async(self.__instance_ingame)()
        await self.__counter()
        while self.__running():
            await self.__logic()
        if not self.__finished:
            # If the game ended before one of the players won,
            # the winner is:
            #   - The last one connected
            #   - If no one is left, the one with the highest score
            #   - If they also have the same score, it's a tie
            diff = self.__players[0].get_score() - self.__players[1].get_score()
            winner_player =                                             \
                self.__players[0] if self.__players[0].is_connected() else  \
                self.__players[1] if self.__players[1].is_connected() else  \
                self.__players[0] if diff > 0 else                          \
                self.__players[1] if diff < 0 else                          \
                None
            self.__winner = winner_player.get_user() if winner_player else None
        await sync_to_async(self.__instance_winner)(self.__winner)
        await sync_to_async(self.__instance_finished)()
        await self.__close_consumers(CLOSE_CODE_OK)
