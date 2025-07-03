import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    // axios.defaults.withCredentials = true;

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);

    const getUser = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/user/data`);
            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/auth/is-auth`);
            data.success ? (
                setIsLoggedIn(true),
                getUser()
            ) : ""
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        getAuthState();
    }, [])

    const value = {
        serverUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUser
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
};
