import { consoleMock } from '../commontest';

const initialState = {
    global: {}
};
const stateChangerEventPostfix = "CHANGER";
const fullStateChangerEventKey = "FULLSTATE" + stateChangerEventPostfix;
const logger = consoleMock;

/**
 * Generates an event object for saving partial data under a given key.
 * @param {string} leKey The key of the data
 * @param {object} data The data to save
 * @returns {object} the event object
 */
export const eventMaker = (leKey, data) => {
    return {
        type: leKey + stateChangerEventPostfix,
        key: leKey,
        payload: data,
    };
};

/**
 * Generates an event object for saving full data.
 * @param {object} data The data to save
 * @returns {object} the event object
 */
export const fullEventMaker = (data) => {
    return {
        type: fullStateChangerEventKey,
        payload: data,
    };
};

/**
 * A reducer that handles "*CHANGER" actions
 * @param {object} state The previous state
 * @param {object} action The action that was received
 */
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
        logger.log("Writing to global state in reducer", action.payload);
        if (action.type === fullStateChangerEventKey) {
            applyFullGlobalState(action.payload);
        } else {
            applyToGlobalState(action.key, action.payload);
        }
    } else {
        logger.log("A non-changer event", action);
    }
    if (!touched) {
        logger.log("No change in state");
        return state;
    }
    logger.log("Reduced state to ", newState, "after action", action);
    return newState;
};