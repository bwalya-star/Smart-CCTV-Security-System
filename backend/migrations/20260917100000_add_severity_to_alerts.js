exports.up = function(knex) {
  return knex.schema.alterTable("alerts", function(table) {
    table.string("severity", 20).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("alerts", function(table) {
    table.dropColumn("severity");
  });
};
