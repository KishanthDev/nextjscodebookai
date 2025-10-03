"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import Image from "next/image";

const AuthPage: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const router = useRouter();

  // Mimic setTimeout to set sign-in mode after 200ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSignIn(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Signup:", { name, email, password, agreeToTerms });
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("login", "true");
    console.log("Login:", { email, password, rememberMe });
    router.push("/dashboard");
  };

  return (
    <main className="h-screen w-screen bg-gray-100 dark:bg-gray-900 overflow-x-hidden">
      <div className={`relative h-screen w-screen overflow-hidden ${isSignIn ? "sign-in" : isSignIn === false ? "sign-up" : ""}`}>
        {/* Background Slide */}
        <div
          className="absolute top-0 right-0 h-full w-[300%] transform transition-transform duration-1000 ease-in-out bg-gradient-to-r from-blue-500 to-purple-500 z-10 shadow-2xl"
          style={{
            transform: isSignIn ? "translateX(0)" : isSignIn === false ? "translateX(100%)" : "translateX(35%)",
            right: isSignIn || isSignIn === false ? "50%" : "0",
            borderBottomRightRadius: "max(50vw, 50vh)",
            borderTopLeftRadius: "max(50vw, 50vh)",
          }}
        ></div>

        {/* Content Row */}
        <div className="content-row absolute top-0 left-0 flex w-full h-full pointer-events-none z-20">
          <div className="col w-1/2 flex items-center justify-center text-center">
            <div className={`text sign-in text-white transform transition-transform duration-1000 ease-in-out ${isSignIn ? "translate-x-0" : "-translate-x-[250%]"}`}>
              <Image
                alt="Deer Icon"
                height={100}
                width={100}
                src="/landingpage/silhouette_deer.svg"
                className="mx-auto mb-4"
              />
              <h2 className="text-4xl font-extrabold mb-4">Welcome Back</h2>
              <p className="text-lg font-semibold">Please sign in to continue</p>
            </div>
          </div>
          <div className="col w-1/2 flex items-center justify-center text-center">
            <div className={`text sign-up text-white transform transition-transform duration-1000 ease-in-out ${isSignIn ? "translate-x-[250%]" : "translate-x-0"}`}>
              <h2 className="text-4xl mt-4 font-extrabold mb-4">Join With Us</h2>
              <p className="text-lg font-semibold">Sign up to get started</p>
              <Image
                alt="Deer Icon"
                height={100}
                width={100}
                src="/landingpage/silhouette_deer.svg"
                className="mx-auto mt-4"
              />
            </div>
          </div>
        </div>

        {/* Form Row */}
        <div className="row flex h-full">
          <div className="col w-1/2 flex items-center justify-center">
            <div className="form-wrapper w-full max-w-md">
              <form
                className={`form sign-up p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md transform transition-all duration-500 ease-in-out ${isSignIn ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
                onSubmit={handleSignup}
              >
                <div className="flex flex-col gap-1 mb-4">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label htmlFor="email-signup" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email-signup"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label htmlFor="password-signup" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password-signup"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={isVisible ? "text" : "password"}
                      className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-10 text-sm shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <button
                      type="button"
                      aria-label={isVisible ? "Hide password" : "Show password"}
                      title={isVisible ? "Hide password" : "Show password"}
                      onClick={() => setIsVisible(!isVisible)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none"
                    >
                      {isVisible ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={!agreeToTerms}
                  variant="default"
                  className={clsx(
                    "w-full group",
                    !agreeToTerms && "cursor-not-allowed opacity-50"
                  )}
                >
                  Sign Up
                </Button>
                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            </div>
          </div>
          <div className="col w-1/2 flex items-center justify-center">
            <div className="form-wrapper w-full max-w-md">
              <form
                className={`form sign-in p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md transform transition-all duration-500 ease-in-out ${isSignIn ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                onSubmit={handleLogin}
              >
                <div className="flex flex-col gap-1 mb-4">
                  <label htmlFor="email-login" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email-login"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label htmlFor="password-login" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password-login"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={isVisible ? "text" : "password"}
                      className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-10 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => setIsVisible(!isVisible)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none"
                    >
                      {isVisible ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button
                  type="submit"
                  variant="default"
                  className="w-full group"
                >
                  Log In
                </Button>
                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign up here
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;