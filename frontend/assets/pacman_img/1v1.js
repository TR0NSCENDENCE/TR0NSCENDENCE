import pipeVertical from '@assets/pacman_img/pipeVertical.png';
import pipeConnectorBottom from '@assets/pacman_img/pipeConnectorBottom.png';
import pipeConnectorTop from '@assets/pacman_img/pipeConnectorTop.png';
import pipeHorizontal from '@assets/pacman_img/pipeHorizontal.png';
import pipeCross from '@assets/pacman_img/pipeCross.png';
import capLeft from '@assets/pacman_img/capLeft.png';
import capRight from '@assets/pacman_img/capRight.png';
import pipeConnectorLeft from '@assets/pacman_img/pipeConnectorLeft.png';
import pipeConnectorRight from '@assets/pacman_img/pipeConnectorRight.png';
import capBottom from '@assets/pacman_img/capBottom.png';
import capTop from '@assets/pacman_img/capTop.png';
import block from '@assets/pacman_img/block.png';
import pipeCorner1 from '@assets/pacman_img/pipeCorner1.png';
import pipeCorner2 from '@assets/pacman_img/pipeCorner2.png';
import pipeCorner3 from '@assets/pacman_img/pipeCorner3.png';
import pipeCorner4 from '@assets/pacman_img/pipeCorner4.png';
import PrisonDoor from '@assets/pacman_img/PrisonDoor.png';

let textureMap = new Map();
const SPEED = 2;
const PACMAN_SPEED = 3;
const RADIUS = 18;
const PELLET_RADIUS = 4;
const BLOCK_SIZE = 42;
const GHOST_SPAWN = 8;
const PACMAN_COLOR = 'yellow';
const BLINKY_COLOR = 'red';
const BLINKY = 'BLINKY';
const PINKY_COLOR = 'pink';
const PINKY = 'PINKY';
const INKY_COLOR = 'cyan';
const INKY = 'INKY';
const CLYDE_COLOR = 'orange';
const CLYDE = 'CLYDE';
const SHATTER_COLOR = 'blue';
const PELLET_COLOR = 'white';
const PACGUM_COLOR_1 = 'black';
const PACGUM_COLOR_2 = 'white';
const PACGUM_RADIUS = 14;
const PINKY_TIME = 8 * 60;
const INKY_TIME = 14 * 60;
const CLYDE_TIME = 20 * 60;
const SCATTER = 'SCATTER';
const CHASE = 'CHASE';
const SCATTER_TIME = 10 * 60;
const CHASE_TIME = 15 * 60;
const SHATTER_TIME = 8 * 60;

let fpsInterval, then, startTime;
let canvas, ctx;

let time = 0;
let real_time = 0;
let id;
let lastKey_j1 = '';
let lastKey_j2 = '';
let score = 0;
let Pacman;
let Blinky;
let ghosts = [];
let winOrLose = 0;

const pellets = [];
const pacgums = [];
const boundaries = [];

const keys_j1 = { w: { pressed: false }, a: { pressed: false }, s: { pressed: false }, d: { pressed: false } }
const keys_j2 = { up: { pressed: false }, left: { pressed: false }, down: { pressed: false }, right: { pressed: false } }

