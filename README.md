# nasa-mission-control-project

A NASA Dashboard for scheduling launches and accessing official SpaceX launches.

## Instalation

This project requires Concurrently v9.6.6^ to install dependencies


You"ll also need to create a MONGO_URL="Mongo Cluster URL" variable in a .env file inside /server directory.

 ```sh
  npm install -g concurrently
```

Install all dependencies:

 ```sh
  npm run install-all
```

Then, run:

 ```sh
  npm run server
```

You're good to go!
