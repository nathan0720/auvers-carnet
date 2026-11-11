AUVERS — AU-DELÀ DU TABLEAU
Page locale HTML, CSS et JavaScript sans compilation ni hébergement public.

OUVRIR
Ouvrir index.html, ou lancer dans ce dossier :
python3 -m http.server 8766 --bind 127.0.0.1
Puis http://127.0.0.1:8766/
Les images et données de carte sont locales. La vidéo Vimeo nécessite Internet.

PARCOURS
Château → Racines (rue Daubigny) → Auberge et mairie → Église → Plateau → Cimetière.
Environ 1,9 km entre les points sur voies OSM, hors jardins, bâtiments et retour.
Parcours indicatif. Pour les Racines, arrêt extérieur prévu ; le sentier intérieur se réserve et son ouverture le mercredi n’est pas confirmée.
Le personnage suit le défilement sans aimantation. Les six boutons permettent de rejoindre une étape. Le menu utilise un déplacement progressif interrompable.

OUVERTURE ET COMPARAISONS
Une image PNG du château et un autoportrait de Van Gogh ; le portrait est droit, sans cadre, et disparaît avec le titre.
Cinq comparateurs tableau/image, église en premier. Le curseur suit le défilement de 20 à 80 % et reste manipulable à la souris, au toucher et au clavier.
Les peintures originales sont conservées. Les quatre images photographiques hors église sont des reconstitutions IA clairement signalées, destinées à la maquette.
Église : photographie de Graham Beards, panneau au premier plan retiré par retouche IA ; original conservé dans assets/eglise.jpg. church-alignment.js recale son affichage sur des repères du tableau, sans modifier les fichiers source.
« 8 OCTOBRE 2026 » est un libellé demandé pour la maquette, sans modifier ni certifier la date réelle des références.

SECONDE PARTIE
« À hauteur de village » : nouvelle composition photographique sur la rue, la matière et les terrasses du château. Elle remplace entièrement l’ancien carnet de deux tirages animés.
Billet : la feuille reste fixe dans une séquence de défilement de 340 svh. L’écriture se termine à 88 % de la séquence ; un temps de lecture précède la sortie vers la suite. Remonter inverse l’écriture.
À partir de 1100 px de large et 600 px de haut, le contexte de visite reste à gauche de la feuille pendant l’écriture. Sur les écrans plus petits, il précède la feuille. Un unique contenu est déplacé entre ces dispositions.
La fin et le pied de page forment un colophon bleu avec une photographie du plateau, un grand « auvers. », les téléchargements et les crédits.
La réduction des animations et l’impression affichent une version statique lisible. Le texte du billet reste accessible aux lecteurs d’écran.

VIDÉO
Drony, « Les plus beaux sites du Val d’Oise — Auvers-sur-Oise », pour le Département du Val-d’Oise, 83 secondes.
https://vimeo.com/533054971
Lecture automatique muette, en boucle. Lecteur du créateur, sans téléchargement ni réhébergement.

FICHIERS
index.html : contenu et crédits détaillés.
style.css : mises en page et adaptations.
script.js : défilement, carte, comparateurs et billet.
church-alignment.js : recalage optique de l’église pour le comparateur.
map-data.js : géométries © OpenStreetMap contributors, ODbL.
parcours-auvers.gpx : tracé pédestre indicatif, sans retour.
carnet-de-terrain.txt : préparation de la visite.
assets/ : images et sources conservées.

Les photos documentaires sont créditées dans « Images, sources & crédits » : Chabe01, Graham Beards, Romain Pajda, GFreihalter (CC BY-SA 4.0), P.poschadel (CC BY-SA 2.0 FR).
Les œuvres de Van Gogh sont des reproductions du domaine public. Le château d’ouverture et les quatre reconstitutions des comparateurs sont des illustrations IA signalées.
Les photos personnelles et le récit de visite doivent remplacer les références et les textes préparatoires après la sortie. Aucun témoignage de visite n’est inventé.

MISE À JOUR : VILLAGE ANIMÉ ET PIED DE PAGE
La partie À hauteur de village comporte trois séquences réversibles au défilement : rue, matière et perspective. Les images s’agrandissent, le cadre s’ouvre et le texte apparaît progressivement. Sans animations ou à l’impression, les trois séquences restent lisibles statiquement.
Le 18 est rétabli dans la colonne de contexte du billet sur grand écran.
La dernière page présente les six étapes en une planche photographique, suivie des liens de téléchargement et des crédits.

Les six photographies de la dernière page sont des liens vers les étapes correspondantes de la carte, avec la même navigation douce que les points du parcours. Les liens restent accessibles au clavier et respectent la préférence de réduction des animations.

PALETTE ET NOTES PERSONNELLES
Cinq couleurs inspirées des visuels apparaissent au défilement. Trois cadrages de référence accompagnent des textes préparatoires à la première personne : seuil, pierre et racines. Ces textes expriment des intentions avant la visite, à remplacer ou ajuster selon les émotions réelles et les photos personnelles. Les notes se révèlent à leur entrée dans le viewport ; les photos ont un léger zoom réversible. Animations désactivées pour la réduction des mouvements et l’impression.

