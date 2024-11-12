import { NextRequest, NextResponse } from "next/server";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const secret_key = process.env.CRYPTO_ENCRYPT_ROLE as string

export const middleware = (req: NextRequest) => {
    const currentURL = req.nextUrl.pathname
    const roleCookie: any = req.cookies.get('role')?.value
    const tokenCookie: any = req.cookies.get('token')?.value

    let role = ''

    if (roleCookie) { role = CryptoJS.AES.decrypt(roleCookie, secret_key).toString(CryptoJS.enc.Utf8) }
    if (tokenCookie && role == 'user' && (currentURL == '/user/login' || currentURL == '/user/register')) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    if (role == 'user' && (currentURL.startsWith('/event/dashboard'))) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    if (tokenCookie && role == 'EO' && (currentURL == '/event-organizer/login' || currentURL == '/event-organizer/register')) {
        return NextResponse.redirect(new URL('/event/dashboard', req.url))
    }

    // if (tokenCookie && role == 'EO' && (currentURL == '/' || currentURL.startsWith('/event/explore') || currentURL.startsWith('/profile-user'))) {
    //     return NextResponse.redirect(new URL('/event/dashboard', req.url))
    // }

    return NextResponse.next()
}

// export const config = {
//     matcher: 
// }