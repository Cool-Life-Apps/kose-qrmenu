
'use client';

import { useState } from 'react';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: ["400", "500", "600"] });

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err) {
      setError('Giriş yapılamadı. Lütfen e-posta adresinizi ve/veya şifrenizi kontrol edin.');
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setMessage(null);
    if (!email) {
      setError('Şifrenizi sıfırlamak için lütfen e-posta adresinizi girin.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Şifre sıfırlama e-postası gönderildi! Gelen kutunuzu kontrol edin.');
    } catch (err) {
      setError('Şifre sıfırlama e-postası gönderilemedi. Lütfen e-posta adresinizi kontrol edin.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-purple-50 to-pink-50">
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h1 className={`${montserrat.className} text-3xl font-bold text-center mb-8 text-gray-800`}>Yönetici Girişi</h1>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
              E-posta
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800 bg-gray-50 transition"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
              Şifre
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800 bg-gray-50 transition"
              id="password"
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="w-full bg-red-100 text-red-700 px-3 py-2 rounded text-xs font-semibold text-center">{error}</div>}
          {message && <div className="w-full bg-green-100 text-green-700 px-3 py-2 rounded text-xs font-semibold text-center">{message}</div>}
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition mt-2"
            type="submit"
          >
            Giriş Yap
          </button>
          <button
            type="button"
            className="w-full text-purple-600 hover:underline text-xs mt-2"
            onClick={handleResetPassword}
          >
            Şifremi Unuttum?
          </button>
        </form>
      </div>
    </div>
  );
}
