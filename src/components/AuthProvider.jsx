'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState('free');
  // 로그인 사용자의 plan을 아직 조회 중인 동안, 접근 제어 로직이 기본값 'free'를
  // 확정된 값처럼 오판(예: Pro 사용자를 잘못 리다이렉트)하지 않도록 구분해서 노출
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // profiles 테이블이 아직 없어도(설정 전) 조용히 free로 유지
    const loadPlan = async (userId) => {
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();
      setPlan(data?.plan ?? 'free');
      setPlanLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadPlan(session.user.id);
      } else {
        setPlanLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setPlanLoading(true);
        loadPlan(session.user.id);
      } else {
        setPlan('free');
        setPlanLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, plan, planLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
