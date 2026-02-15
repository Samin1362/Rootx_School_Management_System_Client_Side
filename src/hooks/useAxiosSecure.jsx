import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import useAuth from "./useAuth";
import { API_BASE_URL } from "../config/api";

const axiosSecure = axios.create({
  baseURL: API_BASE_URL,
});

const useAxiosSecure = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        if (user?.email) {
          config.headers["x-user-email"] = user.email;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.suspended
        ) {
          navigate("/organization-suspended");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [user, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
