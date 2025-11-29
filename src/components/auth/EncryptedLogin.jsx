import React, { useState, useEffect } from "react";
import PUBLIC_KEY_PEM from "../../config/publicKey";

// --- Helpers para RSA / Base64
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/, "")
                 .replace(/-----END PUBLIC KEY-----/, "")
                 .replace(/\s+/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function importPublicKey(pem) {
  const keyBuf = pemToArrayBuffer(pem);
  return window.crypto.subtle.importKey(
    "spki",
    keyBuf,
    { name: "RSA-OAEP", hash: "SHA-512" },
    false,
    ["encrypt"]
  );
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fechaMinutos() {
  const now = new Date();
  return now.toISOString().slice(0,16);
}

// --- Componente
export default function EncryptedLogin() {
  const [pubKey, setPubKey] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const key = await importPublicKey(PUBLIC_KEY_PEM);
        setPubKey(key);
      } catch (err) {
        console.error(err);
        setStatus("Error importando la clave pública");
      }
    })();
  }, []);

  async function encryptField(text) {
    const textWithDate = `${text}_+_${fechaMinutos()}`;
    const base64 = btoa(textWithDate);
    const encoded = new TextEncoder().encode(base64);
    const cipherBuffer = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, pubKey, encoded);
    return arrayBufferToBase64(cipherBuffer);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!pubKey) return setStatus("Clave pública no cargada");
    if (!username || !password) return setStatus("Completa usuario y contraseña");

    const BFF_BASE_URL = process.env.REACT_APP_BFF_API_URL;
    let url = "";
    try {
      setStatus("Encriptando...");
      const encUser = await encryptField(username);
      const encPass = await encryptField(password);
      setPassword("");

      const body = JSON.stringify({ username: encUser, password: encPass });
      setStatus("Enviando al servidor...");
      url = `${BFF_BASE_URL}/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });

      if (!res.ok) return setStatus(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json().catch(() => ({}));
      setStatus(`Login exitoso${data?.token ? ", token recibido" : ""}`);
    } catch (err) {
      console.error(err);
      setStatus("Error en el proceso de login");
    }
  }
   return (
    <div className="p-6 space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">
          Acceso seguro
        </h2>
        <p className="text-xs text-slate-500">
          Tus credenciales se cifran con RSA antes de ser enviadas al servidor.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Usuario
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 mt-2 transition"
        >
          Ingresar
        </button>
      </form>

      {status && (
        <p className="text-xs text-center text-slate-600 mt-1">
          {status}
        </p>
      )}
    </div>
  );
}
