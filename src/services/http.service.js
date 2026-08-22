import Axios from 'axios'
import router from '../router/index.js'

// Base URL: use environment variable if exists, otherwise fallback to Render backend
//const BASE_URL = process.env.VUE_APP_API_URL
const BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://tasko-back-end1.onrender.com/api'
    : 'http://localhost:3030/api';

const axios = Axios.create({
  withCredentials: true, // include cookies for session auth
})

export const httpService = {
  get(endpoint, params = null) {
    return ajax(endpoint, 'GET', params)
  },
  post(endpoint, data = null) {
    return ajax(endpoint, 'POST', data)
  },
  put(endpoint, data = null) {
    return ajax(endpoint, 'PUT', data)
  },
  delete(endpoint, data = null) {
    return ajax(endpoint, 'DELETE', data)
  },
}

//try 
async function ajax(endpoint, method = 'GET', data = null) {
  try {
    const res = await axios({
      url: `${BASE_URL}/${endpoint}`, // ensure slash
      method,
      data: method !== 'GET' ? data : null,
      params: method === 'GET' ? data : null,
    })
    return res.data
  } catch (err) {
    console.error(`Error ${method}ing to ${endpoint}:`, err.response?.data || err)
    if (err.response?.status === 401) {
      router.push('/login')
    }
    throw err
  }
}
