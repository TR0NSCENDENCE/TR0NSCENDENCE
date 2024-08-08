import store from '@store';
import axios from 'axios';

function _makeApiQuery(defaults, url, method, payload, onSuccess, onError) {
	const REQUEST_CONFIG = {
		url: url,
		method: method,
		params: payload,
	};
	axios.create(defaults)(REQUEST_CONFIG)
		.then(onSuccess)
		.catch(onError);
}

<<<<<<< Updated upstream
export function loadAsset(asset) {
	return ('/assets/' + asset);
}

=======
>>>>>>> Stashed changes
export function makeAuthApiQuery(url, method, payload, onSuccess, onError) {
	const DEFAULTS = {
		baseURL: store.state.endpoints.baseUrl,
		headers: {
			Authorization: `Bearer ${store.state.jwt}`,
			'Content-Type': 'application/json',
		},
		xhrFields: {
			withCredentials: true,
		}
	};
	_makeApiQuery(DEFAULTS, url, method, payload, onSuccess, onError);
}

export function makeApiQuery(url, method, payload, onSuccess, onError) {
	const DEFAULTS = {
		baseURL: store.state.endpoints.baseUrl,
		headers: {
			'Content-Type': 'application/json',
		},
		xhrFields: {
			withCredentials: false,
		}
	};
	_makeApiQuery(DEFAULTS, url, method, payload, onSuccess, onError);
}

const utils = {
	makeAuthApiQuery,
	makeApiQuery
};

export default utils;
