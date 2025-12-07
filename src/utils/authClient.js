// src/utils/authClient.js
import { JSEncrypt } from "jsencrypt";
import PUBLIC_KEY_PEM from "../config/publicKey"; // tu PEM público (-----BEGIN PUBLIC KEY-----...)

// Objeto en memoria para guardar token actualizado
let currentJwt = null;
let jwtExpiryAt = 0;

/**
 * IMPORTANTE (seguridad)
 * - No es posible firmar en el cliente con la clave pública; firmar requiere la privada.
 * - Aquí creamos un "JWT cliente" con header.alg = "RS512" pero SIN firma (firma vacía).
 *   Esto es solo para tener un JWT bien formado en el header Authorization.
 * - El backend debe:
 *    1) extraer el JWT cliente del header Authorization,
 *    2) parsear el payload, extraer encCookies y encClientId,
 *    3) desencriptar ambos con su clave privada,
 *    4) validar iat/cookies/clientId/nonce/jti para evitar replay,
 *    5) emitir y devolver un JWT firmado (RS512 o RS256) con exp=2min.
 */

// -----------------------------
// Helpers Base64URL (soporte UTF-8)
// -----------------------------
function base64UrlEncode(str) {
    // Asegurar UTF-8 correcto antes de btoa
    try {
        // encodeURIComponent + unescape es una técnica para soportar UTF-8 en btoa
        const b64 = btoa(unescape(encodeURIComponent(str)));
        return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
        // fallback (menos robusto)
        const b64 = btoa(str);
        return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
}

/**
 * Crea un JWT compacto con firma vacía (3 secciones), forzando el 'alg' que indiques.
 * - headerAlg: por ejemplo "RS512" (string)
 * Resultado: base64url(header).base64url(payload).
 * Para cumplir RFC 7515 y que la herramienta JWT acepte el formato, devolvemos
 * header.payload.  (tercera sección vacía).
 */
function createClientJwtWithAlg(payloadObj, headerAlg = "RS512") {
    const header = { alg: headerAlg, typ: "JWT" };
    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj));
    // Incluimos la tercera sección vacía para mantener 3 segmentos: header.payload.
    return `${headerB64}.${payloadB64}.`;
}

// -----------------------------
// Exports
// -----------------------------
export function getCurrentJwt() {
    const now = Date.now();
    if (!currentJwt || now >= jwtExpiryAt) return null;
    return currentJwt;
}

/**
 * requestSignedJwtFromBff
 * - cookiesChoice: "accepted"|"rejected"|null
 * - bffBaseUrl: base URL del backend (ej: process.env.REACT_APP_BFF_API_URL)
 *
 * Flujo (cliente):
 *  1) encriptar encCookies y encClientId por separado con la clave pública
 *  2) crear un JWT cliente (alg: "RS512") cuyo payload contiene { iat, encCookies, encClientId }
 *  3) POST /auth/token con header Authorization: Bearer <clientJwt> y body {} (o vacío)
 *  4) el backend desencripta, valida y retorna { token } (JWT firmado) -> guardamos en memoria
 */
export async function requestSignedJwtFromBff(cookiesChoice, bffBaseUrl) {
    if (cookiesChoice === null || cookiesChoice === undefined) return null;

    const now = Math.floor(Date.now() / 1000);

    // ClientId a encriptar (según petición)
    const CLIENT_ID = "e7ed6898-e867-4c2c-9079-e057c46e434c";

    // Preparar jsencrypt con la clave pública
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(PUBLIC_KEY_PEM);

    // 1) encriptar payload de cookies
    const cookiesPayload = { cookiesAccepted: !!cookiesChoice, iat: now };
    const encCookies = jsEncrypt.encrypt(JSON.stringify(cookiesPayload));
    if (!encCookies) {
        throw new Error("No se pudo encriptar el payload de cookies con la clave pública (verifica clave/tamaño).");
    }

    // 2) encriptar clientId
    const encClientId = jsEncrypt.encrypt(CLIENT_ID);
    if (!encClientId) {
        throw new Error("No se pudo encriptar el clientId con la clave pública (verifica clave/tamaño).");
    }

    // 3) crear JWT cliente con header.alg = "RS512" pero SIN firma (firma vacía)
    const clientJwtPayload = {
        iat: now,
        encCookies,
        encClientId
        // opcional: nonce/jti si quieres prevenir replay (backend debe validar)
    };
    const clientJwt = createClientJwtWithAlg(clientJwtPayload, "RS512");

    // 4) llamar al BFF
    const safeBase = bffBaseUrl ? bffBaseUrl.replace(/\/$/, "") : "";
    const resp = await fetch(`${safeBase}/auth/web/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Enviamos el JWT cliente en Authorization: Bearer <clientJwt>
            "Authorization": `Bearer ${clientJwt}`
        },
        // Body vacío intencional: toda la info va dentro del clientJwt
        body: JSON.stringify({})
    });

    if (!resp.ok) {
        const txt = await resp.text().catch(() => null);
        throw new Error(`BFF error: ${resp.status} ${txt || ""}`);
    }

    const body = await resp.json();
    if (!body.access_token) throw new Error("Respuesta inválida: no viene token");

    // Guardar token en memoria y calcular expiry (si trae exp)
    currentJwt = body.access_token;
    const expiresIn = body.expires_in;
    if (typeof expiresIn === "number") {
        jwtExpiryAt = Date.now() + expiresIn * 1000;
    } else{
        throw new Error(`Invalid ExpiresIn: ${expiresIn} `);
    }

    return currentJwt;
}
export async function getOrRefreshJwt(cookiesChoice, bffBaseUrl) {
    const now = Date.now();

    // Si NO hay token o expiró → pedir uno nuevo
    if (!currentJwt || now >= jwtExpiryAt) {
        const newToken = await requestSignedJwtFromBff(cookiesChoice, bffBaseUrl);
        return newToken;
    }

    // Si existe y NO ha expirado → usarlo
    return currentJwt;
}

