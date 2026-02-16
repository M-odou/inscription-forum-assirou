
export enum AppView {
  REGISTRATION = 'registration',
  TICKET_SUCCESS = 'ticket_success',
  ADMIN = 'admin',
  CHECKIN = 'checkin'
}

export interface Participant {
  id: string;
  ticketId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  industry: string;
  interestType: 'services' | 'formations' | 'none';
  selectedOfferings: string[];
  opinion: string;
  referralForum: string[];
  referralAssirou: string[];
  registeredAt: string;
  welcomeMessage?: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  industry: string;
  interestType: 'services' | 'formations' | 'none';
  selectedOfferings: string[];
  opinion: string;
  referralForum: string[];
  referralAssirou: string[];
}
