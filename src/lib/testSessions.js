export async function saveTestSession(supabase, { userId, selection, results }) {
  const knownCount = results.filter((r) => r.known).length;
  return supabase.from('test_sessions').insert({
    user_id: userId,
    selection,
    total_count: results.length,
    known_count: knownCount,
    results,
  });
}

export async function fetchTestSessions(supabase) {
  const { data, error } = await supabase
    .from('test_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function hasTestedToday(supabase) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('test_sessions')
    .select('id')
    .gte('created_at', startOfDay.toISOString())
    .limit(1);

  if (error) return false; // 테이블 미설정 등으로 실패하면 막지 않음
  return (data?.length ?? 0) > 0;
}
