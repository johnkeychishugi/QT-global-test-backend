import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateClicksTable1650000000002 implements MigrationInterface {
  name = 'CreateClicksTable202503091650000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'clicks',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'referrer',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'urlId',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      'clicks',
      new TableForeignKey({
        columnNames: ['urlId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'urls',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('clicks');
  }
} 