const map = [
	['1', '-', '-', '-', '-', '-', '-', '-', '_', '-', '-', '-', '-', '-', '-', '-', '2'],
	['|', 'O', '.', '.', '.', '.', '.', '.', 'U', '.', '.', '.', '.', '.', '.', 'O', '|'],
	['|', '.', '1', '2', '.', '1', '2', '.', '.', '.', '1', '2', '.', '1', '2', '.', '|'],
	['|', '.', '4', '3', '.', '4', '+', ']', '.', '[', '+', '3', '.', '4', '3', '.', '|'],
	['|', '.', '.', '.', '.', '.', 'U', '.', '.', '.', 'U', '.', '.', '.', '.', '.', '|'],
	['|', '.', 'N', '.', 'B', '.', '.', '.', 'B', '.', '.', '.', 'B', '.', 'N', '.', '|'],
	['|', '.', '|', '.', '.', '.', 'N', '.', '.', '.', 'N', '.', '.', '.', '|', '.', '|'],
	['|', '.', '4', '-', ']', '.', '{', ']', '~', '[', '}', '.', '[', '-', '3', '.', '|'],
	['|', '.', '.', '.', '.', '.', '|', 'F', 'F', 'F', '|', '.', '.', '.', '.', '.', '|'],
	['|', '.', '1', '_', ']', '.', '4', '-', '-', '-', '3', '.', '[', '_', '2', '.', '|'],
	['|', '.', '{', '3', '.', '.', '.', '.', '.', '.', '.', '.', '.', '4', '}', '.', '|'],
	['|', '.', 'U', '.', '.', 'N', '.', 'B', '.', 'B', '.', 'N', '.', '.', 'U', '.', '|'],
	['|', '.', '.', '.', '[', '}', '.', '.', 'P', '.', '.', '{', ']', '.', '.', '.', '|'],
	['|', '.', 'N', '.', '.', '|', '.', 'N', '.', 'N', '.', '|', '.', '.', 'N', '.', '|'],
	['|', '.', '4', ']', '.', 'U', '.', 'U', '.', 'U', '.', 'U', '.', '[', '3', '.', '|'],
	['|', 'O', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'O', '|'],
	['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

class boundary {
	static width = BLOCK_SIZE;
	static height = BLOCK_SIZE;
	constructor({ position, image, symbol }) {
		this.position = position;
		this.width = BLOCK_SIZE;
		this.height = BLOCK_SIZE;
		this.image = image;
		this.symbol = symbol;
	}
	draw(ctx) { ctx.drawImage(this.image, this.position.x, this.position.y); }
}

class pacman {
	constructor({ position, velocity }) {
		this.position = position;
		this.velocity = velocity;
		this.radius = RADIUS;
		this.speed = PACMAN_SPEED;
		this.life = 3;
	}
	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
		ctx.fillStyle = PACMAN_COLOR;
		ctx.fill();
		ctx.closePath();
	}
	update() {
		this.draw(ctx);
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

class ghost {
	constructor({ position, velocity, color, name }) {
		this.position = position;
		this.velocity = velocity;
		this.radius = RADIUS;
		this.currentDir = '';
		this.collisions = [];
		this.color = color;
		this.mode = SCATTER;
		this.shatter = false;
		this.id_shatter = 0;
		this.target;
		this.scatterTime = SCATTER_TIME;
		this.chaseTime = CHASE_TIME;
		this.shatterTime = SHATTER_TIME
		this.speed = SPEED;
		this.name = name;
		this.inJail = false;
		this.start = false;
	}
	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
		if (this.shatter === true)
			ctx.fillStyle = SHATTER_COLOR;
		else
			ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}
	update() {
		this.draw(ctx);
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

class Pellet {
	constructor({ position }) {
		this.position = position;
		this.radius = PELLET_RADIUS;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
		ctx.fillStyle = PELLET_COLOR;
		ctx.fill();
		ctx.closePath();
	}
}

class Pacgum {
	constructor({ position, color }) {
		this.position = position;
		this.radius = PACGUM_RADIUS;
		this.color = color;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}
}

function createGhosts() {
	const temp_ghosts = [new ghost({ position: { x: boundary.width * GHOST_SPAWN + boundary.width / 2, y: boundary.height * (GHOST_SPAWN - 1) + boundary.height / 2 }, velocity: { x: 0, y: 0 }, color: BLINKY_COLOR, name: BLINKY }),
	new ghost({ position: { x: boundary.width * GHOST_SPAWN + boundary.width / 2, y: boundary.height * GHOST_SPAWN + boundary.height / 2 }, velocity: { x: 0, y: 0 }, color: PINKY_COLOR, name: PINKY }),
	new ghost({ position: { x: boundary.width * (GHOST_SPAWN - 1) + boundary.width / 2, y: boundary.height * GHOST_SPAWN + boundary.height / 2 }, velocity: { x: 0, y: 0 }, color: INKY_COLOR, name: INKY }),
	new ghost({ position: { x: boundary.width * (GHOST_SPAWN + 1) + boundary.width / 2, y: boundary.height * GHOST_SPAWN + boundary.height / 2 }, velocity: { x: 0, y: 0 }, color: CLYDE_COLOR, name: CLYDE })
	]
	return (temp_ghosts);
}

function createImage(src, onLoadCallback, onErrorCallback) {
	const image = new Image();

	// Gérer le cas où l'image est chargée avec succès
	image.onload = () => {
		if (onLoadCallback) onLoadCallback(image);
	};

	// Gérer les erreurs de chargement de l'image
	image.onerror = () => {
		console.error(`Failed to load image at ${src}`);
		if (onErrorCallback) onErrorCallback(image);
	};

	image.src = src;
	return image;
}

//permet d'avoir un chiffre random de 0 jusqu'au max renseigner en parametre
function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function all_ghosts_updates() {
	ghosts.forEach(ghost => {
		ghost.update();
	})
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const paddedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return `${minutes}:${paddedSeconds}`;
}

function clock() {
	time++;
	real_time++;
}

//Stock dans une map les signes et leur pass pour l'affichage de la map
function initMap(textureMap) {
	textureMap.set("|", pipeVertical);
	textureMap.set("_", pipeConnectorBottom);
	textureMap.set("*", pipeConnectorTop);
	textureMap.set("-", pipeHorizontal);
	textureMap.set("+", pipeCross);
	textureMap.set("[", capLeft);
	textureMap.set("]", capRight);
	textureMap.set("}", pipeConnectorLeft);
	textureMap.set("{", pipeConnectorRight);
	textureMap.set("U", capBottom);
	textureMap.set("N", capTop);
	textureMap.set("B", block);
	textureMap.set("1", pipeCorner1);
	textureMap.set("2", pipeCorner2);
	textureMap.set("3", pipeCorner3);
	textureMap.set("4", pipeCorner4);
	textureMap.set("~", PrisonDoor);
}

function stockMap(textureMap) {
	initMap(textureMap);

	const imagePromises = [];

	changeColorImage();
	map.forEach((row, i) => {
		row.forEach((symbol, j) => {
			if (symbol === '.') {
				pellets.push(new Pellet({
					position: { x: boundary.width * j + boundary.width / 2, y: boundary.height * i + boundary.height / 2 }
				}));
			}
			else if (symbol === 'O') {
				pacgums.push(new Pacgum({
					position: { x: boundary.width * j + boundary.width / 2, y: boundary.height * i + boundary.height / 2, color: PACGUM_COLOR_1 }
				}));
			}
			else if (symbol === 'P') {
				Pacman = new pacman({
					position: { x: boundary.width * j + boundary.width / 2, y: boundary.height * i + boundary.height / 2 },
					velocity: { x: 0, y: 0 }
				});
			}
			else if (textureMap.has(symbol)) {
				const src = textureMap.get(symbol);
				const promise = new Promise((resolve, reject) => {
					createImage(src, (image) => {
						boundaries.push(new boundary({
							position: { x: boundary.width * j, y: boundary.height * i },
							image: image,
							symbol: symbol
						}));
						resolve();
					}, reject);
				});
				imagePromises.push(promise);
			}
		});
	});
	return Promise.all(imagePromises); // Attendre que toutes les images soient chargées
}

// boundary.image = applyColorFilterToImage(boundary.image);

function getCssVariableValue(varColor) {
	const color_style = getComputedStyle(document.documentElement);
	return color_style.getPropertyValue(varColor).trim();
}

function changeColorImage() {
	const hexColor = getCssVariableValue('--mesh-color');
	boundaries.forEach((boundary) => {
		boundary.image = applyColorFilterToImage(boundary.image, hexColor);
	})
}

function applyColorFilterToImage(image, color) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	// Assurez-vous que le canvas a la même taille que l'image
	canvas.width = image.width;
	canvas.height = image.height;

	// Dessinez l'image sur le canvas
	ctx.drawImage(image, 0, 0);

	// Obtenez les données des pixels
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	// Décomposez la couleur souhaitée en ses composantes rouge, vert, bleu
	const r = parseInt(color.slice(1, 3), 16);
	const g = parseInt(color.slice(3, 5), 16);
	const b = parseInt(color.slice(5, 7), 16);

	// Parcourez chaque pixel
	for (let i = 0; i < data.length; i += 4) {
		const grayscale = data[i]; // Puisque l'image est en noir et blanc, r=g=b

		// Si le pixel n'est pas complètement blanc, appliquez la couleur
		if (grayscale > 30) {
			data[i] = r * (grayscale / 255);       // Rouge
			data[i + 1] = g * (grayscale / 255);   // Vert
			data[i + 2] = b * (grayscale / 255);   // Bleu
		}
	}

	// Mettez à jour le canvas avec les nouvelles données de pixels
	ctx.putImageData(imageData, 0, 0);

	// Retournez le canvas pour affichage
	return canvas;
}

//Affiche la map et les pellets
function affMapAndPellets() {
	boundaries.forEach((boundary) => {
		boundary.draw(ctx);
		if (collidersDetector({ circle: Pacman, rectangle: boundary })) {
			Pacman.velocity.x = 0;
			Pacman.velocity.y = 0;
		}
		if (collidersDetector({ circle: Blinky, rectangle: boundary }) && boundary.symbol !== '~') {
			Blinky.velocity.x = 0;
			Blinky.velocity.y = 0;
		}
	})

	pellets.forEach((pellet, i) => {
		pellet.draw(ctx);
		if (Math.hypot(pellet.position.x - Pacman.position.x,
			pellet.position.y - Pacman.position.y) < pellet.radius / 2 + Pacman.radius / 2) {
			pellets.splice(i, 1);
			score += 10;
		}
	})

	pacgums.forEach((pacgum, i) => {
		if ((time / 15) % 2 === 0)
			pacgum.color = PACGUM_COLOR_1;
		else if ((time / 15) % 2 === 1)
			pacgum.color = PACGUM_COLOR_2;

		pacgum.draw(ctx);
		if (Math.hypot(pacgum.position.x - Pacman.position.x,
			pacgum.position.y - Pacman.position.y) < pacgum.radius / 2 + Pacman.radius / 2) {
			pacgums.splice(i, 1);
			ghosts.forEach(ghost => {
				ghost.shatter = true;
				if (ghost.id_shatter !== 0) {
					clearTimeout(ghost.id_shatter);
					ghost.id_shatter = setTimeout(() => { ghost.shatter = false }, 7000)
				}
				ghost.id_shatter = setTimeout(() => { ghost.shatter = false, ghost.id_shatter = 0 }, 7000)
			})
		}
	})
}

//Renvoie un booleen si la case donner en parametre est en contact avec un joueur ou un ghost
function collidersDetector({ circle, rectangle }) {
	const padding = boundary.width / 2 - circle.radius - 1;
	return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
		&& circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
		&& circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
		&& circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding);
}

//Permet les mouvements du joueur et empeches le joueur de s'arreter en cours de route
function pacmanMouvement(key, x, y) {
	if (key === 'w' || key === 's') {
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];
			if (collidersDetector({ circle: { ...Pacman, velocity: { x: x, y: y } }, rectangle: boundary })) {
				Pacman.velocity.y = 0;
				return ;
			}
			else
				Pacman.velocity.y = y;
		}
	}
	if (key === 'a' || key === 'd') {
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];
			if (collidersDetector({ circle: { ...Pacman, velocity: { x: x, y: y } }, rectangle: boundary })) {
				Pacman.velocity.x = 0;
				return ;
			}
			else
				Pacman.velocity.x = x;
		}
	}
}

