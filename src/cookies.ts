import { CookieOptions, ParsedCookie, Response } from ".";

export function parseCookies(cookieHeader: string): ParsedCookie {
    const cookies: ParsedCookie = {};
    if (!cookieHeader) {
        return cookies;
    }
    const cookiePairs = cookieHeader.split(';');
    for (const pair of cookiePairs) {
        const [key, value] = pair.trim().split('=');
        cookies[key] = decodeURIComponent(value);
    }
    return cookies;
}

export function deleteCookie(res: Response, cookieName: string, options?: CookieOptions) {
    const cookieValue = '';
    const cookieOptions = {
        ...options,
        expires: new Date(0), // Set expiration time to the past
    };

    const cookieHeader = `${cookieName}=${cookieValue};${serializeOptions(cookieOptions)}`;
    res.setHeader('Set-Cookie', cookieHeader);
}


export function setCookie(res: Response, cookieName: string, cookieValue: string, options?: CookieOptions) {
    const cookieHeader = `${cookieName}=${cookieValue};${serializeOptions(options || {})}`;
    res.setHeader('Set-Cookie', cookieHeader);
}

function serializeOptions(options: CookieOptions): string {
    const parts = [];

    if (options.expires) {
        parts.push(`Expires=${options.expires.toUTCString()}`);
    }
    if (options.path) {
        parts.push(`Path=${options.path}`);
    }
    if (options.domain) {
        parts.push(`Domain=${options.domain}`);
    }
    if (options.secure) {
        parts.push(`Secure`);
    }
    if (options.httpOnly) {
        parts.push(`HttpOnly`);
    }
    if (options.sameSite) {
        parts.push(`SameSite=${options.sameSite}`);
    }

    return parts.join('; ');
}
