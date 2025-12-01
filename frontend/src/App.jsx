/*
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/auth/login/LoginPage";
import SignupPage from "./pages/auth/signup/SignupPage";
import HomePage from "./pages/home/HomePage";
import ProtectedRoute from "./utils/protectRoute";


const App = () => {
return (
 <BrowserRouter>
 <Navbar />
   <Routes>
   <Route
    path="/"
    element={
     <ProtectedRoute>
     <HomePage />
    </ProtectedRoute>
}
/>
<Route path="/signup" element={<SignupPage />} />
<Route path="/login" element={<LoginPage />} />
</Routes>
</BrowserRouter>
);
};


export default App;
*/

// App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import LoginPage from "./pages/auth/login/LoginPage";
//import SignupPage from "./pages/auth/signup/SignupPage";
import HomePage from "./pages/home/HomePage";
import CreatePage from "./pages/create/createPage";
import PracticePage from "./pages/practice/practicePage";
import ProblemDetail from "./pages/practice/problemDetail";
import SignupPage from "./pages/auth/signup/SignupPage";

 
const authFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("qc_auth")) || { loggedIn: false, user: null };
  } catch {
    return { loggedIn: false, user: null };
  }
};

const App = () =>{
  const [auth, setAuth] = useState(authFromStorage);

  useEffect(() => {
    localStorage.setItem("qc_auth", JSON.stringify(auth));
  }, [auth]);

  const login = (user) => setAuth({ loggedIn: true, user });
  const logout = () => setAuth({ loggedIn: false, user: null });

  return (
    <BrowserRouter>
      <Navbar auth={auth} logout={logout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/create"
          element={
            <ProtectedRoute auth={auth}>
              <CreatePage />
              </ProtectedRoute>
          }
        />

        <Route
          path="/practice"
          element={
            <ProtectedRoute auth={auth}>
              <PracticePage />
            </ProtectedRoute>
          }
        />
         <Route
    path="/practice/:id"
    element={
      <ProtectedRoute auth={auth}>
        <ProblemDetail />
      </ProtectedRoute>
    }
  />

        

        <Route path="/login" element={<LoginPage login={login} />} />
        <Route path="/signup" element={<SignupPage login={login}/>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


// ProtectedRoute: wraps a route and redirects to /login if not logged in.
 // It passes the "from" location so LoginPage can redirect back after sign-in.
 
function ProtectedRoute({ auth, children }) {
  const location = useLocation();

  if (!auth.loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default App;
