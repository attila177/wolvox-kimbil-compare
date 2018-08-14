const initialState = {
    global: {}
};
const stateChangerEventPostfix = "CHANGER";
const fullStateChangerEventKey = "FULLSTATE" + stateChangerEventPostfix;


export const eventMaker = (leKey, data) => {
    return {
        type: leKey + stateChangerEventPostfix,
        key: leKey,
        payload: data,
    };
};

export const fullEventMaker = (data) => {
    return {
        type: fullStateChangerEventKey,
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
    const applyFullGlobalState = (value) => {
        touched = true;
        newState.global = value;
    };

    if (action.type.indexOf(stateChangerEventPostfix) === action.type.length - stateChangerEventPostfix.length) {
        console.log("Writing to global state in reducer", action.payload);
        if (action.type === fullStateChangerEventKey) {
            applyFullGlobalState(action.payload);
        } else {
            applyToGlobalState(action.key, action.payload);
        }
    } else {
        console.log("A non-changer event", action);
    }
    if (!touched) {
        console.log("No change in state");
        return state;
    }
    console.log("Reduced state to ", newState, "after action", action);
    return newState;
};