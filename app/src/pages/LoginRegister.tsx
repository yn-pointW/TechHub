import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';

type Tab = 'login' | 'register';

export default function LoginRegister() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);

  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(loginEmail, loginPassword);
    if (success) {
      addToast('success', t('auth.welcome'));
      navigate(useAuthStore.getState().isAdmin ? '/admin' : '/');
    } else {
      addToast('error', t('auth.login_error'));
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      addToast('error', t('auth.passwords_mismatch'));
      return;
    }
    setIsSubmitting(true);
    const success = await register(regName, regEmail, regPhone, regPassword);
    if (success) {
      addToast('success', t('auth.account_created'));
      navigate('/');
    } else {
      addToast('error', t('auth.register_error'));
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-tech-bg-secondary border border-tech-border-subtle rounded-2xl p-8"
      >
        {/* Tabs */}
        <div className="flex bg-tech-bg-tertiary rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'login' ? 'bg-tech-accent-primary text-black' : 'text-tech-text-secondary hover:text-white'
            }`}
          >
            <LogIn size={16} />
            {t('auth.login')}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'register' ? 'bg-tech-accent-primary text-black' : 'text-tech-text-secondary hover:text-white'
            }`}
          >
            <UserPlus size={16} />
            {t('auth.register')}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <h2 className="text-h2 text-white text-center mb-6">{t('auth.login_title')}</h2>

              <div>
                <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('auth.email')}</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="user@techhub.md"
                  className="input-base w-full"
                  required
                />
              </div>

              <div>
                <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder={t('auth.password_hint')}
                    className="input-base w-full pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-tech-text-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-tech-border-subtle bg-tech-bg-tertiary accent-tech-accent-primary" />
                  <span className="text-tech-text-secondary text-sm">{t('auth.remember_me')}</span>
                </label>
                <Link to="/" className="text-tech-accent-primary text-sm hover:underline">{t('auth.forgot_password')}</Link>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 disabled:opacity-50">
                {isSubmitting ? t('auth.entering') : t('auth.enter')}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-tech-border-subtle" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-tech-bg-secondary px-4 text-tech-text-muted text-sm">sau</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setLoginEmail('user@techhub.ru'); setLoginPassword('user123'); }}
                  className="w-full btn-secondary text-sm py-3"
                >
                  👤 {t('auth.login_as_user')}
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginEmail('admin@techhub.ru'); setLoginPassword('admin123'); }}
                  className="w-full btn-secondary text-sm py-3"
                >
                  🔑 {t('auth.login_as_admin')}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister}
              className="space-y-5"
            >
              <h2 className="text-h2 text-white text-center mb-6">{t('auth.register_title')}</h2>

              <div>
                <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('auth.name')}</label>
                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Ion Popescu" className="input-base w-full" required />
              </div>
              <div>
                <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('auth.email')}</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="ion@example.com" className="input-base w-full" required />
              </div>
              <div>
                <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('auth.phone')}</label>
                <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+373 69 123-456" className="input-base w-full" required />
              </div>
              <div>
                <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('auth.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder={t('auth.password_hint')}
                    className="input-base w-full pr-12"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-tech-text-muted hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-tech-text-secondary text-sm mb-1.5 block">{t('auth.password_confirm')}</label>
                <input type="password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} placeholder={t('auth.password_repeat')} className="input-base w-full" required />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-4 disabled:opacity-50">
                {isSubmitting ? t('auth.creating') : t('auth.create_account')}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}