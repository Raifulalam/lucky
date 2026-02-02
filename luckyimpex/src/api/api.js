// src/api.js

// Base URL of your backend API
export const BASE_URL = "https://lucky-1-6ma5.onrender.com/api";

/**
 * GET request
 * @param {string} endpoint
 */
export const getData = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`GET request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("GET request error:", error);
        throw error;
    }
};

/**
 * POST request
 * @param {string} endpoint
 * @param {object} data
 */
export const postData = async (endpoint, data) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`POST request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("POST request error:", error);
        throw error;
    }
};

/**
 * PUT request (update entire resource)
 * @param {string} endpoint
 * @param {object} data
 */
export const putData = async (endpoint, data) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`PUT request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("PUT request error:", error);
        throw error;
    }
};

/**
 * PATCH request (update partial resource)
 * @param {string} endpoint
 * @param {object} data
 */
export const patchData = async (endpoint, data) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`PATCH request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("PATCH request error:", error);
        throw error;
    }
};

/**
 * DELETE request
 * @param {string} endpoint
 */
export const deleteData = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`DELETE request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("DELETE request error:", error);
        throw error;
    }
};
