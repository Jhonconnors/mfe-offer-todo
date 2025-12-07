import React, { useState, useEffect } from "react";
import PUBLIC_KEY_PEM from "../publicKey";
import { getOrRefreshJwt } from "../utils/authClient";

// --- Helpers para RSA / Base64
function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
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
  return now.toISOString().slice(0, 16);
}

// --- Componente
export default function EncryptedLogin() {
  const [pubKey, setPubKey] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  const BFF_BASE_URL = process.env.REACT_APP_BFF_API_URL || "";

  // cargar clave pública + token previo
  useEffect(() => {
    (async () => {
      try {
        const key = await importPublicKey(PUBLIC_KEY_PEM);
        setPubKey(key);
      } catch (err) {
        console.error("Error importando clave pública:", err);
        setStatus("Error importando la clave pública");
      }
    })();

    const existing = localStorage.getItem("token");
    if (existing) {
      setToken(existing);
      setLoggedIn(true);
    }
  }, []);

  async function encryptField(text) {
    const textWithDate = `${text}_+_${fechaMinutos()}`;
    const base64 = btoa(textWithDate);
    const encoded = new TextEncoder().encode(base64);

    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      pubKey,
      encoded
    );

    return arrayBufferToBase64(cipherBuffer);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!pubKey) return setStatus("Clave pública no cargada");
    if (!username || !password)
      return setStatus("Completa usuario y contraseña");

    setLoading(true);

    try {
      setStatus("Encriptando...");
      const encUser = await encryptField(username);
      const encPass = await encryptField(password);
      setPassword("");

      const body = JSON.stringify({ username: encUser, password: encPass });

      const cookiesChoice = localStorage.getItem("cookiesChoice") || null;

      // Construir headers, incluir Authorization solo si tenemos clientJwt
      let clientJwt = await getOrRefreshJwt(cookiesChoice, BFF_BASE_URL);
      const headers = { "Content-Type": "application/json" };
      if (clientJwt) headers["Authorization"] = `Bearer ${clientJwt}`; 
      const url = `${BFF_BASE_URL.replace(/\/$/, "")}/auth/login`;
      setStatus("Enviando al servidor...");
      const res = await fetch(url, {
        method: "POST",
        headers: headers,
        body,
      });

      if (!res.ok) {
        let text = await res.text().catch(() => "");
        let message = text || res.statusText || "Error en la petición";
        setStatus(`Error ${res.status}: ${message}`);
        setLoading(false);
        return;
      }

      // el servidor retorna: accessToken, tokenType, expiresIn
      const data = await res.json().catch(() => ({}));

      const receivedToken = data?.accessToken || null;

      setStatus(
        `Login exitoso${receivedToken ? ", token recibido" : ""}`
      );

      setToken(receivedToken);
      setLoggedIn(true);

      if (receivedToken) {
        localStorage.setItem("token", receivedToken);

        // 🔥 evento global (App.js lo usa para cerrar modal)
        window.dispatchEvent(
          new CustomEvent("app:login", { detail: receivedToken })
        );
      }

      setLoading(false);
    } catch (err) {
      console.error("Error en login:", err);
      setStatus("Error en el proceso de login");
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setLoggedIn(false);
    setStatus("Sesión cerrada");
    window.dispatchEvent(new CustomEvent("app:logout", { detail: null }));
  }

  // --- Vista si está logueado ---
  if (loggedIn) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Bienvenido</h2>
          <p className="text-sm text-slate-500">
            Has iniciado sesión correctamente.
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm">
            Token:{" "}
            {token ? token.slice(0, 30) + "..." : "No token"}
          </p>

          <div className="mt-4 space-y-2">
            <button
              onClick={handleLogout}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Cerrar sesión
            </button>

            <button
              onClick={() => setStatus("Acción de ejemplo ejecutada")}
              className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm"
            >
              Ir al panel
            </button>
          </div>
        </div>

        {status && (
          <p className="text-xs text-center text-slate-600 mt-1">
            {status}
          </p>
        )}
      </div>
    );
  }

  // --- Vista login ---
  return (
    <div className="p-6 space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">
          Acceso seguro
        </h2>
        <p className="text-xs text-slate-500">
          Tus credenciales se cifran con RSA antes de ser enviadas al
          servidor.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Usuario
          </label>
          <input
            name="username"
            autoComplete="username"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Contraseña
          </label>
          <input
            type="password"
            name="current-password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-lg ${
            loading ? "opacity-60" : "bg-blue-600 hover:bg-blue-700"
          } text-white text-sm font-medium py-2.5 mt-2 transition`}
        >
          {loading ? "Procesando..." : "Ingresar"}
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