//Permet les mouvements du joueur et empeches le joueur de s'arreter en cours de route
function blinkyMouvement(key, x, y) {
	if (Blinky.inJail === true)
		return ;
	if (key === 'ArrowUp' || key === 'ArrowDown') {
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];
			if (boundary.symbol === '~' && key === 'ArrowUp')
			{
				Blinky.velocity.y = y;
				return ;
			}
			else if (collidersDetector({ circle: { ...Blinky, velocity: { x: x, y: y } }, rectangle: boundary })) {
				Blinky.velocity.y = 0;
				return ;
			}
			else
				Blinky.velocity.y = y;
		}
	}
	if (key === 'ArrowLeft' || key === 'ArrowRight') {
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i];
			if (collidersDetector({ circle: { ...Blinky, velocity: { x: x, y: y } }, rectangle: boundary })) {
				Blinky.velocity.x = 0;
				return ;
			}
			else
				Blinky.velocity.x = x;
		}
	}
}

//permet de detecter avec quelles cases le fantomes est en collisions
function ghostDetectCollisions(ghost, boundary) {
	if (!ghost.collisions.includes('right') && collidersDetector({ circle: { ...ghost, velocity: { x: ghost.speed, y: 0 } }, rectangle: boundary }))
		ghost.collisions.push('right');
	if (!ghost.collisions.includes('left') && collidersDetector({ circle: { ...ghost, velocity: { x: -ghost.speed, y: 0 } }, rectangle: boundary }))
		ghost.collisions.push('left');
	if (!ghost.collisions.includes('up') && collidersDetector({ circle: { ...ghost, velocity: { x: 0, y: -ghost.speed } }, rectangle: boundary }))
		if (boundary.symbol !== '~')
			ghost.collisions.push('up');
	if (!ghost.collisions.includes('down') && collidersDetector({ circle: { ...ghost, velocity: { x: 0, y: ghost.speed } }, rectangle: boundary }))
		ghost.collisions.push('down');
}

