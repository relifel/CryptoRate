import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, saveToken } from '../api';

/**
 * 轻量级状态反馈组件
 */
const Toast = ({ message, type, isVisible, onClose }) => {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95 pointer-events-none'}`}
    >
      <div className={`px-5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border bg-white/90 flex items-center gap-3 backdrop-blur-xl
        ${type === 'error' ? 'border-red-100' : 'border-slate-100'}`}
      >
        {type === 'error' ? (
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800 flex-shrink-0" />
        )}
        <span className={`text-sm font-medium tracking-wide font-sans ${type === 'error' ? 'text-red-600' : 'text-slate-800'}`}>
          {message}
        </span>
      </div>
    </div>
  );
};

/**
 * 悬浮标签输入框 (遵循系统级无衬线字体规范)
 */
const FloatingInput = ({ id, type, value, onChange, label, disabled, required = true }) => {
  return (
    <div className="relative group w-full">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder=" "
        className={`peer w-full px-4 pt-6 pb-2 border-b-[1.5px] border-slate-200 bg-transparent text-slate-800 text-[15px] font-sans
          focus:outline-none focus:border-slate-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 top-4 text-slate-400 text-[15px] font-sans transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none
          peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-slate-800 peer-focus:font-medium origin-left
          ${value ? '-translate-y-3 scale-75 font-medium text-slate-800' : ''}`}
      >
        {label}
      </label>
    </div>
  );
};

/**
 * 动态数据流粒子画布组件 (支持鼠标交互)
 */
