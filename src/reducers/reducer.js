const initialState = {
    global: {}
};
const stateChangerEventPostfix = "CHANGER";


export const eventMaker = (leKey, data) => {
    return {
        type: leKey + stateChangerEventPostfix,
        key: leKey,
        payload: data,
    };
};

export const rootReducer = (state = initialState, action) => {
    let newState = { ...state };
    let touched = false;
    const applyToGlobalState = (key, value) => {
        touched = true;
        newState.global[key] = value;
    };

    if (action.type.indexOf(stateChangerEventPostfix) === action.type.length - stateChangerEventPostfix.length) {
        console.log("Writing to global state in reducer");
        applyToGlobalState(action.key, action.payload);
    }
    if (!touched) {
        console.log("No change in state");
        return state;
    }
    console.log("Reduced state to ", newState, "after action", action);
    return newState;
};