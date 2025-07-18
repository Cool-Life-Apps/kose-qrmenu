
'use client';

import { useState } from 'react';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';

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
      setError('Giriş yapılamadı. Lütfen e-posta adresinizi ve şifrenizi kontrol edin.');
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
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="w-full max-w-xs">
        <h1 className="text-3xl font-bold text-center mb-8">Yönetici Girişi</h1>
        <form onSubmit={handleLogin} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              E-posta
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Şifre
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-xs italic">{error}</p>}
          {message && <p className="text-green-500 text-xs italic">{message}</p>}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Giriş Yap
            </button>
            <a
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 cursor-pointer"
              onClick={handleResetPassword}
            >
              Şifremi Unuttum?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
