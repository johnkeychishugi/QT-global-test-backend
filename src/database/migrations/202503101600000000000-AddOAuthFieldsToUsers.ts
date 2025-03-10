import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOAuthFieldsToUsers202503101600000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make passwordHash nullable
    await queryRunner.changeColumn(
      'users',
      'passwordHash',
      new TableColumn({
        name: 'passwordHash',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Add OAuth columns
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'picture',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'provider',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'providerId',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert passwordHash to not nullable
    await queryRunner.changeColumn(
      'users',
      'passwordHash',
      new TableColumn({
        name: 'passwordHash',
        type: 'varchar',
        isNullable: false,
      })
    );

    // Drop the OAuth columns
    await queryRunner.dropColumn('users', 'picture');
    await queryRunner.dropColumn('users', 'provider');
    await queryRunner.dropColumn('users', 'providerId');
  }
} 