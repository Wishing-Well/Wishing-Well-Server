# Wishing-Well
Server provides a back-end to Wishing-Well React Native.
It will have user authentication, user information, and provide routes for the front end.

## Prerequisites
Install required modules with the command `npm install`.

Under server/server, change redis_secret_example.js to redis_secret.js and substitute your own secret inside the file.
 

##  Getting Started
In the server folder, the index.js will run the server.  Use the command below to start the server: 

``` nodemon server/index.js ```

##  Notes for DevOps
Body parser and bcrypt will need to be manually installed from /srv/Wishing-Well-Server.

