// client/src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect } from "react";
import MainFeed from "./components/MainFeed";
import ArticleDetail from "./components/ArticleDetail";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ArticleEditor from "./components/admin/ArticleEditor";
import AdminStaging from "./components/admin/AdminStaging";

import SiteLoginPage from "./components/SiteLoginPage.js";
import { AuthProvider, useAuth } from "./context/AuthContext";
import GlobalStyles from "./styles/GlobalStyles";
import Layout from "./components/common/Layout";
import AboutPage from "./components/AboutPage";
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";
import TermsPage from "./components/TermsPage";

// Protected route for site-wide content
const SiteRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Protected route for admin content
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" />;

  return isAdmin ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <GlobalStyles />

        <Routes>
          {/* Public route - only the site login page */}
          <Route path="/login" element={<SiteLoginPage />} />

          {/* Site-protected routes */}
          <Route
            path="/"
            element={
              <SiteRoute>
                <Layout>
                  <MainFeed />
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/article/:id"
            element={
              <SiteRoute>
                <Layout>
                  <ArticleDetail />
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/latest"
            element={
              <SiteRoute>
                <Layout>
                  <MainFeed />
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/audio"
            element={
              <SiteRoute>
                <Layout>
                  <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                    <h1>Audio Features</h1>
                    <p>Coming soon...</p>
                  </div>
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/explore"
            element={
              <SiteRoute>
                <Layout>
                  <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                    <h1>Explore</h1>
                    <p>Coming soon...</p>
                  </div>
                </Layout>
              </SiteRoute>
            }
          />

          {/* About, Privacy, and Terms routes */}
          <Route
            path="/about"
            element={
              <SiteRoute>
                <Layout>
                  <AboutPage />
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/privacy"
            element={
              <SiteRoute>
                <Layout>
                  <PrivacyPolicyPage />
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/terms"
            element={
              <SiteRoute>
                <Layout>
                  <TermsPage />
                </Layout>
              </SiteRoute>
            }
          />

          {/* Placeholder routes for other footer links */}
          <Route
            path="/contact"
            element={
              <SiteRoute>
                <Layout>
                  <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                    <h1>Contact Us</h1>
                    <p>Coming soon...</p>
                  </div>
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/subscribe"
            element={
              <SiteRoute>
                <Layout>
                  <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                    <h1>Subscribe</h1>
                    <p>Coming soon...</p>
                  </div>
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/contributors"
            element={
              <SiteRoute>
                <Layout>
                  <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                    <h1>Contributors</h1>
                    <p>Coming soon...</p>
                  </div>
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/support"
            element={
              <SiteRoute>
                <Layout>
                  <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                    <h1>Support Us</h1>
                    <p>Coming soon...</p>
                  </div>
                </Layout>
              </SiteRoute>
            }
          />

          <Route
            path="/cookies"
            element={
              <SiteRoute>
                <Layout>
                  <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                    <h1>Cookie Policy</h1>
                    <p>Coming soon...</p>
                  </div>
                </Layout>
              </SiteRoute>
            }
          />

          {/* Admin authentication route */}
          <Route
            path="/admin/login"
            element={
              <SiteRoute>
                <AdminLogin />
              </SiteRoute>
            }
          />

          {/* Admin-protected routes */}
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

          <Route
            path="/admin/staging"
            element={
              <AdminRoute>
                <AdminStaging />
              </AdminRoute>
            }
          />


          {/* Catch-all route - redirect to home if authenticated or login if not */}
          <Route
            path="*"
            element={
              <SiteRoute>
                <Navigate to="/" replace />
              </SiteRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
