

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import Sidebar from '../slidebar/page';
import { MdOutlineDirectionsCar, MdOutlineAccountBalanceWallet, MdPerson } from "react-icons/md";
import { BsClipboardCheck } from "react-icons/bs";
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import  baseURL from '@/utils/api';

const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 1.5 }) => {
    const controls = useAnimation();
    const [count, setCount] = useState(0);
    const [ref, inView] = useInView({ triggerOnce: true });

    useEffect(() => {
        if (inView) {
            controls.start({
                count: value,
                transition: { duration }
            });
        }
    }, [inView, value, controls, duration]);

    return (
        <motion.span
            ref={ref}
            animate={controls}
            onUpdate={latest => setCount(Math.floor(latest.count))}
        >
            {prefix}{count}{suffix}
        </motion.span>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalDrivers: 0,
        totalCabs: 0,
        assignedCabs: 0,
        totalExpenses: 0,
    });

    const [expenseData, setExpenseData] = useState([]);
    const [expenseBreakdown, setExpenseBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setError("No authentication token found. Please log in.");
                    return;
                }

                const headers = { headers: { Authorization: `Bearer ${token}` } };

                const [driversRes, cabsRes, assignedCabsRes, expensesRes] = await Promise.allSettled([
                    axios.get(`${baseURL}api/driver/profile`, headers),
                    axios.get(`${baseURL}api/cabDetails`, headers),
                    axios.get(`${baseURL}api/assigncab`, headers),
                    axios.get(`${baseURL}api/cabs/cabExpensive`, headers)
                ]);

                const driversData = driversRes.status === "fulfilled" ? driversRes.value.data : [];
                const cabsData = cabsRes.status === "fulfilled" ? cabsRes.value.data : [];
                const assignedCabsData = assignedCabsRes.status === "fulfilled" ? assignedCabsRes.value.data : [];
                const expensesData = expensesRes.status === "fulfilled" ? expensesRes.value.data?.data || [] : [];

                const totalExpenses = expensesData.reduce((acc, curr) => acc + (curr.totalExpense || 0), 0);

                const monthlyExpenseData = expensesData.map((exp, index) => ({
                    month: exp.cabNumber || `Cab ${index + 1}`,
                    expense: exp.totalExpense || 0
                }));

                const aggregatedBreakdown = expensesData.reduce((acc, exp) => {
                    const breakdown = exp.breakdown || {};
                    acc.fuel = (acc.fuel || 0) + (breakdown.fuel || 0);
                    acc.fasttag = (acc.fasttag || 0) + (breakdown.fastTag || breakdown.fasttag || 0);
                    acc.tyre = (acc.tyre || 0) + (breakdown.tyre || breakdown.tyrePuncture || 0);
                    acc.other = (acc.other || 0) + (breakdown.other || breakdown.otherProblems || 0);
                    return acc;
                }, {});

                const formattedBreakdown = [
                    { name: "Fuel", value: aggregatedBreakdown.fuel || 0 },
                    { name: "FastTag", value: aggregatedBreakdown.fasttag || 0 },
                    { name: "TyrePuncture", value: aggregatedBreakdown.tyre || 0 },
                    { name: "OtherProblems", value: aggregatedBreakdown.other || 0 }
                ];

                setStats({
                    totalDrivers: driversData.length || 0,
                    totalCabs: cabsData.length || 0,
                    assignedCabs: assignedCabsData.length || 0,
                    totalExpenses: totalExpenses || 0,
                });

                setExpenseData(monthlyExpenseData);
                setExpenseBreakdown(formattedBreakdown);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setError("Failed to fetch dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#A020F0'];

    return (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 min-h-screen flex text-white">
            <Sidebar />

            <div className="p-8 mt-20 md:ml-60 sm:mt-0 flex-1">
                <motion.h1
                    className="text-3xl font-bold mb-6 text-center text-gray-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Admin Dashboard
                </motion.h1>

                {loading && <p className="text-center text-gray-300">Loading dashboard data...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {[
                                { 
                                    label: 'Total Drivers', 
                                    value: stats.totalDrivers, 
                                    icon: <MdPerson size={28} />,
                                    prefix: '',
                                    suffix: ''
                                },
                                { 
                                    label: 'Total Cabs', 
                                    value: stats.totalCabs, 
                                    icon: <MdOutlineDirectionsCar size={28} />,
                                    prefix: '',
                                    suffix: ''
                                },
                                { 
                                    label: 'Assigned Cabs', 
                                    value: stats.assignedCabs, 
                                    icon: <BsClipboardCheck size={28} />,
                                    prefix: '',
                                    suffix: ''
                                },
                                { 
                                    label: 'Total Expenses', 
                                    value: stats.totalExpenses, 
                                    icon: <MdOutlineAccountBalanceWallet size={28} />,
                                    prefix: '₹',
                                    suffix: ''
                                }
                            ].map((card, index) => (
                                <motion.div
                                    key={index}
                                    className="p-5 bg-gray-800 shadow-lg rounded-lg flex items-center space-x-4 transition-transform transform hover:scale-105 hover:shadow-2xl"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className="p-4 bg-white text-gray-800 rounded-full">{card.icon}</div>
                                    <div className="text-white">
                                        <h2 className="text-lg font-semibold">{card.label}</h2>
                                        <p className="text-2xl font-bold">
                                            <AnimatedCounter 
                                                value={card.value} 
                                                prefix={card.prefix}
                                                suffix={card.suffix}
                                            />
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <motion.div 
                                className="bg-gray-800 p-6 shadow-xl rounded-lg"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <h2 className="text-lg font-semibold mb-4 text-gray-200">Monthly Expenses per Cab</h2>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={expenseData}>
                                        <XAxis dataKey="month" stroke="#E5E7EB" />
                                        <YAxis stroke="#E5E7EB" />
                                        <Tooltip formatter={(value) => `₹${value}`} />
                                        <Bar dataKey="expense" fill="#6366F1" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>

                            <motion.div 
                                className="bg-gray-800 p-6 shadow-xl rounded-lg"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <h2 className="text-lg font-semibold mb-4 text-gray-200">Expense Breakdown</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie 
                                            data={expenseBreakdown} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={80}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {expenseBreakdown.map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${value}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;