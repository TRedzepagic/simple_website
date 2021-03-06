# simple_website
A simple website with a database, as well as front-end and back-end components.

## To-Do
- Implement login system (Deleting only available to logged in admin user)
  
## Features
![Looks](/assets/looks.png)

This is a simple library-esque website.
You can:
- Add new books
- Update existing books
- Delete books
- List all books
- List a specific book
from the database.

## Cloning
You can "git clone" my repo with (Entire repository):

```
"git clone https://github.com/TRedzepagic/simple_website.git"
```

## Database configuration
To setup the database you need to install the mysql-server, which you can look up online.

**NOTE:** Database is named "WEBSITE" on mysql server, table is named "BOOKS".

To get the exact same table as me, inside the mysql shell, type these commands :
```
CREATE DATABASE WEBSITE;
USE WEBSITE;
CREATE TABLE BOOKS
(
    ISBN varchar(255) NOT NULL,
    TITLE varchar(255) NOT NULL,
    PAGES varchar(255) NOT NULL,
    YEAR varchar(255) NOT NULL,
    AUTHORNAME varchar(255) NOT NULL,
    PRIMARY KEY (ISBN)
);
```
While on the server, you can create a user with this command :

```
"CREATE USER 'your_website_user'@'localhost' IDENTIFIED BY 'your_website_password$';"
```
Then you need to grant the user access to our logging table, or else we will get an error :

```
"GRANT ALL PRIVILEGES ON WEBSITE.BOOKS TO 'your_website_user'@'localhost';"
```
Here we granted all privileges on our "BOOKS" table to our user named "your_website_user".