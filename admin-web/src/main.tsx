// import { createRouter } from "@tanstack/react-router";
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
// import { routeTree } from "./routes";
// import "./styles/tailwind.css";
// import "./common/i18n";

// const router = createRouter({ routeTree });

// export type TanstackRouter = typeof router;

// declare module "@tanstack/react-router" {
// 	interface Register {
// 		// This infers the type of our router and registers it across your entire project
// 		router: TanstackRouter;
// 	}
// }

// const rootElement = document.querySelector("#root") as Element;
// if (!rootElement.innerHTML) {
// 	const root = ReactDOM.createRoot(rootElement);
// 	root.render(
// 		<React.StrictMode>
// 			<React.Suspense fallback="loading">
// 				<App router={router} />
// 			</React.Suspense>
// 		</React.StrictMode>
// 	);
// }

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { createRouter } from '@tanstack/react-router';
// import { AuthProvider, useAuth } from './context/auth';
// import { routeTree } from './routes';
// import App from './App';

// import "./styles/tailwind.css";


// export const router = createRouter({
//   routeTree,
//   context: {
//     auth: undefined!,
//   },
// });

// declare module '@tanstack/react-router' {
//   interface Register {
//     router: typeof router;
//   }
// }

// function RootApp() {
//   const auth = useAuth();
//   return <App router={router} />;
// }

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <AuthProvider>
//       <RootApp />
//     </AuthProvider>
//   </React.StrictMode>
// );
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter } from '@tanstack/react-router';
import { AuthProvider, useAuth } from './context/auth';
import { routeTree } from './routes';
import App from './App';
import './styles/tailwind.css';

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  
  React.useEffect(() => {
    // Update router context whenever auth changes
    router.update({
      context: {
        auth,
      },
    });

    // When user is logged out (token expired), navigate to login
    if (!auth.loading && !auth.isAuthenticated && router.state.location.pathname !== '/login' && router.state.location.pathname !== '/signup' && router.state.location.pathname !== '/forgot-password') {
      router.navigate({ to: '/login', replace: true });
    }
  }, [auth, auth.isAuthenticated, auth.user, auth.loading]);

  return <App router={router} />;
}

function RootApp() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);