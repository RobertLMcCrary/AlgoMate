import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/*
export default clerkMiddleware({
    beforeAuth(req) {
        // Custom logic before Clerk's authentication
    },
    afterAuth(authData, req) {
        const { userId } = authData;

        // Redirect unauthenticated users to the sign-in page for protected routes
        const protectedRoutes = ['/dashboard', '/problems', '/community'];
        if (
            protectedRoutes.some((route) =>
                req.nextUrl.pathname.startsWith(route)
            ) &&
            !userId
        ) {
            const signInUrl = new URL('/sign-in', req.url);
            return NextResponse.redirect(signInUrl);
        }

        // Allow public routes and authenticated access
        return NextResponse.next();
    },
});
*/

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
