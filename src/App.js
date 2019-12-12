/*jslint esnext:true, browser:true, no-console:false*/
/*eslint no-console:0*/
//Fonction permettant de suire le chargements des promesses. Mettre false pour masquer les traces.
/* eslint-disable */
console.trace = (false) ? console.log : function () {};
/* eslint-enable */

/**
 * Classe gérant l'application en général. Seule script à inclure dans la page.
 */
class App {
	static get config() {
		var result = {};
		this.configurables.forEach(property => {
			result[property] = this[property];
		});
		for (let property in this._config) {
			result[property] = this._config[property];
		}
		return result;
	}
	static set config(obj) {
		for (let property in obj) {
			this.setConfig(property, obj[property]);
		}
	}
	static getConfig(property, defaultValue = undefined) {
		if (this.configurables.includes(property)) {
			return this[property];
		} else if (this._config[property] !== undefined) {
			return this._config[property];
		} else {
			return defaultValue;
		}
	}
	static setConfig(property, value) {
		if (this.configurables.includes(property)) {
			this[property] = value;
		} else {
			this._config[property] = value;
		}
	}
	static addEventListeners(object, events) {
		if (object instanceof Array) {
			return object.forEach(this.addEventListeners, this);
		}
		for (let k in events) {
			object.addEventListener(k, events[k]);
		}
		return this;
	}
	/**
	 * Ajoute une série de propriétés à l'objet (ou un objet fourni)
	 * @param   {object} object     - L'objet à modifier (ou this par défaut)
	 * @param   {object} properties - Les propriétés à appliquer
	 * @returns {this}   - this
	 */
	static setProperties(object, properties) {
		for (let k in properties) {
			if (properties[k] === undefined) {
				delete object[k];
			} else {
				object[k] = properties[k];
			}
		}
		return object;
	}
	static setAttributes(element, attrs) {
		var k;
		attrs = attrs || {};
		for (k in attrs) {
			if (attrs[k] === undefined) {
				element.removeAttribute(k);
			} else {
				element.setAttribute(k, attrs[k]);
			}
		}
		return this;
	}
	/**
	 * Transfere les attributs d'un objet à un autre
	 * @param   {object} src  - L'objet duquel prendre les attributs
	 * @param   {object} dest - L'objet où mettre les attributs
	 * @param   {Array}  skip - Un tableau d'attributs à ignorer
	 * @returns {Qr}     - this
	 */
	static transfererAttributs(src, dest, skip) {
		Array.from(src.attributes).forEach(attr => {
			if (skip.indexOf(attr.name) === -1) {
				dest.setAttribute(attr.name, attr.value);
			}
		});
		return this;
	}
	/**
	 * Transfere les classes d'un élément HTML vers un autre
	 * @param   {HTMLElement} src  - L'élément HTML d'où prendre les classes
	 * @param   {HTMLElement} dest - L'élément HTML d'où prendre les classes
	 * @returns {this}        - this
	 */
	static transfererClasses(src, dest) {
		Array.from(src.classList).forEach(c => {
			dest.classList.add(c);
		});
		return this;
	}
	/**
	 * Retourne un objet contenant les informations et données d'une adresse
	 * @param   {string} url - L'adresse à analyser
	 * @returns {object} - L'objet
	 */
	static parseUrl(url) {
		var resultat;
		resultat = {};
		try {
			url = decodeURI(url);
		} catch (err) {
			//url = url;
		}
		url = url.split("?");
		if (url.length > 1) {
			resultat.search = url.splice(1).join("?");
			resultat.data = this.parseSearch(resultat.search);
		}
		url = url[0];
		url = url.split("#");
		if (url.length > 1) {
			resultat.hash = url.splice(1).join("#");
			resultat.refs = resultat.hash.split(',');
		}
		if (url[0]) {
			resultat.href = url[0];
		}
		return resultat;
	}
	/**
	 * Normalise une chaine pour utiliser comme id
	 * @param   {string} str - La chaine à normaliser
	 * @returns {string} - La chaine normalisée
	 */
	static normaliserString(str) {
		var resultat;
		resultat = str;
		resultat = resultat.toLowerCase();
		resultat = resultat.replace(/[áàâä]/g, "a");
		resultat = resultat.replace(/[éèêë]/g, "e");
		resultat = resultat.replace(/[íìîï]/g, "i");
		resultat = resultat.replace(/[óòôö]/g, "o");
		resultat = resultat.replace(/[úùûü]/g, "u");
		resultat = resultat.replace(/[ýỳŷÿ]/g, "y");
		resultat = resultat.replace(/[ç]/g, "c");
		resultat = resultat.replace(/[æ]/g, "ae");
		resultat = resultat.replace(/[œ]/g, "oe");
		resultat = resultat.replace(/[^a-z0-9]/g, "_");
		resultat = resultat.replace(/_+/g, "_");
		resultat = resultat.replace(/^_/g, "");
		resultat = resultat.replace(/_$/g, "");
		return resultat;
	}
	static createElement(name, attributes = {}) {
		var resultat;
		attributes = attributes || {};
		this.setAttributes(resultat, attributes);
		return resultat;
	}
	/**
	 * Retourne un objet contenant les informations et données d'une adresse
	 * @param   {string} url - L'adresse à analyser
	 * @returns {object} - L'objet
	 */
	static parseSearch(urlSearch) {
		var resultat, donnees;
		resultat = {};
		if (!urlSearch) {
			return resultat;
		}
		try {
			urlSearch = decodeURI(urlSearch);
		} catch (err) {
			//urlSearch = urlSearch;
		}
		if (urlSearch[0] === "?") {
			urlSearch = urlSearch.substr(1);
		}
		if (urlSearch.trim() === "") {
			return resultat;
		}
		donnees = urlSearch.split("&");
		donnees.forEach(d => {
			var donnee = d.split("=");
			if (donnee.length === 0) {
				return;
			}
			var cle = donnee.shift();
			donnee = donnee.join("=");
			if (resultat[cle] === undefined) {
				resultat[cle] = donnee;
			} else if (resultat instanceof Array) {
				resultat[cle].push(donnee);
			} else {
				resultat[cle] = [resultat[cle], donnee];
			}
		});
		return resultat;
	}
	static path_script(file) {
		var result = this._pathScript;
		if (file) {
			result += "/" + file;
		}
		return result;
	}
	static path_page(file) {
		var result = this._pathPage;
		if (file) {
			result += "/" + file;
		}
		return result;
	}
	static path_data(file) {
		var result = this._pathPage;
        if (this.dataDir) {
		  result += "/" + this.dataDir;
        }
		if (file) {
			result += "/" + file;
		}
		return result;
	}
	static setPaths() {
        var url = window.location.href.split("?")[0];
		var dossierPage = url.split("/").slice(0, -1);
		this._pathPage = dossierPage.join("/");
		var src = document.currentScript.getAttribute("src").split("/").slice(0, -1);
		if (src.length > 0 && src[0] === "") {
			src[0] = dossierPage.slice(0, 3).join("/");
		}
		if (src.length === 0 || !src[0].startsWith("http")) {
			src = dossierPage.concat(src).filter(x => x !== ".");
			let idx;
			while (idx = src.indexOf(".."), idx > -1) {
				src.splice(idx - 1, 2);
			}
		}
		this._pathScript = src.join("/");
	}
	/**
	 * Returns a promise resolved when given module is fully loaded
	 * @param   {string|array} file URL to module file
	 * @returns {Promise}      A Promise object
	 */
	static addScript(file, module = false) {
		if (file instanceof Array) {
			return Promise.all(file.map(f => this.addScript(f, module)));
		} else {
			return new Promise(resolve => {
				file += (file.endsWith(".js")) ? "" : ".js";
				var element = document.createElement("script");
				element.setAttribute("src", this.path_script(file));
				if (module) {
					element.setAttribute("type", "module");
				}
				element.addEventListener("load", () => resolve(element));
				document.head.appendChild(element);
			});
		}
	}
	static addDependency(dependency) {
		var result;
		if (dependency instanceof Array) {
			dependency.forEach((d) => this.addDependency(d));
			return this;
		}
		if (dependency.endsWith(".js")) {
			result = document.createElement("script");
			result.setAttribute("src", this.path_script(dependency));
			result.setAttribute("type", "module");
		} else if (dependency.endsWith(".css")) {
			result = document.createElement("link");
			result.setAttribute("href", this.path_script(dependency));
			result.setAttribute("rel", "stylesheet");
		} else {
			throw "Dependency '" + dependency + "' not valid.";
		}
		document.head.appendChild(result);
		return result;
	}

