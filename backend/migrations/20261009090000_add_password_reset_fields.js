exports.up = function (knex) {
    return knex.schema.alterTable("users", function (table) {
        table.string("password_reset_token_hash", 64).nullable();
        table.timestamp("password_reset_expires_at").nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable("users", function (table) {
        table.dropColumn("password_reset_token_hash");
        table.dropColumn("password_reset_expires_at");
    });
};