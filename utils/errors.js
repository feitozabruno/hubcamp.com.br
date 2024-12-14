export class BaseError extends Error {
  constructor(name, message, action, status_code) {
    super(message);
    this.name = name;
    this.action = action;
    this.status_code = status_code;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class ValidationError extends BaseError {
  constructor(message) {
    super(
      "validation_error",
      message || "Todos os campos são obrigatórios.",
      "Verifique os campos enviados e tente novamente.",
      400,
    );
  }
}

export class RequestBodyError extends BaseError {
  constructor(message) {
    super(
      "request_body_error",
      message || "Não foi possível converter o corpo da requisição para JSON.",
      "Verifique o formato do corpo da requisição e tente novamente.",
      400,
    );
  }
}

export class DatabaseConnectionError extends BaseError {
  constructor(message) {
    super(
      "database_connection_error",
      message || "Falha ao conectar com o banco de dados.",
      "Tente novamente mais tarde ou contate o suporte",
      503,
    );
  }
}

export class DatabaseSyntaxError extends BaseError {
  constructor(message) {
    super(
      "database_syntax_error",
      message || "Erro de sintaxe do comando SQL.",
      "Verifique a sintaxe do comando SQL e tente novamente.",
      500,
    );
  }
}

export class MigrationError extends BaseError {
  constructor(message) {
    super(
      "migration_error",
      message || "Falha ao buscar ou executar migrações",
      "Verifique o modelo de migração e tente novamente.",
      500,
    );
  }
}

export class DuplicateEntryError extends BaseError {
  constructor(conflictField = "username ou email") {
    super(
      "duplicate_entry_error",
      `O ${conflictField} já existe.`,
      `Escolha um ${conflictField} diferente e tente novamente.`,
      409,
    );
  }
}

export class NotFoundError extends BaseError {
  constructor(resource = "recurso") {
    super(
      "not_found_error",
      `${resource} não encontrado.`,
      `Verifique se o ${resource} existe e tente novamente.`,
      404,
    );
  }
}

export function handleError(err) {
  if (err instanceof ValidationError) {
    return Response.json(err, {
      status: err.status_code,
    });
  }

  if (err instanceof RequestBodyError) {
    return Response.json(err, {
      status: err.status_code,
    });
  }

  if (err instanceof NotFoundError) {
    return Response.json(err, {
      status: err.status_code,
    });
  }

  if (err instanceof MigrationError) {
    return Response.json(err, {
      status: err.status_code,
    });
  }

  if (err.code === "23502") {
    const validationError = new ValidationError();

    return Response.json(validationError, {
      status: validationError.status_code,
    });
  }

  if (err.code === "23505") {
    const detail = err.detail || "";
    let conflictField = "unknown";

    if (detail.includes("username")) {
      conflictField = "username";
    } else if (detail.includes("email")) {
      conflictField = "email";
    }

    const duplicateError = new DuplicateEntryError(conflictField);

    return Response.json(duplicateError, {
      status: duplicateError.status_code,
    });
  }

  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    const connectionError = new DatabaseConnectionError();

    return Response.json(connectionError, {
      status: connectionError.status_code,
    });
  }

  if (err.code === "42601") {
    const databaseSyntaxError = new DatabaseSyntaxError();

    return Response.json(databaseSyntaxError, {
      status: databaseSyntaxError.status_code,
    });
  }

  return Response.json(
    {
      name: "internal_server_error",
      message: "Erro interno no servidor.",
      action: "Tente novamente mais tarde ou contate o suporte.",
      status_code: 500,
    },
    {
      status: 500,
    },
  );
}
