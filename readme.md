# Overview

Welcome to the Step-X repository. This repo is dedicated to the API created for the data extraction and manipulation of the World Bank's database called STEP. Bellow in this readme, it will be explained the installation and usage process.

The API was created using the following technologies:

- TypeScript
- Node
- MongoDB
- Restify


## Installation process

To install and prepare the Step-X environment it's necessary to follow these instructions in order, step by step. To start, it's needed to:


- Install the [Node.js](https://nodejs.org/en/download/) 
- Install the [migrate-mongo](https://www.npmjs.com/package/migrate-mongo) for the database migration and initial configuration
- Install [PM2](https://pm2.keymetrics.io/) (if you wish, you can skip this step)
- Install [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/) in your machine or server

Once installed the required tools describe above, we need to install the libraries used in this project. To make that, execute the command below:

    npm i

After that, your workspace is prepared to execute the API, but you will need to follow some configuration instructions that will be described in the next steps.


## Configuration process

To use the API, first some configurations is required, such as creating a valid user in the database and the api key used in the encryption process. To generate the valid user, perform the generateNewUser migration available at src/data/migrations:

    migrate-mongo up

The database in this example is called stepX, change the name according to your configuration. The database in this example is called stepX, change the name according to your configuration. The default password will be WorldBank123.

Configure the file migrate-mongo-config.js according to the configuration of your environment. Pay attention to the password and api key used in the src/config/environment.ts file. Because it will serve to encrypt the user's initial password.

## Running the application
To start the application, it is first necessary to transpiling the code with the command below:

    npm run build

The application can finally be run with the command:

    npm run dev

## Running the application in a production environment
If you want to start the application in a production environment using pm2, run the following command:

    npm run build && pm2 startOrReload ecosystem.config.js --env production     