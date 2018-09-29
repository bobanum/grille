/*jslint esnext:true,browser:true*/
class Critere {
	constructor() {
		this._titre = "";
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
		if (this._dom) {
			return this._dom;
		}
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
		} else {
			resultat.classList.add("leaf");
		}
		if (this.lignes) {
			resultat.appendChild(this.dom_lignes(this.lignes));
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
			throw "Mauvaise valeur pour un critere";
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
	static load(fichierJson, nb) {
		return Grille.loadJson("config.json").then(config => {
			this.config = config;
		}).then(() => Grille.loadJson(fichierJson)).then(data => {
			return Grille.fromObject(data);
		}).then(grille => {
			nb = nb || 1;
			return new Promise(resolve => {
				window.addEventListener("load", () => {
					var dom = grille.dom;
					window.interface.appendChild(dom);
					for (let i = 1; i < nb; i += 1) {
						window.interface.appendChild(dom.cloneNode(true));
					}
					resolve(grille);
				});
			});
		}).then(/*data => {
			console.log(data);
		}*/);
	}
	static init() {
	}
}
Critere.init();

class Grille extends Critere {
	constructor() {
		super();
		this.papier = "lettre";
		this.orientation = "portrait";
		this.colonnes = 2;
		this.rangees = 1;
	}
	get colonnes() {
		return this._colonnes;
	}
	set colonnes(val) {
		this._colonnes = val;
		Grille.setVariable("colonnes", this._colonnes);
//		Grille.styles.page.gridTemplateColumns = "repeat(" + this._colonnes + ", 1fr)";
	}
	get rangees() {
		return this._rangees;
	}
	set rangees(val) {
		this._rangees = val;
		Grille.setVariable("rangees", this._rangees);
//		Grille.styles.page.gridTemplateRows = "repeat(" + this._rangees + ", 1fr)";
	}
	get papier() {
		return this.width + "in " + this.height + "in";
	}
	set papier(val) {
		val = val.toLowerCase();
		if (val === "lettre") {
			this.largeur = 8.5;
			this.hauteur = 11;
		} else if (val === "legal") {
			this.largeur = 8.5;
			this.hauteur = 14;
		} else if (val === "a4") {
			this.largeur = 8.27;
			this.hauteur = 11.69;
		} else {
			val = val.trim().split(" +").map(v => parseFloat(v));
			this.largeur = val[0];
			this.hauteur = val[1];
		}
		if (this.orientation) {
			this.orientation = this.orientation;	// Pour juster les hargeurs et hauteurs
		}
		Grille.setVariables({
			"largeur": this.largeur + "in",
			"hauteur": this.hauteur + "in",
		});
	}
	get orientation() {
		if (this.largeur > this.hauteur) {
			return "paysage";
		} else {
			return "portrait";
		}
	}
	set orientation(val) {
		var vals = [this.largeur, this.hauteur];
		vals.sort((a,b)=>(a<b)?-1:1);
		console.log(val, vals);
		if (val === "paysage") {
			vals.reverse();
		}
		this.largeur = vals[0];
		this.hauteur = vals[1];
		console.log(val, vals);
		Grille.setVariables({
			"largeur": this.largeur + "in",
			"hauteur": this.hauteur + "in",
		});
	}
	static setVariable(name, value) {
		this.styles.root.setProperty("--" + name, value);
	}
	static setVariables(vars) {
		for (let i in vars) {
			this.setVariable(i, vars[i]);
		}
	}
	static loadJson(fic) {
		return new Promise(resolve => {
			var xhr = new XMLHttpRequest();
			xhr.open("get", fic);
			xhr.responseType = "json";
			xhr.addEventListener("load", (e) => {
				resolve(e.target.response);
			});
			xhr.send(null);
		});
	}
	static load(fichierJson) {
		return this.loadJson("config.json").then(config => {
			this.config = config;
		}).then(() => this.loadJson(fichierJson)).then(data => {
			return this.fromObject(data);
		}).then(grille => {
			var nb = grille.colonnes * grille.rangees;
			return new Promise(resolve => {
				window.addEventListener("load", () => {
					var dom = grille.dom;
					window.interface.appendChild(dom);
					for (let i = 1; i < nb; i += 1) {
						window.interface.appendChild(dom.cloneNode(true));
					}
					resolve(grille);
				});
			});
		}).then(/*data => {
			console.log(data);
		}*/);
	}
	static ajouterStyle(regles) {
		var style= document.head.appendChild(document.createElement("style"));
		style.innerHTML = Object.values(regles).join(" ");
		this.styles = {};
		Object.keys(regles).forEach((r, i) => {
			this.styles[r] = style.sheet.cssRules[i].style;
		});
	}
	static init() {
		var regles = {"root": ":root{}", "body": "body {}", "page": "div.page {}", "feuillet": "div.feuillet {}"};
		this.ajouterStyle(regles);
	}
}
Grille.init();

