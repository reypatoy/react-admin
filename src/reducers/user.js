export const userState = {
    isLogin: false,
    user: null,
    error: null,
    type: null,
    loading: false,
    };



const userReducer = (state = userState, action) => {
    switch (action.type) {
        case 'SET_USER':
            state = {
                ...state,
                isLogin: true,
                type: action.payload.userType,
                user: action.payload.newUser,
            };
            return state;

        case 'LOGOUT':
            state = {
                ...state,
                isLogin: false,
                user: null,
                error: null,
                type:  null,
                loading: false,
            };
            return state;
        default:
            return state;
    }
};

export default userReducer;