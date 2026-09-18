exports.up = function(knex) {
  return knex.schema.alterTable("alerts", function(table) {
    table.string("alert_classification", 50).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("alerts", function(table) {
    table.dropColumn("alert_classification");
  });
};