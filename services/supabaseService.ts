
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
  // CORRECTION : On extrait 'salutation' car elle n'existe pas encore dans votre schéma Supabase
  const { salutation, ...dbPayload } = participant;

  const { error } = await supabase
    .from('participants')
    .insert([dbPayload]);

  if (error) {
    console.error('Error saving participant:', error);
    if (error.code === 'PGRST204') {
        const { error: retryError } = await supabase.from('participants').insert([dbPayload]);
        return !retryError;
    }
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

export const deleteParticipant = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting participant:', error);
    return false;
  }
  return true;
};

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
