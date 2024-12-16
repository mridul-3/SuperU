'use client';

import React, { useState } from "react";
import { useRouter } from 'next/navigation'


export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    // Function to set the token in localStorage
    const setToken = (token) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("authToken", token);
        } else {
            console.error("LocalStorage is not available on the server side.");
        }
    };

    // Function to handle login
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form submission reload
        setError(null); // Clear any previous error messages

        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.token); // Save token in localStorage
                console.log("Login successful, token saved.");
                router.push("/dashboard"); // Redirect to dashboard
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Login failed.");
            }
        } catch (error) {
            setError("An error occurred during login.");
            console.error("Error during login:", error);
        }
    };

    return (
        <div class="bg-sky-100 flex justify-center items-center h-screen">
            <div class="w-1/2 h-screen hidden lg:block">
                <img src="https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg?w=826" alt="Placeholder Image" class="object-cover w-full h-full" />
            </div>
            <div class="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
                <h1 class="text-2xl font-semibold mb-4">Login</h1>
                <div class="mb-4" className="bg-sky-100">
                    <label for="emial" class="block text-gray-800">Email</label>
                    <input type="email" id="email" name="email" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autocomplete="off" onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div class="mb-4">
                    <label for="password" class="block text-gray-800">Password</label>
                    <input type="password" id="password" name="password" class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autocomplete="off" onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div class="mb-4 flex items-center">
                    <input type="checkbox" id="remember" name="remember" class="text-red-500"/>
                    <label for="remember" class="text-green-900 ml-2">Remember Me</label>
                </div>

                <div class="mb-6 text-blue-500">
                    <a href="#" class="hover:underline">Forgot Password?</a>
                </div>
                <button onClick={handleLogin} class="bg-red-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full">Login</button>
                <div class="mt-6 text-green-500 text-center">
                    <a href="#" class="hover:underline">Sign up Here</a>
                </div>
            </div>
        </div>
    );
}