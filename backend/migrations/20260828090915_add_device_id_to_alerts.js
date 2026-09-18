exports.up = function (knex) {

    return knex.schema.alterTable(
        "alerts",
        function (table) {

            table
                .integer("device_id")
                .unsigned()
                .nullable()
                .references("id")
                .inTable("cctv_devices")
                .onDelete("SET NULL")
                .onUpdate("CASCADE");

        }
    );

};


exports.down = function (knex) {

    return knex.schema.alterTable(
        "alerts",
        function (table) {

            table.dropColumn("device_id");

        }
    );

};