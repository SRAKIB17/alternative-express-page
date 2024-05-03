import { IncomingMessage, OutgoingHttpHeader, ServerResponse } from "http";
import { OutgoingHttpHeaders } from "http2";
import { ServerOptions } from "https";

export interface ParsedCookie {
    [key: string]: string;
}

interface SecureOption extends ServerOptions {
    enableSsl?: true;
}
interface Option extends ServerOptions {
    enableSsl?: false;
}

export type ServerOptionsProps = SecureOption | Option;
export enum ContentType {
    PlainText = 'text/plain',
    HTML = 'text/html',
    JSON = 'application/json',
    XML = 'application/xml',
    CSS = 'text/css',
    JavaScript = 'application/javascript',
    Markdown = 'text/markdown',
    CSV = 'text/csv',
    PDF = 'application/pdf',
    ImageJPEG = 'image/jpeg',
    ImagePNG = 'image/png',
    ImageGIF = 'image/gif',
    SVG = 'image/svg+xml',
    AudioMPEG = 'audio/mpeg',
    AudioWAV = 'audio/wav',
    VideoMP4 = 'video/mp4',
    BinaryData = 'application/octet-stream'
}

export interface option {
    status?: number
}
interface bufferOption extends option {
    contentType?: ContentType
}

interface ResponseMethod {
    json: (data: any, option?: option, headers?: OutgoingHttpHeaders) => void;
    html: (data: string, option?: option, headers?: OutgoingHttpHeaders) => void;
    xml: (data: string, option?: option, headers?: OutgoingHttpHeaders) => void;
    text: (data: string, option?: option, headers?: OutgoingHttpHeaders) => void;
    sendFile: (filePath: string) => void;
    buffer: (buffer: Buffer, option?: bufferOption, headers?: OutgoingHttpHeaders) => void;
    error: (status: number, message: string, headers?: OutgoingHttpHeaders) => void;
    redirect: (url: string, option?: option, headers?: OutgoingHttpHeaders) => void;
}

export interface CookieOptions {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface Response extends ServerResponse, ResponseMethod {
    status: (status: number) => ResponseMethod;
    next: () => void
    deleteCookie: (cookieName: string, options?: CookieOptions) => void
    setCookie: (cookieName: string, cookieValue: string, options?: CookieOptions) => void
}
export type file = {
    field: string;
    filename: string;
    name: string;
    type: string;
    size: number;
    buffer: Buffer;
}
export interface Request extends IncomingMessage {
    params: {
        [key: string]: string
    },
    cookies: ParsedCookie,
    query: {
        [key: string]: string
    },
    body: {
        [key: string]: string
    },
    file: file,
    files: file[],
    location: {
        hash: string | null,
        protocol: string | null,
        origin: string | null,
        username: string | null,
        password: string | null,
        hostname: string | null,
        port: string | null,
        href: string | null,
        query: {
            [key: string]: string
        },
        path: string | null
    }
}

export interface Route {
    path: string;
    method: string;
    callback: (req: Request, res: Response) => void;
}
