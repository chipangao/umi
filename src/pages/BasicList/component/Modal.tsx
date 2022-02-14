import { useEffect } from 'react';
import { useRequest } from 'umi';
import moment from 'moment';
import { Modal as AntdModal, Form, Input,message,Spin,Tag } from 'antd';

import { submitFieldsAdaptor, setFieldsAdaptor } from '../helper';
import FormBuilder from '../builder/FormBuilder';
import ActionBuilder from '../builder/ActionBuilder';
import styles from '../index.less';
import { BasicListApi } from '../data';

const Modal = ({
  isModalVisible,
  modalUri,
  hideModal,
}: {
  isModalVisible: boolean;
  modalUri: String;
  hideModal: (reload?:Boolean) => void;
}) => {
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const init = useRequest<{ data: BasicListApi.PageData }>(`http://localhost:8002${modalUri}?X-API-KEY=antd`, {
    manual: true,
    onError:()=>{
      hideModal();
    }
  });
  
  const request = useRequest(
    (values: any) => {
      message.loading({ content: 'Processing...', key: 'process', duration: 0 });
      const { uri, method, ...formValues } = values;
      return {
        url: `http://localhost:8002${uri}`,
        method,
        data: {
          ...submitFieldsAdaptor(formValues),
          'X-API-KEY': 'antd',
        },
      };
    },
    {
      manual: true,
      onSuccess: (data) => {
        message.success({
          content: data.message,
          key: 'process',
        });
        hideModal(true);
      },
      formatResult: (res: any) => {
        return res;
      },
      throttleInterval: 1000,
    },
  );

  const onFinish = (values: any) => {
    request.run(values);
  };
  const actionHandler = (action: BasicListApi.Action) => {
    switch (action.action) {
      case 'submit':
        form.setFieldsValue({ uri: action.uri, method: action.method });
        form.submit();
        break;
      case 'cancel':
        hideModal();
        break;
      case 'reset':
        form.resetFields();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      form.resetFields();
      init.run();
    }
  }, [isModalVisible]);

  useEffect(() => {
    if (init.data) {
      form.setFieldsValue(setFieldsAdaptor(init.data));
    }
  }, [init.data]);

  return (
    <div>
      <AntdModal
        title={init?.data?.page?.title}
        maskClosable={false}
        forceRender
        visible={isModalVisible}
        onCancel={()=>{hideModal()}}
        footer={ActionBuilder(init?.data?.layout?.actions[0]?.data, actionHandler,false,false)}
      >
        {init?.loading ? 
          <Spin className={styles.formSpin} tip="Loading..." />
         :
       ( <><Form
          form={form}
          {...layout}
          initialValues={{
            create_time: moment(),
            update_time: moment(),
            status: true,
          }}
          onFinish={onFinish}
        >
          {FormBuilder(init?.data?.layout?.tabs[0]?.data || [])}
          <Form.Item name="uri" key="uri" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="method" key="method" hidden>
            <Input />
          </Form.Item>
        </Form>
        <Tag className={styles.formUpdateTime}>
        Update Time: {moment(init.data?.dataSource?.update_time).format('YYYY-MM-DD HH:mm:ss')}
        </Tag>
        </>)
        }
      </AntdModal>
    </div>
  );
};

export default Modal;
