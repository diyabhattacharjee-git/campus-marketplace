import { Routes, Route } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import ProtectedRoute from '@/routes/ProtectedRoute';

import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import DashboardPage from '@/pages/student/DashboardPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import PublicProfilePage from '@/pages/profile/PublicProfilePage';
import ProductsPage from '@/pages/products/ProductsPage';
import ProductDetailPage from '@/pages/products/ProductDetailPage';
import CreateListingPage from '@/pages/products/CreateListingPage';
import EditListingPage from '@/pages/products/EditListingPage';
import MyListingsPage from '@/pages/products/MyListingsPage';
import BuyerRequestsPage from '@/pages/bidding/BuyerRequestsPage';
import CreateBuyerRequestPage from '@/pages/bidding/CreateBuyerRequestPage';
import BuyerRequestDetailPage from '@/pages/bidding/BuyerRequestDetailPage';
import MyBuyerRequestsPage from '@/pages/bidding/MyBuyerRequestsPage';
import MyBidsPage from '@/pages/bidding/MyBidsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.HOME} element={<HomePage />} />

      {/* Auth flow — shares the split-screen AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
      </Route>

      {/* Authenticated app shell — Navbar + Sidebar.
          Each Step from here (Products, Bidding, Chat, ...) adds a
          <Route> inside this block rather than creating a new layout. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.USER_PROFILE} element={<PublicProfilePage />} />

          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.CREATE_PRODUCT} element={<CreateListingPage />} />
          <Route path={ROUTES.EDIT_PRODUCT} element={<EditListingPage />} />
          <Route path={ROUTES.PRODUCT_DETAILS} element={<ProductDetailPage />} />
          <Route path={ROUTES.MY_LISTINGS} element={<MyListingsPage />} />

          <Route path={ROUTES.CREATE_BUYER_REQUEST} element={<CreateBuyerRequestPage />} />
          <Route path={ROUTES.MY_BUYER_REQUESTS} element={<MyBuyerRequestsPage />} />
          <Route path={ROUTES.BUYER_REQUESTS} element={<BuyerRequestsPage />} />
          <Route path={ROUTES.BUYER_REQUEST_DETAILS} element={<BuyerRequestDetailPage />} />
          <Route path={ROUTES.MY_BIDS} element={<MyBidsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
