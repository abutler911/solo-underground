// client/src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainFeed from "./components/MainFeed";
import ArticleDetail from "./components/ArticleDetail";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ArticleEditor from "./components/admin/ArticleEditor";
import { AuthProvider, useAuth } from "./context/AuthContext";
import GlobalStyles from "./styles/GlobalStyles";
import Layout from "./components/common/Layout";

// Protected route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalStyles />
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <Layout>
                <MainFeed />
              </Layout>
            }
          />

          <Route
            path="/article/:id"
            element={
              <Layout>
                <ArticleDetail />
              </Layout>
            }
          />

          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/create"
            element={
              <AdminRoute>
                <ArticleEditor />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/edit/:id"
            element={
              <AdminRoute>
                <ArticleEditor />
              </AdminRoute>
            }
          />

          {/* Add additional routes here */}
          <Route
            path="/latest"
            element={
              <Layout>
                <MainFeed />
              </Layout>
            }
          />

          <Route
            path="/audio"
            element={
              <Layout>
                <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                  <h1>Audio Features</h1>
                  <p>Coming soon...</p>
                </div>
              </Layout>
            }
          />

          <Route
            path="/explore"
            element={
              <Layout>
                <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                  <h1>Explore</h1>
                  <p>Coming soon...</p>
                </div>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
