import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jqqwpfnbepnfopvkonrs.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fake-key-for-now';

let globalUnread = 0;
const badgeListeners = new Set<(c: number) => void>();

export const notifyUnread = () => { globalUnread++; badgeListeners.forEach(l => l(globalUnread)); };
export const clearUnread = () => { globalUnread = 0; badgeListeners.forEach(l => l(globalUnread)); };

export function useUnreadBadge() {
  const [count, setCount] = useState(globalUnread);
  useEffect(() => {
    badgeListeners.add(setCount);
    return () => { badgeListeners.delete(setCount); };
  }, []);
  return count;
}

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

export function useSupabaseRealtime(ngoCategory: string) {
  const [connecting, setConnecting] = useState<boolean>(true);

  useEffect(() => {
    setConnecting(true);
    
    const channel = supabaseClient
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        (payload: any) => {
          const row = payload.new;
          const { food_category, donor_name, quantity } = row;
          
          if (!ngoCategory || ngoCategory === 'All' || food_category === ngoCategory) {
            notifyUnread();
            toast.custom((t) => (
              <div className="bg-gray-800 text-white px-4 py-3 rounded-xl shadow-xl flex flex-col gap-3 min-w-[280px] border border-gray-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-emerald-400">New Donation Match!</h4>
                    <p className="text-sm font-medium text-gray-200 mt-1">
                      {donor_name || 'A local donor'} listed {quantity} kg of {food_category}
                    </p>
                  </div>
                  <span className="text-xl">🍲</span>
                </div>
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      toast.success(`Accepted ${quantity}kg of ${food_category}!`);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-lg"
                  >
                    Accept Now
                  </button>
                </div>
              </div>
            ), { duration: Infinity });
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setConnecting(false);
        }
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [ngoCategory]);

  return { connecting };
}
