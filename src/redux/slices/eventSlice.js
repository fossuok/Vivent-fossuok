// src/redux/slices/eventSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { API_URL_CONFIG } from "@/api/configs";

// sample event data
const sampleEvents = [
  {
    id: 1,
    title: "Workshop 1",
    organization: "Organization A",
    description: "Description of Workshop 1",
    date: "2023-10-01",
    location: "Location A",
    duration: "2 hours",
    max_participants: 50,
    link: "https://example.com/workshop1",
    is_active: true,
    created_at: "2023-09-01",
    instructors: [
        {
            id: 1,
            name: "Instructor A",
            email: "A@gmail.com",
            description: "Instructor A description",
        },
    ]
  },
];

const initialState = {
  events: [],
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    getEvents(state, action) {
      const events = action.payload;
      state.events = events;
    },
    addEvent(state, action) {
      const newEvent = action.payload;
      state.events.push(newEvent);
    },
    removeEvent(state, action) {
      const eventId = action.payload;
      state.events = state.events.filter((event) => event.id !== eventId);
    },
  },
});

export const { getEvents, addEvent, removeEvent } = eventSlice.actions;
export default eventSlice.reducer;

// Thunk for fetching events from the API
export const fetchEvents = () => async (dispatch, getState) => {
    try {
      const response = await fetch(API_URL_CONFIG.getEvents, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 404) {
        return;
      }
  
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
  
      const data = await response.json();
      const existingEvents = getState().event.events;
  
      data.forEach((element) => {
        // Check if the event ID already exists in the state
        if (!existingEvents.some((event) => event.id === element.id)) {
          dispatch(addEvent(element)); // Add only unique events
        }
      });
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

export const deleteEvent = (eventId) => async (dispatch) => {
  try {
    const response = await fetch(API_URL_CONFIG.deleteEvent + `${eventId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete event");
    }

    dispatch(removeEvent(eventId));
  } catch (error) {
    console.error("Error deleting event:", error);
  }
};
