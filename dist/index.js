var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CookieJar } from "tough-cookie";
import fetchcookie from "fetch-cookie";
// htmlのテキストを整形して返す
function conciseText(text) {
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
    constructor(status, finalUrl, responseBody) {
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
    // constructorの引数には指定しない、空のオブジェクトどちらでも適応できる
    constructor({ cookieJar = new CookieJar(), defaultHeaders = {} } = {}) {
        this.cookieJar = cookieJar;
        this.fetchCookie = fetchcookie(fetch, this.cookieJar);
        this.defaultHeaders = defaultHeaders;
    }
    // cookieJar, defaultHeadersを使用してfetchを行う
    // fetch自体がエラーが発生した場合は、statusを1000に設定し独自のエラーを投げる
    // response.okがfalseの場合も独自のエラーを投げる
    fetch(url, init) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.fetchCookie(url, Object.assign({ headers: Object.assign(Object.assign({}, this.defaultHeaders), init === null || init === void 0 ? void 0 : init.headers) }, init));
                if (!response.ok) {
                    throw new MyFetchError(response.status, response.url, yield response.text());
                }
                return response;
            }
            catch (e) {
                if (e instanceof MyFetchError) {
                    throw e;
                }
                throw new MyFetchError(1000, url.toString(), e.message);
            }
        });
    }
    // 初期値のcookieJar, defaultHeadersを設定できる
    // 使用しやすいようにインスタンスだけでなく、関数自体も返す。
    static create({ cookieJar, defaultHeaders } = {}) {
        const myFetch = new MyFetch({ cookieJar, defaultHeaders });
        return {
            // もしmyFetch.fetchだけを返してしまうと、thisはthisのままで[[prototype]]の関数への参照がそのまま返るだけ
            // そのため、bindしてthisを固定して返す
            fetch: myFetch.fetch.bind(myFetch),
            client: myFetch
        };
    }
}
