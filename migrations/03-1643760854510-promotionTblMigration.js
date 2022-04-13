const {
  MigrationInterface, 
  QueryRunner, 
  Table, 
  TableIndex, 
  TableColumn, 
  TableForeignKey 
} = require("typeorm");

// Define Seed Data
// const insertStatement = `INSERT INTO domain (name, base_url, acct_id, create_date, update_date) 
//    VALUES ("default", "/blog", 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;   

console.log("PROMOTION TABLE MIGRATION");

// Define Migration Change(s)
module.exports = class promotionTblMigration1643760854510 {
    name = 'promotionTblMigration1643760854510'

    /* Create Table */
    async up(queryRunner) {
      await queryRunner.createTable(
        new Table({
          name: 'promotion',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'acct_id',      type: 'integer' },
            { name: 'domain_id',    type: 'integer' },
            { name: 'contentmd_id', type: 'integer' },
            { name: 'parent_contentmd_id', type: 'integer' },
            { name: 'parent_id',    type: 'integer' },
            { name: 'create_date',  type: 'timestamp', default: 'now()' },
            { name: 'update_date',  type: 'timestamp', default: 'now()' }
          ],
        }),
      );
      
      /* Insert Seed Data */
      // await queryRunner.query(insertStatement);
    }
           
    async down(queryRunner) {
      await queryRunner.dropTable("domain");
    }

  };
  

