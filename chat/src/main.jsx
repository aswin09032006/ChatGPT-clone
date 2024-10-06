import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import DashboardLayout from './layouts/DashboardLayout/dashboardLayout.jsx';
import RootLayout from './layouts/RootLayout/rootLayout.jsx';
import ChatPage from './routes/ChatPage/chatPage.jsx';
import DashboardPage from './routes/DashboardPage/dashboardPage.jsx';
import HomePage from './routes/Homepage/homepage.jsx';
import SignInPage from './routes/SignInpage/signInPage.jsx';
import SignUpPage from './routes/SignUppage/signUpPage.jsx';

const router = createBrowserRouter([
  {
    element: <RootLayout/>,
    children: [
      {
        path: "/",
        element: <HomePage/>
      },
      {
        path: "/sign-in/*",
        element: <SignInPage/>
      },
      {
        path: "/sign-up/*",
        element: <SignUpPage/>
      },
      {
        element: <DashboardLayout/>,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage/>
          },
          {
            path: "/dashboard/chats/:id",
            element: <ChatPage/>
          }
        ]
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
