exports.up = function (knex) {
    return knex.schema.createTable("enrolled_people", table => {
        table.increments("id").primary();
        table.integer("user_id").unsigned().notNullable()
            .references("id").inTable("users")
            .onDelete("CASCADE").onUpdate("CASCADE");
        table.string("name", 100).notNullable();
        table.string("relationship", 60).notNullable();
        table.text("notes").nullable();
        table.integer("photo_count").unsigned().notNullable();
        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
        table.unique(["user_id", "name"], "enrolled_people_user_name_unique");
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("enrolled_people");
};
