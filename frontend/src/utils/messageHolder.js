/**
 * 全局 message 持有者，供非 React 组件（如 axios 拦截器）使用。
 * 在 App 初始化时通过 setMessageApi 注入 antd App.useApp() 的 message 实例。
 */
let messageApi = null;

export const setMessageApi = (api) => {
  messageApi = api;
};

export const getMessageApi = () => messageApi;
