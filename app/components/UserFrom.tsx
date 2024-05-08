/*"use client";

import { useRouter } from "next/router";
import React, { useState } from "react";

const UserForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setErrorMessage("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const response = await res.json();
      setErrorMessage(
        response.message || "An error occurred, please try again."
      );
    } else {
      // Assuming you want to refresh and navigate on successful registration
      router.reload(); // Use `router.reload()` to refresh the page
      router.push("/"); // Navigate to home after the reload or just use push if no reload needed
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-1/2">
        <h1>Create New User</h1>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          onChange={handleChange}
          required
          value={formData.name}
          className="m-2 bg-slate-400 rounded"
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          onChange={handleChange}
          required
          value={formData.email}
          className="m-2 bg-slate-400 rounded"
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          onChange={handleChange}
          required
          value={formData.password}
          className="m-2 bg-slate-400 rounded"
        />
        <input
          type="submit"
          value="Create User"
          className="bg-blue-300 hover:bg-blue-100 cursor-pointer p-2"
        />
      </form>
      <p className="text-red-500">{errorMessage}</p>
    </>
  );
};

export default UserForm;
*/
