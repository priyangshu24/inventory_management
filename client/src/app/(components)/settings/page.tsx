"use client";

import React, { useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import { Bell, Moon, Globe, Shield, Key } from "lucide-react";

type UserSetting = {
  label: string;
  value: string | boolean;
  type: "text" | "toggle";
  icon?: React.ReactNode;
  description?: string;
};

const mockSettings: UserSetting[] = [
  { 
    label: "Username", 
    value: "Priyangshu", 
    type: "text",
    description: "Your display name visible to other users"
  },
  { 
    label: "Email", 
    value: "priyangshudey77@gmail.com", 
    type: "text",
    description: "Your primary email address for notifications"
  },
  { 
    label: "Notifications", 
    value: true, 
    type: "toggle",
    icon: <Bell className="w-5 h-5" />,
    description: "Receive email notifications for important updates"
  },
  { 
    label: "Dark Mode", 
    value: false, 
    type: "toggle",
    icon: <Moon className="w-5 h-5" />,
    description: "Enable dark mode for better viewing at night"
  },
  { 
    label: "Language", 
    value: "English", 
    type: "text",
    icon: <Globe className="w-5 h-5" />,
    description: "Choose your preferred language"
  },
  { 
    label: "Two-Factor Auth", 
    value: false, 
    type: "toggle",
    icon: <Shield className="w-5 h-5" />,
    description: "Enable 2FA for enhanced security"
  },
  { 
    label: "API Key", 
    value: "xxxxxx-xxxxx-xxxxx", 
    type: "text",
    icon: <Key className="w-5 h-5" />,
    description: "Your API key for integrations"
  }
];

const Settings = () => {
  const [userSettings, setUserSettings] = useState<UserSetting[]>(mockSettings);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggleChange = (index: number) => {
    const settingsCopy = [...userSettings];
    settingsCopy[index].value = !settingsCopy[index].value as boolean;
    setUserSettings(settingsCopy);

    // Handle dark mode toggle specifically
    if (settingsCopy[index].label === "Dark Mode") {
      setIsDarkMode(!isDarkMode);
      if (!isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Initialize dark mode on component mount
  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  return (
    <div className="w-full dark:bg-gray-900 transition-colors duration-200">
      <Header name="User Settings" />
      <div className="overflow-x-auto mt-5 shadow-md">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
          <thead className="bg-gray-800 dark:bg-gray-900 text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Setting</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Value</th>
            </tr>
          </thead>
          <tbody>
            {userSettings.map((setting, index) => (
              <tr 
                className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150" 
                key={setting.label}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {setting.icon}
                    <div>
                      <div className="font-medium dark:text-white">{setting.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {setting.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {setting.type === "toggle" ? (
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={setting.value as boolean}
                        onChange={() => handleToggleChange(index)}
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full 
                        peer peer-focus:ring-blue-400 peer-focus:ring-4 
                        transition peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                        after:transition-all peer-checked:bg-blue-600"
                      ></div>
                    </label>
                  ) : (
                    <input
                      type="text"
                      className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 
                        dark:bg-gray-700 dark:border-gray-600 
                        focus:outline-none focus:border-blue-500"
                      value={setting.value as string}
                      onChange={(e) => {
                        const settingsCopy = [...userSettings];
                        settingsCopy[index].value = e.target.value;
                        setUserSettings(settingsCopy);
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;