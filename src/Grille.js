/*jslint esnext:true,browser:true*/
/*global Critere, App */
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
	}
	get rangees() {
		return this._rangees;
	}
	set rangees(val) {
		this._rangees = val;
		Grille.setVariable("rangees", this._rangees);
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
		if (val === "paysage") {
			vals.reverse();
		}
		this.largeur = vals[0];
		this.hauteur = vals[1];
		Grille.setVariables({
			"largeur": this.largeur + "in",
			"hauteur": this.hauteur + "in",
		});
	}
	dom_creer() {
		var resultat = super.dom_creer();
		var id = resultat.appendChild(document.createElement("div"));
		id.classList.add("identification");
		id.setAttribute("data-pts", this.valeur);
		return resultat;
	}
	static setVariable(name, value) {
		this.styles.root.setProperty("--" + name, value);
	}
	static setVariables(vars) {
		for (let i in vars) {
			this.setVariable(i, vars[i]);
		}
	}
	static load(fichierJson) {
		var promises = [];
		promises.push(App.loadJson("config.json").then(config => {
			this.config = config;
			return config;
		}));
		if (fichierJson) {
			promises.push(App.loadJson(fichierJson).then(data => {
				return this.fromObject(data);
			}));
		}
		return Promise.all(promises).then(data => {
			var grille = data[1];
			if (grille) {
				grille.ajouterA(document.getElementById('interface'));
				return grille;
			}
		});
	}
	ajouterA(element) {
		var nb = this.colonnes * this.rangees;
		var dom = this.dom;
		element.appendChild(dom);
		for (let i = 1; i < nb; i += 1) {
			window.interface.appendChild(dom.cloneNode(true));
		}
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
		this.ajouterStyle({
			"root": ":root{}",
			"body": "body {}",
			"page": "div.page {}",
			"feuillet": "div.feuillet {}",
		});
		if (location.pathname.endsWith("/index.html")) {
			if (location.search) {
				this.load(location.search.substr(1) + ".json");
			} else {
				this.load().then(() => {
					document.getElementById("interface").innerHTML = '<h1>Ajouter <code style="font-weight:lighter;">?mon_projet</code> à l\'adresse pour le faire afficher</h1>';

				});
			}
		}
	}
}
Grille.init();

