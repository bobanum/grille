/*jslint esnext:true,browser:true*/
/*global Critere, App */
class Grille extends Critere {
	/**
	 * Creates an instance of Grille.
	 */
	constructor() {
		super();
		this.papier = "lettre";
		this.orientation = "portrait";
		this.colonnes = 2;
		this.rangees = 1;
		this.colonnesInternes = 1;
		this.police = 12;
		this.trou = 18;
	}
	/**
	 * Paramètre style du json
	 */
	get style() {
		return (this._style) ? this._style.innerHTML : "";
	}
	set style(val) {
		this._style = document.head.appendChild(document.createElement("style"));
		this._style.innerHTML = this.renderStyle(val);
	}
	/**
	 * Détermine le nombre de feuillets à l'horizontal
	 */
	get colonnes() {
		return this._colonnes;
	}
	set colonnes(val) {
		this._colonnes = val;
		Grille.setVariable("colonnes", this._colonnes);
	}
	/**
	 * Détermine le nombre de feuillet à la verticale
	 */
	get rangees() {
		return this._rangees;
	}
	set rangees(val) {
		this._rangees = val;
		Grille.setVariable("rangees", this._rangees);
	}
	/**
	 * Détermine la taille générale de la police d'un feuillet
	 */
	get police() {
		return this._police;
	}
	set police(val) {
		this._police = val;
		Grille.setVariable("police", this._police);
	}
	/**
	 * Détermine la hauteur des zones inscriptibles
	 */
	get trou() {
		return this._police;
	}
	set trou(val) {
		this._trou = val;
		Grille.setVariable("hauteur-trou", this._trou);
	}
	/**
	 * Détermine le nombre à l'intérieur d'un feuillet (Pas très au point)
	 */
	get colonnesInternes() {
		return this._colonnesInternes;
	}
	set colonnesInternes(val) {
		this._colonnesInternes = val;
		Grille.setVariable("colonnesInternes", this._colonnesInternes);
	}
	/**
	 * Détermine la taille du papier
	 */
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
			this.orientation = this.orientation; // Pour ajuster les hargeurs et hauteurs
		}
		Grille.setVariables({
			"largeur": this.largeur + "in",
			"hauteur": this.hauteur + "in",
		});
	}
	/**
	 * Détermine l'orientation du papier (doit quand même être changé dans le fureteur)
	 */
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
	/**
	 * Retourne le HTML du feuillet
	 */
	dom_creer() {
		var resultat = super.dom_creer();
		resultat.appendChild(this.html_identification(this.valeur));
		return resultat;
	}
	/**
	 * Retourne le HTML de la zone d'identification
	 * @param {string} valeur La valeur du feuillet
	 */
	html_identification(valeur) {
		var resultat = document.createElement("div");
		resultat.classList.add("identification");
		resultat.setAttribute("data-pts", valeur);
		return resultat;
	}
	/**
	 * Retourne le innerHTML à mettre dans une balise <style> en fonction de la feuille de styles donnée
	 * @param {object|string|array} obj Le style à traiter
	 */
	renderStyle(obj) {
		if (typeof obj === "string") {
			return obj;
		} else if (obj instanceof Array) {
			return obj.join("");
		}
		var result = "";
		for (let k in obj) {
			if (k === "") {
				result += this.renderRule(obj[k]);
			} else {
				result += k + "{" + this.renderRule(obj[k]) + "}";
			}
		}
		return result;
	}
	/**
	 * Retourne la version string d'une règle fournie
	 * @param {object|string|array} obj La règle à traiter
	 */
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
	
	/**
	 * Ajoute une variable CSS à la page
	 * @param {string} name Le nom de la variable (sans les --)
	 * @param {string} value La valeur à donner à la variable
	 */
	static setVariable(name, value) {
		this.styles.root.setProperty("--" + name, value);
	}
	/**
	 * Ajoute une série de variables CSS à la page
	 * @param {object} vars Un objet contenant les propriété personnalisées (sans les --)
	 */
	static setVariables(vars) {
		for (let i in vars) {
			this.setVariable(i, vars[i]);
		}
	}
	/**
	 * Promesse qui charge un fichier de grille JSON
	 * @param {string} fichierJson L'url du fichier à charger
	 * @returns Promise resolves Grille
	 */
	static load(fichierJson) {
		if (!fichierJson) {
			return Promise.resolve(this.fromObject(null));
		}
		return App.loadJson(fichierJson).then(data => {
			if (!data) {
				throw("Grille json introuvable");
			}
			var grille = this.fromObject(data);
			grille.ajouterA(document.body);
			return grille;
		});
	}
	/**
	 * Ajoute les feuillets à un élément de la page
	 * Permet également de "publiposter" une grande quantité de feuillets avec les noms des élèves (TODO simplifier)
	 * @param {HTMLElement} element L'élément conteneur des feuillets (et page)
	 */
	ajouterA(element) {
		var nb = this.colonnes * this.rangees;
		var dom = this.dom;
		console.log(this.eleves);
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
				/*Pour éviter le tri par clé*/

				var eleves2 = [];
				for (let matricule in eleves) {
					if (matricule[0] === "_") {
						continue;
					}
					eleves[matricule].groupe = groupe;
					eleves[matricule].matricule = matricule;
					eleves2.push(eleves[matricule]);
				}
				eleves2.sort((eleveA, eleveB) => {
					return (eleveA.nom < eleveB.nom) ? -1 : (eleveA.nom > eleveB.nom) ? 1 : (eleveA.prenom < eleveB.prenom) ? -1 : (eleveA.prenom > eleveB.prenom) ? 1 : 0;
				});
				eleves2.forEach(eleve => {
					if (n % nb === 0) {
						page = Grille.ajouterPage(element);
					}
					let g = dom.cloneNode(true);
					g.querySelector("div.identification").appendChild(this.html_identitication(eleve, "eleve"));
					page.appendChild(g);
					n++;
				});
			}
		}
	}
	/**
	 * Retourne un span contenant d'autres spans avec des classes en fonction des propriétés de l'objet donné
	 * @param {object} obj Un objet contenant les informations
	 */
	html_identitication(obj, classe) {
		var resultat, info;
		resultat = document.createElement("span");
		if (classe) {
			resultat.classList.add(classe);
		}
		for (let k in obj) {
			info = resultat.appendChild(document.createElement("span"));
			info.classList.add(k);
			info.innerHTML = obj[k];
		}
		return resultat;
	}
	/**
	 * Retourne une page après l'avoir ajoutée à une élément HTML fourni
	 * @param {HTMLElement} conteneur Le conteneur dans lequel mettre la page
	 * @returns {HTMLElement}
	 */
	static ajouterPage(conteneur) {
		var resultat = document.createElement("div");
		if (conteneur) {
			conteneur.appendChild(resultat);
		}
		resultat.classList.add("interface");
		resultat.classList.add("page");
		return resultat;
	}
	/**
	 * Ajoute un style inline et le remplit des règles donnees. Garde dans this.style une trace de la règle ajoutée.
	 * @param {object} regles Les règles à ajouter sous forme {"cle": ":selecteur{}"}
	 */
	static ajouterStyle(regles) {
		var style = document.head.appendChild(document.createElement("style"));
		style.innerHTML = Object.values(regles).join(" ");
		Object.keys(regles).forEach((r, i) => {
			this.styles[r] = style.sheet.cssRules[i].style;
		});
	}
	/**
	 * Retourne une liste numérotée des grilles fournies (par l'API)
	 * @param {array} liste Les grilles à afficher
	 */
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
		this.styles = {};
		this.ajouterStyle({
			"root": ":root{}",
			"body": "body {}",
			"page": "div.page {}",
			"feuillet": "div.feuillet {}",
		});
		if (location.pathname.endsWith("/index.html") || location.pathname.endsWith("/")) {
			if (location.search) {
				this.load(App.path_data(location.search.substr(1) + ".json"));
			} else {
				var page = this.ajouterPage(document.body);
				var div = page.appendChild(document.createElement("div"));
				div.innerHTML = '<h1>Ajouter <code style="font-weight:lighter;">?mon_projet</code> à l\'adresse pour le faire afficher</h1>';
				App.loadJson("api.php?g").then(data => {
					if (!data) {
						return false;
					}
					div.appendChild(this.listeGrilles(data));
				});
			}
		}
	}
}
Grille.init();
