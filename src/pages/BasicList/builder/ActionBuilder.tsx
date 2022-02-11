import { Button } from 'antd';
import { ButtonType } from 'antd/lib/button';
import { BasicListApi } from '../data';

const actionBuilder = (
  actions: BasicListApi.Action[] | undefined,
  actionHandler: BasicListApi.ActionHandler,
  loading?: false,
  record?:{},
) => {
  return (actions || []).map((action: any) => {
    if (action.component === 'button') {
      return (
        <Button
          key={action.text}
          type={action.type as ButtonType}
          onClick={() => actionHandler(action,record)}
          loading={loading}
        >
          {action.text}
        </Button>
      );
    }
    return null;
  });
};

export default actionBuilder;
