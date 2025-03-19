exports.up = (pgm) => {
  pgm.createTable("sessions", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    token: {
      type: "text",
      notNull: true,
      unique: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    expires_at: {
      type: "timestamptz",
      notNull: true,
    },
  });
};
