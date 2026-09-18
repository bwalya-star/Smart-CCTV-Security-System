exports.up = function (knex) {

    return knex.schema.alterTable(
        "cctv_devices",
        function (table) {

            table
                .string("device_secret", 255)
                .nullable()
                .unique();

        }
    );

};


exports.down = function (knex) {

    return knex.schema.alterTable(
        "cctv_devices",
        function (table) {

            table.dropColumn("device_secret");

        }
    );

};