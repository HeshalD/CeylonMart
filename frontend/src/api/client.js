import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default client;


