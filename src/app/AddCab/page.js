"use client";

import { useState, useEffect } from "react";
import Sidebar from "../slidebar/page";
import { FaCar, FaClipboardList, FaCalendarAlt, FaUpload } from "react-icons/fa";
import { motion } from "framer-motion";
import baseURL from '@/utils/api'

const AddCab = () => {
    const [formData, setFormData] = useState({
        cabNumber: "",
        insuranceNumber: "",
        insuranceExpiry: "",
        registrationNumber: "",
        cabImage: null,
        addedBy: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const adminId = localStorage.getItem("id");
        if (adminId) {
            setFormData((prev) => ({ ...prev, addedBy: adminId }));
        }
    }, []);

    const handleChange = (e) => {
        if (e.target.name === "cabImage") {
            setFormData({ ...formData, cabImage: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.cabNumber.trim()) newErrors.cabNumber = "Cab Number is required";
        if (!formData.insuranceNumber.trim()) newErrors.insuranceNumber = "Insurance Number is required";
        if (!formData.insuranceExpiry.trim()) newErrors.insuranceExpiry = "Insurance Expiry is required";
        if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration Number is required";
        if (!formData.cabImage) newErrors.cabImage = "Cab image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setSuccess("");

        try {
            const token = localStorage.getItem("token");
            const formDataToSend = new FormData();
            Object.keys(formData).forEach((key) => {
                formDataToSend.append(key, formData[key]);
            });

            const response = await fetch(`${baseURL}api/cabDetails/add`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formDataToSend,
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Cab added successfully!");
                setFormData({
                    cabNumber: "",
                    insuranceNumber: "",
                    insuranceExpiry: "",
                    registrationNumber: "",
                    cabImage: null,
                    addedBy: localStorage.getItem("id") || "",
                });
            } else {
                setErrors({ apiError: typeof data.error === "string" ? data.error : "Something went wrong" });
            }
        } catch (error) {
            setErrors({ apiError: "Server error, try again later" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="flex min-h-screen bg-gradient-to-r from-gray-900  text-white"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8 }}
        >
            <Sidebar />
            <div className="flex flex-1 justify-center items-center p-6 ">
                <motion.div 
                    className="bg-gray-800 border border-[#00000] hover:border hover:border-blue-400 rounded-lg p-8 w-full max-w-3xl shadow-2xl"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl font-semibold text-center text-white mb-6 ">Add Cab</h2>
                    {success && <p className="text-green-500 text-center mb-4">{success}</p>}
                    {errors.apiError && (
                        <p className="text-white text-center mb-4">
                            {typeof errors.apiError === "object" ? JSON.stringify(errors.apiError) : errors.apiError}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        {[
                            { name: "cabNumber", icon: <FaCar />, placeholder: "Cab Number" },
                            { name: "insuranceNumber", icon: <FaClipboardList />, placeholder: "Insurance Number" },
                            { name: "insuranceExpiry", icon: <FaCalendarAlt />, placeholder: "Insurance Expiry Date", type: "date" },
                            { name: "registrationNumber", icon: <FaClipboardList />, placeholder: "Registration Number" },
                        ].map(({ name, icon, placeholder, type = "text" }, index) => (
                            <motion.div 
                                key={index} 
                                className="relative mt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="absolute left-3 top-3 text-white">{icon}</div>
                                <input
                                    type={type}
                                    name={name}
                                    placeholder={placeholder}
                                    className="w-full bg-gray-700 text-white pl-10 p-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-white-400"
                                    onChange={handleChange}
                                    value={formData[name]}
                                />
                                {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
                            </motion.div>
                        ))}

                        <motion.div 
                            className="relative mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <FaUpload className="absolute left-3 top-3 text-white" />
                            <input
                                type="file"
                                name="cabImage"
                                accept="image/*"
                                className="w-full bg-gray-700 text-white p-3 pl-10 border border-gray-500 rounded-lg focus:ring-2 focus:ring-white-400"
                                onChange={handleChange}
                            />
                            {errors.cabImage && <p className="text-white text-sm mt-1">{errors.cabImage}</p>}

                            <button
                            type="submit"
                            className=" w-full jsx-ec59cb17e9a40e66 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-300 mt-4"
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add Cab"}
                        </button>
                        </motion.div>

                       
                  
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AddCab;
