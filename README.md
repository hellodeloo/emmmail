# Emmmail

**Emmmail** est un starter-kit qui aide à l'intégration d'emails responsifs.

Il est construit sur **[Foundation for Emails 2.2.0](http://foundation.zurb.com/emails.html)** et utilise **[Gulp 4](http://gulpjs.com/)**, **[Babel](https://babeljs.io/)**, **ES6** et **[Sass](http://sass-lang.com/)**.

## Installation

```
git clone git@github.com:hellodeloo/emmmail.git
```

```
cd emmmail
yarn install
```

## Utilisation

**Personnalisez** les variables de `folder`, `email`, `conn`, `smtp` du `gulpfile.babel.js`

**Développez** dans le dossier "src" et lancer la commande `gulp dev` qui se chargera de:

- Lancer le BrowserSync
- Compiler le scss
- Optmiser les images
- Inliner le css
- Placer l'ensemble dans le répertoire "dist"

**Hébergez** sur ftp avec `gulp deploy`

**Envoyez** un email test avec `gulp send`

Puis **générez le livrable** zippé avec `gulp build`
