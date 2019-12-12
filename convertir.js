window.addEventListener("load", function () {
	Convertir.toJson(document.getElementById("flat").value);
})
class Convertir {
	static toJson(txt) {
		var lignes = txt.split(/\r\n|\n\r|\r|\n/);
		var resultat = this.nouveau("");
		var courants = [resultat];
		lignes.forEach(ligne => {
			debugger;
			var n = ligne.match(/^\|*/)[0].length;
			ligne = ligne.substr(n);
			while (n > courants.length) {
				let nouveau = this.nouveau("");
				courants[0].criteres.push(nouveau);
				courants.unshift(nouveau);
			}
			var nouveau = this.nouveau(...ligne.split(/\|/));
			if (n > courants.length - 1) {
				courants.unshift(courants[0].criteres.slice(-1)[0]);
			}
			while (n < courants.length -1) {
				courants.shift();
			}
			courants[0].criteres.push(nouveau);
		});
		console.log(resultat);
	}
	static nouveau(titre, valeur=null) {
		var resultat = {titre: titre};
		if (valeur !== null) {
			resultat.valeur = valeur;
		} else {
			resultat.criteres = [];
		}
		return resultat;
	}
	static toFlat(txt) {
		console.log(txt);
	}
}