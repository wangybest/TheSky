import {notification, message} from 'antd';
import {stringify} from 'querystring';
import {history} from 'umi';

/* --------------------------------------------------------------------------变量-------------------------------------------------------------------------- */


/**
 * 请求方法
 */
export const REQ_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
};

/**
 * 响应状态
 * */
const CODE_MESSAGE = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '您没有访问权限！',
  403: '您的访问是被禁止的！',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器开小差了，请稍后再试。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 通过响应头Content-Type类型，返回不同的响应内容
 */
const RES_CONTENT_TYPE = {
  /* 返回ArrayBuffer对象 */
  arrayBuffer: [],
  /* 返回Blob对象 */
  blob: [
    {regExp: /image\/x-icon/i, desc: 'ICON图片'},
    {regExp: /image\/jpeg/i, desc: 'JPEG图片'},
    {regExp: /application\/pdf/i, desc: 'PDF图片'},
    {regExp: /image\/gif/i, desc: 'GIF图片'},
    {regExp: /image\/png/i, desc: 'GIF图片'},
    {regExp: /application\/octet-stream/i, desc: '流文件'},
    {regExp: /application\/vnd.ms-excel/i, desc: 'Excel文件'},
    {
      regExp: /application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/i,
      desc: 'Excel文件',
    },
    {
      regExp: /application\/vnd.openxmlformats-officedocument.wordprocessingml.document/i,
      desc: 'Word文件',
    },
  ],
  /* 返回FormData对象 */
  formData: [],
  /* 返回JSON对象 */
  json: [{regExp: /application\/json/i, desc: 'JSON'}],
  /* 返回String对象 */
  text: [
    {regExp: /text\/html/i, desc: 'HTML文本'},
    {regExp: /text\/xml/i, desc: 'XML文本'},
    {regExp: /text\/plain/i, desc: 'Plain文本'},
    {regExp: /text\/css/i, desc: 'Plain文本'},
    {regExp: /text\/javascript/i, desc: 'JS文本'},
    {regExp: /application\/x-javascript/i, desc: 'JS文本'},
  ],
};

/**
 * 响应的异常代码
 */
const RES_ERROR_CODE = {
  LOGOUT: ['302', '0x88888888'],
};

/* --------------------------------------------------------------------------Private函数-------------------------------------------------------------------------- */

/**
 * 解析响应状态
 * @param response 响应对象
 * @returns {*} 正常：response，异常：error
 */
function responseStatusValidate(response) {
  /* 响应正常 */
  if (response.ok) {
    return response;
  }
  /* 响应错误, 抛出异常 */
  const errorText = CODE_MESSAGE[response.status] || response.statusText;
  const error = new Error(errorText);
  error.status = response.status;
  error.errorUrl = response.url;
  throw error;
}

/**
 * 解析响应数据类型
 * @param response 响应对象
 * @returns {*} 根据Content-Type解析的响应体，详情见RES_CONTENT_TYPE
 */
function responseDataRead(response) {
  // 校验Content-Type响应头，解析响应体
  const contentType = response.headers.get('Content-Type');
  if (!contentType) {
    // eslint-disable-next-line no-console
    console.warn('由于没有获取到响应头的Content-Type，无法正常解析响应Body，所以直接返回text。');
    return response.text();
  }
  // 校验标准响应头，解析响应体
  if (contentType) {
    const keys = Object.keys(RES_CONTENT_TYPE);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      for (let j = 0; j < RES_CONTENT_TYPE[key].length; j += 1) {
        const headType = RES_CONTENT_TYPE[key][j];
        if (contentType.match(headType.regExp)) {
          return response[key]();
        }
      }
    }
  }
  // 如果无法满足以上解析方式，则直接返回text
  // eslint-disable-next-line no-console
  console.warn('由于没有找到匹配Content-Type，所以直接返回Response。');
  return response.text();
}

/**
 * 解析响应登录失效
 * @param {*} resData 响应体内容
 */
function responseLogoutValidate(resData) {
  if (resData instanceof Object && RES_ERROR_CODE.LOGOUT.includes(resData.code)) {
    const error = new Error('登录已过期，请重新登录！');
    error.status = -100;
    error.errorUrl = 'unknown';
    throw error;
  }
  return resData;
}

/**
 * 解析响应登录失效
 * @param {*} blob 响应流对象
 */
async function responseBlobLogoutValidate(blob) {
  let jsonData;
  try {
    const text = await blob.text();
    jsonData = JSON.parse(text);
  } catch (error) {
    return blob;
  }
  /* 处理异常响应 */
  if (jsonData instanceof Object) {
    /* 抛异常：登录失效异常 */
    if (RES_ERROR_CODE.LOGOUT.includes(jsonData.code)) {
      const error = new Error('登录已过期，请重新登录！');
      error.status = -100;
      error.errorUrl = 'unknown';
      throw error;
    }
    /* 抛异常：自定义异常 */
    // eslint-disable-next-line no-console
    console.warn('response error:', jsonData);
    const msg = Object.prototype.hasOwnProperty.call(jsonData, 'msg') ? jsonData.msg : null;
    const error = new Error(msg);
    error.status = -200;
    error.errorUrl = 'unknown';
    throw error;
  }
  /* 响应无异常，返回流内容 */
  return blob;
}

/**
 * 响应异常处理
 * @param err 异常对象
 * @returns {null}
 */
