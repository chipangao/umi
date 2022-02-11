import { Input, Form, DatePicker, TreeSelect, Switch ,Col,Select} from 'antd';
import { BasicListApi } from '../data';
import moment from 'moment';

const SearchBuilder = (data: BasicListApi.Field[] | undefined) => {
  const { RangePicker } = DatePicker;
  const { Option } = Select;
  return (data || []).map((field) => {
    switch (field.type) {
      case 'text':  
        return (
          <Col sm={6}>
          <Form.Item label={field.title} name={field.key} key={field.key}>
            <Input disabled={field.disabled} />
          </Form.Item>
          </Col>
        );
      case 'datetime':
        return (
          <Col sm={12}>
          <Form.Item label={field.title} name={field.key} key={field.key}>
            <DatePicker.RangePicker 
              showTime 
              disabled={field.disabled} 
              style={{width:'100%'}}
              ranges={{
                Today: [moment().startOf('day'), moment().endOf('day')],
                  'Last 7 Days': [moment().subtract(7, 'd'), moment()],
                    'Last 30 Days': [moment().subtract(30, 'days'), moment()],
                      'Last Month': [
                        moment().subtract(1, 'months').startOf('month'),
                        moment().subtract(1, 'months').endOf('month'),
                      ],
              }}        
            />
          </Form.Item>
          </Col>
        );
      case 'tree':
        return (
          <Col sm={6}>
          <Form.Item label={field.title} name={field.key} key={field.key}>
            <TreeSelect treeData={field.data} disabled={field.disabled} treeCheckable />
          </Form.Item>
          </Col>
        );
      case 'select':
      case 'switch':
        return (
          <Col sm={6}>
          <Form.Item label={field.title} name={field.key} key={field.key} valuePropName="checked">
            <Select>
              {(field.data||[]).map((option:any)=>{
                return (<Option value={option.value}>{option.title}</Option>)
              })}
            </Select>
          </Form.Item>
          </Col>
        );
      default:
        return null;
    }
  });
};

export default SearchBuilder;
