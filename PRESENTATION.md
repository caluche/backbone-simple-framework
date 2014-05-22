PRESENTATION
====================================================

## Etat de des lieux

### Core

_Qualités :_

- gestion des assets
- gestion des transitions
- qualités inhérentes à l'utilisation d'un framework

_Problèmes :_

- maintenabilité (interdépendences, redondances dans le code, ...)
- obfuscation de backbone (le bonnes pratiques de backbone ne sont pas transposables)
- lenteur
- API peu lisible


### Georgette

#### _approche :_

- réinjection d'une couche controlleur / plus de résponsabilité au développeur
- moins de résponsabilités données aux vues
- notion (objet) `Transition`
- approche modulaire : beaucoup de composants peuvent être utilisés dans un projet sans utiliser l'ensemble du framework
- possibilité de création de plugins, bibliothèque de transitions
- API : cherche à être consistante avec celle de backbone


#### dependences :

- underscore
- jquery
- backbone
- requirejs
- requirejs-text (n'est nécessaire qu'en dev, les templates sont minifiés avec le reste du code)
- when (pourrait remplacé par une implémentation plus légère)
- es5-polyfill (pour when.js dans les vieux navigateurs)
- PreloadJS (optionnel - peux être remplacé)


#### _environnement / overview :_

- dépendences (cf. bower)
- qu'est ce qui est de résponsabilité du framework et qu'est ce qui ne l'est pas
- configuration de l'environnement
- configuration de l'application
- cycles de vie :
    - configuration
    - bootstrap
    - cycle de vie d'une route (schema)
- minification (r.js) / mise en prod (cf. example config renault)


#### _sytème de dossiers :_

- notion de `components`
- PubSub


#### _routing :_

- router
- dispatcher
    *   object `Request`
    *   introduction aux events
- controlleurs
    *   states controlleurs
    *   common controllers


#### _vues :_

- layout
- regions
- base-view, model-view
- transitions
- loader


#### _plugins / assets

- structure de base d'un plugin
- _example_ : assets management















