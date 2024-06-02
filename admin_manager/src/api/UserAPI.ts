
import { fetchGetWithToken } from "./AuthenticationAPI";
import { MyRequest } from "../../../website/src/api/MyRequest";
import { User } from "../models/User";

interface ResultPageableInteface {
    usersData: User[];
    totalElements: number
}

export const checkEmailExist = async (email: string) => {
    const URL = `http://localhost:8080/api/v1/user/by-email/${email}`;
    try {
        const response = await MyRequest(URL);
        if (response) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};

export const checkUsernameExist = async (username: string) => {
    const URL = `http://localhost:8080/api/v1/user/by-username/${username}`;
    try {
        const response = await MyRequest(URL);
        if (response) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};

export const getUserLogin = async (username: string): Promise<User> => {
    const URL = `http://localhost:8080/api/v1/user/by-username/${username}`;
    const response = await MyRequest(URL);
    // console.log(response)
    return response;
};

export const getUserById = async (id: number): Promise<User> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error("No access token found");
    }
    const URL = `http://localhost:8080/api/v1/user/${id}`;
    const response = await fetch(URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    return data;
};

export const getWinnerByAuctionId = async (auctionID: number | undefined): Promise<User> => {
    const URL = `http://localhost:8080/api/v1/user/get-winner-auction/${auctionID}`;
    const response = await MyRequest(URL);
    // console.log(response)
    return response;
};

export async function getMembers(page: number, role: string): Promise<ResultPageableInteface> {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error("No access token found");
    }

    const URL = `http://localhost:8080/api/v1/user/staff?page=${page - 1}&role=${role}`;

    const response = await fetchGetWithToken(URL, 'GET', token)

    if (!response.ok) {
        throw new Error(`Cannot access ${URL}`);
    }

    const data = await response.json();

    const users: User[] = data.content.map((user: User) => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        district: user.district,
        ward: user.ward,
        city: user.city,
        yob: user.yob,
        cccd: user.cccd,
        state: user.state,
        avatar: user.avatar,
        bankAccountNumber: user.bankAccountNumber,
        bankAccountName: user.bankAccountName
    }));

    return {
        usersData: users,
        totalElements: data.totalElements,
    };
}


