const {
  MigrationInterface, 
  QueryRunner, 
  Table, 
  TableIndex, 
  TableColumn, 
  TableForeignKey 
} = require("typeorm");

module.exports = class domainTblMigration1643760854508 {
    name = 'domainTblMigration1643760854508'

    async up(queryRunner) {
      await queryRunner.createTable(
        new Table({
          name: 'domain',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'name',
              type: 'varchar',
            },
            {
              name: 'base_url',
              type: 'varchar',
            },
            {
              name: 'acct_id',
              type: 'integer',
            },
            {
              name: 'create_date',
              type: 'timestamp',
              default: 'now()'
            },
            {
              name: 'update_date',
              type: 'timestamp',
              default: 'now()'
            },
          ],
        }),
      );
    }
   
    async down(queryRunner) {
      await queryRunner.dropTable("domain");
    }
  };
  