//compare le tableau des collisions avec celui des directions, permet de n'obtenir que les directions disponibles
function createAvailableDirection(ghost, directions) {
	for (let i = 0; i < directions.length; i++) {
		if (ghost.collisions.includes(directions[i])) {
			directions.splice(i, 1);
			i = -1;
		}
	}
}

//Permet d'empecher les fantomes de revenirs sur leur pas et empecher les blocages
function removePrevDirection(ghost, directions) {
	let toRemove = -1;
	if (directions.length > 1) {
		switch (ghost.currentDir) {
			case 'up':
				toRemove = directions.indexOf('down');
				break;
			case 'down':
				toRemove = directions.indexOf('up');
				break;
			case 'right':
				toRemove = directions.indexOf('left');
				break;
			case 'left':
				toRemove = directions.indexOf('right');
				break;
			default:
				break;
		}
		if (toRemove !== -1)
			directions.splice(toRemove, 1);
	}
}

//Modes de chasse de blinky, dans ce mode il predira les mouvements du joueur pour le pieger
function chaseBehaviorPinky(ghost, directions, target) {
	ghost.target = target;
	const randDir = getRandomInt(directions.length);

	if (Math.abs(ghost.target.y - ghost.position.y) < 4 * BLOCK_SIZE
		&& Math.abs(ghost.target.x - ghost.position.x) < 4 * BLOCK_SIZE) {
		if (ghost.target.y < ghost.position.y && directions.includes('up'))
			ghost.currentDir = 'up';
		else if (ghost.target.y > ghost.position.y && directions.includes('down'))
			ghost.currentDir = 'down';
		else if (ghost.target.x < ghost.position.x && directions.includes('left'))
			ghost.currentDir = 'left';
		else if (ghost.target.x > ghost.position.x && directions.includes('right'))
			ghost.currentDir = 'right';
		else
			ghost.currentDir = directions[randDir];
	}
	else {
		if (ghost.target.y - 4 * BLOCK_SIZE < ghost.position.y && directions.includes('up'))
			ghost.currentDir = 'up';
		else if (ghost.target.y + 4 * BLOCK_SIZE > ghost.position.y && directions.includes('down'))
			ghost.currentDir = 'down';
		else if (ghost.target.x - 4 * BLOCK_SIZE < ghost.position.x && directions.includes('left'))
			ghost.currentDir = 'left';
		else if (ghost.target.x + 4 * BLOCK_SIZE > ghost.position.x && directions.includes('right'))
			ghost.currentDir = 'right';
		else
			ghost.currentDir = directions[randDir];
	}
}

