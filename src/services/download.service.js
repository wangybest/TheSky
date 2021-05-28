import { requestBlob } from '../utils/http/requestUtils';

/**
 * 文件下载请求处理
 * @param {*} params 请求参数 { url, method, body, fileName }
 */
export async function reqDownloadFile(params) {
  // 参数校验
  if (!params) {
    // eslint-disable-next-line no-alert
    alert('文件下载参数错误，请联系管理员检查！');
    return undefined;
  }
  const { url, method, body, fileName } = params;
  // 发送请求
  const resData = await requestBlob(url, { method, body });
  if (resData === undefined) {
    return undefined;
  }
  // 构建DOM
  const objUrl = window.URL.createObjectURL(resData);
  const downloadElement = document.createElement('a');
  downloadElement.style.display = 'none';
  downloadElement.download = fileName || '下载文件.txt';
  downloadElement.href = objUrl;
  window.document.body.appendChild(downloadElement);
  // 点击下载
  downloadElement.click();
  // 释放URL对象
  window.URL.revokeObjectURL(objUrl);
  // 移除DOM
  window.document.body.removeChild(downloadElement);
  return null;
}

// 响应流 正常