QUATRE SÉQUENCES ET NAVIGATION LATÉRALE
Les phrases se remplacent au défilement ; leur texte est préparatoire et n’invente pas un ressenti de visite. Une photo de référence de l’église recule du détail à l’ensemble. Une bande photographique avance horizontalement au défilement vertical. Le montage animé dure 60 secondes, avec six photographies de référence et des phrases de maquette. Lecture, pause, curseur temporel, ambiance synthétique de vent désactivée par défaut. Les plans personnels et les vrais sons ne sont pas encore fournis ; ils doivent remplacer la maquette après la sortie. Le montage s’arrête en quittant son cadre ou en masquant l’onglet.
Treize repères latéraux sont cliquables, indiquent la section active, s’allongent au survol et révèlent un libellé au focus clavier. Ils utilisent la navigation douce existante. Les nouvelles séquences conservent une présentation statique avec réduction des animations et à l’impression.

MISE À JOUR : PAPIER, COULEUR ET NAVIGATION
La séquence « Une minute. Juste ici. » et son audio ont été retirés.
Les détails deviennent progressivement nets ; le titre se révèle mot par mot. Des traits SVG se dessinent vers des annotations en marge. Un disque bleu grandit, remplit l’écran puis révèle l’auberge. La dernière photographie s’agrandit pour devenir une couverture. Les effets restent réversibles, avec des présentations statiques pour la réduction des animations et l’impression.
Le coin inférieur droit du billet devient accessible une fois la frappe terminée. Tirer le coin pour déchirer la feuille et télécharger assets/billet-auvers.pdf. Un clic ou Entrée réalise la même action. La feuille réapparaît après le téléchargement. Le PDF est un document local d’une page avec les liens officiels ; pas de service externe.
La barre latérale reste discrète à distance du pointeur. Au survol, ses repères s’allongent en vague. Cliquer rejoint une section ; maintenir et glisser permet de parcourir la page en continu, avec interpolation douce et curseur doré. Un contrôle de type slider permet aussi les flèches, Page précédente/suivante, Début et Fin au clavier.

DÉCHIRURE INTERACTIVE ET FAVICON
Le billet est maintenant découpé en deux vrais morceaux visuels. Le tracé irrégulier avance avec la distance du geste ; la partie détachée suit directement le pointeur. Relâcher avant la fin remet le papier en place, sans téléchargement. Relâcher après 92 % du geste détache la feuille et lance le PDF. Le clavier conserve une activation par Entrée avec la même déchirure visible.
Favicon SVG : a ivoire, fond bleu, petit trait ocre. La barre native de défilement est masquée par scrollbar-width et les pseudo-éléments WebKit ; le défilement et la barre latérale personnalisée restent disponibles.

DERNIERS AJUSTEMENTS
La déchirure suit désormais l’attache horizontale du haut ; la feuille entière bouge sous la main, sans coupe diagonale dans le texte. Les liens externes ouvrent un nouvel onglet avec noopener/noreferrer, les ancres internes conservent la navigation douce et les téléchargements leur comportement habituel. Toute navigation annule le glissement résiduel de la barre ; le relâchement du glissement fixe sa destination pour éviter le retour intempestif en bas.
La bulle bleue a été remplacée par un aplat rectangulaire qui se retire vers le haut. Le recul sur l’église est limité de 1,14 à 1 pour conserver un cadrage stable. Trois favicons et leur planche de comparaison sont dans assets ; le a reste actif en attendant le choix.

Favicon actif : visage de Vincent van Gogh, recadrage de l’autoportrait de 1889 déjà crédité dans le carnet, inspiré du principe du favicon de la Maison de Van Gogh. PNG 16, 32 et 180 px ; aperçu 192 px, source SVG conservée.

GESTE GUIDÉ SUR LA LIGNE
La déchirure commence désormais sur le repère à droite de la ligne sous la date. Maintenir le clic ou le doigt puis suivre la ligne vers la gauche. S’éloigner verticalement bloque la progression ; relâcher avant le bout remet le billet en place. Arriver au bout et relâcher télécharge le PDF. Une ligne superposée suit le geste au-dessus de la feuille animée. Entrée au clavier réalise aussi la déchirure. Tous les liens non internes, y compris les fichiers et crédits, ouvrent maintenant un nouvel onglet. La déchirure conserve son téléchargement PDF direct.

Tous les documents, y compris le PDF du billet après la déchirure, ouvrent maintenant un nouvel onglet. Aucun attribut download ne force le téléchargement. Le PDF peut être enregistré depuis son lecteur.

Le billet se soulève maintenant avec une légère inclinaison en perspective, une courbure du bord, un revers éclairé et une ombre portée progressive. Relâcher avant la fin rabat le papier. La déchirure complète ouvre toujours le PDF dans un nouvel onglet. Les effets de relief sont désactivés pour la réduction des animations.
