// src/redux/slices/templateSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { API_URL_CONFIG } from "@/api/configs";

const sampleTemplates = [
  {
    templateName: "Template 1",
    emailSubject: "Welcome to the Event",
    body: "Dear {name},\n\nThank you for registering for our event. We look forward to seeing you there!\n\nBest regards,\nEvent Team",
    event_id: 1,
    id: 1,
    created_at: "2025-05-01T20:35:24.164276",
  },
];

const initialState = {
  templates: [],
};

const templateSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    getTemplates(state, action) {
      const templates = action.payload;
      state.templates = templates;
    },
    addTemplate(state, action) {
      const newTemplate = action.payload;
      state.templates.push(newTemplate);
    },
    removeTemplate(state, action) {
      const templateId = action.payload;
      state.templates = state.templates.filter(
        (template) => template.id !== templateId
      );
    },
    resetTemplates(state) {
      state.templates = [];
    }

  },
});

export const { getTemplates, addTemplate, removeTemplate, resetTemplates } =
  templateSlice.actions;
export default templateSlice.reducer;

// Thunk for fetching templates from the API
export const fetchTemplates = (event_id) => async (dispatch, getState) => {
  try {
    const url = API_URL_CONFIG.getTemplates + `${event_id}/email-templates?skip=0&limit=10`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      console.log("templates not found, using sample data");
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch templates");
    }

    const data = await response.json();
    const existingTemplates = getState().template.templates;

    data.forEach((element) => {
      // Check if the template ID already exists in the state
      if (!existingTemplates.some((template) => template.id === element.id)) {
        dispatch(addTemplate(element)); // Add only unique templates
      }
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
  }
};

export const deleteTemplate = (templateId, eventId) => async (dispatch) => {
  try {
    const url = API_URL_CONFIG.deleteTemplate + `${eventId}/email-templates/${templateId}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete template");
    }

    dispatch(removeTemplate(templateId));
  } catch (error) {
    console.error("Error deleting template:", error);
  }
}
