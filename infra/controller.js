import { NextResponse } from "next/server";
import {
  InternalServerError,
  NotFoundError,
  ServiceError,
  ValidationError,
} from "./errors.js";

export function controller(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json(error, {
          status: error.statusCode,
        });
      }

      if (error instanceof ValidationError) {
        return NextResponse.json(error, {
          status: error.statusCode,
        });
      }

      if (error instanceof NotFoundError) {
        return NextResponse.json(error, {
          status: error.statusCode,
        });
      }

      const publicErrorObject = new InternalServerError({
        statusCode: error.statusCode,
        cause: error,
      });

      console.log(publicErrorObject);

      return NextResponse.json(publicErrorObject, {
        status: publicErrorObject.statusCode,
      });
    }
  };
}
