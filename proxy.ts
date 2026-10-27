import { clerkMiddleware } from "@clerk/nextjs/server";

// Establish Clerk request context. Individual admin pages/API routes still
// perform explicit server-side owner authorization and fail closed.
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|map)).*)", "/(api|trpc)(.*)"],
};
