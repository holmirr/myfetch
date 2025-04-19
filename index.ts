import { CookieJar } from "tough-cookie";
import fetchcookie from "fetch-cookie";
import { FetchCookieImpl } from "fetch-cookie";

export default class MyFetch {
  public cookieJar: CookieJar;
  public fetchCookie: FetchCookieImpl<RequestInfo | URL, RequestInit, Response>;
  public defaultHeaders: RequestInit["headers"];

  constructor({cookieJar=new CookieJar(), defaultHeaders={}}: {cookieJar?: CookieJar, defaultHeaders?: RequestInit["headers"]} = {}) {
    this.cookieJar = cookieJar;
    this.fetchCookie = fetchcookie(fetch, this.cookieJar);
    this.defaultHeaders = defaultHeaders;
  }

  async fetch(url: RequestInfo | URL, init?: RequestInit) {
    return this.fetchCookie(url, {headers:{...this.defaultHeaders, ...init?.headers}, ...init});
  }

  static init({cookieJar, defaultHeaders}: {cookieJar?: CookieJar, defaultHeaders?: RequestInit["headers"]} = {}) {
    const myFetch = new MyFetch({cookieJar, defaultHeaders});
    return {
      fetch: myFetch.fetch.bind(myFetch) as typeof fetch,
      client: myFetch
    }
  }
}

