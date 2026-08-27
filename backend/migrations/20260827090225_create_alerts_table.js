exports.up = function (knex) {
    return knex.schema.createTable("alerts", function (table) {
        table.increments("id").primary();
        table.string("image_path", 255);
        table.boolean("detected");
        table.float("confidence");
        table.string("status", 50);
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("alerts");
};exports.up = function(knex) {
	return knex.schema.createTable("alerts", function(table) {
		table.increments("id").primary();
		table.string("image_path", 255);
		table.boolean("detected");
		table.float("confidence");
		table.string("status", 50);
		table.timestamp("created_at").defaultTo(knex.fn.now());
	});
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists("alerts");
};
