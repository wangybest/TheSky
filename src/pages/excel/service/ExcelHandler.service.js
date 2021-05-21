import {request} from "@/utils/requestUtils";


/**
 * 转换excel
 */
export async function handleExcel(data) {
  return await request(`/rest/excel/upload`, {
    method: 'POST',
    body: data
  });
}
