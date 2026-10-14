exports.up = function (knex) {
    return knex.schema.createTable("camera_recording_schedules", table => {
        table.tinyint("id").unsigned().primary();
        table.boolean("enabled").notNullable().defaultTo(false);
        table.time("start_time").notNullable();
        table.time("end_time").notNullable();
        table.json("days").notNullable();
        table.string("time_zone", 64).notNullable();
        table.integer("updated_by").unsigned().nullable();
        table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("camera_recording_schedules");
};
