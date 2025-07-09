import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate();
    const { userData, serverUrl, setUserData, setIsLoggedIn } = useContext(AppContext);

    const sendVerificationOtp = async () => {
        try {
            // axios.defaults.withCredentials = true;
            const { data } = await axios.post(` ${serverUrl}/api/auth/send-verify-otp`);
            if (data.success) {
                navigate("/email-verify");
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const logout = async () => {
        try {
            // axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${serverUrl}/api/auth/logout`)
            if (data.success) {
                setIsLoggedIn(false);
                setUserData(false);
                navigate("/");
                toast.success(data.message)
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
            <img src={assets.logo} alt='' className='w-28 sm:w-32 cursor-pointer' />
            {userData ?
                <div className='flex justify-center items-center rounded-full text-white relative group cursor-pointer w-8 h-8 bg-black'>
                    {userData.name[0].toUpperCase()}
                    <div className='absolute hidden group-hover:block top-0 right-0 z-10 rounded-full pt-10 text-black'>
                        <ul className='list-none m-0 p-1.5 w-32 bg-gray-100 text-sm'>
                            {!userData.isAccountVerified &&
                                <li onClick={sendVerificationOtp} className='py-1.5 px-2 hover:bg-gray-200'>Verify Email</li>
                            }
                            <li onClick={logout} className='py-1.5 px-2 hover:bg-gray-200 pr-10'>Logout</li>
                        </ul>
                    </div>
                </div>
                :
                <button onClick={() => { navigate("/login") }} className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer transition-all'>
                    Login <img src={assets.arrow_icon} alt='' />
                </button>
            }
        </div>
    )
};

export default Navbar;