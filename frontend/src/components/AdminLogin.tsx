import { useState } from "react";

const ADMIN_PASSWORD = "jubayer606";

export default function AdminLogin({ onLogin }: any) {
   const [password, setPassword] = useState("");

   const handleLogin = () => {
      if (password === ADMIN_PASSWORD) {
         localStorage.setItem("admin_logged_in", "true");
         onLogin();
      } else {
         alert("Wrong password");
      }
   };

   return (
      <div>
         <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
         />

         <button onClick={handleLogin}>Login</button>
      </div>
   );
}
