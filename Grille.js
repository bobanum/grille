/*jslint esnext:true,browser:true*/
class Grille {
	constructor() {
		this.titre = "";
		this.valeur = 0;
		this._criteres = [];
		this.lignes = 0;
		this.parent = null;
	}
	get criteres() {
		return this._criteres;
	}
	set criteres(val) {
		this.ajouterCritere(val);
	}
	get niveau() {
		if (!this.parent) {
			return 0;
		} else {
			return 1 + this.parent.niveau;
		}
	}
	get dom() {
		if (this._dom) { return this._dom; }
		var resultat = document.createElement("div");
		resultat.classList.add("grille");
		resultat.classList.add("niveau-" + this.niveau);
		resultat.appendChild(this.dom_titre());
		if (this.valeur !== undefined) {
			let div = resultat.appendChild(document.createElement("div"));
			div.classList.add("valeur");
			div.setAttribute("data-pts", this.valeur);
		}
		if (this._criteres.length) {
			resultat.appendChild(this.dom_criteres());
		}
		if (this.lignes) {
			resultat.appendChild(this.dom_lignes(this.lignes));
		}
		resultat.obj = this;
		return resultat;
	}
	dom_titre() {
		var resultat = document.createElement("div");
		resultat.classList.add("titre");
		resultat.innerHTML = this.titre;
		return resultat;
	}
	dom_lignes(lignes) {
		var resultat = document.createElement("div");
		resultat.classList.add("lignes");
		if (typeof lignes === "number") {
			for (let i = 0; i < lignes; i += 1) {
				resultat.appendChild(document.createElement("div"));
			}
		} else if (lignes instanceof Array) {
			lignes.forEach(function (l) {
				var div = resultat.appendChild(document.createElement("div"));
				div.innerHTML = l;
			});
		}
		return resultat;
	}
	dom_criteres() {
		var resultat = document.createElement("ol");
		this._criteres.forEach(function (c) {
			var li = resultat.appendChild(document.createElement("li"));
			li.appendChild(c.dom);
		}, this);
		return resultat;
	}
	ajouterCritere(critere) {
		if (critere instanceof Grille) {
			this._criteres.push(critere);
			critere.parent = this;
			return this;
		} else if (critere instanceof Array) {
			return critere.forEach(c=>this.ajouterCritere(c));
		} else if (typeof critere === "object") {
			return this.ajouterCritere(Grille.fromObject(critere));
		} else if (typeof critere === "string") {
			return this.ajouterCritere(Grille.fromJson(critere));
		} else {
			throw "Mauvaise valeur pour un critere";
		}
	}
	fill(obj) {
		for (let k in obj) {
			this[k] = obj[k];
		}
		return this;
	}
	static loadJson(fic) {
		return new Promise(resolve => {
			var xhr = new XMLHttpRequest();
			xhr.open("get", fic);
			xhr.responseType = "json";
			xhr.addEventListener("load", (e) => {
				console.log(e.target);
				resolve(this.fromObject(e.target.response));

			});
			xhr.send(null);
		});
	}
	static fromJson(json) {
		return this.fromObject(JSON.parse(json));
	}
	static fromObject(obj) {
		var resultat = new this();
		resultat.fill(obj);
		return resultat;
	}
	static load(fichierJson, nb) {
		return Grille.loadJson("projet2_zelda.json").then(data => {
			nb = nb || 1;
			window.addEventListener("load", () => {
				var dom = data.dom;
				window.interface.appendChild(dom);
				for (let i = 1; i < nb; i += 1) {
					window.interface.appendChild(dom.cloneNode(true));
				}
			});
		});
	}
	static init() {
//		window.addEventListener("load", function () {
//			var g = Grille.loadJson("projet2_zelda.json");
//			window.interface.appendChild(g.dom);
//		});
//		window.addEventListener("load", function() {
//			console.log(window.interface);
//			window.interface.appendChild(window.interface.firstElementChild.cloneNode(true));
//			window.interface.appendChild(window.interface.firstElementChild.cloneNode(true));
//		});
	}
}
Grille.init();
