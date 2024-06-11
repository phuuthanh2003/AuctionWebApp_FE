import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { handleActiveUser, login } from "../../api/AuthenticationAPI";

export default function Login() {
    const [loginRequest, setLoginRequest] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [notification, setNotification] = useState("");
    const { token } = useParams();

    useEffect(() => {
        if (token) {
            if (token === "reset-success") {
                setNotification("Đổi mật khẩu thành công vui lòng đăng nhập!");
                return;
            }
            handleActiveUser(token)
                .then((result) => {
                    if (result) {
                        setNotification("Kích hoạt tài khoản thành công vui lòng đăng nhập!");
                    }
                    else {
                        setNotification('');
                        setError("Kích hoạt tài khoản không thành công");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [token])

    const onChangeLoginRequest = (key: keyof typeof loginRequest) => (e: ChangeEvent<HTMLInputElement>) => {
        setLoginRequest((preValue) => ({ ...preValue, [key]: e.target.value }));
    }

    const handleLogin = async () => {
        const success = await login(loginRequest, setError);
        if (success) {
            // navigate("/")
            window.location.href = '/';
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <>
            {/* <!-- Begin Umino's Breadcrumb Area --> */}
            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li>
                                <a href="index.html">Trang chủ</a>
                            </li>
                            <li className="active">Đăng nhập </li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* Begin Umino's Login Register Area   */}
            <div className="umino-login-register_area">
                <div className="container">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xs-12 col-lg-12">
                            {/* <!-- Login Form s--> */}
                            <form action="#">
                                <div className="login-form">
                                    <h4 className="login-title">Đăng nhập</h4>
                                    {notification && <h5 className="fw-bold" style={{ color: "green" }}>{notification}</h5>}
                                    <div className="row mb-4">
                                        <div className="col-md-12 col-12">
                                            <label>Tên đăng nhập/ Email</label>
                                            <input
                                                type="text"
                                                value={loginRequest.username}
                                                onChange={onChangeLoginRequest("username")}
                                                placeholder="Nhập tên đăng nhập/ Email"
                                                onKeyPress={handleKeyPress}
                                            />
                                        </div>
                                        <div className="col-12 mb--20">
                                            <label>Mật khẩu</label>
                                            <input
                                                type="password"
                                                value={loginRequest.password}
                                                onChange={onChangeLoginRequest("password")}
                                                placeholder="Nhập mật khẩu"
                                                onKeyPress={handleKeyPress}
                                            />
                                        </div>
                                        <div className="col-md-8">
                                            <div className="check-box">
                                                <input
                                                    type="checkbox"
                                                    id="remember_me"
                                                />
                                                <label htmlFor="remember_me">
                                                    Nhớ mật khẩu
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="forgotton-password_info">
                                                <Link to={"/quen-mat-khau"}>
                                                    Quên mật khẩu?
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <button type="button" className="login_btn" onClick={handleLogin}>
                                                Đăng nhập
                                            </button>
                                            {error && <div className="mt-2" style={{ color: "red" }}>{error}</div>}
                                        </div>
                                    </div>

                                    <Link to={"/dang-ky"}>
                                        Bạn chưa có tài khoản ?
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
