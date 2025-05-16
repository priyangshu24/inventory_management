"use client";

import {
  ExpenseByCategorySummary,
  useGetExpensesByCategoryQuery,
} from "@/state/api";
import { useMemo, useState } from "react";
import Header from "@/app/(components)/Header";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type AggregatedDataItem = {
  name: string;
  color?: string;
  amount: number;
};

type AggregatedData = {
  [category: string]: AggregatedDataItem;
};

// Consistent color palette for better visual appearance
const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
];

const Expenses = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: expensesData,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery();
  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const filtered: AggregatedData = expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory =
          selectedCategory === "All" || data.category === selectedCategory;
        const dataDate = parseDate(data.date);
        const matchesDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);
        return matchesCategory && matchesDate;
      })
      .reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
        const amount = parseInt(data.amount);
        if (!acc[data.category]) {
          acc[data.category] = { 
            name: data.category, 
            amount: 0,
            // Use predefined colors instead of random ones
            color: COLORS[Object.keys(acc).length % COLORS.length]
          };
        }
        acc[data.category].amount += amount;
        return acc;
      }, {});

    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate]);

  const classNames = {
    label: "block text-sm font-medium text-gray-700 mb-1",
    selectInput:
      "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm transition-all duration-200 hover:border-blue-300",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !expensesData) {
    return (
      <div className="text-center text-red-500 py-4 bg-red-50 rounded-lg border border-red-200 p-4">
        Failed to fetch expenses
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="mb-5 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-lg shadow-lg text-white">
        <Header name="Expenses" />
        <p className="text-sm text-white opacity-90 mt-2">
          A visual representation of expenses over time.
        </p>
      </div>

      {/* FILTERS & CHART CONTAINER */}
      <div className="flex flex-col md:flex-row justify-between gap-5">
        <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Filter by Category and Date
          </h3>
          <div className="space-y-5">
            {/* CATEGORY */}
            <div>
              <label htmlFor="category" className={classNames.label}>
                Category
              </label>
              <select
                id="category"
                name="category"
                className={classNames.selectInput}
                defaultValue="All"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>All</option>
                <option>Office</option>
                <option>Professional</option>
                <option>Salaries</option>
              </select>
            </div>
            {/* START DATE */}
            <div>
              <label htmlFor="start-date" className={classNames.label}>
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                name="start-date"
                className={classNames.selectInput}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {/* END DATE */}
            <div>
              <label htmlFor="end-date" className={classNames.label}>
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                name="end-date"
                className={classNames.selectInput}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            {/* RESET BUTTON */}
            <div className="pt-2">
              <button
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => {
                  setSelectedCategory("All");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="flex-grow bg-white shadow-lg rounded-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Expense Distribution
          </h3>
          {aggregatedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={aggregatedData}
                  cx="50%"
                  cy="50%"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="amount"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {aggregatedData.map(
                    (entry: AggregatedDataItem, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === activeIndex ? entry.color : entry.color}
                        opacity={index === activeIndex ? 1 : 0.8}
                        stroke="#FFFFFF"
                        strokeWidth={index === activeIndex ? 2 : 1}
                      />
                    )
                  )}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "6px",
                    padding: "10px",
                    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #E5E7EB"
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  iconSize={10}
                />
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#000" floodOpacity="0.3" />
                  </filter>
                </defs>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available for the selected filters
            </div>
          )}
        </div>
      </div>
      
      {/* DATA TABLE */}
      {aggregatedData.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aggregatedData.map((item, index) => {
                  const totalAmount = aggregatedData.reduce((sum, item) => sum + item.amount, 0);
                  const percentage = ((item.amount / totalAmount) * 100).toFixed(1);
                  
                  return (
                    <tr 
                      key={item.name} 
                      className={`${index === activeIndex ? "bg-blue-50" : ""} hover:bg-gray-50 transition-colors duration-150`}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                        ${item.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;