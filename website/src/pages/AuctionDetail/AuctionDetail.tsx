import { useEffect, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link, useLocation, useParams } from "react-router-dom";
import { Auction } from "../../models/Auction";
import { getAuction } from "../../api/AuctionAPI";
import { formatDateString } from "../../utils/formatDateString";
import { Jewelry } from "../../models/Jewelry";
import { User } from "../../models/User";
import { formatNumber } from "../../utils/formatNumber";
import ImageProduct from "./AuctionImageProduct";
import { AuctionRegistration } from "../../models/AuctionRegistration";
import { getAuctionRegistrationsByAuctionId } from "../../api/AuctionRegistrationAPI";
import useAccount from "../../hooks/useAccount";
import { AuctionTabDetail } from "./Components/AuctionTabDetail";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getAuctionHistoriesByAuctionId } from "../../api/AuctionHistoryAPI";
import { AuctionHistory } from "../../models/AuctionHistory";


export default function AuctionDetail() {
    const [auction, setAuction] = useState<Auction | null>(null);
    const [jewelry, setJewelry] = useState<Jewelry | null>(null);
    const [jewelryUser, setJewelryUser] = useState<User | null>(null);
    const [auctionRegistations, setAuctionRegistations] = useState<AuctionRegistration[]>([]);
    const [staff, setStaff] = useState<User | null>(null);
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | string>('');
    const { id } = useParams();
    const token = localStorage.getItem("access_token");
    const user = useAccount(token);
    let auctionId = 0;
    const location = useLocation();
    const [auctionHistories, setAuctionHistories] = useState<AuctionHistory[]>([]);
    const [bidPerPage, setBidPerPage] = useState<number>(3);

    useEffect(() => {
        if (auctionId !== null) {
            getAuctionHistoriesByAuctionId(auctionId, bidPerPage)
                .then((response) => {
                    setAuctionHistories(response.auctionHistoriesData);
                })
                .catch((error) => {
                    console.error(error.message);
                });
        }
    }, [auctionId, bidPerPage])

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const paymentStatus = searchParams.get('paymentStatus');

        if (paymentStatus === 'success') {
            toast.success("Đăng kí tham gia phiên thành công!");
        }
    }, [])

    try {
        auctionId = parseInt(id + "");
        if (Number.isNaN(auctionId)) {
            auctionId = 0;
        }
    } catch (error) {
        auctionId = 0;
        console.log("Error parsing auction id: " + error);
    }

    useEffect(() => {
        getAuctionRegistrationsByAuctionId(auctionId)
            .then((response) => {
                setAuctionRegistations(response.auctionRegistrationsData);
            })
            .catch((error) => {
                console.log(error.message);
            });
        getAuction(auctionId)
            .then((auction) => {
                setAuction(auction);
                setJewelry(auction?.jewelry ?? null);
                setJewelryUser(auction?.jewelry?.user ?? null);
                setStaff(auction?.user ?? null);
            })
            .catch((error) => {
                console.log(error.message);
            });
        window.scrollTo(0, 0);
    }, [auctionId]);

    useEffect(() => {
        if (auction && auction.startDate && auction.endDate) {
            const now = new Date().getTime();
            const startDate = new Date(formatDateString(auction.startDate)).getTime();
            const endDate = new Date(formatDateString(auction.endDate)).getTime();

            if (auction.state === 'ONGOING') {
                // Calculate countdown until end date
                const distanceToEnd = endDate - now;

                if (distanceToEnd < 0) {
                    setTimeLeft("Phiên đấu giá đã kết thúc");
                    return;
                }

                const daysToEnd = Math.floor(distanceToEnd / (1000 * 60 * 60 * 24));
                const hoursToEnd = Math.floor((distanceToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutesToEnd = Math.floor((distanceToEnd % (1000 * 60 * 60)) / (1000 * 60));
                const secondsToEnd = Math.floor((distanceToEnd % (1000 * 60)) / 1000);

                setTimeLeft({ days: daysToEnd, hours: hoursToEnd, minutes: minutesToEnd, seconds: secondsToEnd });
            } else if (auction.state === 'WAITING') {
                // Calculate countdown until start date
                const distanceToStart = startDate - now;

                if (distanceToStart < 0) {
                    setTimeLeft("Phiên đấu giá đang diễn ra");
                    return;
                }

                const daysToStart = Math.floor(distanceToStart / (1000 * 60 * 60 * 24));
                const hoursToStart = Math.floor((distanceToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutesToStart = Math.floor((distanceToStart % (1000 * 60 * 60)) / (1000 * 60));
                const secondsToStart = Math.floor((distanceToStart % (1000 * 60)) / 1000);

                setTimeLeft({ days: daysToStart, hours: hoursToStart, minutes: minutesToStart, seconds: secondsToStart });
            } else if (auction.state === 'FINISHED') {
                // Auction finished
                setTimeLeft("Phiên đấu giá đã kết thúc");
                return;
            }

            const timer = setInterval(() => {
                const now = new Date().getTime();

                if (auction.state === 'ONGOING') {
                    const distanceToEnd = endDate - now;

                    if (distanceToEnd < 0) {
                        setTimeLeft("Phiên đấu giá đã kết thúc");
                        clearInterval(timer);
                        return;
                    }

                    const daysToEnd = Math.floor(distanceToEnd / (1000 * 60 * 60 * 24));
                    const hoursToEnd = Math.floor((distanceToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutesToEnd = Math.floor((distanceToEnd % (1000 * 60 * 60)) / (1000 * 60));
                    const secondsToEnd = Math.floor((distanceToEnd % (1000 * 60)) / 1000);

                    setTimeLeft({ days: daysToEnd, hours: hoursToEnd, minutes: minutesToEnd, seconds: secondsToEnd });
                } else if (auction.state === 'WAITING') {
                    const distanceToStart = startDate - now;

                    if (distanceToStart < 0) {
                        setTimeLeft("Phiên đấu giá đang diễn ra");
                        clearInterval(timer);
                        return;
                    }

                    const daysToStart = Math.floor(distanceToStart / (1000 * 60 * 60 * 24));
                    const hoursToStart = Math.floor((distanceToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutesToStart = Math.floor((distanceToStart % (1000 * 60 * 60)) / (1000 * 60));
                    const secondsToStart = Math.floor((distanceToStart % (1000 * 60)) / 1000);

                    setTimeLeft({ days: daysToStart, hours: hoursToStart, minutes: minutesToStart, seconds: secondsToStart });
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [auction]);

    const checkAlreadyRegistered = () => {
        if (auctionRegistations && auctionRegistations.length > 0) {
            return auctionRegistations.some(registration => registration.user?.id === user?.id);
        }
        return false;
    }


    return (
        <>
            <div className="template-color-1">
                <div className="main-wrapper">
                    {/* <!-- Begin Umino's Breadcrumb Area --> */}
                    <div className="breadcrumb-area">
                        <div className="container">
                            <div className="breadcrumb-content">
                                <ul>
                                    <li>
                                        <a href="index.html">Home</a>
                                    </li>
                                    <li className="active">
                                        Trang sức đấu giá
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* <!-- Umino's Breadcrumb Area End Here -->

                    <!-- Begin Umino's Single Product Sale Area --> */}
                    <div className="sp-area">
                        <div className="container">
                            <div className="sp-nav">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="sp-img_area">
                                            {jewelry && <ImageProduct jewelry={jewelry} />}
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        {auction?.state === 'WAITING' &&
                                            <p className="para" id="countdown-txt">Thời gian đếm ngược bắt đầu trả giá:</p>
                                        }
                                        {auction?.state === 'ONGOING' &&
                                            <p className="para" id="countdown-txt">Thời gian đếm ngược kết thúc trả giá:</p>
                                        }
                                        <div className="umino-countdown_area mb-4">
                                            {typeof timeLeft === 'string' ? (
                                                <div className="umino-countdown" style={{ padding: "10px 0px" }}>{timeLeft}</div>
                                            ) : (
                                                <div className="umino-countdown">
                                                    <div className="countdown-item">
                                                        <div>{timeLeft.days}</div>
                                                        <div className="countdown-label">Ngày</div>
                                                    </div>
                                                    <div className="countdown-item">
                                                        <div>{timeLeft.hours}</div>
                                                        <div className="countdown-label">Giờ</div>
                                                    </div>
                                                    <div className="countdown-item">
                                                        <div>{timeLeft.minutes}</div>
                                                        <div className="countdown-label">Phút</div>
                                                    </div>
                                                    <div className="countdown-item">
                                                        <div>{timeLeft.seconds}</div>
                                                        <div className="countdown-label">Giây</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        < div className="register-form">
                                            <div className="row">
                                                <div className="col-6">
                                                    <p className="left-title-text no-margin">Mã trang sức:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="right-info-text no-margin fw-bold" style={{ color: "#b41712" }}>{jewelry?.id}</p>
                                                </div>
                                                <div className="col-6">

                                                    <p className="left-title-text no-margin">Giá khởi điểm:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="right-info-text no-margin" style={{ color: "#b41712" }}>
                                                        <span className="fw-bold novaticPrice openningPrice">{formatNumber(auction?.firstPrice)}</span>
                                                        <span className="fw-bold unitPrice"> VNĐ</span>
                                                    </p>
                                                </div>
                                                <div className="col-6">

                                                    <p className="left-title-text no-margin">Phí đăng ký tham gia đấu giá:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="fw-bold right-info-text no-margin" style={{ color: "#b41712" }}>
                                                        <span className="fw-bold novaticPrice registerFee">{formatNumber(auction?.participationFee)}</span>
                                                        VNĐ
                                                    </p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="left-title-text no-margin">Bước giá:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="right-info-text no-margin" style={{ color: "#b41712" }}>
                                                        <span className="fw-bold novaticPrice step-price stepPrice">{formatNumber(auction?.priceStep)}</span>
                                                        <span className="fw-bold unitPrice"> VNĐ</span>
                                                    </p>
                                                </div>
                                                <div className="col-6" >
                                                    <p className="left-title-text no-margin">Số bước giá tối đa/ lần trả:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="fw-bold right-info-text no-margin" style={{ color: "#b41712" }}>Bước giá không giới hạn</p>
                                                </div>
                                                <div className="col-6">

                                                    <p className="left-title-text no-margin">Tiền đặt trước:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="fw-bold right-info-text no-margin" style={{ color: "#b41712" }}>
                                                        <span className="fw-bold novaticPrice depositPrice">{formatNumber(auction?.deposit)}</span> VNĐ</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="left-title-text no-margin">Phương thức đấu giá:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="fw-bold right-info-text no-margin" style={{ color: "#b41712" }}>Trả giá lên và liên tục</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="left-title-text no-margin">Tên chủ tài sản:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="fw-bold right-info-text no-margin" style={{ color: "#b41712" }}>{jewelryUser?.fullName}</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="left-title-text no-margin">Nơi xem tài sản:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="fw-bold right-info-text no-margin" style={{ color: "#b41712" }}>Nhà văn hóa sinh viên</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="left-title-text no-margin">Thời gian bắt đầu trả giá:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="fw-bold right-info-text no-margin" style={{ color: "#b41712" }}>{auction?.startDate ? formatDateString(auction?.startDate) : ""}</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="left-title-text no-margin">Thời gian kết thúc trả giá:</p>
                                                </div>
                                                <div className="col-6">
                                                    <p className="fw-bold right-info-text no-margin" style={{ color: "#b41712" }}>{auction?.startDate ? formatDateString(auction?.endDate) : ""}</p>
                                                </div>
                                                <div className="col-6 col-xs-6">
                                                    <b className="spanauctionproperty">Giá trúng tối thiểu:</b>
                                                </div>
                                                <div className="col-6 col-xs-6 right-info-text no-margin" style={{ color: "#b41712" }}>
                                                    <span className="fw-bold spanColorAuctionproperty novaticPrice">{formatNumber(auction?.firstPrice)}</span>
                                                    <span className="fw-bold spanColorAuctionproperty"> VNĐ</span>
                                                </div>
                                                <div className="row mt-2" style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center", paddingTop: "15px", paddingLeft: "40px", paddingRight: "12px"
                                                }}>
                                                    {auction?.state === 'WAITING' && !checkAlreadyRegistered() && (
                                                        <Link
                                                            to={"/dang-ki-dau-gia/" + auctionId}
                                                            className="fw-bold text-center eg-btn btn--primary text-white btn--sm"
                                                            style={{
                                                                backgroundColor: "#B41712",
                                                                textTransform: "unset",
                                                                border: "unset",
                                                                borderRadius: "10px",
                                                                padding: "10px 15px",
                                                                fontSize: "16px"
                                                            }}
                                                        >
                                                            <i className="fa fa-gavel" style={{ marginRight: "5px" }}></i>Đăng ký tham gia đấu giá
                                                        </Link>
                                                    )}
                                                    {auction?.state === 'WAITING' && checkAlreadyRegistered() && (
                                                        <button
                                                            className="bidding-request-confirm-btn"
                                                            style={{
                                                                borderRadius: "10px",
                                                                backgroundColor: "#ccc",
                                                                color: "#333",
                                                                border: "unset",
                                                                padding: "10px 15px",
                                                                fontSize: "16px",
                                                                display: "block",
                                                                marginBottom: "10px"
                                                            }}
                                                            disabled
                                                        >
                                                            <i className="fa fa-gavel" style={{ marginRight: "10px" }}></i>Bạn đã đăng kí tham gia phiên này.
                                                        </button>
                                                    )}
                                                    {auction?.state === 'ONGOING' && checkAlreadyRegistered() && (
                                                        <Link
                                                            to={"/dau-gia-san-pham/" + auctionId}
                                                            className="fw-bold text-center eg-btn btn--primary content-center text-white btn--sm"
                                                            style={{
                                                                backgroundColor: "#28A745",
                                                                textTransform: "unset",
                                                                border: "unset",
                                                                borderRadius: "10px",
                                                                padding: "10px",
                                                                fontSize: "16px",
                                                                width: "50%",
                                                            }}
                                                        >
                                                            <i className="fa fa-gavel" style={{ marginRight: "5px" }}></i>Đấu giá ngay...
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="auction-card3">

                                                <div className="share-area">
                                                    <ul className="social-icons d-flex">
                                                        <li><a><i className="bx bxl-facebook"></i></a></li>
                                                    </ul>
                                                    <div>
                                                        <div className="share-btn"><i className="bx bxs-share-alt"></i></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Umino's Single Product Area Sale End Here  */}

                    {/* Begin Umino's Single Product Tab Area  */}

                    <AuctionTabDetail auctionHistories={auctionHistories} setBidPerPage={setBidPerPage} auction={auction} staff={staff} jewelry={jewelry} />
                </div>
                <ToastContainer />
            </div>
        </>
    );
}