const DataParticleCanvas = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, radius: 120 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeObj = new ResizeObserver(entries => {
      for (let entry of entries) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = entry.contentRect.width * dpr;
        canvas.height = entry.contentRect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${entry.contentRect.width}px`;
        canvas.style.height = `${entry.contentRect.height}px`;
      }
    });
    const parentContainer = canvas.parentElement;
    if (parentContainer) resizeObj.observe(parentContainer);

    const particles = [];
    const PARTICLE_COUNT = 60;
    const CONNECTION_DISTANCE = 110;

    class Particle {
      constructor() {
        this.w = parentContainer.clientWidth || 1000;
        this.h = parentContainer.clientHeight || 1000;
        this.x = Math.random() * this.w;
        this.y = Math.random() * this.h;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.baseX = this.x;
        this.baseY = this.y;
        this.radius = Math.random() * 1.5 + 0.8;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update(mouse) {
        this.x += this.vx;
        this.y += this.vy;

        // 边界循环
        if (this.x < 0) this.x = this.w;
        if (this.x > this.w) this.x = 0;
        if (this.y < 0) this.y = this.h;
        if (this.y > this.h) this.y = 0;

        // 鼠标交互推斥逻辑
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            const activeForce = force * 2; // 推力倍数

            this.x -= forceDirectionX * activeForce;
            this.y -= forceDirectionY * activeForce;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // 使用偏灰蓝的极简配色 
        ctx.fillStyle = `rgba(71, 85, 105, ${this.opacity})`;
        ctx.fill();
      }
    }

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    };
    init();

    const animate = () => {
      const w = parentContainer.clientWidth || canvas.width;
      const h = parentContainer.clientHeight || canvas.height;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouseRef.current);
        particles[i].draw();

        // 绘制粒子间连线
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(71, 85, 105, ${0.15 * (1 - distance / CONNECTION_DISTANCE)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // 绘制粒子与鼠标的连线
        if (mouseRef.current.x != null && mouseRef.current.y != null) {
          const mx = particles[i].x - mouseRef.current.x;
          const my = particles[i].y - mouseRef.current.y;
          const mDistance = Math.sqrt(mx * mx + my * my);
          if (mDistance < mouseRef.current.radius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(71, 85, 105, ${0.2 * (1 - mDistance / mouseRef.current.radius)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    setTimeout(() => animate(), 100);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObj.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 block w-full h-full pointer-events-auto" />;
};


export default function Login({ onSuccess, onCancel }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'default' });
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'default') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const u = formData.username.trim();
    if (!u || !formData.password) {
      showToast('请输入完整的用户名和密码', 'error');
      return;
    }
    setLoading(true);
    try {
      showToast('验证中...', 'default');
      const res = await userAPI.login({ username: u, password: formData.password });
      if (res && res.data) {
        saveToken(res.data);
        showToast('验证成功', 'default');
        setTimeout(() => {
          if (onSuccess) onSuccess({ username: u, token: res.data });
        }, 600);
      } else {
        showToast('登录失败，请验证凭证', 'error');
      }
    } catch (err) {
      showToast(err.message || '登录失败，请检查密码是否正确', 'error');
    } finally {
      if (!onSuccess) setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const u = formData.username.trim();
    if (!u || !formData.password) {
      showToast('请输入完整的用户名和密码', 'error');
      return;
    }
    setLoading(true);
    try {
      showToast('正在为您配置智库架构...', 'default');
      await userAPI.register({
        username: u,
        password: formData.password,
        email: formData.email.trim() || undefined
      });
      showToast('配置成功！为您跳转至验证页', 'default');
      setTimeout(() => {
        setIsRegister(false);
        setFormData(prev => ({ ...prev, password: '' }));
      }, 1000);
    } catch (err) {
      showToast(err.message || '注册失败，用户名可能已存在', 'error');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setFormData(prev => ({ ...prev, password: '', email: '' }));
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden relative font-sans">

      {/* 极简科幻逃生舱 - 返回首页 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-[100] flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-teal-400 hover:-translate-x-[2px] hover:drop-shadow-[0_0_8px_rgba(45,212,191,0.6)] transition-all duration-300 font-sans group focus:outline-none"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="opacity-70 group-hover:opacity-100 transition-opacity">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium tracking-wide">返回</span>
      </button>

      {/* 极轻微的背景呼吸层 */}
      <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-slate-200 blur-[150px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-slate-300 blur-[150px] mix-blend-multiply opacity-50" />
      </div>

      <Toast
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      {/* AuthModal Container: 居中大卡片, 弥散阴影 */}
      <div className="relative z-10 w-[94%] max-w-5xl h-[660px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.05)] flex overflow-hidden ring-1 ring-slate-100/50">

        {/* 左侧视觉区 (45%) */}
        <div className="w-[45%] hidden md:flex flex-col relative bg-gradient-to-br from-slate-50 to-slate-100 p-12 justify-end border-r border-slate-100">

          {/* 核心动效：粒子层 */}
          <DataParticleCanvas />

          {/* 背景叠加一层极弱渐变确保文字可读性 */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/80 via-transparent to-transparent pointer-events-none z-0"></div>

          <div className="relative z-10 mb-8 pointer-events-none">
            <h1 className="text-[40px] font-bold text-slate-800 leading-[1.2] tracking-tight whitespace-pre-line font-sans">
              化繁为简，{"\n"}
              洞见数据本源。
            </h1>
            <p className="mt-6 text-[15px] font-normal text-slate-500 max-w-[280px] leading-relaxed">
              构建数字资产管理的新标准，我们为您提供专业、清晰、极度安全的数据智能监控平台。
            </p>
          </div>
        </div>

        {/* 右侧交互区 (55%) */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-14 relative bg-white">

          <div className="w-full max-w-[360px]">

            <div className="text-center mb-10">
              <h2 className="text-[28px] font-semibold text-slate-900 tracking-tight mb-2 font-sans">
                {isRegister ? '加入系统' : '欢迎回来'}
              </h2>
              <p className="text-slate-500 text-[15px] font-sans">
                {isRegister ? '登录您的CryptoRate' : '登录您的CryptoRate'}
              </p>
            </div>


            {/* 表单主体 */}
            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
              <FloatingInput
                id="username"
                type="text"
                label="账号"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />

              {isRegister && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <FloatingInput
                    id="email"
                    type="email"
                    label="安全通讯邮箱 (可选)"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required={false}
                  />
                </div>
              )}

              <FloatingInput
                id="password"
                type="password"
                label="密码"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />

              <div className="pt-6 relative w-full h-[52px]">
                {/* 主操作按钮：极简点缀色 slate-800 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute inset-0 w-full rounded-[14px] bg-slate-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.12)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.15)] hover:-translate-y-[1px] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_rgba(15,23,42,0.12)] font-sans"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-white/80" />
                  ) : (
                    <>
                      {isRegister ? '注册您的通行证' : '通过账号验证'}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 底部附加操作 */}
            <div className="mt-8 flex flex-col items-center gap-5">
              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className="text-[14px] text-slate-500 font-medium hover:text-slate-800 transition-colors disabled:opacity-50 font-sans"
              >
                {isRegister ? '已有通行证？返回登录' : '没有通行证？即刻创建'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
