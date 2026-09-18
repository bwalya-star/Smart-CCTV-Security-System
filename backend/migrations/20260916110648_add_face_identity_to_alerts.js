/**
 * Add face recognition information to alerts
 */

exports.up = function(knex) {
  return knex.schema.alterTable("alerts", function(table) {

    table.string("identity_name", 100)
      .nullable();

    table.float("face_similarity")
      .nullable();

    table.string("identity_status", 50)
      .nullable();

  });
};

exports.down = function(knex) {
  return knex.schema.alterTable("alerts", function(table) {

    table.dropColumn("identity_name");

    table.dropColumn("face_similarity");

    table.dropColumn("identity_status");

  });
};