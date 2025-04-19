"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tough_cookie_1 = require("tough-cookie");
const fetch_cookie_1 = __importDefault(require("fetch-cookie"));
class MyFetch {
    constructor({ cookieJar = new tough_cookie_1.CookieJar(), defaultHeaders = {} } = {}) {
        this.cookieJar = cookieJar;
        this.fetchCookie = (0, fetch_cookie_1.default)(fetch, this.cookieJar);
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
    static init({ cookieJar, defaultHeaders } = {}) {
        const myFetch = new MyFetch({ cookieJar, defaultHeaders });
        return {
            fetch: myFetch.fetch.bind(myFetch),
            client: myFetch
        };
    }
}
exports.default = MyFetch;
