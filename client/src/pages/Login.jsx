import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
    const { serverUrl, setIsLoggedIn, getUser } = useContext(AppContext);

    const [state, setState] = useState("Sign Up");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            // axios.defaults.withCredentials = true;
            
            if (state === "Sign Up") {
                const { data } = await axios.post(`${serverUrl}/api/auth/register`, {
                    name, email, password
                });
                if (data.success) {
                    setIsLoggedIn(true);
                    toast.success("Login success.")
                    getUser();
                    navigate("/");
                } else {
                    toast.error(data.message);
                }
            } else {
                const { data } = await axios.post(`${serverUrl}/api/auth/login`, {
                    email, password
                });
                if (data.success) {
                    setIsLoggedIn(true);
                    toast.success(data.message);
                    getUser();
                    navigate("/");
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-500'>
            <img
                onClick={() => navigate("/")}
                src={assets.logo} alt=''
                className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
            />
            <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
                <h2 className='text-3xl font-semibold text-white text-center mb-3'>
                    {state === "Sign Up" ? "Create Account" : "Login"}
                </h2>
                <p className='text-center text-sm mb-6'>
                    {state === "Sign Up" ? "Create your account" : "Login to your account"}
                </p>

                <form onSubmit={onSubmitHandler}>
                    {state === "Sign Up" && (
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#454e7b]'>
                            <img src={assets.person_icon} alt='' />
                            <input
                                type='text'
                                value={name}
                                placeholder='Full Name'
                                onChange={e => setName(e.target.value)}
                                className='bg-transparent outline-none w-[80%]'
                                required />
                        </div>
                    )}

                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#454e7b]'>
                        <img src={assets.mail_icon} alt='' />
                        <input
                            type='email'
                            value={email}
                            placeholder='Email id'
                            onChange={e => setEmail(e.target.value)}
                            className='bg-transparent outline-none w-[80%]'
                            required />
                    </div>
                    
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#454e7b]'>
                        <img src={assets.lock_icon} alt='' />
                        <input
                            type='password'
                            value={password}
                            placeholder='Password'
                            onChange={e => setPassword(e.target.value)}
                            className='bg-transparent outline-none w-[80%]'
                            required />
                    </div>

                    <p onClick={() => navigate("/reset-password")} className='px-1 mb-4 text-indigo-500 cursor-pointer'>Forgot password?</p>

                    <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer'>
                        {state}
                    </button>
                </form>

                {state === "Sign Up" ? (
                    <p className='text-gray-400 text-center text-sm mt-4'>
                        Already have an account?
                        <span onClick={() => setState("Login")} className='text-blue-400 cursor-pointer underline'> Login here</span>
                    </p>
                ) : (
                    <p className='text-gray-400 text-center text-sm mt-4'>
                        Don't have an account?
                        <span onClick={() => setState("Sign Up")} className='text-blue-400 cursor-pointer underline'> Sign Up</span>
                    </p>
                )}
            </div>
        </div>
    )
};

export default Login;