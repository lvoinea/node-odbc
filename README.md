# uODBC

This is a fork of the **Node.js bindings for unixODBC** project available at https://github.com/markdirish/node-odbc.

The main goals of this fork are to:
- add UNICODE support when running under Linux/MacOS with the official MS SQL Server ODBC driver [available here](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16).
- [TODO] add suport for bulk inserts.
- [TODO] add support for connection state reset to connection pooling.

The original documentation is available at [here](README.original.md).

This document contains additional information regarding the proposed additons.

---
## Functional specification

This is targeted at the use of the official [MS SQL Server ODBC driver]((https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16)) under Linux with [unixODBC](https://www.unixodbc.org/) as driver manager.
### UTF-8 Support

- Handle UTF-8 literals in queries.
    Example: 
    ```
    insert into ΩDBC.dbo.Tαble2 ([Col Ω], [Col α]) values (N'Ω', N'α')
    ```
    > **WARNING**: ODBC only supports the UCS-2 subset of UNICODE. Characters such as 😀 (emojii) are therefore not supported, even if they can be represented in UTF-8.
---
## Usage

- Set the `locale` on your system to a UTF-8 compatible encoding (e.g., `en_US.UTF-8`).
- Install `libiconv` if not present
  For MacOS: `brew install libiconv`
- Install the package from GitHub:
 `npm install https://github.com/lvoinea/node-odbc`
- Require package `uodbc` in your `js` script:
    ```
    const odbc = require('uodbc');
    const connection = await odbc.connect('DSN=...;UID=...;PWD=...;');
    statement = "insert into ΩDBC.dbo.Tαble2 ([Col Ω], [Col α]) values (N'an Ω', 'other')"
    result = await connection.query(statement);
    ```
- For more details over the supported API see original documentation [here](README.original.md).


---
## Development
### Setting up

- Make sure `Node.js` is installed
- Install packages `npm ci`
- Install other library dependencies:
    - `libiconv`
    For MacOS: `brew install libiconv`

### Building

Make sure `Node.js` package `node-pre-gyp` is installed in the global space.

- Use `node-pre-gyp` commands to build and package:
    eg: `node-pre-gyp build --debug`
- To deploy:
    - Set-up a `NODE_PRE_GYP_GITHUB_TOKEN`
    - Update the `package.json` to point to an accesible repository
    - run `npm run publish`

### Testing

- Make sure `Node.js` package `mocha` is installed in the global space

- Prepare a `.env` file in the root with the following structure:
    ```
    DBMS=mssql
    CONNECTION_STRING=DSN=...;UID=...;PWD=...;
    DB_SCHEMA=dbo
    DB_TABLE=Tαble
    DB_NAME=ΩDBC
    ```
    Replace the `...` with appropriate values and make sure the `ΩDBC` database and `dbo` schema exist in the SQL Server.

- Run command: `npm run test-utf8`

