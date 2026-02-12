import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/roster/:path*", "/staff/:path*", "/hotel/:path*", "/my-schedule/:path*"],
};
