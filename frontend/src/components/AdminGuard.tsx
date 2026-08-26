import { useEffect, useState, type ReactNode } from "react";

const ADMIN_EMAIL = "devxub@gmail.com";
const ADMIN_PASSWORD = "jubayer606";

const ADMIN_CODE = btoa(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`);

interface AdminGuardProps {
   children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
   const [authorized, setAuthorized] = useState(false);

   useEffect(() => {
      const storedCode = localStorage.getItem("admin_code");

      if (storedCode === ADMIN_CODE) {
         setAuthorized(true);
      } else {
         window.location.href = "/admin/login";
      }
   }, []);

   if (!authorized) {
      return null;
   }

   return <>{children}</>;
}
