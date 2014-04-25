README
=======================================================

simple framework draft
(MVC - Plugin oriented)

## dependencies

-   backbone
-   underscore
-   jquery
-   whenjs
-   preloadjs _(optionnal)_
-   requirejs

@TODO :
-   extract project from test app
-   remove requirejs dependency - prefer `browserify` for build step
-   allow global, AMD and CommonJS integration

_inspired from Chaplin architecture_

## install

```sh
$ cd path/to/project
$ npm install
$ bower install
$ node app.js
```

the main file is `public/js/main.js`

## notes

for local dev of bower module, see: [https://oncletom.io/2013/live-development-bower-component/](https://oncletom.io/2013/live-development-bower-component/)

