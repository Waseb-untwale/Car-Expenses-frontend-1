
"use client"

import { useState, useEffect } from "react"

import { useRouter } from "next/navigation"
import { Menu, User, Truck, LogOut, Settings, X } from "lucide-react"
import { MdOutlineAssignmentTurnedIn, MdDashboard } from 'react-icons/md';
import { RiMoneyRupeeCircleLine } from 'react-icons/ri';
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion } from "framer-motion"
import axios from 'axios';
import { FiMenu, FiUser, FiTruck, FiLogOut, FiSettings, FiX } from 'react-icons/fi';
import baseURL from "@/utils/api"
import Image from 'next/image';


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyName, setCompanyName] = useState('');
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    toast.success("Logout successful! Redirecting to login...")
    setTimeout(() => {
      router.push("/components/login")
    }, 1000)
  }


  useEffect(() => {
    const id = localStorage.getItem('id');

    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}api/admin/getAllSubAdmins`);
        const allSubAdmins = response.data.subAdmins;

        const matched = allSubAdmins.find((elm) => elm._id === id);
        if (matched) {
          setCompanyLogo(matched.companyLogo);
          setCompanyName(matched.name); // Store company name

        }
      } catch (error) {
        console.error('Error fetching sub-admins:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const menuItems = [
    { icon: <MdDashboard />, label: 'Dashboard', link: '/AdminDashboard' },
    { icon: <FiUser />, label: 'Driver Details', link: '/DriverDetails' },
    { icon: <MdOutlineAssignmentTurnedIn />, label: 'Assign Cab', link: '/AssignCab' },
    { icon: <FiTruck />, label: 'View Cab', link: '/CabInfo' },
    { icon: <FiSettings />, label: 'Servicing', link: '/Servicing' },
    { icon: <RiMoneyRupeeCircleLine />, label: 'Expenses', link: '/Expensive' },

    // { icon: <MdOutlineAssignmentTurnedIn />, label: 'Add Cab', link: '/AddCab' },
    // { icon: <MdOutlineAssignmentTurnedIn />, label: 'Add Driver', link: '/AddDriver' },
  ];

  return (
    <>
      {/* Mobile Navbar - Only shown on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-500 to-indigo-700 bg-opacity-90 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-4">
          {companyLogo?.trim() ? (
            <Image
              src={companyLogo}
              alt="Company Logo"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-4 border-white"
            />
          ) : (
            <span className="text-white text-sm italic">No Logo</span>
          )}
          <span className="text-white text-lg font-semibold">
            {companyName || ""}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl p-1 rounded-full hover:bg-gray-800 transition-all"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay - Only shown when sidebar is open on mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar - Different positioning for mobile and desktop */}
      <aside
        className={`
            fixed md:fixed z-40 
            h-[calc(100vh-0px)] md:h-screen 
            transition-all duration-300 
            ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
      >
        <div
          className={`  
              h-full w-64 
              flex flex-col 
              bg-black backdrop-blur-lg shadow-lg 
              border-r border-gray-700 border-opacity-40 
              transition-opacity duration-300
              ${isOpen ? "opacity-100" : "md:opacity-100 opacity-0"}
            `}
        >
          {/* Header - Hidden on mobile since it's in the navbar */}
          <div className="hidden md:block sticky top-0 z-10 bg-black px-4 py-3 border-b border-gray-700">
            <div className="flex items-center gap-4">
              {companyLogo?.trim() ? (
                <Image
                  src={companyLogo}
                  alt="Company Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full border-4 border-white"                />
              ) : (
                <span className="text-white text-sm italic">No Logo</span>
              )}
              <span className="text-indigo-500 text-lg font-semibold">
                {companyName || ""}
              </span>
            </div>
          </div>


          {/* Mobile spacing to account for the top navbar */}
          <div className="h-16 md:hidden"></div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-4 px-2 py-4">
              {loading
                ? menuItems.map((_, index) => (
                  <li key={index} className="flex items-center gap-2 p-2 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
                    <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
                  </li>
                ))
                : menuItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 hover:scale-105"
                    onClick={() => {
                      router.push(item.link)
                      if (window.innerWidth < 768) setIsOpen(false)
                    }}
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white">
                      <span className="text-white font-bold">{item.icon}</span>
                    </span>
                    <span className="text-white font-semibold hover:text-indigo-300">{item.label}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Fixed logout button at bottom */}
          <div className="sticky bottom-0 p-4 border-t border-gray-700 bg-black">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="w-full flex cursor-pointer items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full text-white transition duration-200"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black border border-white">
                <LogOut className="text-white h-4 w-4" />
              </span>
              <span className="text-white font-semibold hover:text-yellow-300">Logout</span>
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
