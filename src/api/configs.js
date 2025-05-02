import { create } from "domain";

export const BASE_URL = process.env.NEXT_PUBLIC_URL;

export const API_URL_CONFIG = {
    login: `${BASE_URL}/users/login`,
    getUsers: `${BASE_URL}/users`,
    getParticipants: `${BASE_URL}/events/`,
    getEvents: `${BASE_URL}/events/`,
    markPresent: `${BASE_URL}/events/`,
    getSingleParticipant: `${BASE_URL}/events/`,
    updateParticipant: `${BASE_URL}/events/`,
    deleteParticipant: `${BASE_URL}/events/`,
    createParticipant: `${BASE_URL}/events/`,
} 