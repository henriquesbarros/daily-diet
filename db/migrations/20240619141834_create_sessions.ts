import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sessions', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.string('token', 255).notNullable().unique()
    table.string('refresh_token', 255).notNullable().unique()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('expires_at').notNullable()
    table.timestamp('refresh_expires_at').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('sessions')
}
