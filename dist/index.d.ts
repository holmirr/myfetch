import { CookieJar } from "tough-cookie";
import { FetchCookieImpl } from "fetch-cookie";
export declare class MyFetchError extends Error {
    status: number;
    finalUrl: string;
    responseBody: string;
    constructor(status: number, finalUrl: string, responseBody: string);
}
export default class MyFetch {
    cookieJar: CookieJar;
    fetchCookie: FetchCookieImpl<RequestInfo | URL, RequestInit, Response>;
    defaultHeaders: RequestInit["headers"];
    constructor({ cookieJar, defaultHeaders }?: {
        cookieJar?: CookieJar;
        defaultHeaders?: RequestInit["headers"];
    });
    fetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    static create({ cookieJar, defaultHeaders }?: {
        cookieJar?: CookieJar;
        defaultHeaders?: RequestInit["headers"];
    }): {
        fetch: typeof fetch;
        client: MyFetch;
    };
}
