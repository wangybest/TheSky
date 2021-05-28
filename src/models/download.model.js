import { reqDownloadFile } from "../services/download.service";

/**
 * 文件处理Model
 */
export default {
    namespace: "download",

    state: {},

    effects: {
        /**
         * 文件下载，请求参数 payload : { url, method, body, fileName }
         *
         * url：下载路径，必填
         * method：请求方法，非必填，默认GET
         * body：请求参数内容，非必填，默认空
         * fileName: 文件名称（包含扩展名），非必填，默认‘下载文件.txt’
         */
        *file({ payload, callback }, { call }) {
            const resData = yield call(reqDownloadFile, payload);
            if (resData === undefined) {
                return;
            }
            if (callback) {
                callback();
            }
        }
    },
}
