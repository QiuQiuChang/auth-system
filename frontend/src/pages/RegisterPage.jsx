import { useState } from "react";
import { App, Button, Form, Input } from "antd";
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { encryptPassword } from "../utils/crypto";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const encryptedPassword = await encryptPassword(values.password);
      await authApi.register({ ...values, password: encryptedPassword });
      message.success("注册成功，请登录");
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "注册失败，请稍后重试";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="系统概览">
        <div className="brand-mark">
          <SafetyCertificateOutlined />
        </div>
        <div>
          <p className="auth-eyebrow">创建安全账号</p>
          <h1 className="auth-hero-title">从第一步开始保护账户访问</h1>
          <p className="auth-hero-copy">
            注册后系统会使用 BCrypt 保存密码，并通过 JWT 维护你的登录状态。
          </p>
        </div>
        <div className="auth-metrics">
          <div>
            <strong>3-20</strong>
            <span>用户名长度</span>
          </div>
          <div>
            <strong>8+</strong>
            <span>密码位数</span>
          </div>
          <div>
            <strong>Email</strong>
            <span>邮箱校验</span>
          </div>
        </div>
      </section>

      <section className="auth-panel" aria-label="注册表单">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">注册账号</h2>
            <p className="auth-subtitle">填写基本信息后即可开始使用</p>
          </div>

          <Form
            name="register"
            className="auth-form"
            initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <input type="text" name="fakeuser" autoComplete="username" style={{ position: 'absolute', opacity: 0, height: 0, padding: 0, border: 0, pointerEvents: 'none' }} tabIndex={-1} />
            <input type="password" name="fakepassword" autoComplete="new-password" style={{ position: 'absolute', opacity: 0, height: 0, padding: 0, border: 0, pointerEvents: 'none' }} tabIndex={-1} />

            <Form.Item
              name="username"
              rules={[
                { required: true, message: "请输入用户名" },
                { min: 3, max: 20, message: "用户名长度为 3-20 个字符" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                autoComplete="new-username"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "请输入邮箱" },
                { type: "email", message: "请输入有效的邮箱地址" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="邮箱"
                autoComplete="off"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 8, message: "密码长度至少 8 位" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "请确认密码" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次密码输入不一致"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                注册
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-footer">
            已有账号？ <Link to="/login">立即登录</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
