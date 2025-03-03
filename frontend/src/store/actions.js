export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT = "LOGOUT";

// Action creators for admin login
export const loginSuccess = (token, userId, userName, userType) => ({
  type: LOGIN_SUCCESS,
  payload: { token, userId, userName, userType },
});

export const logout = (token) => ({
  type: LOGOUT,
  payload: token,
});
