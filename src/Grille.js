/*jslint esnext:true,browser:true*/
/*global Critere, App */
class Grille extends Critere {
	constructor() {
		super();
		this.papier = "lettre";
		this.orientation = "portrait";
		this.colonnes = 2;
		this.rangees = 1;
		this.colonnesInternes = 1;
	}
	get style() {
		return (this._style) ? this._style.innerHTML : "";
	}
	set style(val) {
		this._style = document.head.appendChild(document.createElement("style"));
		this._style.innerHTML = this.renderStyle(val);
	}
	get colonnes() {
		return this._colonnes;
	}
	set colonnes(val) {
		this._colonnes = val;
		Grille.setVariable("colonnes", this._colonnes);
	}
	get colonnesInternes() {
		return this._colonnesInternes;
	}
	set colonnesInternes(val) {
		this._colonnesInternes = val;
		Grille.setVariable("colonnesInternes", this._colonnesInternes);
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
			this.orientation = this.orientation; // Pour juster les hargeurs et hauteurs
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
		vals.sort((a, b) => (a < b) ? -1 : 1);
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
	renderStyle(obj) {
		if (typeof obj === "string") {
			return obj;
		} else if (obj instanceof Array) {
			return obj.join("");
		}
		var result = "";
		for (let k in obj) {
			result += k + "{" + this.renderRule(obj[k]) + "}";
		}
		return result;
	}
	renderRule(obj) {
		if (typeof obj === "string") {
			return obj;
		} else if (obj instanceof Array) {
			return obj.join("");
		}
		var result = "";
		for (let k in obj) {
			result += k + ":" + this.renderRule(obj[k]) + ";";
		}
		return result;
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
		if (fichierJson) {
			promises.push(App.loadJson(fichierJson).then(data => {
				return this.fromObject(data);
			}));
		}
		return Promise.all(promises).then(data => {
			var grille = data[0];
			if (grille) {
				grille.ajouterA(document.body);
				return grille;
			}
		});
	}
	ajouterA(element) {
		var nb = this.colonnes * this.rangees;
		var dom = this.dom;
		if (!App.eleves) {
			let page = Grille.ajouterPage(element);
			page.appendChild(dom);
			for (let i = 1; i < nb; i += 1) {
				page.appendChild(dom.cloneNode(true));
			}
		} else {
			var n = 0;
			let page;
			for (let groupe in App.eleves) {
				if (groupe[0] === "_") {
					continue;
				}

				let eleves = App.eleves[groupe];
				for (let matricule in eleves) {
					if (matricule[0] === "_") {
						continue;
					}
					let eleve = eleves[matricule];
					eleve.groupe = groupe;
					eleve.matricule = matricule;
					if (n % nb === 0) {
						page = Grille.ajouterPage(element);
					}
					let g = dom.cloneNode(true);
					g.querySelector("div.identification").appendChild(this.identitication(eleve));
					page.appendChild(g);
					n++;
				}
			}

		}
	}
	identitication(eleve) {
		var resultat, info;
		resultat = document.createElement("span");
		resultat.classList.add("eleve");
		for (let k in eleve) {
			info = resultat.appendChild(document.createElement("span"));
			info.classList.add(k);
			info.innerHTML = eleve[k];
		}
		return resultat;
	}
	static ajouterPage(conteneur) {
		var resultat = conteneur.appendChild(document.createElement("div"));
		resultat.classList.add("interface");
		resultat.classList.add("page");
		return resultat;
	}
	static ajouterStyle(regles) {
		var style = document.head.appendChild(document.createElement("style"));
		style.innerHTML = Object.values(regles).join(" ");
		this.styles = {};
		Object.keys(regles).forEach((r, i) => {
			this.styles[r] = style.sheet.cssRules[i].style;
		});
	}
	static listeGrilles(liste) {
		var resultat = document.createElement("ol");
		liste.forEach(g => {
			var li = resultat.appendChild(document.createElement("li"));
			var a = li.appendChild(document.createElement("a"));
			a.setAttribute("href", "?" + g);
			a.innerHTML = g;
		});
		return resultat;
	}
	static init() {
		this.ajouterStyle({
			"root": ":root{}",
			"body": "body {}",
			"page": "div.page {}",
			"feuillet": "div.feuillet {}",
		});
		if (location.pathname.endsWith("/index.html") || location.pathname.endsWith("/")) {
			if (location.search) {
				this.load(location.search.substr(1) + ".json");
			} else {
				this.load().then(() => {
					var page = this.ajouterPage(document.body);
					var div = page.appendChild(document.createElement("div"));
					div.innerHTML = '<h1>Ajouter <code style="font-weight:lighter;">?mon_projet</code> à l\'adresse pour le faire afficher</h1>';
					App.loadJson("api.php?g").then(data => {
						if (!data) {
							return false;
						}
						div.appendChild(this.listeGrilles(data));
					});
				});
			}
		}
	}
}
Grille.init();
