import { useState, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SafetyCertificateOutlined } from '@ant-design/icons';

/**
 * 全屏覆盖层：路由变化时立即显示 loading，duration 毫秒后淡出。
 * 使用 useLayoutEffect 确保状态在浏览器绘制前同步更新，避免闪烁。
 * children 始终渲染，被固定定位的覆盖层挡住。
 */
const LoadingGate = ({
  duration = 1000,
  children,
}) => {
  const location = useLocation();
  const [phase, setPhase] = useState('loading');
  const [visiblePath, setVisiblePath] = useState(location.pathname);
  const isRouteChanging = visiblePath !== location.pathname;
  const shouldShowLoading = phase !== 'ready' || isRouteChanging;

  useLayoutEffect(() => {
    setPhase('loading');

    const fadeTimer = setTimeout(() => setPhase('fading'), duration);
    const readyTimer = setTimeout(() => {
      setVisiblePath(location.pathname);
      setPhase('ready');
    }, duration + 300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(readyTimer);
    };
  }, [location.pathname]);

  return (
    <>
      {shouldShowLoading && (
        <div className={`loading-overlay loading-overlay-enter ${phase === 'fading' ? 'loading-overlay-exit' : ''}`}>
          <div className="loading-content">
            <div className="loading-logo-wrapper">
              <div className="loading-logo">
                <SafetyCertificateOutlined />
              </div>
              <div className="loading-pulse-ring" />
              <div className="loading-pulse-ring loading-pulse-ring-delayed" />
            </div>
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>
            <p className="loading-text">正在加载</p>
          </div>
        </div>
      )}
      <div className={shouldShowLoading ? 'route-content route-content-hidden' : 'route-content'}>
        {children}
      </div>
    </>
  );
};

export default LoadingGate;
