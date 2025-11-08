import Navbar from "./components/Navbar";
import EncryptedLogin from "./components/EncryptedLogin";

const apiHost = process.env.REACT_APP_API_URL;

export default function App() {
  return (
    <>
      <Navbar />
      <EncryptedLogin apiUrl={`${apiHost}/auth/login`} />
    </>
  );
}
