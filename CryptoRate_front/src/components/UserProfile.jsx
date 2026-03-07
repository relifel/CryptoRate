import React, { useState, useEffect } from 'react';
import { profileAPI } from '../api';

/**
 * UserProfile 个人中心组件 (真实联调版)
 * 
 * 符合资深全栈架构师标准的极简、现代卡片式设计。
 * 已对接后端真实 API。
 */
const UserProfile = () => {
    // ── 账户信息状态 ──
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ nickname: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

    // ── 修改密码状态 ──
    const [pwForm, setPwForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwStatus, setPwStatus] = useState({ text: '', type: '' });

    // ── 获取个人资料 ──
    const fetchProfile = async () => {
        try {
            const res = await profileAPI.getProfile();
            if (res && res.data) {
                setProfile(res.data);
                setForm({
                    nickname: res.data.nickname || '',
                    email: res.data.email || '',
                });
            }
        } catch (err) {
            console.error('获取信息失败:', err);
            setStatusMsg({ text: '❌ 获取资料失败，请检查登录状态', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // ── 保存个人资料 ──
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatusMsg({ text: '', type: '' });

        try {
            const res = await profileAPI.updateProfile({
                nickname: form.nickname,
                email: form.email
            });
            if (res.code === 200) {
                setStatusMsg({ text: '✅ 个人资料保存成功', type: 'success' });
                setProfile(res.data); // 更新底层展示
                setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
            } else {
                setStatusMsg({ text: `❌ ${res.msg || '保存失败'}`, type: 'error' });
            }
        } catch (err) {
            setStatusMsg({ text: '❌ 网络异常，请检查后端服务', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // ── 修改密码 ──
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwStatus({ text: '❌ 两次输入的新密码不一致', type: 'error' });
            return;
        }

        setPwSaving(true);
        setPwStatus({ text: '', type: '' });

        try {
            const res = await profileAPI.changePassword({
                oldPassword: pwForm.oldPassword,
                newPassword: pwForm.newPassword,
                confirmPassword: pwForm.confirmPassword
            });
            if (res.code === 200) {
                setPwStatus({ text: '✅ 密码已修改，请妥善保管', type: 'success' });
                setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setPwStatus({ text: '', type: '' }), 3000);
            } else {
                setPwStatus({ text: `❌ ${res.msg || '修改失败'}`, type: 'error' });
            }
        } catch (err) {
            setPwStatus({ text: '❌ 修改失败，旧密码可能错误或网络异常', type: 'error' });
        } finally {
            setPwSaving(false);
        }
    };

    // ── 样式变量 ──
    const colors = {
        primary: '#6366f1',
        success: '#10b981',
        error: '#ef4444',
        bg: '#f8fafc',
        card: '#ffffff',
        text: '#1e293b',
        textMuted: '#64748b',
        border: '#e2e8f0',
    };

    const styles = {
        container: { maxWidth: '500px', margin: '40px auto', padding: '0 20px', fontFamily: '"Inter", sans-serif', color: colors.text },
        card: { background: colors.card, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '24px', marginBottom: '24px', border: `1px solid ${colors.border}` },
        title: { margin: '0 0 8px', fontSize: '20px', fontWeight: '700' },
        sub: { margin: '0 0 24px', fontSize: '14px', color: colors.textMuted },
        group: { marginBottom: '16px', display: 'flex', flexDirection: 'column' },
        label: { fontSize: '12px', fontWeight: '600', color: colors.textMuted, marginBottom: '6px' },
        input: { padding: '10px 14px', borderRadius: '10px', border: `1px solid ${colors.border}`, fontSize: '14px', outline: 'none' },
        readOnly: { padding: '10px 14px', borderRadius: '10px', border: `1px solid ${colors.border}`, fontSize: '14px', background: colors.bg, color: colors.textMuted, cursor: 'not-allowed' },
        button: (isLoading) => ({ padding: '12px', borderRadius: '10px', border: 'none', background: isLoading ? colors.textMuted : colors.primary, color: '#fff', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', width: '100%', transition: 'all 0.2s' }),
        status: (type) => ({ fontSize: '13px', marginTop: '12px', textAlign: 'center', display: 'block', color: type === 'success' ? colors.success : colors.error }),
        loading: { textAlign: 'center', padding: '100px 0', color: colors.textMuted }
    };

    if (loading) return <div style={styles.loading}>正在加载资料...</div>;

    return (
        <div style={styles.container}>
            <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>个人中心</h1>

            {/* 基本资料 */}
            <div style={styles.card}>
                <h2 style={styles.title}>基本资料</h2>
                <p style={styles.sub}>管理您的账户公开展示名称与电子邮箱</p>
                <form onSubmit={handleSaveProfile}>
                    <div style={styles.group}>
                        <label style={styles.label}>用户名</label>
                        <div style={styles.readOnly}>{profile?.username}</div>
                    </div>
                    <div style={styles.group}>
                        <label style={styles.label}>显示昵称</label>
                        <input
                            style={styles.input}
                            value={form.nickname}
                            onChange={e => setForm({ ...form, nickname: e.target.value })}
                            placeholder="请输入新昵称"
                        />
                    </div>
                    <div style={styles.group}>
                        <label style={styles.label}>电子邮箱</label>
                        <input
                            style={styles.input}
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="example@mail.com"
                        />
                    </div>
                    <button style={styles.button(saving)} disabled={saving}>
                        {saving ? '同步中...' : '提交修改'}
                    </button>
                    {statusMsg.text && <span style={styles.status(statusMsg.type)}>{statusMsg.text}</span>}
                </form>
            </div>

            {/* 安全设置 */}
            <div style={styles.card}>
                <h2 style={styles.title}>账户安全</h2>
                <p style={styles.sub}>为了您的账户安全，建议定期更换密码</p>
                <form onSubmit={handleChangePassword}>
                    <div style={styles.group}>
                        <label style={styles.label}>当前密码</label>
                        <input
                            style={styles.input}
                            type="password"
                            value={pwForm.oldPassword}
                            onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                            placeholder="验证旧密码"
                            required
                        />
                    </div>
                    <div style={styles.group}>
                        <label style={styles.label}>新密码</label>
                        <input
                            style={styles.input}
                            type="password"
                            value={pwForm.newPassword}
                            onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                            placeholder="6-30 位混合字符"
                            required
                        />
                    </div>
                    <div style={styles.group}>
                        <label style={styles.label}>确认新密码</label>
                        <input
                            style={styles.input}
                            type="password"
                            value={pwForm.confirmPassword}
                            onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                            placeholder="再次确认新密码"
                            required
                        />
                    </div>
                    <button style={styles.button(pwSaving)} disabled={pwSaving}>
                        {pwSaving ? '正在修改...' : '确认修改'}
                    </button>
                    {pwStatus.text && <span style={styles.status(pwStatus.type)}>{pwStatus.text}</span>}
                </form>
            </div>

            <p style={{ textAlign: 'center', fontSize: '12px', color: colors.textMuted }}>
                账户最后更新时间: {profile?.updateTime || '暂无记录'}
            </p>
        </div>
    );
};

export default UserProfile;
