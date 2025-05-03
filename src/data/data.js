import {
  UserPlusIcon,
  DocumentArrowUpIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserIcon,
  HomeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export const EVENTS = ["workshop1", "workshop2", "workshop3", "workshop4"];

export const EXCLUDE_FIELDS = ["_id", "attended", "__v"];

export const REQUIRED_COLUMNS_FROM_CSV = ['firstName', 'lastName', 'email', 'phone', 'studentId', 'linkedin', "nic", "attended"];

export const NAVIGATIONS = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Participants", href: "/participants", icon: UserIcon },
  { name: "Add Participant", href: "/addParticipant", icon: UserPlusIcon },
  { name: "Bulk Import", href: "/bulkUpload", icon: DocumentArrowUpIcon },
  { name: "Import Logs", href: "/importLogs", icon: ClipboardDocumentListIcon },
  { name: "Email Campaign", href: "/EmailCampaign", icon: PaperAirplaneIcon },
  { name: "Email Templates", href: "/Email", icon: DocumentTextIcon },
  { name: "Email Logs", href: "/EmailLogs", icon: ClipboardDocumentListIcon },
  { name: "Analytics", href: "/Analytics", icon: ChartBarIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];
