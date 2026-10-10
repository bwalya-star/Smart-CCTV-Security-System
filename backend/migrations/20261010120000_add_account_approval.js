exports.up = async function (knex) {
    await knex.schema.alterTable("users", table => {
        table.string("contact_phone", 40).nullable();
        table.string("property_type", 30).nullable();
        table.text("property_information").nullable();
    });

    await knex.schema.createTable("account_requests", table => {
        table.increments("id").primary();
        table.string("name", 100).notNullable();
        table.string("email", 150).notNullable();
        table.string("contact_phone", 40).notNullable();
        table.string("property_type", 30).notNullable();
        table.text("property_information").nullable();
        table.string("password_hash", 255).notNullable();
        table.string("status", 20).notNullable().defaultTo("pending");
        table.integer("reviewed_by").unsigned().nullable()
            .references("id").inTable("users").onDelete("SET NULL").onUpdate("CASCADE");
        table.timestamp("reviewed_at").nullable();
        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        table.index(["status", "created_at"]);
        table.index(["email", "status"]);
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("account_requests");
    await knex.schema.alterTable("users", table => {
        table.dropColumn("contact_phone");
        table.dropColumn("property_type");
        table.dropColumn("property_information");
    });
};
