/**
 * Add user_id to alerts table
 */
exports.up = function (knex) {
    return knex.schema.table("alerts", function (table) {

        table
            .integer("user_id")
            .unsigned()
            .nullable()
            .references("id")
            .inTable("users")
            .onDelete("SET NULL")
            .onUpdate("CASCADE");

    });
};


/**
 * Remove user_id if migration is rolled back
 */
exports.down = function (knex) {
    return knex.schema.table("alerts", function (table) {

        table.dropForeign(
            "user_id"
        );

        table.dropColumn(
            "user_id"
        );

    });
};