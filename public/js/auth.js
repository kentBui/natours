import axios from "axios";

import { showAlert } from "./alert";

export const login = async (email, password) => {
  console.log({ email, password });
  try {
    axios.defaults.withCredentials = true;
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:2000/api/v1/users/signin",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Login success");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }

    if (res.data) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
    }
    console.log(res);
  } catch (error) {
    console.log(error);
    showAlert("error", error.response.data.message);
  }
};

export const logout = async () => {
  try {
    axios.defaults.headers.withCredentials = true;

    const res = await axios.get("http://127.0.0.1:2000/api/v1/users/logout");
    console.log(res.data);
    if (res.data.status === "success") {
      showAlert("success", res.data.message);

      // location.reload(true);
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
