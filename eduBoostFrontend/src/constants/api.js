const BASE_URL = import.meta.env.VITE_API_URL;

export const API = {
    BASE: BASE_URL,
    ADMIN: `${BASE_URL}/admin`,
    PUBLIC: `${BASE_URL}/public`,
    USER: `${BASE_URL}/user`,
};