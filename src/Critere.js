/*jslint esnext:true,browser:true*/
class Critere {
   constructor() {
      this._titre = "";
      this._valeur = null;
      this._criteres = [];
      this._type = null;
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
   get type() {
      if (this._type !== null) {
         return this._type;
      } else if (this.parent) {
         return this.parent.type;
      } else {
         return "valeur";
      }
   }
   set type(val) {
      this._type = val;
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
   get isLeaf() {
      return this._criteres.filter(c=>!c.off).length === 0 && !this.lignes;
   }
   valeurCriteres() {
      var resultat = 0;
      resultat = this._criteres.filter(c=>!c.off).reduce((t, c) => t + c.valeur, 0);
      return resultat;
   }
   dom_creer() {
      var resultat = document.createElement("div");
      resultat.classList.add("grille");
      resultat.classList.add("niveau-" + this.niveau);
      resultat.appendChild(this.dom_titre());
      if (this.isLeaf) {
         resultat.appendChild(this.dom_valeur());
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
   dom_valeur() {
      if (this.valeur === undefined || this.valeur === false) {
         return document.createTextNode("");
      }
      if (this.type === "coches" && this.isLeaf) {
         return this.dom_coches(this.valeur);
      }
      var resultat = document.createElement("div");
      resultat.classList.add("valeur");
      resultat.setAttribute("data-pts", this.valeur);
      return resultat;
   }
   dom_coches(valeur) {
      var resultat = document.createElement("span");
      resultat.classList.add("coches");
      for (let i = 0; i <= valeur; i += 1) {
         let span = resultat.appendChild(document.createElement("span"));
         span.innerHTML = i;
      }
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
      var titre = this.titre.split("|");
      titre.forEach(t => {
         var span = resultat.appendChild(document.createElement('span'));
         span.innerHTML = t;
      });
      if (!this.isLeaf) {
         resultat.appendChild(this.dom_valeur());
      }
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
      var criteres = this._criteres.filter(c=>!c.off);
      if (criteres.length === 0) {
         return document.createTextNode("");
      }
      var resultat = document.createElement("ol");
      if (this.style_ol) {
         for (let p in this.style_ol) {
            resultat.style[p] = this.style_ol[p];
         }
      }
      criteres.forEach(function (c) {
         var li = resultat.appendChild(document.createElement("li"));
         if (c.style_li) {
            for (let p in c.style_li) {
               li.style[p] = c.style_li[p];
            }
         }
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
         return critere.forEach(c => this.ajouterCritere(c));
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
   static init() {}
}
Critere.init();
