
import { createClient } from '@supabase/supabase-js';
import { Participant } from '../types';

const SUPABASE_URL = 'https://nxyikgnmwgekozacsxgh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CT9i9dFAV5UnzsIWTKLUcQ_4d_dIj-b';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchParticipants = async (): Promise<Participant[]> => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('registeredAt', { ascending: false });

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
  return data as Participant[];
};

export const saveParticipant = async (participant: Participant): Promise<boolean> => {
  const { error } = await supabase
    .from('participants')
    .insert([participant]);

  if (error) {
    console.error('Error saving participant:', error);
    return false;
  }
  return true;
};

export const updateParticipantCheckIn = async (ticketId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('participants')
    .update({ 
      checkedIn: true, 
      checkedInAt: new Date().toISOString() 
    })
    .eq('ticketId', ticketId);

  if (error) {
    console.error('Error updating check-in:', error);
    return false;
  }
  return true;
};

/**
 * Vérifie si les identifiants fournis correspondent à un administrateur en base de données.
 */
export const verifyAdminCredentials = async (username: string, password: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) {
    return false;
  }
  return true;
};
