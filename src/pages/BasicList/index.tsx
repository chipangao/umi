import { useState, useEffect } from 'react';
import { Table, Space, Row, Col, Card, Pagination, Modal as AntdModal,message,Tooltip,Button,Form,InputNumber} from 'antd';
import { useRequest,useIntl,history,useLocation } from 'umi';
import { PageContainer,FooterToolbar } from '@ant-design/pro-layout';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { stringify } from 'query-string'
import { useToggle,useUpdateEffect } from 'ahooks';
import { BasicListApi } from './data';
import { submitFieldsAdaptor } from './helper';
import ColumnsBuilder from './builder/ColumnBuilder';
import ActionBuilder from './builder/ActionBuilder';
import SearchBuilder from './builder/SearchBuilder';
import Modal from './component/Modal';
import QueueAnim from 'rc-queue-anim';

import styles from './index.less';
const index = () => {
  const [pageQuery, setPageQuery] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [sortQuery, setsortQuery] = useState('desc');
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalUri, setModalUri] = useState('');
  const [selectedRowkeys,setSelectedRowKeys]=useState([]);
  const [selectedRow,setSelectedRow]=useState([]);
  const [searchVisible,searchAction]=useToggle(false);
  //const [selectColums,setTableCoiumns]=useSessionStorageState<BasicListApi.Field[]>('basicListTableColums',[]);
  const [selectColums,setTableCoiumns]=useState<BasicListApi.Field[]>([]);
  const {confirm} = AntdModal;
  const [searchForm] = Form.useForm();
  const location = useLocation();
  //const init = useRequest('https://public-api-v2.aspirantzhang.com/api/admins?X-API-KEY=antd')
  //init data
  //`http://localhost:8002/api/admins?X-API-KEY=antd${pageQuery}&order=${sortQuery}`,
  const init = useRequest<{ data: BasicListApi.ListData }>((values:any)=>{
    return {
      url: `http://localhost:8002${location.pathname.replace('basic-list','')}?X-API-KEY=antd${pageQuery}&order=${sortQuery}`,
      params:values,
      paramsSerializer: function (params:any) {
        return stringify(params,{arrayFormat:'comma',skipEmptyString:true,skipNull:true});
      },
    }
  })
  const request = useRequest(
      (values: any) => {
        const { uri, method, ...formValues } = values;
        const url = `http://localhost:8002${uri}`;
        message.loading({content:'Processing...',key:'process',duration:0})
        return {
          url,
          method,
          data: {
            ...formValues,
            'X-API-KEY': 'antd',
          },
        };
      },
      { 
        manual: true,
        onSuccess: (data:any)=>{
          message.success({
            content:data.message,
            key:'process',
          })
          hideModal(true);
        },
        formatResult: (res:any)=>{
          return res
        },
        throttleInterval: 1000,
      },  
  );
  const data = init?.data;
  const loading = init.loading;
  //Table data
  const dataSource = data?.dataSource;
  const mapdata = dataSource?.map((item:any) => {
    return item;
  });
  //Table columns
  const columns = data?.layout?.tableColumn || undefined;
  const tableToolbar = data?.layout.tableToolBar;
  //Pagination
  const pagetotal = data?.meta.total;
  const currentPage = data?.meta.page;
  const per_page = data?.meta.per_page;
  const intl = useIntl();

  useUpdateEffect(() => {
    init.run();
  }, [pageQuery, perPage, sortQuery, modalUri,location.pathname]);
  useEffect(() =>{
    if(columns){
      setTableCoiumns(columns)
    }
  },[columns])
  useEffect(()=>{
    if(modalUri){
      setModalVisible(true);
    }
  },[modalUri])
  const onChange = (pagination: any, filters: any, sorter: any) => {
    switch (sorter.order) {
      case 'ascend':
        setsortQuery('asc');
        break;
      case 'descend':
        setsortQuery('desc');
        break;
      default:
        setsortQuery('');
        break;
    }
  };
  const paginationChangehandler = (page: number, perPage: number) => {
    setPageQuery(`&page=${page}&per_page=${perPage}`)
    init.run();
  };

  const onFinish = (value: any) => {
    init.run(submitFieldsAdaptor(value));
  };

  const searchLayout = () => {
    return (
      <QueueAnim type="top">
        {searchVisible ? (
      <Card className={styles.searchForm} key="searchForm">
      <Form onFinish={onFinish} form={searchForm}>
        <Row gutter={24}>
          <Col sm={6}>
            <Form.Item label="ID" name="id" key="id">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          {SearchBuilder(init.data?.layout.tableColumn)}
        </Row>
        <Row>
          <Col sm={24} className={styles.textAlignRight}>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button
                onClick={() => {
                  init.run();
                  searchForm.resetFields();
                }}
              >
                Clear
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  ):null}
</QueueAnim>
);
};

  const batchOverView = (dataSource:BasicListApi.Field[]) => {
    return <Table
    size='small'
    rowKey="id"
    pagination={false}
    columns={[
      selectColums[0]||{},
      selectColums[1]||{}]} 
    dataSource={dataSource}/>
  }
  function actionHandler (action: BasicListApi.Action,record:BasicListApi.Field){
    switch (action.action) {
      case 'modal':
        setModalUri( 
          action.uri?.replace(/:\w+/g,(field)=>{
          return record[field.replace(':','')];
        }) as string);
        break;
      case 'reload':
        init.run();
        break;
      case 'page':{
        const uri = (action.uri?.replace(/:\w+/g,(field)=>{
          return record[field.replace(':','')];
        }) as string);
        history.push(`/basic-list${uri}`)
        break;}
      case 'delete':
      case 'deletePermanently':
      case 'restore':
        const operationName = intl.formatMessage(
          {
            id:`basic-list.list.actionHandler.${action.action}`
          }
        );
        confirm({
          title: intl.formatMessage(
            {
              id:'basic-list.list.actionHandler.confirmTitle',
            },
            {
              operationName:operationName,
            },
          ),
          icon: <ExclamationCircleOutlined />,
          content: batchOverView(selectedRow.length>0?selectedRow:[record]),
          okText: `Sure to ${operationName} ?`,
          okType: 'danger',
          cancelText: 'Cancel',
          onOk() {
            return request.run({
              uri:action.uri,
              method:action.method,
              type: action.action,
              ids:selectedRow.length>0?selectedRowkeys:[record.id]
            });
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        break;
      default:
        break;
    }
  };

  const beforeTableLayout = () => {
    return (
      <Row>
        <Col xs={24} sm={12}>
          ...
        </Col>
        <Col xs={24} sm={12} className={styles.tableToolbar}>
          <Space>
          <Tooltip title="search">
            <Button 
              shape="circle" 
              icon={<SearchOutlined />} 
              type={searchVisible?'primary':'default'}
              onClick={()=>{
              searchAction.toggle();
              }}
            />
          </Tooltip>
              {ActionBuilder(tableToolbar,actionHandler,false,'')}
          </Space>
        </Col>
      </Row>
    );
  };
  const afterLayout = () => {
    return (
      <Row>
        <Col xs={24} sm={12}>
          ...
        </Col>
        <Col xs={24} sm={12} className={styles.tableToolbar}>
          <Pagination
            total={pagetotal || 0}
            current={currentPage || 1}
            pageSize={per_page || 10}
            showSizeChanger
            showQuickJumper
            showTotal={(pagetotal) => `Total ${pagetotal} items`}
            onChange={paginationChangehandler}
            onShowSizeChange={paginationChangehandler}
          />
        </Col>
      </Row>
    );
  };

  const hideModal = (reload = false) => {
    setModalVisible(false);
    setModalUri('');
      if(reload){
        init.run();
      }    
  }
  const rowSelection = {
    seletedRowKeys:selectedRowkeys,
    onChange:(_selectedRowKeys:any, _selectedRows:any)=>{
      setSelectedRowKeys(_selectedRowKeys)
      setSelectedRow(_selectedRows)
    },

    }
  const batchToolBar =()=>{
    return selectedRowkeys.length >0 &&(<Space>{ActionBuilder(init?.data?.layout?.batchToolBar,actionHandler)}</Space>)
  }
  return (
    <PageContainer>
      {searchLayout()}
      <Card>
        {beforeTableLayout()}
        <Table
          rowKey="id"
          columns={ColumnsBuilder(selectColums,actionHandler)}
          dataSource={mapdata}
          pagination={false}
          loading={loading}
          onChange={onChange}
          rowSelection={rowSelection}
        />
        {afterLayout()}
      </Card>
      <Modal
        isModalVisible={isModalVisible}
        hideModal={hideModal}
        modalUri={modalUri}
      />
      <FooterToolbar extra={batchToolBar()}/>
    </PageContainer>
  );
};
export default index;
