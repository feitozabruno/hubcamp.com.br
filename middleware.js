import { NextResponse } from "next/server";
import { NotFoundError, MethodNotAllowedError } from "infra/errors.js";

const routes = [
  { pattern: /^\/api\/v1\/status$/, methods: ["GET"] },
  { pattern: /^\/api\/v1\/users$/, methods: ["POST"] },
  { pattern: /^\/api\/v1\/users\/[^/]+$/, methods: ["GET", "PUT"] },
  { pattern: /^\/api\/v1\/migrations$/, methods: ["GET", "POST"] },
  { pattern: /^\/api\/v1\/sessions$/, methods: ["POST", "DELETE"] },
];

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  const matchedRoute = routes.find((route) => route.pattern.test(pathname));

  if (!matchedRoute) {
    const error = new NotFoundError();
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  if (!matchedRoute.methods.includes(method)) {
    const error = new MethodNotAllowedError();
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
