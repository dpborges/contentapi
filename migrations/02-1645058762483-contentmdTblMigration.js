const {  
  MigrationInterface, 
  QueryRunner, 
  Table, 
  TableIndex, 
  TableColumn, 
  TableForeignKey  
} = require("typeorm");

console.log("CONTENTMD TABLE MIGRATION ");

// const insertStatement = `INSERT INTO domain (name, base_url, acct_id, create_date, update_date) 
//    VALUES ("default", "/blog", 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;   

module.exports = class contentmdTblMigration1645058762483 {
  name = 'contentmdTblMigration1645058762483';

   async up(queryRunner) {
      await queryRunner.createTable(
        new Table({
          name: 'contentmd',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'acct_id',    type: 'integer' },
            { name: 'domain_id',  type: 'integer' },
            { name: 'creator_id', type: 'varchar' },
            { name: 'content_id', type: 'varchar' },
            { name: 'title',      type: 'varchar' },
            { name: 'slug',       type: 'varchar' },
            { name: 'base_url',   type: 'varchar' },
            { name: 'excerpt', type: 'varchar'    },
            { name: 'images',  type: 'varchar'    },
            { name: 'content_type', type: 'varchar' },
            { name: 'file_type',    type: 'varchar' },
            { name: 'word_cnt',     type: 'integer' },
            { name: 'lang',     type: 'varchar'     },
            // { name: 'domain',   type: 'varchar'     },
            { name: 'create_date', type: 'timestamp'},
            { name: 'update_date', type: 'timestamp'}
          ],
        }),
      );
     
       /* Insert Seed Data */
      //  await queryRunner.query(insertStatement);
    }

    async down(queryRunner) {
      await queryRunner.dropTable("conentmd");
    }

}
        