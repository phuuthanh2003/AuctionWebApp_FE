import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import "./Modal.css";
import { handleLogout } from "../../../utils/logout";
import {
  formatNumber,
  formatNumberAcceptNull,
} from "../../../utils/formatNumber";
import { numberToVietnameseText } from "../../../utils/numberToVietnameseText";
import { Image } from "../../../models/Image";
import { Jewelry } from "../../../models/Jewelry";
import {
  bidByUser,
  confirmDeleteBid,
  getAuctionHistoriesByAuctionId,
  getAuctionHistoriesByAuctionIdAndUserId,
} from "../../../api/AuctionHistoryAPI";
import { Auction } from "../../../models/Auction";
import { formatDateStringAcceptNull } from "../../../utils/formatDateString";
import { User } from "../../../models/User";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { AuctionHistory } from "../../../models/AuctionHistory";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import {
  isPhoneNumberWrongFormat,
  isYearOfBirthWrongFormat,
} from "../../../utils/checkRegister";
import { RequestApproval } from "../../../models/RequestApproval";
import changeStateRequest, {
  confirmRequest,
} from "../../../api/RequestApprovalAPI";
import { changePassword } from "../../../api/AuthenticationAPI";
import {
  getIconImageByJewelryId,
  getImagesByJewelryId,
} from "../../../api/ImageApi";
import Stomp from "stompjs";

import { Transaction } from "../../../models/Transaction";
import { PaginationControl } from "react-bootstrap-pagination-control";



import { handlePay } from "../../../api/PaymentAPI";
import { setMethodTransaction } from "../../../api/TransactionAPI";
import { useTranslation } from "react-i18next";
import { StateAuctionView } from "../../AuctionList/Components/StateAuctionView";
import { t } from "i18next";
import { TypeTransaction } from "../Components/member/TypeTransaction";

import { PaymentMethod } from "../Components/member/PaymentMethod";
import { StateTransaction } from "../Components/member/StateTransaction";

// *** MODAL FOR USER ***
// Interface
interface SaveEditProfileModalProps {
  user: User | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleEdit: (isConfirm: boolean) => void;
}

interface BidConfirmDeleteProps {
  stompClient: Stomp.Client | null;
  connected: boolean;
  bidCode: string;
  user: User | null;
  auction: Auction | undefined;
}

