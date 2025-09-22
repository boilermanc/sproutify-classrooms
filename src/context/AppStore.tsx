// src/context/AppStore.tsx - Updated with classroom selection functionality
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { nanoid } from "nanoid";

export type TowerPortConfig = 20 | 28 | 32;

export type Tower = {
  id: string;
  name: string;
  ports: TowerPortConfig;
  location?: string;
  createdAt: string;
  vitals: {
    ph?: number;
    ec?: number;
    lightHours?: number;
  };
  plants: Plant[];
  pests: PestLog[];
  harvests: Harvest[];
  wasteGrams?: number;
};

export type Plant = {
  id: string;
  name: string;
  seededAt?: string;
  plantedAt?: string;
  quantity?: number; // number of seedlings planted
  growthRate?: number; // cm/week or similar
  harvestDate?: string;
  harvestWeightGrams?: number;
  outcome?: string; // eaten, donated, sold, composted
};

export type PestLog = {
  id: string;
  date: string;
  issue: string;
  action?: string;
};

export type Harvest = {
  id: string;
  date: string;
  weightGrams: number;
  destination: string; // cafeteria, donation, home, etc
};

// ADD CLASSROOM TYPE FOR GARDEN NETWORK
export type Classroom = {
  id: string;
  name: string;
  kiosk_pin: string;
  created_at: string;
  teacher_id?: string;
};

// UPDATED STATE TO INCLUDE SELECTED CLASSROOM
type State = {
  towers: Tower[];
  selectedClassroom: Classroom | null; // ADD THIS
};

// UPDATED ACTION TYPE TO INCLUDE CLASSROOM SELECTION
type Action =
  | { type: "ADD_TOWER"; payload: { id: string; name: string; ports: TowerPortConfig; location?: string } }
  | { type: "UPDATE_VITALS"; payload: { id: string; ph?: number; ec?: number; lightHours?: number } }
  | { type: "ADD_PEST"; payload: { towerId: string; entry: PestLog } }
  | { type: "ADD_PLANT"; payload: { towerId: string; plant: Plant } }
  | { type: "UPDATE_PLANT"; payload: { towerId: string; plant: Plant } }
  | { type: "ADD_HARVEST"; payload: { towerId: string; harvest: Harvest } }
  | { type: "SET_WASTE"; payload: { towerId: string; grams: number } }
  | { type: "SET_SELECTED_CLASSROOM"; payload: Classroom | null }; // ADD THIS

// UPDATED INITIAL STATE
const initialState: State = {
  towers: [],
  selectedClassroom: null, // ADD THIS
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOWER": {
      const t: Tower = {
        id: action.payload.id,
        name: action.payload.name,
        ports: action.payload.ports,
        location: action.payload.location,
        createdAt: new Date().toISOString(),
        vitals: {},
        plants: [],
        pests: [],
        harvests: [],
      };
      return { ...state, towers: [t, ...state.towers] };
    }
    case "UPDATE_VITALS": {
      return {
        ...state,
        towers: state.towers.map((t) =>
          t.id === action.payload.id
            ? { ...t, vitals: { ...t.vitals, ...action.payload } }
            : t
        ),
      };
    }
    case "ADD_PEST": {
      return {
        ...state,
        towers: state.towers.map((t) =>
          t.id === action.payload.towerId
            ? { ...t, pests: [action.payload.entry, ...t.pests] }
            : t
        ),
      };
    }
    case "ADD_PLANT": {
      return {
        ...state,
        towers: state.towers.map((t) =>
          t.id === action.payload.towerId
            ? { ...t, plants: [action.payload.plant, ...t.plants] }
            : t
        ),
      };
    }
    case "UPDATE_PLANT": {
      return {
        ...state,
        towers: state.towers.map((t) =>
          t.id === action.payload.towerId
            ? {
                ...t,
                plants: t.plants.map((p) => (p.id === action.payload.plant.id ? action.payload.plant : p)),
              }
            : t
        ),
      };
    }
    case "ADD_HARVEST": {
      return {
        ...state,
        towers: state.towers.map((t) =>
          t.id === action.payload.towerId
            ? { ...t, harvests: [action.payload.harvest, ...t.harvests] }
            : t
        ),
      };
    }
    case "SET_WASTE": {
      return {
        ...state,
        towers: state.towers.map((t) =>
          t.id === action.payload.towerId ? { ...t, wasteGrams: action.payload.grams } : t
        ),
      };
    }
    // ADD NEW CASE FOR CLASSROOM SELECTION
    case "SET_SELECTED_CLASSROOM": {
      return {
        ...state,
        selectedClassroom: action.payload,
      };
    }
    default:
      return state;
  }
}

const StoreCtx = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => undefined });

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const raw = localStorage.getItem("sproutify:store");
      return raw ? (JSON.parse(raw) as State) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem("sproutify:store", JSON.stringify(state));
  }, [state]);

  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>;
};

export function useAppStore() {
  return useContext(StoreCtx);
}

export function newPlant(partial?: Partial<Plant>): Plant {
  return {
    id: nanoid(),
    name: "",
    quantity: 1,
    ...partial,
  };
}

export function newHarvest(partial?: Partial<Harvest>): Harvest {
  return {
    id: nanoid(),
    date: new Date().toISOString().slice(0, 10),
    weightGrams: 0,
    destination: "",
    ...partial,
  };
}

export function newPest(partial?: Partial<PestLog>): PestLog {
  return {
    id: nanoid(),
    date: new Date().toISOString(),
    issue: "",
    action: "",
    ...partial,
  };
}

// HELPER FUNCTION FOR CLASSROOM SELECTION (OPTIONAL)
export function setSelectedClassroom(classroom: Classroom | null): Action {
  return { type: "SET_SELECTED_CLASSROOM", payload: classroom };
}