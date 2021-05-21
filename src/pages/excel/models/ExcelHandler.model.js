import {handleExcel} from "@/pages/excel/service/ExcelHandler.service";

export default {
  namespace: 'excelHandler',
  state: {},
  effects: {
    // excel转换
    * handlerExcel({payload,callback}, {call}) {
      const response = yield call(handleExcel,payload);
      if (callback) {
        callback(response)
      }
    },
  },
  reducers: {}
}
