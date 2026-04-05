# Mon Vieux Grimoire - Backend

Ce projet est l'API du site de notation de livres "Mon Vieux Grimoire".

## Prérequis
* [Node.js](https://nodejs.org/) (v16 ou supérieur)
* Un compte [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## Installation
1. Clonez le dépôt.
2. Allez dans le dossier backend : `cd backend`.
3. Installez les dépendances : `npm install`.

## Configuration
Créez un fichier `.env` dans le dossier backend et ajoutez votre variable de connexion :
`MONGO_URL=mongodb+srv://<username>:<password>@cluster0.jbqulg2.mongodb.net/?retryWrites=true&w=majority`

## Lancement
Pour démarrer le serveur (port 4000 par défaut) :
`node server` ou `npm start`