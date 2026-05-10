import { Navigate, Outlet } from "react-router-dom";
import Header from "./Header";
import { useAppSession } from "../context/appSession";

function FullPageLoader() {
  return (
    <div className="page-shell flex items-center justify-center">
      <div className="surface-card w-full max-w-sm p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-stone-200 bg-stone-900 text-xl font-semibold text-stone-50">
          W
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
          Loading workspace
        </p>
      </div>
    </div>
  );
}

export function ProtectedLayout() {
  const { authLoading, isAuthenticated } = useAppSession();

  if (authLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export function PublicLayout() {
  const { authLoading, isAuthenticated } = useAppSession();

  if (authLoading) {
    return <FullPageLoader />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