	/**
	 * Ajoute la balise pour l'affichage du favicon.
	 */
	static addFavicon() {
		var resultat = document.createElement('link');
		resultat.setAttribute('href', this.path_script("favicon.svg"));
		resultat.setAttribute('rel', 'icon');
		resultat.setAttribute('type', 'image/svg+xml');
		document.head.appendChild(resultat);
		return resultat;
	}
	static loadJson(fic, defaultValue = null) {
        return new Promise((resolve) => {
			var xhr = new XMLHttpRequest();
			xhr.open("get", fic);
			xhr.responseType = "json";
			xhr.addEventListener("load", (e) => {
				if (e.target.status === 404) {
					resolve(defaultValue);
				} else {
					resolve(e.target.response);
				}
			});
//			xhr.addEventListener("error", (e) => {
//				resolve(e.target.response);
//			});
//			console.log(xhr.onerror);
			xhr.onerror = function(){
				console.log("error" + xhr.status);
			};
			xhr.upload.onloadstart = function(){
				console.log("onloadstart" + xhr.status);
			};
			xhr.upload.onloadend = function(){
				console.log("onloadend" + xhr.status);
			};
			xhr.upload.onerror = function(){
				console.log("error" + xhr.status);
			};
			try {
				xhr.send(null);
			} catch (err) {
				console.log(err);
				resolve(err);
			}
		});
	}
	static loadEleves(fic) {
		if (!fic) {
            return Promise.resolve({});
        }
        return this.loadJson(fic).then(data => {
			this.eleves = data;
			return data;
		});
	}
	static loadConfig() {
		return this.loadJson(this.path_page("config.json")).then(data => {
			this.config = data;
			return data;
		});
	}
	static loadScripts(scripts) {
		console.trace(this.name, "loadScripts", scripts);
		return Promise.all(scripts.map(m => this.addScript(m))).then(data => {
			console.trace(this.name, "loaded", scripts, data);
			return Promise.all(scripts.map(m => (!this[m] || !this[m].load) ? null : this[m].load()));
		});
	}
	static load() {
		if (this._loaded) {
			return Promise.resolve();
		}
		console.trace(this.name, "load");
		var scripts = [
			'Critere.js',
			'Grille.js',
		];
		return Promise.all([
			this.loadScripts(scripts),
			this.loadEleves(this.fichierEleves)
		]).then(data => {
			console.trace("Scripts chargés", data);
			this._loaded = true;
		});
	}
	static init() {
		console.trace(this.name, "init");
        this.dataDir = "data";
		//this.fichierEleves = "eleves.json";
		this.configurables = ["titre", "fichierEleves"];
		this._config = {};
		this.setPaths();
		this.data = this.parseSearch(window.location.search);
		this.addDependency([
			'grille.css',
		]);
		this.addFavicon();
		var promesses = [
			this.loadConfig(),
			new Promise(resolve => {
				window.addEventListener("load", () => resolve());
			})
		];
		Promise.all(promesses).then(() => {
			console.trace(this, "Page HTML chargée");
			this.load();
		});
	}
}
App.init();
