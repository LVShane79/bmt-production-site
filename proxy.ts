import { clerkMiddleware } from "@clerk/nextjs/server";

// Establish Clerk request context. Individual admin pages/API routes still
// perform explicit server-side owner authorization and fail closed.
export default clerkMiddleware();

export const config = {
  // Public pages and public utility APIs do not need a Clerk request context.
  // Keeping the middleware on the private surface avoids making keyless build
  // and smoke-test environments fail while routes remain fail-closed via
  // ownerOrUnauthorized().
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
