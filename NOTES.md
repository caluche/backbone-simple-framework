Retours Vivien - 20140414

Je pose mes premières impressions, elles sont un peu critiques mais sont plus là pour engendrer une discussion, poser un peu les choses pour donner le maximum de cohérence/flexibilité à l'ensemble.

- La séparation MVC est effectivement plus nette et doit permettre plus de découpage, c'est vrai. Par contre je ne sais pas quelle approche est la mieux, c'est vision Rails ou celle plus modulaire avec l'ensemble des couches MVC dans chaque module.

- Il faudrait voir le comportement de la compression, essentielle mais chiante à mettre en place, il faut qu'elle soit contrôlée à chaque étape.
=> ok - le système d'autoload a été viré

- La gestion des dépendances RequireJS est encore un peu compliquée, il faut bien savoir où sont les choses et simplifier les paths ou ajouter l'ensemble des librairies dans un objet global FW pour n'avoir qu'une dépendance (le plus simple pour les devs novices mais moins souple).
=> prevu

- Il faut garder la gestion de l'environnement pour chaque user ou faire une génération de config par défaut avec un outil comme Grunt. Dans ce dernier cas Il faudra également ajouter le fichier dans l'ignore list de SVN, ce qui est un peu chiant (pas de fichier ignore à la racine comme Git).

- Les contrôleurs semblent faire toujours un peu la même chose (du moins quand ils sont simples), et le code lié aux régions est toujours un peu similaire dans les vues. Il y a surement un moyen d'avoir des comportements par défaut moyennant du paramétrage.
=> ajout methode dans abstract controller

- Je ne comprends parfois pas trop l'arborescence, pourquoi "service" n'est pas dans "components" par exemple...
=> effectivement à revoir

- Je me pose la question au sujet des régions, j'ai l'impression que ça ajoute pas mal de complexité pour pas grand chose, tel qu'elles sont faites ici, les zones pourraient être ajoutées dans le template html. Leur utilisation avec les transition pourraient être moins visibles à l'utilisateur novice.
=> oui on peut cacher l'utilisation des transitions dans les regions - à voir si ca ne cache pas la compréhension du truc

- De façon générale il faut quelque chose de plus simple, on doit pouvoir du moins rendre simple à un utilisateur novice l'utilisation du FW afin de le pousser à l'adopter. Afin de garder de la souplesse, les patterns doivent être utilisés coté FW, ces mêmes paradigmes pourront être utilisés par l'utilisateur expert. De la même manière, il faut qu'il soit utilisable et nécessaire sur les petits projets (temps d'apprentissage augmenté). L'idée est là, l'ensemble est plus souple mais perd en facilité immédiate...
=> effectivement c'est à tester / retravailler

Voilà pour commencer les réflexions, si tu as un peu de temps dans la semaine...


testing components - Renault | Jeu de la cle
-   install `jQuery.noConflict` _cf. [http://requirejs.org/docs/jquery.html#noconflictmap](http://requirejs.org/docs/jquery.html#noconflictmap)_
-   move backbones history inside fw ? - can cause problem if something async must be done before instaciating controller
-   add view helpers in base view => we should be able to configure or extend these helpers in some way
-   defaultTransition should use `html` instead of `appendTo`

-   abstract should have a kind of method like that:
```
    showSimpleView: function(regionId, view) {
        var region = this.layout.getRegion(regionId);
        var transition = region.createTransition(true);
        transition.show(view);
    }
```

-   `BaseView.onRender` is called both in `Transition` and `BaseView.render` - @TODO remove from transition
    in `Transition`, `View.onShow` should be called when the element is in the DOM but still hidden

    allow to path `template` in BaseView constructor

-   add a mixin to `underscore` to create json object we can use with a model from (`$.serialize` or) `$.serializeArray`
    @NOTE serialize() encode URI Components - this should be done from the save method of the model

-   `Layout.addRegion` should be able to insert the DOM element in the layout

-   `BaseView` add a setTemplate helper internally calling `buildTemplateCache`

-   `Transition` -> nextView.onShow should be called into an `_.defer` (cf. focus doesn't work properly)
