import { createBrowserRouter } from 'react-router-dom';

import App from '../App';

import Employees from '@/features/Employees/Employees';
import EmployeeDetail from '@/features/Employees/EmployeeDetail';
import Settings from '@/features/Settings/Settings';
import { Integrations } from '@/features/Integrations';
import Terminal from '@/features/Terminal';
import Login from '@features/Login';
import Signup from '@features/Signup';
import ResetPassword from '@features/ResetPassword';
import RequestPasswordReset from '@features/RequestPasswordReset';

import PublicRouteGuard from '@/guards/Public';
import PrivateRouteGuard from '@/guards/Private';
import ResetPasswordGuard from '@/guards/ResetPassword';

export const createRouter = () =>
    createBrowserRouter([
        {
            element: <PublicRouteGuard />,
            children: [
                {
                    path: '/login',
                    element: <Login />,
                },
                {
                    path: '/signup',
                    element: <Signup />,
                },
                {
                    path: '/request-password-reset',
                    element: <RequestPasswordReset />,
                }
            ]
        },
        {
            element: <ResetPasswordGuard />,
            children: [
                {
                    path: '/reset-password',
                    element: <ResetPassword />,
                }
            ]
        },
        {
            path: '/',
            element: <PrivateRouteGuard />,
            children: [
                {
                    element: <App />,
                    children: [
                        {
                            path: "/employees",
                            element: <Employees />,
                        },
                        {
                            path: "/employees/:id",
                            element: <EmployeeDetail />,
                        },
                        {
                            path: "/settings",
                            element: <Settings />,
                        },
                        {
                            path: "/integrations",
                            element: <Integrations />,
                        },
                        {
                            path: "/terminal",
                            element: <Terminal />,
                        }
                    ],
                }
            ],
        },
    ]
);
