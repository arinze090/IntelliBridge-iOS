import axios from 'axios';
import store from '../redux/store';

// export const baseURL = 'https://legacy-bridge-backend.onrender.com';
export const baseURL = 'https://intelli-bridge-backend.vercel.app/';
// console.log('baseURL', baseURL);

// using axios to create a reusuable instance across
const axiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
  withCredentials: true,
});

// use the redux token as the token for intercxeptors
const addTokenToRequest = async requestHeader => {
  // const token = sessionStorage.getItem("#f8WEB#");
  const mToken = store.getState()?.user?.accessToken;
  console.log('mtoken', mToken);

  if (requestHeader.url !== 'authentication/login') {
    requestHeader.headers.Authorization = `Bearer ${mToken}`;
  }

  return requestHeader;
};

axiosInstance.interceptors.request.use(addTokenToRequest);

export default axiosInstance;
