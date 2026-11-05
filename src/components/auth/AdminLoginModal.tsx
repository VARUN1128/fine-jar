import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Terminal } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        setEmail('');
        setPassword('');
        onSuccess();
        onClose();
      } else {
        setErrorMsg(result.error || 'AUTHENTICATION_FAILED: ACCESS_DENIED');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'RUNTIME_ERROR: AUTHENTICATION_TERMINATED');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = () => {
    setEmail('fine@gmail.com');
    setPassword('fine@sof.admn');
    setErrorMsg('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ADMIN_CONSOLE // AUTH_GATEWAY"
      description="Restricted administrative access. Supabase Auth credential verification."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono">
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 bg-[#020303] border border-[#ff65d8] text-[#ff65d8] text-xs">
            <AlertCircle className="w-4 h-4 text-[#ff65d8] flex-shrink-0 mt-0.5" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">
            OPERATOR_EMAIL
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c2cbc5]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fine@gmail.com"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#c2cbc5] uppercase mb-1">
            ENCRYPTED_PASSPHRASE
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c2cbc5]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-8 pr-9 py-1.5 text-xs bg-[#020303] border border-[#304c3b] focus:border-[#38ff8e] text-[#f8fffa] outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c2cbc5] hover:text-[#38ff8e]"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleAutofill}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#38ff8e] bg-[#020303] hover:bg-[#38ff8e] hover:text-[#020303] border border-[#304c3b] px-2 py-0.5 uppercase"
          >
            <Terminal className="w-3 h-3 text-[#38ff8e] group-hover:text-[#020303]" />
            <span>AUTOFILL fine@gmail.com</span>
          </button>
          <span className="text-[10px] text-[#c2cbc5]">RESTRICTED_ACCESS</span>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase text-[#020303] bg-[#38ff8e] border border-[#38ff8e] hover:bg-transparent hover:text-[#38ff8e] disabled:opacity-50 clip-corner-diagonal"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-[#020303] border-t-transparent animate-spin" />
            ) : (
              <>
                <span>VERIFY_CREDENTIALS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
