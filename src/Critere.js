/*jslint esnext:true,browser:true*/
class Critere {
	constructor() {
		this._titre = "";
		this._valeur = null;
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
	get valeur() {
		if (this._valeur === null) {
			return this.valeurCriteres();
		}
		return this._valeur;
	}
	set valeur(val) {
		this._valeur = val;
	}
	get niveau() {
		if (!this.parent) {
			return 0;
		} else {
			return 1 + this.parent.niveau;
		}
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
		}
		return this._dom;
	}
	valeurCriteres() {
		var resultat = 0;
		resultat = this.criteres.reduce((t, c) => t + c.valeur, 0);
		return resultat;
	}
	dom_creer() {
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
		} else if (this.lignes) {
			resultat.appendChild(this.dom_lignes(this.lignes));
		} else {
			resultat.classList.add("leaf");
		}
		resultat.obj = this;
		return resultat;
	}
	get titre() {
		return this._titre;
	}
	set titre(val) {
		if (!val) {
			this._titre = "";
		} else if (typeof val === "string") {
			this._titre = val.replace(/§/g, "<br/>");
		} else if (val instanceof HTMLElement) {
			this.titre = val.innerHTML;
		} else {
			this._titre = "";
		}
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
		if (critere instanceof Critere) {
			this._criteres.push(critere);
			critere.parent = this;
			return this;
		} else if (critere instanceof Array) {
			return critere.forEach(c=>this.ajouterCritere(c));
		} else if (typeof critere === "object") {
			return this.ajouterCritere(Critere.fromObject(critere));
		} else if (typeof critere === "string") {
			return this.ajouterCritere(Critere.fromJson(critere));
		} else {
			throw "Mauvaise valeur pour un critere : ";
		}
	}
	fill(obj) {
		for (let k in obj) {
			this[k] = obj[k];
		}
		return this;
	}
	static fromJson(json) {
		return this.fromObject(JSON.parse(json));
	}
	static fromObject(obj) {
		var resultat = new this();
		resultat.fill(obj);
		return resultat;
	}
	static init() {
	}
}
Critere.init();
