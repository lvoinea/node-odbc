/* eslint-env node, mocha */
const assert = require('assert');
const odbc   = require('../../lib/odbc');

require('dotenv').config({ path: `.env` });

const DBMS_LIST = [
  'mssql',
];
global.dbms = undefined;
global.table = `${process.env.DB_NAME}.${process.env.DB_SCHEMA}.${process.env.DB_TABLE}`;

describe('UTF8...', () => {
  let connection = null;

  before(async () => {
    if (process.env.DBMS)
    {
      if (DBMS_LIST.indexOf(process.env.DBMS) > -1)
      {
        //require('dotenv').config({ path: `test/DBMS/${process.env.DBMS}/.env` });
        global.dbms = process.env.DBMS;
        
        statement = `CREATE TABLE ${global.table} (
          [Col Ω] nvarchar(255),
          [Col α] varchar(255)
        );`
        connection = await odbc.connect(`${process.env.CONNECTION_STRING}`);
        await connection.query(statement);
        await connection.close();        
        
      }
    }
    else 
    {
      let supportedDbmsList = '';
      DBMS_LIST.forEach((dbms) => {
        supportedDbmsList = supportedDbmsList.concat(`${dbms}, `);
      });
      supportedDbmsList = supportedDbmsList.slice(0, -2);
      throw new Error(`DBMS is not recognized. Supported DBMS values for running tests include: ${supportedDbmsList}`);      
    }    
  });

  beforeEach(async () => {
    connection = await odbc.connect(`${process.env.CONNECTION_STRING}`);
  });

  afterEach(async () => {
    await connection.close();
    connection = null;
  });

  after(async () => {    
    const connection = await odbc.connect(`${process.env.CONNECTION_STRING}`);
    await connection.query(`DROP TABLE ${global.table}`);
    await connection.close();    
  });

  describe('...with query...', () => {
    it('...should accept UTF8 value literals.', async () => {       
      statement = `insert into ${global.table} ([Col Ω], [Col α]) values (N'an Ω', 'other')`
      result = await connection.query(statement);
      assert.equal(result.statement, statement);
    });

    it('...should not accept UNICODE literal beyond UCS-2 (e.g., emoji 😀)', async () => {      
      statement = `insert into ${global.table} ([Col Ω], [Col α]) values (N'😀', 'other')`
      await assert.rejects(async() => connection.query(statement));   
      
      statement = `insert into ${global.table} ([Col Ω], [Col α]) values (N'\u{1F600}', 'other')`
      await assert.rejects(async() => connection.query(statement));

      statement = `insert into ${global.table} ([Col Ω], [Col α]) values (N'\u{1F600}', 'other')`
      await assert.rejects(async() => connection.query(statement));

      statement = `select [Col Ω] as [Col \u{1F600}] from ${global.table}`
      await assert.rejects(async() => connection.query(statement));
    });

    it('...should return UTF8 query values', async () => {      
      statement = `select [Col Ω],[Col α] from ${global.table}`
      result = await connection.query(statement);
      assert.deepEqual(result[0], { 'Col Ω': 'an Ω', 'Col α': 'other' });

      statement = `select "Col Ω","Col α" from ${global.table}`
      result = await connection.query(statement);
      assert.deepEqual(result[0], { 'Col Ω': 'an Ω', 'Col α': 'other' });

      statement = `select * from ${global.table} where [Col Ω] = N'an Ω'`
      result = await connection.query(statement);
      assert.deepEqual(result[0], { 'Col Ω': 'an Ω', 'Col α': 'other' });
    });
  });

  describe('...with columns...', () => {

    it('...should return UTF8 column names', async () => {      
      result = await connection.columns(
        process.env.DB_NAME, 
        process.env.DB_SCHEMA,
        process.env.DB_TABLE,
        null);
      assert.deepEqual(result[0]['COLUMN_NAME'], 'Col Ω');
      assert.deepEqual(result[1]['COLUMN_NAME'], 'Col α');
    });

    it('...should not accept UNICODE literals beyond UCS-2 (e.g., emoji 😀)', async () => {      
      await assert.rejects(async() => connection.columns(
        '😀', 
        '😀',
        '😀',
        null));
    });
  });

});
