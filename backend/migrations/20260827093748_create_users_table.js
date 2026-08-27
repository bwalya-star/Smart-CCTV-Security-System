exports.up = function (knex) {
    return knex.schema.createTable("users", function (table) {

        table.increments("id").primary();

        table.string("name", 100).notNullable();

        table.string("email", 150)
            .notNullable()
            .unique();

        table.string("password_hash", 255)
            .notNullable();

        table.string("role", 50)
            .notNullable()
            .defaultTo("user");

        table.timestamp("created_at")
            .defaultTo(knex.fn.now());

        table.timestamp("updated_at")
            .defaultTo(knex.fn.now());

    });
};


exports.down = function (knex) {
    return knex.schema.dropTableIfExists("users");
};