function chaseBehaviorInky(ghost, directions, target) {
	ghost.target = target;
	const randDir = getRandomInt(directions.length);

	if (Math.abs(ghost.target.y - ghost.position.y) < 4 * BLOCK_SIZE
		&& Math.abs(ghost.target.x - ghost.position.x) < 4 * BLOCK_SIZE) {
		if (ghost.target.y < ghost.position.y && directions.includes('up'))
			ghost.currentDir = 'up';
		else if (ghost.target.y > ghost.position.y && directions.includes('down'))
			ghost.currentDir = 'down';
		else if (ghost.target.x < ghost.position.x && directions.includes('left'))
			ghost.currentDir = 'left';
		else if (ghost.target.x > ghost.position.x && directions.includes('right'))
			ghost.currentDir = 'right';
		else
			ghost.currentDir = directions[randDir];
	}
	else
		ghost.currentDir = directions[randDir];
}

function chaseBehaviorClyde(ghost, directions, target) {
	ghost.target = target;
	const randDir = getRandomInt(directions.length);

	if (Math.abs(ghost.target.y - ghost.position.y) < 4 * BLOCK_SIZE
		&& Math.abs(ghost.target.x - ghost.position.x) < 4 * BLOCK_SIZE) {
		if (ghost.target.y > ghost.position.y && directions.includes('up'))
			ghost.currentDir = 'up';
		else if (ghost.target.y < ghost.position.y && directions.includes('down'))
			ghost.currentDir = 'down';
		else if (ghost.target.x > ghost.position.x && directions.includes('left'))
			ghost.currentDir = 'left';
		else if (ghost.target.x < ghost.position.x && directions.includes('right'))
			ghost.currentDir = 'right';
		else
			ghost.currentDir = directions[randDir];
	}
	else {
		if (ghost.target.y < ghost.position.y && directions.includes('up'))
			ghost.currentDir = 'up';
		else if (ghost.target.y > ghost.position.y && directions.includes('down'))
			ghost.currentDir = 'down';
		else if (ghost.target.x < ghost.position.x && directions.includes('left'))
			ghost.currentDir = 'left';
		else if (ghost.target.x > ghost.position.x && directions.includes('right'))
			ghost.currentDir = 'right';
		else
			ghost.currentDir = directions[randDir];
	}
}

