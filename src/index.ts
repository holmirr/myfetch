import { CookieJar } from "tough-cookie";
import fetchcookie from "fetch-cookie";
import { FetchCookieImpl } from "fetch-cookie";

// htmlのテキストを整形して返す
function conciseText(text: string) {
  // 行ごとにリスト化
  const lines = text.trim().split(/\r?\n/);
  // 行ごとに前後の空白を取り除く、かつ、空行を削除
  const conciseLines = lines.map(line => line.trim()).filter(line => line !== "");
  // 改行で結合
  return conciseLines.join("\n");
}

// myfetchは独自のエラーを投げる
// error.status, error.finalUrl, error.responseBodyを持つ
// error.messageは、status, finalUrl, responseBodyを整形したものを返す
export class MyFetchError extends Error {
  status: number;
  finalUrl: string;
  responseBody: string;

  constructor(status: number, finalUrl: string, responseBody: string) {
    // Errorのコンストラクタの引数は.messageになる
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

// 初期値のcookieJar, defaultHeadersを設定できる
export default class MyFetch {
  public cookieJar: CookieJar;
  public fetchCookie: FetchCookieImpl<RequestInfo | URL, RequestInit, Response>;
  public defaultHeaders: RequestInit["headers"];

  // constructorの引数には指定しない、空のオブジェクトどちらでも適応できる
  constructor({ cookieJar = new CookieJar(), defaultHeaders = {} }: { cookieJar?: CookieJar, defaultHeaders?: RequestInit["headers"] } = {}) {
    this.cookieJar = cookieJar;
    this.fetchCookie = fetchcookie(fetch, this.cookieJar);
    this.defaultHeaders = defaultHeaders;
  }

  // cookieJar, defaultHeadersを使用してfetchを行う
  // fetch自体がエラーが発生した場合は、statusを1000に設定し独自のエラーを投げる
  // response.okがfalseの場合も独自のエラーを投げる
  public async fetch(url: RequestInfo | URL, init?: RequestInit) {
    try {
      const response = await this.fetchCookie(url, { headers: { ...this.defaultHeaders, ...init?.headers }, ...init });
      if (!response.ok) {
        throw new MyFetchError(response.status, response.url, await response.text());
      }
      return response;
    } catch (e) {
      if (e instanceof MyFetchError) {
        throw e;
      }
      throw new MyFetchError(1000, url.toString(), (e as Error).message);
    }
  }

  // 初期値のcookieJar, defaultHeadersを設定できる
  // 使用しやすいようにインスタンスだけでなく、関数自体も返す。
  static create({ cookieJar, defaultHeaders }: { cookieJar?: CookieJar, defaultHeaders?: RequestInit["headers"] } = {}) {
    const myFetch = new MyFetch({ cookieJar, defaultHeaders });
    return {
      // もしmyFetch.fetchだけを返してしまうと、thisはthisのままで[[prototype]]の関数への参照がそのまま返るだけ
      // そのため、bindしてthisを固定して返す
      fetch: myFetch.fetch.bind(myFetch) as typeof fetch,
      client: myFetch
    }
  }
}
