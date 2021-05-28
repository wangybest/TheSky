import React, {Component} from 'react'

import {Form, Row, Col, Upload, Button,Input} from 'antd';
import {connect} from "umi";

const FormItem = Form.Item;

class ExcelHandler extends Component {
  uploadExcelFormRef = React.createRef();

  state = {
    uploadExcelFile: null
  };

  eventUpload =()=>{
    this.uploadExcelFormRef.current.validateFields().then(values => {
      const {uploadExcelFile}  = this.state;
      const formData = new FormData;
      formData.append('file', uploadExcelFile);
      formData.append('projectName', values.projectName);
      const {dispatch} = this.props;
      dispatch({
        type: 'download/file',
        payload: {
          url: `rest/excel/upload`,
          method: "POST",
          body: formData,
          fileName: "导出数据.xlsx"
        },
      });
    })
  };

  beforeUpload = (file) => {
    console.log("进入");
    // 更新当前上传文件集合
    this.setState({
      uploadExcelFile: file,
    }, () => {
      this.uploadExcelFormRef.current.setFieldsValue({fileName: file.name});
    });
    // 手动上传，返回false
    return false;
  };

  render() {
    const {loading} = this.props;
    return(
      <Form ref={this.uploadExcelFormRef}>
        <Row gutter={20}>
          <Col span={18}>
              <Row>
                <Col>
                  <FormItem label={'Excel选择'} name={'fileName'}
                            rules={[{required: true, message: '请选择Excel'}]}>
                    <Input readOnly/>
                  </FormItem>
                </Col>
                <Col>
              <Upload
                accept={['.xlsx']}
                beforeUpload={(file)=>this.beforeUpload(file)}
                showUploadList={false}
              >
                <Button type='primary'>数据导入</Button>
              </Upload>
                </Col>
              </Row>
            <Row>
              <Col>
            <FormItem label={'项目名称'} name={'projectName'}
                      rules={[{required: true, message: '项目名称不能为空'}]}>
              <Input/>
            </FormItem>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row>
          <Col>
            <Button onClick={this.eventUpload}>上传</Button>
          </Col>
        </Row>
      </Form>
    )


  }

}

export default connect(({excelHandler,loading}) => ({
  excelHandler,
  loading:loading.effects['excelHandler/handlerExcel']
}))(ExcelHandler);
