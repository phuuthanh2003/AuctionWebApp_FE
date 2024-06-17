import { Route, Routes } from 'react-router-dom';
import RouterComAdmin from './router-admin';
import RouterComManager from './router-manager';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import Index from '../pages/Index/Index';
import ManageManager from '../pages/admin/manage-account/ManageManager';
import ManageStaff from '../pages/admin/manage-account/ManageStaff';
import ManageUser from '../pages/admin/manage-account/ManageMember';
import RequestWaitlist from '../pages/manager/ManageRequest/components/RequestWaitlist';
import AuctionsList from '../pages/manager/Auctions/AuctionsList';
import PassedJewelriesList from '../pages/manager/PassedJewelry/PassedJewelriesList';
import TransactionList from '../pages/manager/transaction/TransactionList';
import CreateAuction from '../pages/manager/Auctions/CreateAuction';
import ViewProducts from '../pages/manager/View/ViewProducts';

const RouterCom = () => {
  return (
    <>
      <Routes>
        {/* /ADMIN/ */}
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route element={<GuestRoute />}>
            <Route path="/admin" element={<Index />} />
            <Route path="/admin/account/manager" element={<ManageManager />} />
            <Route path="/admin/account/staff" element={<ManageStaff />} />
            <Route path="/admin/account/user" element={<ManageUser />} />
            {/* <Route path="/admin/chi-tiet-nguoi-dung/:id" element={<ViewUser />} /> */}
            {/* <Route path="/admin/view/ViewTransactionSeller" element={<ViewTransactionSeller />} />
            <Route path="/admin/view/ViewTransactionBuyer" element={<ViewTransactionBuyer />} />
            <Route path="/admin/view/ViewTransactionUser" element={<ViewTransactionUser />} />
            <Route path="/admin/view/ViewProfile" element={<ViewProfile />} /> */}
          </Route>
        </Route>
        {/* /MANAGER/ */}
        <Route element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route path="/manager" element={<Index />} />
          <Route path="/manager/yeu-cau-dau-gia" element={<RequestWaitlist />} />
          <Route path="/manager/cac-phien-dau-gia" element={<AuctionsList />} />
          <Route path="/manager/tai-san-dang-cho" element={<PassedJewelriesList />} />
          <Route path="/manager/giao-dich/nguoi-mua" element={<TransactionList />} />
          <Route path="/manager/giao-dich/nguoi-ban" element={<TransactionList />} />
          <Route path="/manager/giao-dich/hoan-tien" element={<TransactionList />} />
          <Route path="/manager/giao-dich/dang-ky-tham-gia" element={<TransactionList />} />
          <Route path="/manager/create-auction" element={<CreateAuction />} />
          <Route path="/manager/view/viewproducts" element={<ViewProducts />} />
          {/* <Route
            path="/manager/view/Viewauctionslist"
            element={<ViewAuctionsList />}
          /> */}
        </Route>
      </Routes>
    </>
  );
};

export default RouterCom;
