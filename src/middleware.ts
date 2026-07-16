import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const admintoken = request.cookies.get("admintoken")?.value || "";
  console.log(admintoken);

  if (admintoken) {
    try {
      // Create a secret key from the environment variable
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

      // Verify the token
      const { payload } = await jwtVerify(admintoken, secretKey);
      console.log("Decoded Token:", payload);

      const currentTimestamp = Math.floor(Date.now() / 1000);
      console.log(currentTimestamp);
      if (payload.exp! < currentTimestamp) {
        // Token expired
        return NextResponse.redirect(new URL("/admin", request.nextUrl));
      }

      const userId = payload.id;
    } catch (error) {
      // Token is invalid, clear the cookie and redirect to login
      console.error("Token verification failed:", error);
      const response = NextResponse.redirect(
        new URL("/admin", request.nextUrl)
      );
      response.cookies.delete("admintoken");
      return response;
    }
  }

  if (path.startsWith("/admin/") && !admintoken) {
    return NextResponse.redirect(new URL("/admin", request.nextUrl));
  }
}

export const config = {
  matcher: ["/", "/admin/:path"],
};
