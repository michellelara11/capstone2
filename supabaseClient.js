window.SUPABASE_URL = "https://fttgcvqcxmeumvhjhbjn.supabase.co";
window.SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dGdjdnFjeG1ldW12aGpoYmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2Nzc0NjYsImV4cCI6MjA3NjI1MzQ2Nn0.QE3g-HTcMhpE1g5WAvj6-lkge4uREijOC6xxdXG8gKk";

if (!window.supabase) {
  console.error(
    "Supabase library failed to load. Make sure the UMD script tag is included before this file."
  );
}

// Create a single shared client
afterSupabaseLoaded(function initSupabase() {
  try {
    window.sb = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY
    );
    console.log("[Supabase] Client initialized");
  } catch (e) {
    console.error("[Supabase] Initialization error:", e);
  }
});

// Ensures the global `supabase` from the UMD script is available before creating the client
function afterSupabaseLoaded(cb) {
  if (window.supabase && window.supabase.createClient) return cb();
  var attempts = 0;
  var max = 20; // ~2s
  var timer = setInterval(() => {
    attempts++;
    if (window.supabase && window.supabase.createClient) {
      clearInterval(timer);
      cb();
    } else if (attempts >= max) {
      clearInterval(timer);
      console.error("Supabase library not available.");
    }
  }, 100);
}
