import { useState, type FormEvent } from "react";

const ADMIN_EMAIL = "devxub@gmail.com";
const ADMIN_PASSWORD = "jubayer606";

export default function AdminLogin() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");

   const handleLogin = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setError("");

      if (
         email.trim().toLowerCase() === ADMIN_EMAIL &&
         password === ADMIN_PASSWORD
      ) {
         const adminCode = btoa(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`);

         localStorage.setItem("admin_code", adminCode);

         window.location.reload();
         return;
      }

      setError("Invalid email or password.");
   };

   return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
         <div className="w-full max-w-md rounded-xl bg-white px-8 py-8 shadow-xl">
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
               Admin Login
            </h1>

            <p className="mb-6 text-sm text-gray-500">
               Login to access the admin dashboard.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
               {/* Email */}
               <div>
                  <label
                     htmlFor="email"
                     className="block font-bold text-gray-800"
                  >
                     Email
                  </label>
                  <input
                     type="email"
                     id="email"
                     placeholder="Enter your email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     autoComplete="email"
                     className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
               </div>

               {/* Password */}
               <div>
                  <label
                     htmlFor="password"
                     className="block font-bold text-gray-800"
                  >
                     Password
                  </label>

                  <input
                     type="password"
                     id="password"
                     placeholder="Enter your password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     autoComplete="current-password"
                     className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
               </div>

               {/* Error */}
               {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                     {error}
                  </p>
               )}

               {/* Login */}
               <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-indigo-500 py-2.5 font-bold text-white transition hover:bg-indigo-600"
               >
                  Login
               </button>
            </form>
         </div>
      </div>
   );
}
