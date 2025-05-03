export const BASE_URL = process.env.NEXT_PUBLIC_URL;

export const API_URL_CONFIG = {
    login: `${BASE_URL}/users/login`,
    getUsers: `${BASE_URL}/users`,
    getParticipants: `${BASE_URL}/events/`,
    getEvents: `${BASE_URL}/events/`,
    createEvent: `${BASE_URL}/events/`,
    deleteEvent: `${BASE_URL}/events/`,
    markPresent: `${BASE_URL}/events/`,
    getSingleParticipant: `${BASE_URL}/events/`,
    updateParticipant: `${BASE_URL}/events/`,
    deleteParticipant: `${BASE_URL}/events/`,
    createParticipant: `${BASE_URL}/events/`,
    uploadCSV: `${BASE_URL}/upload/events/`,
    getImportLogs: `${BASE_URL}/upload/upload-logs`,
    clearImportLogs: `${BASE_URL}/upload/clear-logs`,
    sendEmails: `${BASE_URL}/send-emails/`,
    getTemplates: `${BASE_URL}/events/`,
    deleteTemplate: `${BASE_URL}/events/`,
    getEmailLogs: `${BASE_URL}/email-logs/?skip=0&limit=100`,
    deleteEmailLogs: `${BASE_URL}/email-logs/delete-logs`,
} 