//Modes de chasse de blinky, dans ce mode il va dans sa zone
function scatterBehavior(ghost, directions, target) {
	ghost.target = target;
	const randDir = getRandomInt(directions.length);
	if (ghost.target.y < ghost.position.y && directions.includes('up'))
		ghost.currentDir = 'up';
	else if (ghost.target.y > ghost.position.y && directions.includes('down'))
		ghost.currentDir = 'down';
	else if (ghost.target.x < ghost.position.x && directions.includes('left'))
		ghost.currentDir = 'left';
	else if (ghost.target.x > ghost.position.x && directions.includes('right'))
		ghost.currentDir = 'right';
	else
		ghost.currentDir = directions[randDir];
}

function shatterBehavior(ghost, directions) {
	const randDir = getRandomInt(directions.length);
	ghost.currentDir = directions[randDir];
}

//choix de la maniere dont le fantome vas suivre le joueur en fonction de qui il est
function chaseTarget(ghost, directions) {

	if (ghost.name === PINKY)
		chaseBehaviorPinky(ghost, directions, { x: Pacman.position.x, y: Pacman.position.y });
	else if (ghost.name === INKY)
		chaseBehaviorInky(ghost, directions, { x: Pacman.position.x, y: Pacman.position.y });
	else if (ghost.name === CLYDE)
		chaseBehaviorClyde(ghost, directions, { x: Pacman.position.x, y: Pacman.position.y });
	if (time >= ghost.chaseTime) {
		ghost.mode = SCATTER;
		ghost.scatterTime = time + SCATTER_TIME;
	}
}

//choix de la maniere dont le fantome vas faire des rondes en fonction de qui il est
function scatterTarget(ghost, directions) {
	if (ghost.name === BLINKY)
		scatterBehavior(ghost, directions, { x: 63, y: 63 });
	else if (ghost.name === PINKY)
		scatterBehavior(ghost, directions, { x: 651, y: 63 });
	else if (ghost.name === INKY)
		scatterBehavior(ghost, directions, { x: 63, y: 651 });
	else if (ghost.name === CLYDE)
		scatterBehavior(ghost, directions, { x: 651, y: 651 });
	if (time >= ghost.scatterTime) {
		ghost.mode = CHASE;
		ghost.chaseTime = time + CHASE_TIME;
	}
}

//ajoute la velocity necessaire au mouvement en fonction de leur direction choisis par le modes
function ghostMouvement(ghost) {
	switch (ghost.currentDir) {
		case 'down':
			ghost.velocity.y = ghost.speed;
			ghost.velocity.x = 0;
			break;
		case 'up':
			ghost.velocity.y = -ghost.speed;
			ghost.velocity.x = 0;
			break;
		case 'right':
			ghost.velocity.y = 0;
			ghost.velocity.x = ghost.speed;
			break;
		case 'left':
			ghost.velocity.y = 0;
			ghost.velocity.x = -ghost.speed;
			break;
		default:
			break;
	}
	ghost.collisions = [];
}