function responseErrorValidate(err) {
  // eslint-disable-next-line no-console
  console.error(err);
  // 网络异常
  if (!err.status) {
    // notification.error({
    //   message: `网络错误！`,
    //   description: '网络开小差了，请检查网络！',
    // });
    return undefined;
  }
  // 请求异常
  switch (err.status) {
    case -100: // 登录失效
      // 移除令牌
      removeToken();
      // 跳转页面
      // eslint-disable-next-line no-case-declarations
      const queryString = stringify({redirect: window.location.href});
      history.push(`/login?${queryString}`);
      return undefined;
    case -200:
      message.error(err.message || '响应异常，请联系相关人员！');
      return undefined;
    // case 401:
    //   history.replace(`/error/401`);
    //   return undefined;
    // case 403:
    //   history.replace(`/error/403`);
    //   return undefined;
    // case 500:
    //   history.push(`/error/500`);
    //   return undefined;
    // case 502:
    //   history.push(`/error/503`);
    //   return undefined;
    // case 503:
    //   history.push(`/error/503`);
    //   return undefined;
    // case 504:
    //   message.error('网关超时');
    //   return undefined;
    default:
      message.error(err.message || '响应异常，请联系相关人员！');
      return undefined;
  }
}

/**
 * 组装请求参数
 * @param {*} url 请求路径
 * @param {*} fetchOptions 请求参数
 */
function installFetchOption(url, fetchOptions) {
  const options = typeof fetchOptions === 'object' ? {...fetchOptions} : {};
  /* 设置：默认参数 */
  options.credentials = 'omit'; // 不发送cookie
  options.mode = 'cors'; // 允许跨域请求
  options.cache = 'no-cache'; // 缓存
  options.redirect = 'error'; // 不允许重定向

  /* 参数兼容处理 */
  if (Object.prototype.hasOwnProperty.call(options, 'data')) {
    options.body = options.data;
  }

  /* 校验：请求方法 */
  options.method = String(options.method).toLocaleUpperCase();
  if (!Object.keys(REQ_METHOD).includes(options.method)) {
    options.method = REQ_METHOD.GET;
  }
  if (options.method === REQ_METHOD.GET) {
    delete options.body;
  }

  /* 校验：请求头 */
  if (!Object.prototype.hasOwnProperty.call(options, 'headers')) {
    options.headers = {};
  }
  if (!Object.prototype.hasOwnProperty.call(options, 'Accept')) {
    options.headers['Accept'] = 'application/json';
  }

  // 默认请求头
  options.headers['X-Requested-With'] = 'XMLHttpRequest';
  options.headers['x-charset'] = 'UTF-8';
  options.headers['ts'] = `${new Date().getTime()}`;
  options.headers['path'] = `${url}`;

  /* 校验：请求体 */
  if (Object.prototype.hasOwnProperty.call(options, 'body')) {
    if (!(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json;charset=utf-8';
      options.body = JSON.stringify(options.body);
    }
  }
  return options;
}

/* --------------------------------------------------------------------------Request函数-------------------------------------------------------------------------- */

/**
 * 发送一个请求, 并根据ContentType解析响应体数据.
 * @param {string} url 请求路径
 * @param {object} fetchOptions 请求参数
 */
export async function request(url, fetchOptions) {
  // 组装请求参数
  const options = installFetchOption(url, fetchOptions);
  /* 发送请求 */
  return (
    fetch(`${url}`, options)
      // 响应状态处理
      .then(responseStatusValidate)
      // 响应数据处理
      .then(responseDataRead)
      // 响应登录失效处理
      .then(responseLogoutValidate)
      // 异常处理
      .catch(responseErrorValidate)
  );
}

/**
 * 发送一个请求，并返回解析后的Blob数据.
 * @param {*} url 请求路径
 * @param {*} fetchOptions fetch参数
 */
export async function requestBlob(url, fetchOptions) {
  // 组装请求参数
  const options = installFetchOption(url, fetchOptions);
  return (
    fetch(`${url}`, options)
      // 响应状态处理
      .then(responseStatusValidate)
      // 响应数据处理
      .then((response) => response.blob())
      // 响应登录失效处理
      .then(responseBlobLogoutValidate)
      // 异常处理
      .catch(responseErrorValidate)
  );
}

/**
 * 发送一个请求, 并根据ContentType解析响应体数据. URL前不会拼接网关路径
 * @param {string} url 请求路径
 * @param {object} fetchOptions 请求参数
 */
export async function requestUrl(url, fetchOptions) {
  // 组装请求参数
  const options = installFetchOption(url, fetchOptions);
  /* 发送请求 */
  return (
    fetch(url, options)
      // 响应状态处理
      .then(responseStatusValidate)
      // 响应数据处理
      .then(responseDataRead)
      // 响应登录失效处理
      .then(responseLogoutValidate)
      // 异常处理
      .catch(responseErrorValidate)
  );
}

/**
 * 发送一个请求，直接返回Response对象，慎用
 * @param {*} url 请求路径
 * @param {*} fetchOptions fetch参数
 */
export async function requestPure(url, fetchOptions) {
  // 组装请求参数
  const options = installFetchOption(url, fetchOptions);
  return (
    fetch(`${url}`, options)
      // 响应状态处理
      .then(responseStatusValidate)
      // 异常处理
      .catch(responseErrorValidate)
  );
}
