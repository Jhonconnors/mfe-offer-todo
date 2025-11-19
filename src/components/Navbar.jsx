export default function Navbar({ onLoginClick }) {
  return (
    <nav className="navbar">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / título */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-lg">
            🔐
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm">Encrypted Login</span>
            <span className="text-[11px] text-blue-100">
              React + RSA Encryption
            </span>
          </div>
        </div>

        {/* Botón Ingresar */}
        <button
          type="button"
          onClick={onLoginClick}
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white"
        >
          Ingresar
        </button>
      </div>
    </nav>
  );
}
