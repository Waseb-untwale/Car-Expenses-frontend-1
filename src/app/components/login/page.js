
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, X, Car } from 'lucide-react'
import baseURL from "@/utils/api"

const Login = () => {
  const [timer, setTimer] = useState(120)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  }

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post(`${baseURL}api/admin/login`, {
        email,
        password,
      })

      if (res.status === 200) {
        // toast.success(res.data.message)
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("id", res.data.id)
        
        // Check if the user is blocked
        try {
          const subAdminsRes = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
          const loggedInUser = subAdminsRes.data.subAdmins.find((e) => e._id === res.data.id)

          if (loggedInUser?.status === 'Inactive') {
            setIsBlocked(true)
            setShowModal(true) 
          } else {
            router.push('/AdminDashboard') 
          }
        } catch (error) {
          console.error("Error checking user status:", error)
          router.push('/AdminDashboard') // Default to dashboard if status check fails
        }
      }
    } catch (error) {
      toast.error("Invalid credentials or something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const toggleForgotPassword = () => {
    setShowForgotModal(!showForgotModal)
    setForgotEmail(email)
  }

  useEffect(() => {
    let interval;
    if (showForgotModal || showOtpModal) {
      setTimer(120);
      setIsTimerRunning(true);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showForgotModal, showOtpModal]);

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setForgotLoading(true)

    try {
      const res = await axios.post(`${baseURL}api/password/send-otp`, {
        email: forgotEmail,
      })

      if (res.status === 200) {
        toast.success(res.data.message)
        localStorage.setItem("email", forgotEmail)
        setShowForgotModal(false)
        setShowOtpModal(true)
        setTimer(120)
        setIsTimerRunning(true)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setOtpLoading(true)

    try {
      const email = localStorage.getItem("email")
      if (!email) {
        toast.error("Email not found. Please try again from the beginning.")
        setShowOtpModal(false)
        setShowForgotModal(true)
        return
      }

      const res = await axios.post(`${baseURL}api/password/verify-otp`, {
        email,
        otp,
      })

      if (res.status === 200) {
        toast.success("OTP Verified! Reset your password.")
        setShowOtpModal(false)
        setShowResetModal(true)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setResetLoading(true)

    try {
      const email = localStorage.getItem("email")
      if (!email) {
        toast.error("Session expired. Please try again from the beginning.")
        setShowResetModal(false)
        setShowForgotModal(true)
        return
      }

      const res = await axios.post(`${baseURL}api/password/reset-password`, {
        email,
        password: newPassword,
      })

      if (res.status === 200) {
        toast.success("Password Reset Successful!")
        localStorage.removeItem("email")
        setShowResetModal(false)
        setNewPassword("")
        setConfirmPassword("")
        setOtp("")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password. Try again.")
    } finally {
      setResetLoading(false)
    }
  }

  const modalWrapper = (modalContent, key) => (
    <motion.div
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 backdrop-blur-sm"
    >
      {modalContent}
    </motion.div>
  )

  const inputStyles = "w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 outline-none focus:border-blue-500 transition-all duration-200"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.9),rgba(17,24,39,1))]" />
      
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      <div className={`relative z-10 w-full max-w-md px-4 ${showForgotModal || showOtpModal || showResetModal ? "blur-sm scale-[0.98]" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key="login-card"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(8,_112,_184,_0.7)]"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">Admin Login</h2>
              <p className="text-blue-200/80">Welcome back! Please enter your details</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
                  Email Address
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputStyles}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputStyles} pr-10`}
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </motion.button>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForgotModal &&
          modalWrapper(
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-md backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(8,_112,_184,_0.7)] mx-4"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Forgot Password</h2>
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-blue-200 mb-2">
                    Email Address
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={inputStyles}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 ${
                    forgotLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending OTP..." : "Send OTP"}
                </motion.button>
              </form>
            </motion.div>,
            "forgot-modal"
          )}

        {showOtpModal &&
          modalWrapper(
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-md backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(8,_112,_184,_0.7)] mx-4"
            >
              <button
                onClick={() => setShowOtpModal(false)}
                className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Verify OTP</h2>
              <p className="text-blue-200/80 text-sm mb-6 text-center">
                Enter the 6-digit OTP sent to your email address
              </p>
              <p className={`text-sm text-center mb-6 ${isTimerRunning ? "text-green-400" : "text-red-400"}`}>
                {isTimerRunning
                  ? `OTP expires in ${Math.floor(timer / 60)}:${(timer % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : "OTP expired. Please request a new one."}
              </p>
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-blue-200 mb-2">
                    OTP Code
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={inputStyles}
                    required
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 ${
                    otpLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={otpLoading}
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </motion.button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpModal(false)
                      setShowForgotModal(true)
                    }}
                    className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Did not receive OTP? Try again
                  </button>
                </div>
              </form>
            </motion.div>,
            "otp-modal"
          )}

        {/* Blocked Admin Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gray-900 text-white p-6 rounded-lg shadow-xl border border-gray-700 w-80"
            >
              <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
              <p className="text-gray-300 mb-4">You have been blocked by the Master Admin.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg w-full"
                onClick={() => setShowModal(false)}
              >
                Close
              </motion.button>
            </motion.div>
          </div>
        )}

        {showResetModal &&
          modalWrapper(
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-md backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(8,_112,_184,_0.7)] mx-4"
            >
              <button
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h2>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-blue-200 mb-2">
                    New Password
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputStyles}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-blue-200 mb-2">
                    Confirm Password
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputStyles}
                    required
                    minLength={6}
                    placeholder="Confirm new password"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 ${
                    resetLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </motion.button>
              </form>
            </motion.div>,
            "reset-modal"
          )}
      </AnimatePresence>
    </div>
  )
}

export default Login