exports.up = (pgm) => {
  pgm.createTable("users", {
    id: { type: "serial", primaryKey: true },
    name: { type: "varchar(100)", notNull: true },
    username: { type: "varchar(50)", notNull: true, unique: true },
    email: { type: "varchar(100)", notNull: true, unique: true },
    password: { type: "varchar(255)", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });
};
