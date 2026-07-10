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
