import { showAlert } from "./alert";

import axios from "axios";
// update data
export const updateSettingData = async (name, email) => {
  try {
    axios.defaults.withCredentials = true;
    const res = await axios.post(
      "http://127.0.0.1:2000/api/v1/users/updateMe",
      { name, email }
    );

    console.log(res);
    if (res.data.status === "success") {
      showAlert("success", "Update data successful");
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};

export const updatePasswordData = async (
  oldPassword,
  newPassword,
  newPasswordConfirm
) => {
  try {
    axios.defaults.withCredentials = true;
    const res = await axios.post(
      "http://127.0.0.1:2000/api/v1/users/updateMyPassword",
      {
        oldPassword,
        newPassword,
        newPasswordConfirm,
      }
    );
    console.log(res);
    if (res.data.status === "success") {
      showAlert("success", "Update password successful");
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