//Calcule les collisions des fantomes, cree les directions qui leurs sont disponible, choisis un mode de deplace et les deplaces en fonction
function AvailableDirectionAndGhostModes(ghost) {
	let directions = ['up', 'down', 'right', 'left'];

	boundaries.forEach(boundary => {
		ghostDetectCollisions(ghost, boundary);
	})
	createAvailableDirection(ghost, directions);
	removePrevDirection(ghost, directions);

	if (ghost.inJail === false) {
		if (ghost.mode === CHASE && ghost.shatter === false)
			chaseTarget(ghost, directions);
		else if (ghost.mode === SCATTER && ghost.shatter === false)
			scatterTarget(ghost, directions);
		else if (ghost.shatter === true)
			shatterBehavior(ghost, directions);
		ghostMouvement(ghost);
	}
}

//Centre de control des fantomes, ajoute la notion de temps pour la sortie des fantomes, et lance le processus de mouvement
function ghostControlCenter() {
	ghosts.forEach(ghost => {
		if (ghost.start === true && ghost.name !== BLINKY)
			AvailableDirectionAndGhostModes(ghost);
		else if (ghost.start === false && ghost.name !== BLINKY) {
			if (ghost.name === PINKY && time >= PINKY_TIME) {
				ghost.start = true;
				ghost.scatterTime = time + SCATTER_TIME;
			}
			else if (ghost.name === INKY && time >= INKY_TIME) {
				ghost.start = true;
				ghost.scatterTime = time + SCATTER_TIME;
			}
			else if (ghost.name === CLYDE && time >= CLYDE_TIME) {
				ghost.start = true;
				ghost.scatterTime = time + SCATTER_TIME;
			}
		}
		if (loseCondition(ghost, id) === true)
			return;
	})
}

//calcule la diff de deux positions (Pacman et un fantome) pour savoir si Pacman c'est fait toucher
function calLoseHitBox(diff) {
	if (diff >= -Pacman.radius / 2 && diff <= Pacman.radius / 2)
		return (true);
	return (false);
}

function resetForJail(ghost) {
	ghost.inJail = true;
	ghost.shatter = false;
	if (ghost.name === BLINKY)
		ghost.position = { x: boundary.width * GHOST_SPAWN + boundary.width / 2, y: boundary.height * (GHOST_SPAWN - 1) + boundary.height / 2 };
	if (ghost.name === PINKY)
		ghost.position = { x: boundary.width * GHOST_SPAWN + boundary.width / 2, y: boundary.height * GHOST_SPAWN + boundary.height / 2 };
	if (ghost.name === INKY)
		ghost.position = { x: boundary.width * (GHOST_SPAWN - 1) + boundary.width / 2, y: boundary.height * GHOST_SPAWN + boundary.height / 2 };
	if (ghost.name === CLYDE)
		ghost.position = { x: boundary.width * (GHOST_SPAWN + 1) + boundary.width / 2, y: boundary.height * GHOST_SPAWN + boundary.height / 2 };
	ghost.velocity.y = 0;
	ghost.velocity.x = 0;
	score += 30;
	setTimeout(() => { ghost.inJail = false }, 3000)
}

function pacManGotCaught() {
	ghosts.forEach(ghost => {
		ghost.start = false;
		ghost.mode = SCATTER;
		resetForJail(ghost);
	})
	time = 0;
	Pacman.position = { x: boundary.width * 8 + boundary.width / 2, y: boundary.height * 12 + boundary.height / 2 };
	pacman.velocity = { x: 0, y: 0 };
	Pacman.life -= 1;
	if (Pacman.life === 0)
		return (true);
	return (false);
}

function loseCondition(ghost, id) {
	if (calLoseHitBox(Pacman.position.y - ghost.position.y) && calLoseHitBox(Pacman.position.x - ghost.position.x) && ghost.shatter === false) {
		if (pacManGotCaught() === true) {
			cancelAnimationFrame(id);
			winOrLose = 1;
		}
		return (true);
	}
	else if (calLoseHitBox(Pacman.position.y - ghost.position.y) && calLoseHitBox(Pacman.position.x - ghost.position.x) && ghost.shatter === true)
		resetForJail(ghost);
	return (false);
}

function winCondition(id) {
	if (pellets.length === 0) {
		cancelAnimationFrame(id);
		winOrLose = 2;
		return;
	}
}

function	get_blinky()
{
	let blinky = undefined;
	ghosts.forEach(ghost => {
		if (ghost.name === BLINKY)
			blinky = ghost;
	})
	return (blinky);
}

