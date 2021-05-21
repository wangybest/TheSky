import React, {Component} from 'react'

import {Form, Row, Col, Upload, Button,Input} from 'antd';
import {connect} from "umi";

const FormItem = Form.Item;

class ExcelHandler extends Component {
  uploadExcelFormRef = React.createRef();

  state = {
  };

  eventUpload =()=>{
    this.uploadExcelFormRef.current.validateFields().then(values => {
      const {file}  = this.state;
      const formData = new FormData;
      formData.append('file', file);
      formData.append('data', values);
      const {dispatch} = this.props;
      dispatch({
        type: 'excelHandler/handlerExcel',
        payload: formData,
        callback: (resData) => {

        }
      });
    })
  };

  render() {
    return(
      <Form ref={this.uploadExcelFormRef}>
        <Row gutter={20}>
          <Col span={18}>
            <FormItem label={'Excel选择'}
                      rules={[{required: true, message: '请选择Excel'}]}>
              <Upload
                accept={['.xlsx']}
                beforeUpload={(file)=>{this.setState({file});return false}}
                showUploadList={false}
              >
                <Button type='primary'>数据导入</Button>
              </Upload>
            </FormItem>

            <FormItem label={'项目名称'} name={'projectName'}
                      rules={[{required: true, message: '项目名称不能为空'}]}>
              <Input/>
            </FormItem>
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

export default connect(({excelHandler}) => ({
  excelHandler
}))(ExcelHandler);
