class KeyboardManager
{
	constructor()
	{
		this.keys = {}
		window.addEventListener('keydown', (event) => {
			this.keys[event.key] = true;
		});
		window.addEventListener('keyup', (event) => {
			this.keys[event.key] = false;
		});
	}

	isKeyDown(key)
	{
		return (this.keys[key]);
	}
}

let KEYBOARD = new KeyboardManager()

exports.KEYBOARD = KEYBOARD
