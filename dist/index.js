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
export default class MyFetch {
    constructor({ cookieJar = new CookieJar(), defaultHeaders = {} } = {}) {
        this.cookieJar = cookieJar;
        this.fetchCookie = fetchcookie(fetch, this.cookieJar);
        this.defaultHeaders = defaultHeaders;
    }
    fetch(url, init) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.fetchCookie(url, Object.assign({ headers: Object.assign(Object.assign({}, this.defaultHeaders), init === null || init === void 0 ? void 0 : init.headers) }, init));
            if (!response.ok) {
                throw new Error(`fetch failed:
        status: ${response.status}
        finalUrl: ${response.url}
        responseBody: ${yield response.text()}
        `);
            }
            return response;
        });
    }
    static create({ cookieJar, defaultHeaders } = {}) {
        const myFetch = new MyFetch({ cookieJar, defaultHeaders });
        return {
            fetch: myFetch.fetch.bind(myFetch),
            client: myFetch
        };
    }
}
