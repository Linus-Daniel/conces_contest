import axios from 'axios';

const Url = process.env.NODE_ENV === "production"?"":"localhost:3000/api"

const api = axios.create({
    baseURL: Url,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

export default api;