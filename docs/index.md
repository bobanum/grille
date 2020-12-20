# Grille
## Installation
Afin de fonctionner le fichier `json` de la grille doit se trouver dans le dossier `data` à la racine du site.

## Paramètres d'une grille
- `titre` : Le titre de la grille. Le séparateur `|` permet de mettre en flex avec space-between.
- `colonnes` : Le nombre de colonnes de feuillets. Défaut 2. 
- `rangees` : Le nombre de rangées de feuillets. Défaut 1.
- `colonnesInternes` : Division d'un feuillet en colonnes. Défaut 1.
- `valeur` : La valeur du feuillet. Permet de surcharger la valeur calculée. Défaut null.
- `papier` : Le taille du papier. Choix possibles : "lettre", "legal", "a4", "4in 4in". Défaut "lettre".
- `orientation` : Orientation du papier. Choix possibles : "portrait" ou "paysage". Défaut "portrait".
- `police` : La taille de la police en pt. Défaut : 12.
- `trou` : La taille des trous en pt. Défaut: 18.
- `align` : Le `align-content` des éléments de premier niveau.
- `gap` : L'espacement des éléments de premier niveau.
- `style` : Permet d'ajuster le style du feuillet. Ex.: `"style": ".critere{font-family:arial;}",`
- `criteres` : Les critères. Voir ci-dessous.

## Paramètres d'un critère
- `titre` : Le libélé du critère.
- `valeur` : La valeur à attribuer au critère. Si le critère contient des sous-critères, celle valeur-ci aura priorité, mais ne sera pas affichée. Une valeur de 0 laissera un champ vide sur la feuille.
- `lignes` : Permet d'ajouter des lignes pour des commentaires. Si présent, la valeur ne s'affichera plus, mais sera tout de même calculée. Les lignes ne s'affichent pas si le critère a des sous-critères.
- `criteres` : Une liste de sous-critères. Si `valeur` est absent, la valeur sera calculée à partir de ceux-ci.