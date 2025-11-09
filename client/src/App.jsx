import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Questions from './pages/Questions';
// import Stories from './pages/Stories';
import HelpAndSupport from './pages/HelpAndSupport';
import Feedback from './pages/Feedback';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* <Route path="/stories/*" element={<Stories />} /> */}
              <Route path="/help-and-support" element={<HelpAndSupport />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/*" element={<Layout />}>
                <Route index element={<Home />} />
                <Route 
                  path="profile/:userId?" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="questions/*" 
                  element={
                    <ProtectedRoute>
                      <Questions />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="connections" 
                  element={
                    <ProtectedRoute>
                      <Connections />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="messages" 
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } 
                />
                {/* Add this new route for individual conversations */}
                <Route 
                  path="messages/:conversationId" 
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="notifications" 
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;