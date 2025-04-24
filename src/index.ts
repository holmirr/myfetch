import { CookieJar } from "tough-cookie";
import fetchcookie from "fetch-cookie";
import { FetchCookieImpl } from "fetch-cookie";

function conciseText(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const conciseLines = lines.map(line => line.trim()).filter(line=> line!== "");
  return conciseLines.join("\n");
}

export class MyFetchError extends Error {
  status: number;
  finalUrl: string;
  responseBody: string;

  constructor(status: number, finalUrl: string, responseBody: string) {
    super(`fetch failed...
      status: ${status}
      finalUrl: ${finalUrl}
      responseBody: ${responseBody}
      `);
    this.status = status;
    this.finalUrl = finalUrl;
    this.responseBody = responseBody;
  }
}

export default class MyFetch {
  public cookieJar: CookieJar;
  public fetchCookie: FetchCookieImpl<RequestInfo | URL, RequestInit, Response>;
  public defaultHeaders: RequestInit["headers"];

  constructor({cookieJar=new CookieJar(), defaultHeaders={}}: {cookieJar?: CookieJar, defaultHeaders?: RequestInit["headers"]} = {}) {
    this.cookieJar = cookieJar;
    this.fetchCookie = fetchcookie(fetch, this.cookieJar);
    this.defaultHeaders = defaultHeaders;
  }

  public async fetch(url: RequestInfo | URL, init?: RequestInit) {
    const response = await this.fetchCookie(url, {headers:{...this.defaultHeaders, ...init?.headers}, ...init});
    if (!response.ok) {
      throw new MyFetchError(response.status, response.url, await response.text());
    }
    return response;
  }

  static create({cookieJar, defaultHeaders}: {cookieJar?: CookieJar, defaultHeaders?: RequestInit["headers"]} = {}) {
    const myFetch = new MyFetch({cookieJar, defaultHeaders});
    return {
      fetch: myFetch.fetch.bind(myFetch) as typeof fetch,
      client: myFetch
    }
  }
}
