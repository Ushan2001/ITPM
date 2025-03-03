import { combineReducers } from "redux";
import { LOGIN_SUCCESS, LOGOUT } from "./actions";

const initialState = {
  isLoggedIn: localStorage.getItem("token") ? true : false,
  userId: localStorage.getItem("userId"),
  userName: localStorage.getItem("userName"),
};

// Reducer function to manage login state
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        token: action.payload.token,
        userId: action.payload.userId,
        userName: action.payload.userName,
      };
    case LOGOUT:
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      return {
        ...state,
        isLoggedIn: false,
        token: null,
        userId: null,
        userName: null,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  authReducer,
});

export default rootReducer;
