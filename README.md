# Web application example

Application with the following stack:

- Templating: Jade
- MVC client: Angular.js
- Routing: Angular.js & Express Connect
- Application Structure: Express.js
- Server Running Environment: Node.js
- Database: PostgreSQL


## Prerequisites

Configured and accessible from console:
    - Node.js
    - NPM
    - Git
    
PostgreSQL DBMS installed and a database


## How to use this code

- Clone the repository:
  git clone 
  
- Open a console (e.g. cmd) and run:
  npm install

- Define an environment variable named DATABASE_URL:
  (windows) set DATABASE_URL=postgres://postgres:<password>@localhost/<db-name>
  (unix) DATABASE_URL=postgres://postgres:<password>@localhost/<db-name>; export DATABASE_URL


## Before running the app

- On pgAdmin, create a databased named:
  <db-name>

- Then run database scripts on database <db-name>, in the following order:
  tables.sql
  test_data.sql
  (only if PROD) production/new_user.sql
  patches/tables_patch0001.sql
  patches/tables_patch0002.sql
  patches/tables_patch0003.sql
  patches/tables_patch0004.sql
  patches/tables_patch0005.sql
  patches/tables_patch0006.sql
  (only if PROD) production/new_user_hash.sql
  test_data_hash.sql

## Running the app

- Runs like a typical express app:

    node app.js

- Then, using Chrome or Safari, access:

    localhost:3000


## Directory Layout
    
    app.js                     --> app config (login/logout routes and handling, API routes, modules import)
    package.json               --> for npm modules installation
    db/
      tables.sql                 --> database schema
      new_user.sql               --> first users of the platform
      test_data.sql              --> first test data to insert on database
      tables_patchXXXX.sql       --> patches to the database, ordered by number XXXX
    public/                    --> all of the files to be used in on the client side
      css/                       --> css files
        styles.css                 --> ORB template main stylesheet
        new-design.css             --> Earthindicators' style and other styles override
      img/                       --> image files
      images/                    --> images files
      js/                        --> javascript files
        app.js                     --> top-level app module for Angular.js
        controllers.js             --> Angular.js controllers
        directives.js              --> custom Angular.js directives
        filters.js                 --> custom Angular.js filters
        services.js                --> custom Angular.js services
        lib/                       --> Angular.js and other 3rd party JavaScript libraries
    routes/
      api.js                       --> route for serving JSON (API that accesses the database)
      index.js                     --> route for serving HTML pages and partials
      socket.js                    --> socket.io message definitions
    views/
      index.jade                 --> main page for app
      layout.jade                --> doctype, title, head boilerplate
      partials/                  --> angular view partials (partial jade templates)
        alerts.jade                --> alerts page
        config.jade                --> config data page
        dashboard.jade             --> dashboard page
        data.jade                  --> manage data page
        indicatorPoint.jade        --> indicator of a given point page
        leftMenu.jade              --> partial of partials for the left menu bar (all pages except alerts)
        leftMenuAlerts.jade        --> partial of partials for the left menu bar (only for alerts pages)
        

        stats.jade                 --> config page (contains some metrics and users' login state)


## License
None
