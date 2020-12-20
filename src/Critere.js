
export default class Critere {
	/**
	 *Creates an instance of Critere.
	 */
	constructor() {
		this._titre = "";
		this._valeur = null;
		this._criteres = [];
		this.lignes = 0;
		this.parent = null;
	}
	/**
	 * Accesseur pour les critères
	 */
	get criteres() {
		return this._criteres;
	}
	set criteres(val) {
		this.ajouterCritere(val);
	}
	/**
	 * Accesseur pour la valeur du critère
	 */
	get valeur() {
		if (this._valeur === null) {
			return this.valeurCriteres();
		}
		return this._valeur;
	}
	set valeur(val) {
		this._valeur = val;
	}
	/**
	 * Accesseur pour le niveau d'imbrication du critère
	 */
	get niveau() {
		if (!this.parent) {
			return 0;
		} else {
			return 1 + this.parent.niveau;
		}
	}
	/**
	 * Accesseur pour le titre
	 */
	get titre() {
		return this._titre;
	}
	set titre(val) {
		if (!val) {
			this._titre = "";
		} else if (typeof val === "string") {
			this._titre = val.replace(/(?:§|¶|\r\n|\n\r|\r|\n)/g, "<br/>");
		} else if (val instanceof HTMLElement) {
			this.titre = val.innerHTML;
		} else {
			this._titre = "";
		}
	}
	/**
	 * Getter du dom. S'il n'a pas été créé, on le crée.
	 */
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
		}
		return this._dom;
	}
	/**
	 * Calcule le total des valeurs des critères
	 */
	valeurCriteres() {
		var resultat = 0;
		resultat = this.criteres.reduce((t, c) => t + c.valeur, 0);
		return resultat;
	}
	/**
	 * Retourne le html du critère, incluant les sous-critères
	 */
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
	/**
	 * Retourne le html d'un titre
	 */
	dom_titre() {
		var resultat = this.splitSpan(this.titre, "titre");
		return resultat;
	}
	/**
	 * Retourne un div rempli de spans en fonction du texte et du séparateur
	 */
	splitSpan(texte, classe, separateur = "|") {
		var resultat = document.createElement("div");
		if (classe) {
			resultat.classList.add(classe);
		}
		var parties = texte.split(separateur);
		parties.forEach(t => {
			var span = resultat.appendChild(document.createElement('span'));
			span.innerHTML = t;
		});
		return resultat;
	}
	/**
	 * Retourne le html des lignes lorsque présent
	 * @param {number|array} lignes Le nombre de lignes ou un tableau de texte à afficher dans les lignes
	 */
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
	/**
	 * Retourne une liste HTML contenant les critères à afficher
	 */
	dom_criteres() {
		var resultat = document.createElement("ol");
		this._criteres.forEach(function (c) {
			var li = resultat.appendChild(document.createElement("li"));
			li.appendChild(c.dom);
		}, this);
		return resultat;
	}
	/**
	 * Ajoute un critère dans la liste des critères
	 * @param {object|array|string} critere Le critère à ajouter
	 */
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
	/**
	 * Transfere les propriétés d'un objet vers le critere
	 * @param {object} obj L'objet à traiter
	 */
	fill(obj) {
		for (let k in obj) {
			this[k] = obj[k];
		}
		return this;
	}
	/**
	 * Crée un objet Critere à partir du string JSON donné
	 * @param {string} json Le json à traiter
	 */
	static fromJson(json) {
		return this.fromObject(JSON.parse(json));
	}
	/**
	 * Crée un objet Critere à partir d'un objet générique donné
	 * @param {object} obj L'objet générique à créer
	 */
	static fromObject(obj) {
		var resultat = new this();
		resultat.fill(obj);
		return resultat;
	}
}