function animate(checkWin, updateData) {
	id = requestAnimationFrame(() => animate(checkWin, updateData));
	const now = Date.now();
	const elapsed = now - then;

	if (elapsed > fpsInterval) {
		then = now - (elapsed % fpsInterval);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (keys_j1.w.pressed && lastKey_j1 === 'w')
			pacmanMouvement('w', 0, -Pacman.speed);
		else if (keys_j1.a.pressed && lastKey_j1 === 'a')
			pacmanMouvement('a', -Pacman.speed, 0);
		else if (keys_j1.s.pressed && lastKey_j1 === 's')
			pacmanMouvement('s', 0, Pacman.speed);
		else if (keys_j1.d.pressed && lastKey_j1 === 'd')
			pacmanMouvement('d', Pacman.speed, 0);

		if (keys_j2.up.pressed && lastKey_j2 === 'ArrowUp')
			blinkyMouvement('ArrowUp', 0, -SPEED);
		else if (keys_j2.left.pressed && lastKey_j2 === 'ArrowLeft')
			blinkyMouvement('ArrowLeft', -SPEED, 0);
		else if (keys_j2.down.pressed && lastKey_j2 === 'ArrowDown')
			blinkyMouvement('ArrowDown', 0, SPEED);
		else if (keys_j2.right.pressed && lastKey_j2 === 'ArrowRight')
			blinkyMouvement('ArrowRight', SPEED, 0);

		affMapAndPellets();
		Pacman.update();
		ghostControlCenter();
		all_ghosts_updates();
		winCondition(id);
		checkWin();
		clock();
		updateData(score, Pacman.life, formatTime(Math.round(real_time / 60)));
	}
}

export function stopAnimate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	cancelAnimationFrame(id);
	time = 0;
	id;
	lastKey_j1 = '';
	score = 0;

	pellets.length = 0;
	pacgums.length = 0;
	boundaries.length = 0;
	ghosts.length = 0;
	winOrLose = 0;
	real_time = 0;
}

export	function checkWinOrLose() { return (winOrLose); }

export function initialize(context, c, updateData, scoreRef, checkWin) {
	return new Promise((resolve, reject) => {
		fpsInterval = 1000 / 60;
		then = Date.now();
		startTime = then;
		canvas = c;
		ctx = context;
		score = scoreRef.value;

		canvas.width = map[0].length * BLOCK_SIZE;
		canvas.height = map.length * BLOCK_SIZE;
		stockMap(textureMap).then(() => {
			changeColorImage();
			ghosts = createGhosts();
			Blinky = get_blinky();
			animate(checkWin, updateData);
			resolve();
		}).catch(reject);
	});
}


//Permet d'ecouter les events du clavier si une touche est presser
addEventListener('keydown', ({ key }) => {
	switch (key) {
		case 'w':
			keys_j1.w.pressed = true;
			lastKey_j1 = 'w';
			break;
		case 'a':
			keys_j1.a.pressed = true;
			lastKey_j1 = 'a';
			break;
		case 's':
			keys_j1.s.pressed = true;
			lastKey_j1 = 's';
			break;
		case 'd':
			keys_j1.d.pressed = true;
			lastKey_j1 = 'd';
			break;
		case 'ArrowUp':
			keys_j2.up.pressed = true;
			lastKey_j2 = 'ArrowUp';
			break;
		case 'ArrowLeft':
			keys_j2.left.pressed = true;
			lastKey_j2 = 'ArrowLeft';
			break;
		case 'ArrowDown':
			keys_j2.down.pressed = true;
			lastKey_j2 = 'ArrowDown';
			break;
		case 'ArrowRight':
			keys_j2.right.pressed = true;
			lastKey_j2 = 'ArrowRight';
			break;
	}
})

//Permet d'ecouter les events du clavier si une touche est lever
addEventListener('keyup', ({ key }) => {
	switch (key) {
		case 'w':
			keys_j1.w.pressed = false;
			break;
		case 'a':
			keys_j1.a.pressed = false;
			break;
		case 's':
			keys_j1.s.pressed = false;
			break;
		case 'd':
			keys_j1.d.pressed = false;
			break;
		case 'ArrowUp':
			keys_j2.up.pressed = false;
			break;
		case 'ArrowLeft':
			keys_j2.left.pressed = false;
			break;
		case 'ArrowDown':
			keys_j2.down.pressed = false;
			break;
		case 'ArrowRight':
			keys_j2.right.pressed = false;
			break;
	}
})