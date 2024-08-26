import store from '@store';
import PongModel, { DEFAULT_SCENE_STATE } from './model';
import PongRenderer from './renderer';
import { Direction } from './utils';
import { defaults } from '@assets/game/pong/defaults.json'

defaults.paddle.max_position = defaults.scene.wall_distance - defaults.paddle.size / 2.
defaults.ball.reset_angle_bounds = Math.atan2(defaults.scene.paddle_distance, defaults.scene.wall_distance);
defaults.ball.reset_angle_range = 2. * defaults.ball.reset_angle_bounds - Math.PI

export default class PongController {
	#has_round_ended = true;
	#countdown_active = false;

	/** @type {PongModel} */
	#model;
	/** @type {PongRenderer} */
	#renderer;

	#simulation_enabled;

	constructor(
		/** @type {PongModel} */ model,
		/** @type {PongRenderer} */ renderer,
		/** @type {boolean} */ enable_simulation=true
	) {
		this.#model = model;
		this.#renderer = renderer;
		this.#simulation_enabled = enable_simulation;
		this.onUpdateRequested = () => {};
		this.onCountdownStart = () => {};
		this.onCountdownStop = () => {};
		this.onPlayerOneInputRequested = () => Direction.NONE;
		this.onPlayerTwoInputRequested = () => Direction.NONE;
		this.onResetRequested = () => {};
	}

	#start_countdown = () => {
		this.#countdown_active = true;
		setTimeout(
			() => {
				this.#countdown_active = false
				this.onCountdownStop();
			},
			3000
		);
		this.onCountdownStart();
	}

	start_round = () => {
		this.onResetRequested(); // TODO: needed ?
		this.#model.reset();
		this.#renderer.updateState({
			ball: this.#model.getBall(),
			paddles: [
				this.#model.getPaddle1(),
				this.#model.getPaddle2(),
			]
		});
		this.#start_countdown();
	}

	#update_paddle = (delta, id, getPaddlePosition, updatePaddlePosition) => {
		const can_move = (position) => {
			const half_padd = defaults.paddle.size / 2.;
			const limit = defaults.scene.wall_distance - half_padd;
			return (Math.abs(position) <= limit);
		}

		const direction = store.getters['pong/player_direction'](id);
		const {position, speed} = getPaddlePosition();

		position.y -= direction * speed * delta;
		if (!can_move(position.y))
			position.y = Math.sign(position.y) * defaults.paddle.max_position;
		updatePaddlePosition({position, speed});
	}

	#update_ball = (delta) => {
		// let remaining_distance = 
	}

	#handle_physics = (delta) => {
		this.#update_paddle(delta, 0, this.#model.getPaddle1, this.#model.setPaddle1);
		this.#update_paddle(delta, 1, this.#model.getPaddle2, this.#model.setPaddle2);
	}

	#render = () => {
		const state = {
			ball: this.#model.getBall(),
			paddles: [
				this.#model.getPaddle1(),
				this.#model.getPaddle2(),
			]
		};
		this.#renderer.updateState(state);
		this.#renderer.render();
	}

	step = () => {
		this.#render()
		if (this.#has_round_ended) {
			this.#has_round_ended = false;
			this.start_round()
		}
		if (this.#simulation_enabled && !this.#countdown_active) {
			this.onUpdateRequested();
			const delta = this.#model.getElapsedTime();
			this.#handle_physics(delta);
		}
	}
}