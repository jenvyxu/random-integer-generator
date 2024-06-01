import "./App.css";
import {
  Form,
  Input,
  Select,
  Space,
  Button,
  InputNumber,
  Divider,
  message,
  Table,
  Switch,
  Modal,
} from "antd";

import { mock } from "mockjs";
import { useState, useEffect, ChangeEventHandler } from "react";

function App() {
  const [form] = Form.useForm();

  const values = {
    count: 10,
    min: 0,
    max: 100,
    isRepeat: true,
    result: "",
  };

  const columns = [
    {
      title: "序号",
      dataIndex: "key",
      key: "key",
      width: 200,
    },
    {
      title: "数值",
      dataIndex: "value",
      key: "value",
      sorter: (a: any, b: any) => a.value - b.value,
    },
    {
      title: "操作",
      key: "delete",
      width: 200,
      render: (_: any, record: any) => (
        <Button onClick={() => deleteData(record)} size="small">
          删除
        </Button>
      ),
    },
  ];

  const deleteData = (data: any) => {
    const { index } = data;

    setDataSource((val: number[]) => val.filter((item, i) => index !== i));
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 12 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 12 },
      sm: { span: 6 },
    },
  };

  const tailLayout = {
    wrapperCol: { offset: 6, span: 16 },
  };

  const createaNumReapeat = () => {
    const { min, max, count, isRepeat } = form.getFieldsValue();
    let result = [];
    const rangeDataSource = dataSource.filter(
      (item) => item >= min && item <= max
    );
    // 如果数据库有数据
    if (useDatabase && rangeDataSource.length > 0) {
      if (isRepeat) {
        while (result.length < count) {
          const selectedIndex = Math.floor(
            Math.random() * rangeDataSource.length
          );
          result.push(rangeDataSource[selectedIndex]);
        }
      } else {
        if (count > max - min + 1) {
          messageApi.error("当前参数不满足 (最大值 - 最小值 + 1) >= 数目");
          return;
        }

        let set = new Set();
        if (rangeDataSource.length < count) {
          // 添加数据库部分
          while (set.size < rangeDataSource.length) {
            const selectedIndex = Math.floor(
              Math.random() * rangeDataSource.length
            );
            set.add(rangeDataSource[selectedIndex]);
          }
          // 添加额外部分
          while (set.size < count) {
            const newNum = mock(`@integer(${min}, ${max})`);
            set.add(newNum);
          }
        } else {
          while (set.size < count) {
            const selectedIndex = Math.floor(
              Math.random() * rangeDataSource.length
            );
            set.add(rangeDataSource[selectedIndex]);
          }
        }
        result = Array.from(set);
      }
    } else {
      if (isRepeat) {
        for (let i = 0; i < count; i++) {
          result.push(mock(`@integer(${min}, ${max})`));
        }
      } else {
        if (count > max - min + 1) {
          messageApi.error("当前参数不满足 (最大值 - 最小值 + 1) >= 数目");
          return;
        }

        let set = new Set();
        while (set.size < count) {
          const newNum = mock(`@integer(${min}, ${max})`);
          set.add(newNum);
        }
        result = Array.from(set);
      }
    }

    form.setFieldValue("result", result.join(" "));
  };

  const copy = async () => {
    const text = form.getFieldValue("result");
    const type = "text/plain";
    const blob = new Blob([text], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    await navigator.clipboard.write(data);
    messageApi.success("复制成功");
  };

  const reset = () => {
    form.resetFields(["count", "min", "max", "isRepeat", "result"]);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const [addDatabase, setAddDatabase] = useState(false);

  const handleAddDataBase = () => {
    setAddDatabase(!addDatabase);
  };

  const [dataSource, setDataSource] = useState<number[]>([]);

  // const [test, setTest] = useState(false);

  useEffect(() => {
    const list = localStorage.getItem("list");
    let parseList = [];
    try {
      if (list) {
        parseList = JSON.parse(list);
        setDataSource(parseList);
      }
    } catch (e) {
      console.log(e);
    }
    // 测试代码
    // setInterval(() => {
    //   // 提供6小时测试
    //   if (Date.now() - 1717151316988 > 6 * 60 * 60 * 1000) {
    //     setTest(true);
    //   }
    // }, 5000);
  }, []);

  const dataSourceToTable = dataSource.map((item, i) => ({
    key: `${i + 1}`,
    value: item,
    index: i,
  }));

  const [newNum, setNewNum] = useState<number | null>(null);

  const addData = () => {
    if (newNum === null) return;
    const newDataSource = [...dataSource, newNum];
    setDataSource(newDataSource);
    localStorage.setItem("list", JSON.stringify(newDataSource));
    setNewNum(null);
  };

  const changeNum = (val: number | null) => {
    if (val === null) return;
    setNewNum(val);
  };

  const [useDatabase, setUseDatabase] = useState(true);

  const changeUseDatabase = (val: boolean) => {
    setUseDatabase(val);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numStr, setNumStr] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    let arr = numStr.split(",");
    let result = [];
    for (let i = 0; i < arr.length; i++) {
      const str = arr[i].trim();
      let num;
      try {
        num = parseInt(str);
      } catch (e) {
        console.log(e);
      }

      if (num !== undefined && !isNaN(num)) {
        result.push(num);
      }
    }

    const newList = [...dataSource, ...result];

    setDataSource(newList);
    localStorage.setItem("list", JSON.stringify(newList));
    setNumStr("");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setNumStr("");
  };

  const handleBatchAdd = (e: any) => {
    setNumStr(e.currentTarget.value);
  };

  const clearDatabase = () => {
    localStorage.removeItem("list");
    setDataSource([]);
  };

  // if (test) {
  //   return "测试时间到";
  // }

  return (
    <>
      {contextHolder}
      <Button
        className={`add-database ${addDatabase ? "" : "btn-hidden"}`}
        onClick={handleAddDataBase}
      >
        {addDatabase ? "返回" : "添加数据库"}
      </Button>
      {!addDatabase ? (
        <>
          <header className="header">
            <h1>随机数生成器</h1>
            <p>随机数生成器，一键生成多种不重复的随机数字结果</p>
          </header>
          <Divider />
          <Form {...formItemLayout} initialValues={values} form={form}>
            <Form.Item
              label="数目"
              name="count"
              rules={[{ required: true, message: "请输入数值" }]}
            >
              <InputNumber style={{ width: "100%" }} max={100000} />
            </Form.Item>
            <Form.Item
              label="最小值"
              name="min"
              rules={[{ required: true, message: "请输入数值" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="最大值"
              name="max"
              rules={[{ required: true, message: "请输入数值" }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="是否重复"
              name="isRepeat"
              rules={[{ required: true }]}
            >
              <Select
                style={{ width: "100%" }}
                options={[
                  {
                    value: true,
                    label: "重复",
                  },
                  {
                    value: false,
                    label: "不重复",
                  },
                ]}
              />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Space>
                <Button type="primary" onClick={createaNumReapeat}>
                  生成
                </Button>
                <Button type="primary" onClick={reset}>
                  清除
                </Button>
                <Button type="primary" onClick={copy}>
                  复制
                </Button>
              </Space>
            </Form.Item>
            <Form.Item
              label="随机数字"
              name="result"
              wrapperCol={{ sm: { span: 16 } }}
            >
              <Input.TextArea autoSize={{ minRows: 8 }} disabled />
            </Form.Item>
          </Form>
        </>
      ) : (
        <>
          <header className="header">
            <h1>数据库</h1>
          </header>
          <main>
            <Space.Compact className="mr-4">
              <InputNumber
                value={newNum}
                onChange={changeNum}
                style={{ width: "200px" }}
              />
              <Button type="primary" onClick={addData}>
                添加
              </Button>
            </Space.Compact>
            <Button type="primary" onClick={showModal} className="mr-4">
              批量添加
            </Button>
            <Button type="primary" onClick={clearDatabase} className="mr-4">
              清空数据库
            </Button>
            <label>
              <Switch
                onChange={changeUseDatabase}
                value={useDatabase}
                className="mr-2"
              />
              启用数据库
            </label>

            <Modal
              title="批量添加"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
              okText="确认"
              cancelText="取消"
            >
              <Input.TextArea
                rows={8}
                placeholder="数字之间用英文逗号隔开"
                value={numStr}
                onChange={handleBatchAdd}
              />
            </Modal>
            <Divider />
            <Table
              columns={columns}
              dataSource={dataSourceToTable}
              size="small"
              pagination={{
                pageSize: 16,
              }}
            />
          </main>
        </>
      )}
    </>
  );
}

export default App;
