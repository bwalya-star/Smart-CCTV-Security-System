exports.up = async function (knex) {
    await knex.schema.createTable("camera_motion_settings", table => {
        table.tinyint("id").unsigned().primary();
        table.boolean("enabled").notNullable().defaultTo(true);
        table.boolean("failsafe_enabled").notNullable().defaultTo(false);
        table.time("failsafe_time").notNullable().defaultTo("18:00:00");
        table.string("time_zone", 64).notNullable().defaultTo("UTC");
        table.date("last_failsafe_date").nullable();
        table.integer("updated_by").unsigned().nullable();
        table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });

    await knex("camera_motion_settings").insert({
        id: 1,
        enabled: true,
        failsafe_enabled: false,
        failsafe_time: "18:00:00",
        time_zone: "UTC"
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("camera_motion_settings");
};
