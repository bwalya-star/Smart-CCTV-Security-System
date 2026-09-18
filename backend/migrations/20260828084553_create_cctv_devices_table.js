exports.up = function (knex) {

    return knex.schema.createTable(
        "cctv_devices",
        function (table) {

            table.increments("id").primary();

            table
                .integer("user_id")
                .unsigned()
                .notNullable()
                .references("id")
                .inTable("users")
                .onDelete("CASCADE")
                .onUpdate("CASCADE");

            table.string("device_name", 100).notNullable();

            table.string("device_code", 100)
                .notNullable()
                .unique();

            table.boolean("is_active")
                .notNullable()
                .defaultTo(true);

            table.timestamp("created_at")
                .defaultTo(knex.fn.now());

            table.timestamp("updated_at")
                .defaultTo(knex.fn.now());
        }
    );

};


exports.down = function (knex) {

    return knex.schema.dropTableIfExists(
        "cctv_devices"
    );

};