# odbc

This is a fork of the "Node.js bindings for unixODBC" project available at https://github.com/markdirish/node-odbc.

The main goals of this fork are to:
- add UNICODE support when running under Linux/MacOS with the official MS SQL Server ODBC driver [available here](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16).
- [TODO] add suport for bulk inserts.
- [TODO] add support for connection state reset.

The original documentation is available at [here](README.original.md).

This document contains additional information regarding the proposed additons.

## Setting up

- Make sure Node.js is installed
- Install packages `npm ci`
- Install other library dependencies:
    - libiconv
    For MacOS: `brew install libiconv`

## Development

Make sure Node.js package `node-pre-gyp` is installed in the global space.

- Use `node-pre-gyp` commands to build and package:
    eg: `node-pre-gyp build --debug`
- To deploy
    - Set-up a `NODE_PRE_GYP_GITHUB_TOKEN`
    - Update the `package.json` to point to an accesible repository
    - run `npm run publish`

## Testing

Make sure Node.js package `mocha` is installed in the global space

Prepare a `.env` file in the root with the following structure:

```
DBMS=mssql
CONNECTION_STRING=DSN=...;UID=...;PWD=...;
DB_SCHEMA=dbo
DB_TABLE=Tαble
DB_NAME=ΩDBC
```
Replace the `...` with appropriate values and make sure the `ΩDBC` database and `dbo` schema exist in the SQL Server.

`npm run test-utf8`

