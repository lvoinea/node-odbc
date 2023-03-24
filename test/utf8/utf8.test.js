/* eslint-env node, mocha */
const assert = require('assert');
const odbc   = require('../../lib/odbc');

require('dotenv').config({ path: `.env` });

const DBMS_LIST = [
  'mssql',
];
global.dbms = undefined;
global.table = `${process.env.DB_NAME}.${process.env.DB_SCHEMA}.${process.env.DB_TABLE}`;

describe('UTF8:', () => {
  let connection = null;

  before(async () => {
    if (process.env.DBMS)
    {
      if (DBMS_LIST.indexOf(process.env.DBMS) > -1)
      {
        //require('dotenv').config({ path: `test/DBMS/${process.env.DBMS}/.env` });
        global.dbms = process.env.DBMS;
        
        connection = await odbc.connect(`${process.env.CONNECTION_STRING}`);
        
        ddl_statements = [
          `CREATE TABLE ${global.table} (
            [Col Ω] nvarchar(255),
            [Col α] varchar(255)
          );`,
          `USE [${process.env.DB_NAME}]`,
          `DROP PROCEDURE IF EXISTS [${process.env.DB_SCHEMA}].[ΩProc]`,
          `CREATE PROCEDURE [${process.env.DB_SCHEMA}].[ΩProc] @value NVARCHAR(32) AS SELECT N'Ω', @value;`
        ]
        for (const statement of ddl_statements) {          
          await connection.query(statement);
        }
        console.log('Exit');
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
    await connection.query(`USE [${process.env.DB_NAME}]`);
    await connection.query(`DROP PROCEDURE [${process.env.DB_SCHEMA}].[ΩProc]`);
    await connection.close();    
  });

  describe('...with connection.query()', () => {
    it('- should accept UTF8 value literals.', async () => {       
      statement = `insert into ${global.table} ([Col Ω], [Col α]) values (N'an Ω', 'other')`
      result = await connection.query(statement);
      assert.equal(result.statement, statement);
    });

    it('- should not accept UNICODE literal beyond UCS-2 (e.g., emoji 😀)', async () => {      
      statement = `insert into ${global.table} ([Col Ω], [Col α]) values (N'😀', 'other')`
      await assert.rejects(async() => connection.query(statement));   
      
      statement = `insert into ${global.table} ([Col Ω], [Col α]) values (N'\u{1F600}', 'other')`
      await assert.rejects(async() => connection.query(statement));

      statement = `insert into ${global.table} ([Col Ω], [Col α]) values (N'\u{1F600}', 'other')`
      await assert.rejects(async() => connection.query(statement));

      statement = `select [Col Ω] as [Col \u{1F600}] from ${global.table}`
      await assert.rejects(async() => connection.query(statement));
    });

    it('- should return UTF8 query values', async () => {      
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

    it('- should accept UTF8 literals when prepared via query parameters', async () => {
      statement = `insert into ${global.table} ([Col Ω], [Col α]) values (?, ?)`
      result = await connection.query(statement, ['Ω prepare','other']);
      assert.equal(result.statement, statement);
      assert.deepEqual(result.parameters, [ 'Ω prepare', 'other' ]);
    });

  });  

  describe('...with connection.columns()', () => {

    it('- should accept UTF8 literals', async () => {      
      result = await connection.columns(
        process.env.DB_NAME, 
        process.env.DB_SCHEMA,
        process.env.DB_TABLE,
        null);
      assert.deepEqual(result[0]['COLUMN_NAME'], 'Col Ω');
      assert.deepEqual(result[1]['COLUMN_NAME'], 'Col α');
    });

    it('- should accept NULL values', async () => {      
      result = await connection.columns(
        process.env.DB_NAME, 
        process.env.DB_SCHEMA,
        null,
        null);
        assert.deepEqual(result[0]['COLUMN_NAME'], 'Col Ω');
        assert.deepEqual(result[1]['COLUMN_NAME'], 'Col α');
    });

    it('- should not accept UNICODE literals beyond UCS-2 (e.g., emoji 😀)', async () => {      
      await assert.rejects(async() => connection.columns(
        '😀', 
        '😀',
        '😀',
        null));
    });
  });

  describe('...with connection.tables()', () => {
    it('- should accept UTF8 literals', async () => {
      result = await connection.tables(
        process.env.DB_NAME, 
        process.env.DB_SCHEMA,
        process.env.DB_TABLE,
        'TABLE');
      assert.deepEqual(result[0]['TABLE_CAT'], process.env.DB_NAME);
      assert.deepEqual(result[0]['TABLE_SCHEM'], process.env.DB_SCHEMA);
      assert.deepEqual(result[0]['TABLE_NAME'], process.env.DB_TABLE);
      assert.deepEqual(result[0]['TABLE_TYPE'], 'TABLE');
    });

    it('- should accept NULL values', async () => {      
      result = await connection.tables(
        process.env.DB_NAME, 
        process.env.DB_SCHEMA,
        null,
        null);
      assert.deepEqual(result[0]['TABLE_CAT'], process.env.DB_NAME);
      assert.deepEqual(result[0]['TABLE_SCHEM'], process.env.DB_SCHEMA);
      assert.deepEqual(result[0]['TABLE_NAME'], process.env.DB_TABLE);
      assert.deepEqual(result[0]['TABLE_TYPE'], 'TABLE');
    });

    it('- should not accept UNICODE literals beyond UCS-2 (e.g., emoji 😀)', async () => {      
      await assert.rejects(async() => connection.tables(
        '😀', 
        '😀',
        '😀',
        null));
    });

  });

  describe('...with statement.prepare()', () => {

    it('- should accept UTF8 literals', async () => {
      statement = await connection.createStatement();
      await assert.doesNotReject(async() => statement.prepare(
        "insert into ΩDBC.dbo.Tαble2 ([Col Ω], [Col α]) values (?, ?)"));
    });

    it('- should not accept UNICODE literal beyond UCS-2 (e.g., emoji 😀)', async () => {      
      statement = await connection.createStatement();
      await assert.rejects(async() => statement.prepare(
        "insert into ΩDBC.dbo.Tαble2 ([Col Ω], [Col 😀]) values (?, ?)"));
    });

  });

  describe('...with statement.callProcedure()', () => {
    
    it('- should accept UTF8 literals', async () => {
      result = await connection.callProcedure(process.env.DB_NAME, process.env.DB_SCHEMA, 'ΩProc', ['α']);
      assert.equal(result.statement, `{ CALL ${process.env.DB_NAME}.${process.env.DB_SCHEMA}.ΩProc (?) }`);
      assert.deepEqual(result.parameters, [ 'α' ]);
    });

  });

});
