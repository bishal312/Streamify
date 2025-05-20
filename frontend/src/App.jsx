import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemestore } from "./store/useThemeStore.js";

const App = () => {
  const { isLoading, authUser } = useAuthUser();

  const {theme} = useThemestore();


  if (isLoading) return <PageLoader />;

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  return (
    <>
    {/* zustand for theme selector */}
      <div className="flex" data-theme={theme}>
        <Routes>
          <Route
            path="*"
            element={<div className="text-red-500">404 - Not Found</div>}
          />
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <Navigate to="/login" />
              ) : !isOnboarded ? (
                <Navigate to="/onboarding" />
              ) : (
                <Layout showSidebar={true}>
                  <HomePage />
                </Layout>
              )
            }
          />

          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <SignUpPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <NotificationsPage/>
                </Layout>
              ):(
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"}/>
              )
            }
          />
          <Route
            path="/call"
            element={isAuthenticated ? <CallPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat/:id"
            element={isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage/>
              </Layout>
            ) : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />}
          />
          <Route
            path="/onboarding"
            element={
              !isAuthenticated ? (
                <Navigate to="/login" />
              ) : !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <HomePage />
              )
            }
          />
        </Routes>
        <Toaster />
      </div>
    </>
  );
};

export default App;
