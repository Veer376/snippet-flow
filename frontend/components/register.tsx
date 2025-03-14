import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Login() {
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [hasEmailText, setHasEmailText] = useState(false);
    const [hasPasswordText, setHasPasswordText] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (event: any) => {
        event.preventDefault(); // 🔥 Prevents form from refreshing the page

        // Ensure email and password are not empty
        if (!email.trim() || !password.trim()) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const success = await login(email, password);
            if (success) {
                navigate('/', { replace: true });
            } else {
                alert("Login failed. Please check your credentials.");
            }

        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again.");
        }

    };


    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center ">
            <div className="absolute top-4 left-4 text-3xl font-bold text-gray-700">Snippet Flow</div>

            <div className="flex flex-col items-center bg-white p-10 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold mb-12">Welcome back</h1>

                <form className="flex flex-col w-80 space-y-8" onSubmit={handleLogin}>
                    {/* Email Input */}
                    <div className="relative w-full">
                        <input
                            type="email"
                            placeholder=""
                            className="w-full p-4 pt-6 border-2 items-center border-gray-300 rounded-full outline-none focus:border-blue-500 focus:ring-0 peer"
                            onFocus={() => setEmailFocused(true)}
                            onBlur={(e) => {
                                setEmailFocused(false);
                                setHasEmailText(e.target.value.trim() !== ""); // Check if text exists
                            }}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label
                            className={`pointer-events-none absolute left-5 transition-all bg-white px-2 rounded-2xl
                                ${emailFocused ? "top-2 -translate-y-2/3 text-blue-500" : ""}
                                ${hasEmailText ? "top-2 -translate-y-2/3 text-gray-400" : "top-5 text-gray-400"}
                            peer-focus:top-2 peer-focus:text-blue-500`}
                        >
                            Enter your email
                        </label>
                    </div>
                    {/* Password Input */}
                    <div className="relative w-full">
                        <input
                            type="password"
                            placeholder=""
                            className="w-full p-4 pt-6 border-2 items-center border-gray-300 rounded-full outline-none focus:border-blue-500 focus:ring-0 peer"
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={(e) => {
                                setPasswordFocused(false);
                                setHasPasswordText(e.target.value.trim() !== ""); // Check if text exists
                            }}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label
                            className={`pointer-events-none absolute left-5 transition-all bg-white px-2 rounded-2xl
                                ${passwordFocused ? "top-2 -translate-y-2/3 text-blue-500" : ""}
                                ${hasPasswordText ? "top-2 -translate-y-2/3 text-gray-400" : "top-5 text-gray-400"}
                            peer-focus:top-2 peer-focus:text-blue-500`}
                        >
                            Enter your password
                        </label>
                    </div>

                    <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-6 text-lg rounded-lg hover:bg-blue-600 transition-all mx-auto">
                        Login
                    </button>
                </form>
                <div className="text-center mt-4">
                    <span className="text-black">Don't have an account? </span>
                    <a href="/register" className="text-blue-500 font-medium hover:underline">
                        Sign Up
                    </a>
                </div>


            </div>
        </div>
    );
}