interface ChangePasswordConfirmProps {
  request: {
    token: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setRequest: (request: {
    token: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
}

interface ViewTransactionModalProps {
  transaction: Transaction;
}

interface TransactionModalProps {
  transaction: Transaction;
  getTransactionList: () => Promise<void>;
}

interface CreateTransactionWinnerModalProps {
  transaction: Transaction;
  show: boolean;
  handleClose: () => void;
  auction: Auction | undefined | null;
  winner: User | undefined;
}

interface ConfirmPayAtCounterTransactionModalProps {
  transaction: Transaction;
  show: boolean;
  handleClose: () => void;
  auction: Auction | undefined | null;
  winner: User | undefined;
  getTransactionList: () => Promise<void>;
}

interface MyRequestProps {
  request: RequestApproval;
}

interface RefuseJewelryModalProps {
  jewelry: Jewelry | undefined;
  request: RequestApproval;
  handleChangeList: () => Promise<void>;
  user: User | null;
}

interface JewelryModalProps {
  jewelry: Jewelry | undefined;
  images: Image[];
  user: User | null;
  request: RequestApproval;
  handleChangeList: () => Promise<void>;
}
// Modal
export const ViewTransactionModal: React.FC<ViewTransactionModalProps> = ({
  transaction,
}) => {
  const payer = transaction.user;
  const method = transaction.paymentMethod;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { t } = useTranslation(["Modal"]);

  return (
    <>
      <Button variant="dark" size="sm" onClick={handleShow}>
        {t("Modal.Xem")}
      </Button>
      {show && (
        <div className="overlay">
          <Modal
            show={show}
            onHide={handleClose}
            centered
            backdropClassName="custom-backdrop"
            size="lg"
          >
            <Modal.Header>
              <Modal.Title className="w-100">
                <div className="col-12 text-center">
                  {t("Modal.Thông tin chi tiết giao dịch")}
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-5">
              <form action="">
                <div className="checkbox-form">
                  <div className="fw-medium row">
                    <h4 className=" fw-medium text-decoration-underline">
                      {t("Modal.Tài khoản giao dịch")}
                    </h4>
                    <div className="checkout-form-list my-4 col-md-6">
                      <div className="checkout-form-list mb-2">
                        <label>{t("Modal.Mã người dùng")}: </label>
                        <span className="fw-bold"> {payer?.id}</span>
                      </div>
                      <div className="checkout-form-list mb-2 ">
                        <label>{t("Modal.Tên người dùng")}</label>
                        <span className="fw-bold">
                          {" "}
                          {payer?.firstName} {payer?.lastName}
                        </span>
                      </div>
                      <div className="checkout-form-list mb-2 ">
                        <label>{t("Modal.Số CCCD")}</label>
                        <span className="fw-bold"> {payer?.cccd}</span>
                      </div>
                      <div className="checkout-form-list mb-2">
                        <label>{t("Modal.Địa chỉ")}</label>
                        <span className="fw-semibold">
                          {" "}
                          {payer?.address}, {payer?.city}, {payer?.district}{" "}
                        </span>
                      </div>
                      <div className="checkout-form-list mb-2">
                        <label>Email: </label>
                        <span className="fw-semibold"> {payer?.email}</span>
                      </div>
                    </div>
                    <div className="checkout-form-list ms-2 mb-2 col-md-6 border p-2 row">
                      <div className="checkout-form-list mb-0 col-md-6">
                        <img src={payer?.bank?.logo} alt="bank" />
                      </div>
                      <div className="checkout-form-list mb-2 col-md-12">
                        <label>{t("Modal.Thẻ ngân hàng")}</label>
                        <span className="fw-bold text-uppercase">
                          {" "}
                          {payer?.bank?.bankName}
                        </span>
                      </div>
                      <div className="checkout-form-list mb-2 col-md-12 ">
                        <label>{t("Modal.Mã số thẻ")}</label>
                        <span className="fw-bold text-success">
                          {" "}
                          {payer?.bankAccountName} - {payer?.bankAccountNumber}
                        </span>
                      </div>
                    </div>
                    <div className="checkout-form-list my-4 col-md-12 p-2 row">
                      <h4 className=" fw-medium text-decoration-underline">
                        {t("Modal.Thông tin giao dịch")}
                      </h4>

                      <div className="checkout-form-list my-4 col-md-6">
                        <div className="checkout-form-list mb-2">
                          <label> {t("Modal.Loại giao dịch")} </label>
                          <span className="fw-bold">
                            {" "}
                            <TypeTransaction type={transaction.type} />
                          </span>
                        </div>
                        <div className="checkout-form-list mb-2">
                          <label>{t("Modal.Phiên đấu giá")}</label>
                          <span className="fw-bold">
                            {" "}
                            {transaction.auction?.id} -{" "}
                            {transaction.auction?.name}
                          </span>
                        </div>
                        <div className="checkout-form-list mb-2">
                          <label>{t("Modal.Thời gian khởi tạo")}</label>
                          <span className="fw-bold">
                            {" "}
                            {formatDateStringAcceptNull(transaction.createDate)}
                          </span>
                        </div>
                        <div className="checkout-form-list mb-2 ">
                          <label>{t("Modal.Thời gian thanh toán")}</label>
                          <span className="fw-bold">
                            {" "}
                            {formatDateStringAcceptNull(
                              transaction.paymentTime
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="checkout-form-list my-4 col-md-6">
                        <div className="checkout-form-list mb-2 ">
                          <label>{t("Modal.Phương thức thanh toán")}</label>
                          <span className="fw-bold">
                            {" "}
                            <PaymentMethod
                              method={
                                transaction.paymentMethod
                                  ? transaction.paymentMethod
                                  : ""
                              }
                            />
                          </span>
                        </div>
                        <div className="checkout-form-list mb-2 ">
                          <label>{t("Modal.Trạng thái thanh toán")}</label>
                          <span className="fw-bold">
                            {" "}
                            <StateTransaction state={transaction.state} />
                          </span>
                        </div>
                        {method === "PAY_AT_COUNTER" && (
                          <div className="checkout-form-list mb-2 ">
                            <label>{t("Modal.Địa điểm thanh toán")}</label>
                            <span className="fw-bold">
                              {" "}
                              {t("Modal.DiaDiem")}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="checkout-form-list mb-2 col-md-12">
                        <label>{t("Modal.Tổng số tiền")} </label>
                        <span className="fw-bold text-uppercase fs-4 text-success">
                          {" "}
                          {formatNumberAcceptNull(transaction.totalPrice)} VND
                        </span>
                      </div>
                      <div className="mt-3">
                        <span style={{ fontSize: "12px" }}>
                          (*){t("Modal.DiaDiem")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="dark" onClick={handleClose}>
                {t("Modal.Đóng")}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  getTransactionList,
}) => {
  const payer = transaction.user;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const [show, setShow] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayCounterModal, setPayCounterModal] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleShowCreateModal = () => {
    setShow(false);
    setShowCreateModal(true);
  };
  const handleShowPayCounterModal = () => {
    setShow(false);
    setPayCounterModal(true);
  };
  const handleCloseCreateModal = () => setShowCreateModal(false);
  const handleClosePayCounterModal = () => setPayCounterModal(false);

  return (
    <>
      <Button variant="warning" size="sm" onClick={handleShow}>
        Thanh toán
      </Button>
      {show && (
        <div className="overlay">
          <Modal
            show={show}
            onHide={handleClose}
            centered
            backdropClassName="custom-backdrop"
            size="sm"
          >
            <Modal.Header>
              <Modal.Title className="w-100">
                <div className="col-12 text-center fw-semibold text-warning">
                  Chọn phương thức thanh toán
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <form action="">
                <div
                  className="row"
                  style={{
                    border: "1px solid #000",
                    borderRadius: "10px",
                    cursor: "pointer",
                    marginBottom: "10px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor:
                      hoverIndex === 0 ? "#f0f0f0" : "transparent",
                  }}
                  onMouseEnter={() => setHoverIndex(0)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={handleShowPayCounterModal}
                >
                  <div
                    className="col-md-4"
                    style={{ flex: "0 0 33.333333%", maxWidth: "33.333333%" }}
                  >
                    <img src="/assets/images/icon/pay_at_counter.png" alt="" />
                  </div>
                  <div
                    className="col-md-8"
                    style={{ flex: "0 0 66.666667%", maxWidth: "66.666667%" }}
                  >
                    <h5 className="fw-semibold mb-0 text-center">Tại quầy</h5>
                  </div>
                </div>
                <div
                  className="row"
                  style={{
                    border: "1px solid #000",
                    borderRadius: "10px",
                    cursor: "pointer",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor:
                      hoverIndex === 1 ? "#f0f0f0" : "transparent",
                  }}
                  onMouseEnter={() => setHoverIndex(1)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={handleShowCreateModal}
                >
                  <div
                    className="col-md-4"
                    style={{ flex: "0 0 33.333333%", maxWidth: "33.333333%" }}
                  >
                    <img src="/assets/images/icon/banking.png" alt="" />
                  </div>
                  <div
                    className="col-md-8"
                    style={{ flex: "0 0 66.666667%", maxWidth: "66.666667%" }}
                  >
                    <h5 className="fw-semibold mb-0 text-center">
                      Chuyển khoản
                    </h5>
                  </div>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="dark" onClick={handleClose}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
      <CreateTransactionWinnerModal
        transaction={transaction}
        show={showCreateModal}
        handleClose={handleCloseCreateModal}
        auction={transaction.auction}
        winner={payer}
      />
      <ConfirmPayAtCounterTransactionModal
        transaction={transaction}
        show={showPayCounterModal}
        handleClose={handleClosePayCounterModal}
        auction={transaction.auction}
        winner={payer}
        getTransactionList={getTransactionList}
      />
    </>
  );
};

export const CreateTransactionWinnerModal: React.FC<
  CreateTransactionWinnerModalProps
> = ({ transaction, show, handleClose, auction, winner }) => {
  const handlePayment = () => {
    if (winner) {
      if (auction && winner)
        handlePay(
          transaction.totalPrice,
          auction?.id,
          winner?.username ? winner.username : "",
          transaction.id
        );
    }
  };
  return (
    <>
      {show && (
        <div className="overlay">
          <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            size="lg"
          >
            <Modal.Header>
              <Modal.Title className="w-100">
                <div className="col-12 text-center">Hóa đơn điện tử</div>
                <div className="col-12 mb-3 text-center ">
                  <span className="text-warning fw-bold">{auction?.name}</span>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <form action="">
                <div className="checkbox-form">
                  <div className="row">
                    <div className="col-md-12 ">
                      <div className="col-md-12 fw-medium row">
                        <h4 className=" fw-medium">Tài khoản thanh toán</h4>
                        <div className="checkout-form-list my-3 col-md-6">
                          <div className="checkout-form-list mb-2">
                            <label>Mã người dùng: </label>
                            <span className="fw-bold"> {winner?.id}</span>
                          </div>
                          <div className="checkout-form-list mb-2 ">
                            <label>Tên người dùng:</label>
                            <span className="fw-bold"> {winner?.fullName}</span>
                          </div>
                          <div className="checkout-form-list mb-2 ">
                            <label>Số CCCD:</label>
                            <span className="fw-bold"> {winner?.cccd}</span>
                          </div>
                          <div className="checkout-form-list mb-2">
                            <label>Địa chỉ:</label>
                            <span className="fw-semibold">
                              {" "}
                              {winner?.address}, {winner?.city},{" "}
                              {winner?.district}{" "}
                            </span>
                          </div>
                          <div className="checkout-form-list mb-2">
                            <label>Email: </label>
                            <span className="fw-semibold">
                              {" "}
                              {winner?.email}
                            </span>
                          </div>
                        </div>
                        <div className="checkout-form-list mb-2 col-md-6 border p-2 row">
                          <div className="checkout-form-list mb-0 col-md-6">
                            <img src={winner?.bank?.logo} alt="bank" />
                          </div>
                          <div className="checkout-form-list mb-2 col-md-12">
                            <label>Thẻ ngân hàng: </label>
                            <span className="fw-bold text-uppercase">
                              {" "}
                              {winner?.bank?.bankName}
                            </span>
                          </div>
                          <div className="checkout-form-list mb-2 col-md-12 ">
                            <label>Mã số thẻ:</label>
                            <span className="fw-bold text-success">
                              {" "}
                              {winner?.bankAccountName} -{" "}
                              {winner?.bankAccountNumber}
                            </span>
                          </div>
                        </div>
                        <div className="checkout-form-list mb-2 col-md-12 p-2 row">
                          <div className="checkout-form-list mb-2 col-md-12">
                            <label>Số tiền cần trả: </label>
                            <span className="fw-bold text-uppercase fs-4 text-success">
                              {" "}
                              {formatNumberAcceptNull(
                                transaction.totalPrice
                              )}{" "}
                              VND
                            </span>
                          </div>
                          <div className="mt-3">
                            <span style={{ fontSize: "12px" }}>
                              (*)Mọi thắc mắc xin liên hệ hotline (+84)
                              0123456789 để được hỗ trợ.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="dark" onClick={handleClose}>
                Đóng
              </Button>
              <Button variant="warning" onClick={handlePayment}>
                Thanh toán
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

export const ConfirmPayAtCounterTransactionModal: React.FC<
  ConfirmPayAtCounterTransactionModalProps
> = ({
  transaction,
  show,
  handleClose,
  auction,
  winner,
  getTransactionList,
}) => {
  const method = "PAY_AT_COUNTER";

  const handleConfirmPayCounter = async () => {
    const changeMethod = await setMethodTransaction(transaction.id, method);
    if (changeMethod) {
      toast.success("Thanh toán tại quầy được xác nhận");
      getTransactionList();
      handleClose();
    }
  };
  return (
    <>
      {show && (
        <div className="overlay">
          <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            size="lg"
          >
            <Modal.Header>
              <Modal.Title className="w-100">
                <div className="col-12 text-center">
                  Xác nhận thanh toán tại quầy
                </div>
                <div className="col-12 mb-3 text-center ">
                  <span className="text-warning fw-bold">{auction?.name}</span>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <form action="">
                <div className="checkbox-form">
                  <div className="row">
                    <div className="col-md-12 ">
                      <div className="col-md-12 fw-medium row">
                        <h4 className=" fw-medium">Tài khoản thanh toán</h4>
                        <div className="checkout-form-list my-3 col-md-6">
                          <div className="checkout-form-list mb-2">
                            <label>Mã người dùng: </label>
                            <span className="fw-bold"> {winner?.id}</span>
                          </div>
                          <div className="checkout-form-list mb-2 ">
                            <label>Tên người dùng:</label>
                            <span className="fw-bold"> {winner?.fullName}</span>
                          </div>
                          <div className="checkout-form-list mb-2 ">
                            <label>Số CCCD:</label>
                            <span className="fw-bold"> {winner?.cccd}</span>
                          </div>
                          <div className="checkout-form-list mb-2">
                            <label>Địa chỉ:</label>
                            <span className="fw-semibold">
                              {" "}
                              {winner?.address}, {winner?.city},{" "}
                              {winner?.district}{" "}
                            </span>
                          </div>
                          <div className="checkout-form-list mb-2">
                            <label>Email: </label>
                            <span className="fw-semibold">
                              {" "}
                              {winner?.email}
                            </span>
                          </div>
                          <div className="checkout-form-list my-4 col-md-12">
                            <label>Số tiền cần trả: </label>
                            <span className="fw-bold text-uppercase fs-4 text-success">
                              {" "}
                              {formatNumberAcceptNull(
                                transaction.totalPrice
                              )}{" "}
                              VND
                            </span>
                          </div>
                          <div className="checkout-form-list mb-2 ">
                            <span style={{ fontSize: "12px" }}>
                              (*)Mọi thắc mắc xin liên hệ hotline (+84)
                              0123456789 để được hỗ trợ.
                            </span>
                          </div>
                        </div>
                        <div className="checkout-form-list my-4 col-md-6">
                          <div className="checkout-form-list mb-2 ">
                            <label>Phương thức thanh toán: </label>
                            <span className="fw-bold">
                              {" "}
                              <PaymentMethod method={method} />
                            </span>
                          </div>
                          <div className="checkout-form-list mb-2 ">
                            <label>Trạng thái thanh toán: </label>
                            <span className="fw-bold">
                              {" "}
                              <StateTransaction state={transaction.state} />
                            </span>
                          </div>

                          {method === "PAY_AT_COUNTER" && (
                            <div className="checkout-form-list mb-2 ">
                              <label>Địa điểm thanh toán: </label>
                              <span className="fw-bold">
                                {" "}
                                Nhà Văn hóa Sinh viên TP.HCM, Lưu Hữu Phước,
                                Đông Hoà, Dĩ An, Bình Dương, Việt Nam
                              </span>
                              <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1003405.79257722!2d105.55479573124998!3d10.768824599999986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a6b19d6763%3A0x143c54525028b2e!2zTmjDoCBWxINuIGjDs2EgU2luaCB2acOqbiBUUC5IQ00!5e0!3m2!1svi!2s!4v1718718338321!5m2!1svi!2s"
                                referrerPolicy="no-referrer-when-downgrade"
                                style={{
                                  border: "0",
                                  width: "100%",
                                  height: "100%",
                                  marginTop: "20px",
                                }}
                                title={"Nhà Văn hóa Sinh viên TP.HCM"}
                                allowFullScreen={true}
                                loading="lazy"
                              ></iframe>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="dark" onClick={handleClose}>
                Đóng
              </Button>
              <Button variant="warning" onClick={handleConfirmPayCounter}>
                Xác nhận
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

export const ConfirmModal: React.FC<JewelryModalProps> = ({
  jewelry,
  images,
  user,
  request,
  handleChangeList,
}) => {
  const [show, setShow] = useState(false);

  const handleCloseJewelryDetail = () => {
    handleChangeList();
    setShow(false);
  };
  const handleShowJewelryDetail = () => setShow(true);

  const handleConfirm = async () => {
    const confirm = await confirmRequest(request.id, user?.id);
    if (confirm) {
      console.log("confirm thành công");
    }

    handleCloseJewelryDetail();
  };

  return (
    <>
      <Button variant="success" size="sm" onClick={handleShowJewelryDetail}>
        Đồng ý
      </Button>
      {show && (
        <div className="overlay">
          <Modal
            show={show}
            onHide={handleCloseJewelryDetail}
            centered
            backdrop="static"
            size="lg"
            className="p-4"
          >
            <Modal.Header>
              <Modal.Title className="w-100">
                <div className="col-12 text-center">Xác nhận tài sản</div>
                <div className="col-12 mb-3 text-center ">
                  <span className="text-success fw-bold">{jewelry?.name}</span>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <h6 className="lh-base">
                Cảm ơn bạn đã phản hồi! Tài sản{" "}
                <span className="text-success fw-semibold">
                  {jewelry?.name}
                </span>{" "}
                của bạn sẽ sớm được đăng ký cho phiên đấu giá phù hợp.
              </h6>
              <h6 className="lh-base">
                Chúng tôi mong muốn bạn gửi tài sản đến địa điểm của chúng tôi
                để tiến hành thẩm định và đăng ký đấu giá. Thông tin chi tiết
                như sau:
              </h6>
              <div className="checkout-form-list mb-2">
                <label className="fw-bold">Địa điểm gửi tài sản:</label>
                <p className="fw-bold">
                  Nhà Văn hóa Sinh viên TP.HCM, Lưu Hữu Phước, Đông Hoà, Dĩ An,
                  Bình Dương, Việt Nam
                </p>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1003405.79257722!2d105.55479573124998!3d10.768824599999986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a6b19d6763%3A0x143c54525028b2e!2zTmjDoCBWxINuIGjDs2EgU2luaCB2acOqbiBUUC5IQ00!5e0!3m2!1svi!2s!4v1718718338321!5m2!1svi!2s"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{
                    border: "0",
                    width: "100%",
                    height: "300px",
                    marginTop: "20px",
                  }}
                  title={"Nhà Văn hóa Sinh viên TP.HCM"}
                  allowFullScreen={true}
                  loading="lazy"
                ></iframe>
              </div>
              <div className="checkout-form-list mb-2 ">
                <span style={{ fontSize: "12px" }}>
                  (*)Mọi thắc mắc xin liên hệ hotline (+84) 0123456789 để được
                  hỗ trợ.
                </span>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="dark" onClick={handleCloseJewelryDetail}>
                Đóng
              </Button>
              <Button variant="success" onClick={handleConfirm}>
                Đồng ý
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

export const RefuseJewelryRequestModal: React.FC<RefuseJewelryModalProps> = ({
  jewelry,
  request,
  user,
  handleChangeList,
}) => {
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => setShow(true);
  const handleDelete = async () => {
    try {
      if (user) {
        const resultDelete = await changeStateRequest(
          request.id,
          user?.id,
          "HIDDEN"
        );
        if (resultDelete) {
          await handleChangeList();
          handleClose();
          toast.success("Xóa thành công.");
        } else {
          console.log("Xóa thất bại");
        }
      }
    } catch (error) {
      console.log("Xóa thất bại");
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn ms-2 btn-sm btn-danger "
        id="save-profile-tab"
        role="tab"
        aria-controls="account-details"
        aria-selected="false"
        onClick={handleShow}
      >
        Từ chối
      </button>
      {show && (
        <div className="overlay">
          <Modal
            show={show}
            onHide={handleClose}
            centered
            backdropClassName="custom-backdrop"
          >
            <Modal.Header>
              <Modal.Title>Xác nhận {jewelry?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Bạn có chắc muốn từ chối mức giá do chúng tôi đưa ra cho sản phẩm
              này không?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="dark" onClick={handleClose}>
                Hủy
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Xác nhận
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

export const ViewJewelryRequestModal: React.FC<MyRequestProps> = ({
  request,
}) => {
  const [show, setShow] = useState(false);
  const [image, setImage] = useState<Image | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  useEffect(() => {
    getIconImageByJewelryId(request.jewelry?.id ? request.jewelry?.id : 1)
      .then((response) => {
        setImage(response);
      })
      .catch((error) => {
        console.error(error.message);
      });

    getImagesByJewelryId(request.jewelry?.id ? request.jewelry?.id : 1)
      .then((response) => {
        setImages(response);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, [request]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="dark" size="sm" onClick={handleShow}>
        Xem
      </Button>
      {show && (
        <div className="overlay">
          <Modal
            show={show}
            onHide={handleClose}
            centered
            backdropClassName="custom-backdrop"
          >
            <Modal.Header>
              <Modal.Title className="w-100">
                <div className="col-12 text-center">Thông tin tài sản</div>
                <div className="col-12 mb-3 text-center ">
                  <span className="text-warning fw-bold">
                    {request.jewelry?.name}
                  </span>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form action="">
                <div className="checkbox-form">
                  <div className="row">
                    <div className="col-md-12 ">
                      <div className="country-select clearfix"></div>
                    </div>
                    <div className="col-md-12 fw-medium">
                      <div className="checkout-form-list mb-2">
                        <label>Mã tài sản: </label>
                        <span className="fw-bold"> {request.jewelry?.id}</span>
                      </div>
                      <div className="checkout-form-list mb-2">
                        <label>Tên:</label>
                        <span className="fw-bold">
                          {" "}
                          {request.jewelry?.name}
                        </span>
                      </div>
                      <div className="checkout-form-list mb-2 row">
                        <div className="col-md-6">
                          <label>Danh mục:</label>
                          <span className="fw-bold">
                            {" "}
                            {request.jewelry?.category?.name}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <label>Thương hiệu:</label>
                          <span className="fw-bold">
                            {" "}
                            {request.jewelry?.brand}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <label>Chất liệu:</label>
                          <span className="fw-bold">
                            {" "}
                            {request.jewelry?.material}
                          </span>
                        </div>
                        <div className="col-md-6">
                          <label>Trọng lượng (g):</label>
                          <span className="fw-bold">
                            {" "}
                            {request.jewelry?.weight}
                          </span>
                        </div>
                      </div>
                      <div className="checkout-form-list checkout-form-list-2 mb-2">
                        <label>Mô tả </label>
                        <br />
                        <textarea
                          readOnly
                          className="w-100 h-auto p-1"
                          id="checkout-mess"
                          value={request.jewelry?.description}
                        ></textarea>
                      </div>
                      <div className="w-100 fw-medium">
                        <div className="checkout-form-list row">
                          <label>Hình ảnh</label>
                          {React.Children.toArray(
                            images.map((img: Image) => (
                              <div className="col-md-3">
                                <img src={img.data} alt="Ảnh sản phẩm" />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="checkout-form-list">
                        <label className="text-danger fw-bold">
                          Giá đề xuất
                        </label>
                        <input
                          className=" fw-bold"
                          placeholder=""
                          type="text"
                          value={formatNumber(request?.desiredPrice)}
                          readOnly={true}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="checkout-form-list">
                        <label className="fw-bold">Trạng thái</label>
                        {request.state === "HIDDEN" ? (
                          <input
                            className=" fw-bold text-danger"
                            placeholder=""
                            type="text"
                            value="Đã bị hủy"
                            readOnly={true}
                          />
                        ) : (
                          <input
                            className=" fw-bold text-success"
                            placeholder=""
                            type="text"
                            value={`${
                              request.isConfirm
                                ? "Đã phê duyệt"
                                : "Chưa phê duyệt"
                            }`}
                            readOnly={true}
                          />
                        )}
                      </div>
                    </div>
                    {request.state === "HIDDEN" && (
                      <>
                        <div className="col-md-6">
                          <div className="checkout-form-list">
                            <label className="fw-bold">*Lý do: </label>
                            <p className="fw-semibold">{request.note}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="dark" onClick={handleClose}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

// Modal view AUCTION HISTORY
interface ViewBidHistoryModalProps {
  auctionId: number | undefined;
  userId: number | undefined;
  auctionHistoryState: string;
}

export const ViewBidHistoryModal: React.FC<ViewBidHistoryModalProps> = ({
  auctionId,
  userId,
  auctionHistoryState,
}) => {
  const [auctionHistories, setAuctionHistories] = useState<AuctionHistory[]>(
    []
  );
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (userId) {
      getAuctionHistoriesByAuctionIdAndUserId(
        auctionId,
        userId,
        auctionHistoryState,
        page
      )
        .then((response) => {
          setAuctionHistories(response.auctionHistoriesData);
          setTotalElements(response.totalElements);
        })
        .catch(() => {});
    }
    setLoading(false);
  }, [page, auctionHistoryState, auctionId, userId]);

  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => setShow(true);

  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-dark ms-2 "
        id="save-profile-tab"
        role="tab"
        aria-controls="account-details"
        aria-selected="false"
        onClick={handleShow}
      >
        Lịch sử đặt giá
      </button>
      {show && (
        <div className="overlay">
          <Modal
            show={show}
            onHide={handleClose}
            centered
            backdropClassName="custom-backdrop"
            size="xl"
          >
            <Modal.Header className="text-center w-100">
              <Modal.Title className="w-100">
                <div className="col-12 text-center">
                  Lịch sử đặt giá phiên đấu
                </div>
                <div className="col-12 mb-3 text-center ">
                  <span className="text-danger fw-bold">
                    Phiên số {auctionId}
                  </span>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="myaccount-orders">
                <div className="table-responsive mt-2">
                  <table className="table table-bordered table-hover">
                    <tbody>
                      <tr>
                        <th>Mã số</th>
                        <th>Mã trả giá</th>
                        <th>Giá đã đặt (VNĐ)</th>
                        <th>Thời gian </th>
                      </tr>
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="text-center">
                            <Spinner animation="border" />
                          </td>
                        </tr>
                      ) : auctionHistories.length > 0 ? (
                        React.Children.toArray(
                          auctionHistories.map((auctionHistory) => (
                            <tr>
                              <td className="fw-semibold">
                                {auctionHistory.id}
                              </td>
                              <td className="fw-semibold text-danger">
                                {auctionHistory.bidCode}
                              </td>
                              <td>{formatNumber(auctionHistory.priceGiven)}</td>
                              <td>
                                {formatDateStringAcceptNull(
                                  auctionHistory.time
                                )}
                              </td>
                            </tr>
                          ))
                        )
                      ) : (
                        <td colSpan={4} className="text-center">
                          <h5 className="fw-semibold lh-base mt-2">
                            Chưa có đặt giá nào cho phiên này
                          </h5>
                        </td>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4">
                <PaginationControl
                  page={page}
                  between={3}
                  total={totalElements}
                  limit={5}
                  changePage={(page) => {
                    setPage(page);
                  }}
                  ellipsis={1}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="dark" onClick={handleClose}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

interface BidConfirmProps {
  bidValue: number;
  setDisplayValue: (value: string) => void;
  setAuction: (auction: Auction) => void;
  username: string | undefined;
  auction: Auction | null;
  setAuctionHistories: (auctionHistories: AuctionHistory[]) => void;
  stompClient: Stomp.Client | null;
  connected: boolean;
}

export const BidConfirm: React.FC<BidConfirmProps> = ({
  stompClient,
  connected,
  setAuctionHistories,
  bidValue,
  username,
  auction,
  setDisplayValue,
  setAuction,
}) => {
  return (
    <>
      <button
        className="fw-bold text-center eg-btn btn--primary text-white btn--sm"
        style={{
          backgroundColor: "#B41712",
          textTransform: "unset",
          border: "unset",
          borderRadius: "5px",
          padding: "10px 10px",
          fontSize: "16px",
        }}
        onClick={() =>
          Swal.fire({
            icon: "question",
            html: `
            <div>Trả giá trang sức với: ${formatNumber(bidValue)} VNĐ.</div>
            <div>Giá của bạn: <span class="fw-bold text-danger">${numberToVietnameseText(
              bidValue
            )}.</span></div>`,
            showCancelButton: true,
            cancelButtonText: "Hủy",
            confirmButtonText: "Xác nhận",
            showLoaderOnConfirm: true,
            preConfirm: () => {
              if (username !== undefined && auction && bidValue) {
                bidByUser(username, auction?.id, bidValue)
                  .then((response) => {
                    if (response === true) {
                      getAuctionHistoriesByAuctionId(auction.id, 3).then(
                        (updatedHistories) => {
                          setAuctionHistories(
                            updatedHistories.auctionHistoriesData
                          );
                        }
                      );

                      if (stompClient && connected) {
                        stompClient.send(
                          "/app/update-auction",
                          {},
                          JSON.stringify(auction.id)
                        );
                      } else {
                        console.error("WebSocket client is not connected.");
                      }
                      setDisplayValue(formatNumber(bidValue || 0));
                      setAuction({ ...auction, lastPrice: bidValue });
                      toast.success("Trả giá thành công!");
                    } else {
                      toast.error(
                        "Trả giá không thành thành công, vui lòng thực hiện lại!"
                      );
                    }
                  })
                  .catch((error) => {
                    console.log(error.message);
                  });
              }
            },
            allowOutsideClick: () => !Swal.isLoading(),
          })
        }
      >
        <i className="fa fa-gavel" style={{ marginRight: "7px" }}></i>Trả giá
      </button>
    </>
  );
};
// MODAL FOR ALL ACCOUNT
export const LogoutModal = () => {
  return (
    <>
      <div
        style={{ cursor: "pointer" }}
        role="tab"
        aria-controls="account-details"
        aria-selected="false"
        // onClick={handleShow}
        onClick={() =>
          Swal.fire({
            icon: "warning",
            html: `
            <h4>Xác nhận đăng xuất.</h4>
            <div>Bạn có chắc muốn đăng xuất khỏi tài khoản ngay bây giờ?</span></div>`,
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
            showLoaderOnConfirm: true,
            preConfirm: () => {
              handleLogout();
            },
            allowOutsideClick: () => !Swal.isLoading(),
          })
        }
      >
        {" "}
        ĐĂNG XUẤT
      </div>
    </>
  );
};

export const SaveEditProfileModal: React.FC<SaveEditProfileModalProps> = ({
  user,
  isEditing,
  setIsEditing,
  handleEdit,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    handleEdit(false);
    changeState();
    setShowModal(false);
  };
  const handleShow = () => setShowModal(true);

  const changeState = () => {
    setIsEditing(!isEditing);

    const inputs = document.querySelectorAll('input[type="text"]');
    const selects = document.querySelectorAll("select");

    inputs.forEach((input) => {
      if (!isEditing) {
        input.removeAttribute("readOnly");
        input.classList.remove("input-required");
      } else {
        input.setAttribute("readOnly", "");
        input.classList.add("input-required");
      }
    });

    selects.forEach((select) => {
      if (!isEditing) {
        select.removeAttribute("disabled");
        select.classList.remove("input-required");
      } else {
        select.setAttribute("disabled", "");
        select.classList.add("input-required");
      }
    });
  };

  const handleSave = () => {
    const isPhoneNumberValid = !isPhoneNumberWrongFormat(user?.phone ?? "");
    const isYearOfBirthValid = !isYearOfBirthWrongFormat(user?.yob ?? "");

    const errorMessages = [
      {
        isValid: isYearOfBirthValid,
        message: "Vui lòng chọn đúng định dạng ngày sinh.",
      },
      {
        isValid: isPhoneNumberValid,
        message: "Vui lòng chọn đúng số điện thoại.",
      },
      { isValid: user?.district, message: "Vui lòng chọn quận/huyện." },
      { isValid: user?.ward, message: "Vui lòng chọn phường/xã." },
      {
        isValid: user?.bankAccountNumber,
        message: "Vui lòng nhập số tài khoản nhận hoàn tiền đặt trước.",
      },
      {
        isValid: user?.bankAccountName,
        message: "Vui lòng nhập tên chủ thẻ ngân hàng.",
      },
    ];
    for (const { isValid, message } of errorMessages) {
      if (!isValid) {
        toast.error(message);
        setShowModal(false);
        return;
      }
    }

    handleEdit(true);
    setShowModal(false);
    changeState();
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-xs btn-primary mb-3 mt-2"
        id="save-profile-tab"
        role="tab"
        aria-controls="account-details"
        aria-selected="false"
        onClick={!isEditing ? changeState : handleShow}
        style={{ backgroundColor: "black", border: "none" }}
      >
        {isEditing ? "Lưu" : "Chỉnh sửa"}
      </button>
      {showModal && (
        <div className="overlay">
          <Modal
            show={showModal}
            centered
            onHide={handleClose}
            backdropClassName="custom-backdrop"
          >
            <Modal.Header>
              <Modal.Title>Xác nhận lưu thay đổi</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Bạn có chắc muốn thông tin thay đổi tài khoản?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="dark" onClick={handleClose}>
                Hủy
              </Button>
              <Button variant="warning" onClick={handleSave}>
                Lưu
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export const BidConfirmDelete: React.FC<BidConfirmDeleteProps> = ({
  stompClient,
  connected,
  bidCode,
  user,
  auction,
}) => {
  const navigate = useNavigate();
  return (
    <>
      <button
        type="button"
        className="text-danger"
        id="save-profile-tab"
        role="tab"
        aria-controls="account-details"
        aria-selected="false"
        onClick={() =>
          Swal.fire({
            icon: "error",
            title: "Xác nhận rút lại giá đã trả?",
            input: "text",
            html: `
            <div>Nếu rút lại giá đã trả, bạn sẽ mất tiền đặt trước và bị truất quyền đấu giá! Vui lòng nhập mã xác nhận để tiếp tục.</div>
            <br/><div>Mã xác nhận: <span class="fw-bold text-danger">${bidCode}</span></div>`,
            inputPlaceholder: "Nhập mã xác nhận...",
            inputAttributes: {
              maxLength: 10,
              autocapitalize: "off",
            },
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
            showLoaderOnConfirm: true,
            preConfirm: async (inputValue: string) => {
              if (!inputValue || inputValue.trim() !== bidCode) {
                Swal.showValidationMessage("Mã xác nhận không đúng.");
                return;
              }
              if (user && auction) {
                await confirmDeleteBid(user?.id, auction?.id);
                if (stompClient && connected) {
                  stompClient.send(
                    "/app/update-auction",
                    {},
                    JSON.stringify(auction.id)
                  );
                } else {
                  console.error("WebSocket client is not connected.");
                }
                toast.success("Xóa thành công.");
                navigate("/tai-san-dau-gia/" + auction.id);
              }
            },
            allowOutsideClick: () => !Swal.isLoading(),
          })
        }
      >
        <i className="fa-solid fa-trash"></i>
      </button>
    </>
  );
};

export const ChangePasswordConfirm: React.FC<ChangePasswordConfirmProps> = ({
  request,
  setRequest,
}) => {
  const { t } = useTranslation(["Modal"]);
  const handleChangePassword = async () => {
    if (request.newPassword !== request.confirmPassword) {
      Swal.fire("Lỗi", "Mật khẩu xác nhận không trùng khớp", "error");
      return;
    }
    try {
      const response = await changePassword(request);
      if (response.status === 200) {
        Swal.fire(
          response.message,
          t("Modal.Mật khẩu đã được đổi."),
          "success"
        );
        setRequest({
          token: "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else if (response.status === 404) {
        Swal.fire(response.message, t("Modal.Đổi mật khẩu thất bại."), "error");
      }
    } catch (error) {
      Swal.fire(
        t("Modal.Lỗi"),
        t("Modal.Đã xảy ra lỗi khi đổi mật khẩu."),
        "error"
      );
    }
  };
  return (
    <>
      <button
        type="button"
        className="btn btn-xs btn-dark mt-4"
        id="save-profile-tab"
        role="tab"
        aria-controls="account-details"
        aria-selected="false"
        onClick={() =>
          Swal.fire({
            icon: "warning",
            title: t("Modal.Bạn có chắc muốn đổi mật khẩu?"),
            showCancelButton: true,
            confirmButtonText: t("Modal.Xác nhận"),
            cancelButtonText: t("Modal.Hủy"),
            showLoaderOnConfirm: true,
            preConfirm: handleChangePassword,
            allowOutsideClick: () => !Swal.isLoading(),
          })
        }
      >
        {t("Modal.Đổi mật khẩu")}
      </button>
    </>
  );
};
