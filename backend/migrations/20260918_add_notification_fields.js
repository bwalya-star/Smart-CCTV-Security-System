exports.up = function(knex) {
  return knex.schema.alterTable("alerts", function(table) {

    table.boolean("notification_sent")
      .nullable()
      .defaultTo(false);

    table.string("notification_channel", 30)
      .nullable();

    table.string("notification_status", 30)
      .nullable();

  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("alerts", function(table) {

    table.dropColumn("notification_sent");

    table.dropColumn("notification_channel");

    table.dropColumn("notification_status");

  });
};
