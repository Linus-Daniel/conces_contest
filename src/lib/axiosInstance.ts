import axios from 'axios';

const Url =
  process.env.NODE_ENV === "production"
    ? "https://conces-contest.vercel.app/api"
    : "http://localhost:3000/api";

const api = axios.create({
    baseURL: Url,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

export default api;