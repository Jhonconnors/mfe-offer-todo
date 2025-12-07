// src/components/EncryptedLogin.jsx
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

// --- JWT helper: intenta leer exp del payload (si es JWT)
function getExpFromJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // pad
    const pad = payload.length % 4;
    const padded = payload + (pad ? "=".repeat(4 - pad) : "");
    const json = atob(padded);
    const obj = JSON.parse(json);
    if (obj && obj.exp) return obj.exp * 1000; // ms
    return null;
  } catch (e) {
    return null;
  }
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

    // cargar token desde localStorage (si existe)
    const existing = localStorage.getItem("token");
    if (existing) {
      setToken(existing);
      setLoggedIn(true);
    }
  }, []);

  // Scheduler: cada X seg verifica si el token expiró y lo borra si corresponde
  useEffect(() => {
    const CHECK_INTERVAL_MS = 15_000; // 15s - ajustable

    function checkAndRemoveExpiredToken() {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        // nada que hacer
        return;
      }

      // preferimos token_exp almacenado (timestamp ms)
      const tokenExpStr = localStorage.getItem("token_exp");
      if (tokenExpStr) {
        const tokenExp = Number(tokenExpStr);
        if (!Number.isNaN(tokenExp) && Date.now() >= tokenExp) {
          // expiró
          console.info("Token expirado según token_exp. Eliminando.");
          localStorage.removeItem("token");
          localStorage.removeItem("token_exp");
          // actualizar estado y notificar app
          setToken(null);
          setLoggedIn(false);
          window.dispatchEvent(new CustomEvent("app:logout", { detail: null }));
        }
        return;
      }

      // si no hay token_exp, intentar extraer exp del JWT
      const jwtExpMs = getExpFromJwt(storedToken);
      if (jwtExpMs !== null) {
        if (Date.now() >= jwtExpMs) {
          console.info("Token JWT expirado según 'exp' inside token. Eliminando.");
          localStorage.removeItem("token");
          localStorage.removeItem("token_exp");
          setToken(null);
          setLoggedIn(false);
          window.dispatchEvent(new CustomEvent("app:logout", { detail: null }));
        }
        return;
      }

      // Si llegamos aquí no podemos determinar expiración (token opaco) -> opcional: no borramos
      // Si prefieres eliminar tokens opacos después de X tiempo, implementa aquí una política.
    }

    // run once immediately then interval
    checkAndRemoveExpiredToken();
    const id = setInterval(checkAndRemoveExpiredToken, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
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
    if (!username || !password) return setStatus("Completa usuario y contraseña");

    setLoading(true);

    try {
      // Intentar obtener clientJwt (solo si cookiesChoice está aceptado)
      const cookiesChoice = localStorage.getItem("cookiesChoice") || null;
      let clientJwt = null;
      try {
        clientJwt = await getOrRefreshJwt(cookiesChoice, BFF_BASE_URL);
      } catch (err) {
        console.warn("No se pudo obtener client JWT antes del login:", err);
      }

      setStatus("Encriptando...");
      const encUser = await encryptField(username);
      const encPass = await encryptField(password);
      setPassword("");

      const body = JSON.stringify({ username: encUser, password: encPass });

      setStatus("Enviando al servidor...");
      const url = `${BFF_BASE_URL.replace(/\/$/, "")}/auth/login`;

      const headers = { "Content-Type": "application/json" };
      if (clientJwt) headers["Authorization"] = `Bearer ${clientJwt}`;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) {
        let text = await res.text().catch(() => "");
        let message = text || res.statusText || "Error en la petición";
        setStatus(`Error ${res.status}: ${message}`);
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const receivedToken = data?.accessToken || data?.access_token || null;

      setStatus(`Login exitoso${receivedToken ? ", token recibido" : ""}`);
      setToken(receivedToken);
      setLoggedIn(true);

      if (receivedToken) {
        // guardar token y, si el servidor retornó expiresIn, guardar token_exp (timestamp ms)
        localStorage.setItem("token", receivedToken);
        const expiresIn = data?.expiresIn || data?.expires_in || null;
        if (typeof expiresIn === "number") {
          const expTs = Date.now() + expiresIn * 1000;
          localStorage.setItem("token_exp", String(expTs));
        } else {
          // opcional: si recibes un JWT con exp embedido, puedes extraerlo y guardarlo
          const jwtExpMs = getExpFromJwt(receivedToken);
          if (jwtExpMs !== null) {
            localStorage.setItem("token_exp", String(jwtExpMs));
          } else {
            // no hay expires info -> no guardamos token_exp (scheduler intentará leer exp del JWT)
          }
        }

        // evento global (App.js lo usa para cerrar modal)
        window.dispatchEvent(new CustomEvent("app:login", { detail: receivedToken }));
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
    localStorage.removeItem("token_exp");
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
          <p className="text-sm text-slate-500">Has iniciado sesión correctamente.</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm">Token: {token ? token.slice(0, 30) + "..." : "No token"}</p>

          <div className="mt-4 space-y-2">
            <button onClick={handleLogout} className="rounded-lg border px-3 py-2 text-sm">
              Cerrar sesión
            </button>

            <button onClick={() => setStatus("Acción de ejemplo ejecutada")} className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm">
              Ir al panel
            </button>
          </div>
        </div>

        {status && <p className="text-xs text-center text-slate-600 mt-1">{status}</p>}
      </div>
    );
  }

  // --- Vista login ---
  return (
    <div className="p-6 space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Acceso seguro</h2>
        <p className="text-xs text-slate-500">Tus credenciales se cifran con RSA antes de ser enviadas al servidor.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Usuario</label>
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
          <label className="block text-xs font-medium text-slate-700">Contraseña</label>
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
          className={`w-full rounded-lg ${loading ? "opacity-60" : "bg-blue-600 hover:bg-blue-700"} text-white text-sm font-medium py-2.5 mt-2 transition`}
        >
          {loading ? "Procesando..." : "Ingresar"}
        </button>
      </form>

      {status && <p className="text-xs text-center text-slate-600 mt-1">{status}</p>}
    </div>
  );
}
