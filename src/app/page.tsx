'use client';

import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';

import {
  generateWebAuthnLoginOptions,
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnLogin,
  verifyWebAuthnRegistration,
} from '@/utils/webAuthn';
import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString();
    const type = formData.get('type')?.toString();

    if (!email) {
      setMessage('Enter email');
      return;
    }

    if (type === 'register') {
      const response = await generateWebAuthnRegistrationOptions(email);

      if (!response.success || !response.data) {
        alert(response.message ?? 'Something went wrong!');
        setMessage('');
        return;
      }

      const localResponse = await startRegistration(response.data);
      const verifyResponse = await verifyWebAuthnRegistration(localResponse);

      if (!verifyResponse.success) {
        alert(verifyResponse.message ?? 'Something went wrong!');
        setMessage('');
        return;
      }
      setMessage('');
      alert('Registration successful!');
    } else {
      const response = await generateWebAuthnLoginOptions(email);

      if (!response.success || !response.data) {
        alert(response.message ?? 'Something went wrong!');
        setMessage('');
        return;
      }

      const localResponse = await startAuthentication(response.data);
      const verifyResponse = await verifyWebAuthnLogin(localResponse);

      if (!verifyResponse.success) {
        alert(verifyResponse.message ?? 'Something went wrong!');
        setMessage('');
        return;
      }
      setMessage('');
      alert('Login successful!');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center gap-2"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="p-2 rounded-md focus:border-slate-800 border-slate-300"
        />
        <p className="text-red-500 text-sm">{message}</p>
        <div>
          <label>
            <input type="radio" name="type" value="register" defaultChecked />
            Register
          </label>

          <label>
            <input type="radio" name="type" value="login" />
            Login
          </label>
        </div>

        <input
          type="submit"
          value="Submit"
          className="px-5 py-2 bg-blue-500 text-white hover:bg-blue-400"
        />
      </form>
    </main>
  );
}
