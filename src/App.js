import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@400;600;700&display=swap";
document.head.appendChild(fontLink);

const mobileCSS = document.createElement("style");
mobileCSS.textContent = `
  html, body, #root { height: 100%; }
  .f-root { display: flex; min-height: 100vh; }
  .f-sidebar {
    background: #0a0a0a;
    border-right: 2px solid #1a1a1a;
    display: flex;
    flex-direction: column;
    transition: width 0.2s ease;
    overflow: hidden;
    flex-shrink: 0;
  }
  .f-main { flex: 1; display: flex; flex-direction: column; overflow: auto; min-width: 0; }
  .f-hamburger { display: none; }
  .f-backdrop { display: none; }
  .f-header-badge { display: flex; }
  .f-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 32px; }
  .f-detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 32px; }
  .f-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .f-content-pad { padding: 32px; }
  .f-header-pad { padding: 0 32px; }
  .f-client-detail-pad { padding: 32px; }
  .f-client-detail-header { display: flex; gap: 20px; align-items: center; margin-bottom: 32px; }
  .f-table-wrap { overflow-x: auto; }

  @media (max-width: 767px) {
    .f-sidebar {
      position: fixed !important;
      top: 0; left: 0; height: 100vh;
      width: 260px !important;
      z-index: 100;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
    }
    .f-sidebar.open { transform: translateX(0); }
    .f-backdrop { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 90; }
    .f-hamburger { display: flex; align-items: center; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 4px 10px 4px 0; line-height: 1; }
    .f-header-badge { display: none; }
    .f-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .f-detail-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .f-form-grid { grid-template-columns: 1fr !important; }
    .f-content-pad { padding: 16px; }
    .f-header-pad { padding: 0 16px; }
    .f-client-detail-pad { padding: 16px; }
    .f-client-detail-header { flex-direction: column; align-items: flex-start; }
    .f-close-btn { display: flex !important; }
  }
`;
document.head.appendChild(mobileCSS);

const INDUSTRIES = ["HVAC", "Plumbing", "Electrical", "Roofing"];
const INTENTS = ["Transactional", "Commercial", "Informational"];
const API = process.env.REACT_APP_API_URL || "http://localhost:3001";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "",
  process.env.REACT_APP_SUPABASE_ANON_KEY || ""
);

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      onLogin(data.session);
    }
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!email) { setError("Enter your email first."); return; }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setForgotSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif" }}>
      <div style={{ width: 360, padding: "40px 36px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderTop: "3px solid #d60000" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Fortitude</div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>Dashboard</div>
        </div>

        {forgotSent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#22c55e", marginBottom: 12 }}>Password reset email sent.</div>
            <div style={{ fontSize: 11, color: "#555" }}>Check your inbox and follow the link.</div>
            <button onClick={() => setForgotSent(false)} style={{ marginTop: 20, fontSize: 11, color: "#d60000", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>← Back to login</button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Email</div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 4, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Barlow Condensed', sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#d60000"}
                onBlur={e => e.target.style.borderColor = "#222"}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Password</div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 4, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Barlow Condensed', sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#d60000"}
                onBlur={e => e.target.style.borderColor = "#222"}
              />
            </div>
            {error && <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 16, lineHeight: 1.4 }}>{error}</div>}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "12px", background: "#d60000", border: "none", borderRadius: 4, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s" }}
            >{loading ? "Signing in..." : "Sign In"}</button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button type="button" onClick={handleForgot} style={{ fontSize: 11, color: "#444", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}>Forgot password?</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clients
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", industry: "HVAC", domain: "", wordpress_url: "", brand_voice: "" });

  // Keyword Library
  const [library, setLibrary] = useState({});
  const [activeIndustry, setActiveIndustry] = useState("HVAC");
  const [newKeyword, setNewKeyword] = useState("");
  const [newVolume, setNewVolume] = useState("");
  const [newIntent, setNewIntent] = useState("Transactional");
  const [libSortField, setLibSortField] = useState("volume");
  const [libSortDir, setLibSortDir] = useState("desc");

  // Image Library
  const [images, setImages] = useState([]);
  const [imageMode, setImageMode] = useState("industry");
  const [imageIndustry, setImageIndustry] = useState("HVAC");
  const [imageClientId, setImageClientId] = useState("");
  const [imageCategory, setImageCategory] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // Competitor Gap
  const [gapDomain, setGapDomain] = useState("");
  const [gapComp1, setGapComp1] = useState("");
  const [gapComp2, setGapComp2] = useState("");
  const [gapResults, setGapResults] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [gapError, setGapError] = useState(null);

  // Content
  const [generatingPost, setGeneratingPost] = useState(null);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  const [editingClient, setEditingClient] = useState(false);
  const [clientEdits, setClientEdits] = useState({});
  const [savingClient, setSavingClient] = useState(false);
  const [scheduleJobs, setScheduleJobs] = useState([]);
  const [scheduleSettings, setScheduleSettings] = useState({});
  const [dragJobId, setDragJobId] = useState(null);
  const [dragOverJobId, setDragOverJobId] = useState(null);
  const [dragQueueId, setDragQueueId] = useState(null);
  const [dragOverQueueId, setDragOverQueueId] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [competitors, setCompetitors] = useState([]);
  const [findingCompetitors, setFindingCompetitors] = useState(false);
  const [monthlyQueue, setMonthlyQueue] = useState([]);
  const [refreshingQueue, setRefreshingQueue] = useState(false);
  const [queueReplacing, setQueueReplacing] = useState(null); // id of row being replaced
  const [gapSuggestions, setGapSuggestions] = useState([]);
  const [showManualKeywordInput, setShowManualKeywordInput] = useState(false);
  const [manualKeywordText, setManualKeywordText] = useState("");
  const [manualKeywordIntent, setManualKeywordIntent] = useState("Transactional");
  const [addingManualKeyword, setAddingManualKeyword] = useState(false);
  const [queueGapLoading, setQueueGapLoading] = useState(false);

  // GBP
  const [gbpStatus, setGbpStatus] = useState({ connected: false, agencyConnected: false });
  const [gbpPost, setGbpPost] = useState({ summary: "", ctaUrl: "", ctaType: "LEARN_MORE", imageUrl: "" });
  const [gbpPosting, setGbpPosting] = useState(false);
  const [gbpPostResult, setGbpPostResult] = useState(null);
  const [gbpPosts, setGbpPosts] = useState([]);
  const [showGbpComposer, setShowGbpComposer] = useState(false);
  const [gbpLocations, setGbpLocations] = useState([]);
  const [gbpLocationsLoading, setGbpLocationsLoading] = useState(false);
  const [gbpLocationsError, setGbpLocationsError] = useState(null);
  const [gbpManualTitle, setGbpManualTitle] = useState("");
  const [gbpManualLocationId, setGbpManualLocationId] = useState("");
  const [gbpAgencyConnected, setGbpAgencyConnected] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [clientsViewMode, setClientsViewMode] = useState("grid");
  const logoInputRef = useRef(null);
  const [clientImages, setClientImages] = useState([]);
  const [clientImageCategory, setClientImageCategory] = useState("");
  const [clientImageUploading, setClientImageUploading] = useState(false);
  const clientImageInputRef = useRef(null);
  const [queueMonth, setQueueMonth] = useState("");

  // SEO Audit
  const [seoUrl, setSeoUrl] = useState("");
  const [seoClient, setSeoClient] = useState("");
  const [seoAuditLoading, setSeoAuditLoading] = useState(false);
  const [seoAudit, setSeoAudit] = useState(null);           // single-page result
  const [seoAuditError, setSeoAuditError] = useState(null);
  const [seoFixing, setSeoFixing] = useState({});
  const [seoFixResults, setSeoFixResults] = useState({});
  const [pluginBannerVisible, setPluginBannerVisible] = useState(false);
  // Site crawl audit
  const [seoMode, setSeoMode] = useState("page");           // "page" | "site"
  const [siteCrawlData, setSiteCrawlData] = useState(null);
  const [siteCrawlProgress, setSiteCrawlProgress] = useState(null);
  const [siteCrawlRunning, setSiteCrawlRunning] = useState(false);
  const [siteCrawlError, setSiteCrawlError] = useState(null);
  const [siteAuditPage, setSiteAuditPage] = useState(null); // drill into a page
  const [issueFilter, setIssueFilter] = useState("all");    // "all"|"error"|"warning"
  const [expandedIssueId, setExpandedIssueId] = useState(null); // drilled issue in Issues tab
  const siteEvtRef = useRef(null);
  const [siteIssuesPanel, setSiteIssuesPanel] = useState(null); // null | "error" | "warning" | "all"
  const [siteIssuesFixingAll, setSiteIssuesFixingAll] = useState(false);
  const [seoAuditTab, setSeoAuditTab] = useState("overview"); // "overview"|"issues"|"pages"|"statistics"

  // ── Auth session listener ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return; // don't load until authenticated
    loadClients();
    loadKeywords("HVAC");
    loadImages();
  }, [session]);

  useEffect(() => {
    loadKeywords(activeIndustry);
  }, [activeIndustry]);

  // Auth-aware fetch wrapper — automatically injects the session token
  const authFetch = async (url, options = {}) => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const token = currentSession?.access_token;
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  const loadClients = async () => {
    setClientsLoading(true);
    try {
      const res = await authFetch(`${API}/api/clients`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      console.error("Failed to load clients:", e);
    } finally {
      setClientsLoading(false);
    }
  };

  const loadKeywords = async (industry) => {
    try {
      const res = await authFetch(`${API}/api/keywords/library?industry=${industry}`);
      const data = await res.json();
      setLibrary(prev => ({ ...prev, [industry]: data.keywords || [] }));
    } catch (e) {
      console.error("Failed to load keywords:", e);
    }
  };

  const loadImages = async (industry) => {
    try {
      const url = industry ? `${API}/api/images?industry=${industry}` : `${API}/api/images`;
      const res = await fetch(url);
      const data = await res.json();
      setImages(data.images || []);
    } catch (e) {
      console.error("Failed to load images:", e);
    }
  };

  const addClient = async () => {
    if (!newClient.name.trim()) return;
    try {
      const res = await authFetch(`${API}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newClient, status: "active" }),
      });
      const data = await res.json();
      setClients(prev => [data.client, ...prev]);
      setNewClient({ name: "", industry: "HVAC", domain: "", wordpress_url: "", brand_voice: "" });
      setShowAddClient(false);
    } catch (e) {
      console.error("Failed to add client:", e);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    try {
      const res = await authFetch(`${API}/api/keywords/library`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword.trim(), industry: activeIndustry, volume: parseInt(newVolume) || 0, intent: newIntent }),
      });
      const data = await res.json();
      setLibrary(prev => ({ ...prev, [activeIndustry]: [data.keyword, ...(prev[activeIndustry] || [])] }));
      setNewKeyword("");
      setNewVolume("");
    } catch (e) {
      console.error("Failed to add keyword:", e);
    }
  };

  const removeKeyword = async (id) => {
    try {
      await authFetch(`${API}/api/keywords/library/${id}`, { method: "DELETE" });
      setLibrary(prev => ({ ...prev, [activeIndustry]: prev[activeIndustry].filter(k => k.id !== id) }));
    } catch (e) {
      console.error("Failed to remove keyword:", e);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !imageCategory.trim()) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("industry", imageIndustry);
      formData.append("category", imageCategory);
      if (imageMode === "client" && imageClientId) formData.append("client_id", imageClientId);
      const res = await authFetch(`${API}/api/images/upload`, { method: "POST", body: formData });
      const data = await res.json();
      setImages(prev => [data.image, ...prev]);
      setImageCategory("");
    } catch (e) {
      console.error("Failed to upload image:", e);
    } finally {
      setImageUploading(false);
    }
  };

  const runGapAnalysis = async () => {
    if (!gapDomain || !gapComp1) return;
    setGapLoading(true);
    setGapResults(null);
    setGapError(null);
    try {
      const url = `${API}/api/keywords/gap?domain=${encodeURIComponent(gapDomain)}&competitor1=${encodeURIComponent(gapComp1)}${gapComp2 ? "&competitor2=" + encodeURIComponent(gapComp2) : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results?.length > 0) setGapResults(data.results);
      else setGapError("No gap keywords found. Try different competitor domains.");
    } catch (e) {
      setGapError("Could not connect to backend.");
    } finally {
      setGapLoading(false);
    }
  };

  const findCompetitors = async () => {
    if (!selectedClient) return;
    setFindingCompetitors(true);
    try {
      const res = await authFetch(`${API}/api/competitors/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: selectedClient.name, industry: selectedClient.industry, domain: selectedClient.domain }),
      });
      const data = await res.json();
      if (data.competitors) {
        setCompetitors(data.competitors);
        await saveCompetitors(data.competitors);
      }
    } catch (e) { console.error("Failed to find competitors:", e); }
    setFindingCompetitors(false);
  };

  const saveCompetitors = async (list) => {
    try {
      const res = await authFetch(`${API}/api/clients/${selectedClient.id}/competitors`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitors: list }),
      });
      const data = await res.json();
      setSelectedClient(prev => ({ ...prev, competitors: data.client.competitors }));
      setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, competitors: data.client.competitors } : c));
    } catch (e) {}
  };

  const loadMonthlyQueue = async (clientId) => {
    try {
      const res = await authFetch(`${API}/api/keywords/queue/${clientId}`);
      const data = await res.json();
      setMonthlyQueue(data.keywords || []);
      setQueueMonth(data.month || "");
    } catch (e) {}
  };

  const refreshMonthlyQueue = async () => {
    if (!selectedClient) return;
    setRefreshingQueue(true);
    try {
      const res = await authFetch(`${API}/api/keywords/monthly-refresh/${selectedClient.id}`, { method: "POST" });
      const data = await res.json();
      console.log("Refresh result:", data);
      await loadMonthlyQueue(selectedClient.id);
    } catch (e) { console.error("Failed to refresh queue:", e); }
    setRefreshingQueue(false);
  };

  const addManualKeyword = async () => {
    if (!manualKeywordText.trim() || !selectedClient) return;
    setAddingManualKeyword(true);
    try {
      const res = await authFetch(`${API}/api/keywords/queue/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id, keyword: manualKeywordText.trim(), source: "manual", intent: manualKeywordIntent, volume: 0 }),
      });
      const data = await res.json();
      if (data.keyword) {
        setMonthlyQueue(prev => [...prev, data.keyword]);
        setManualKeywordText("");
        setShowManualKeywordInput(false);
      }
    } catch (e) { console.error("Failed to add manual keyword:", e); }
    setAddingManualKeyword(false);
  };

  const removeQueueItem = async (id) => {
    try {
      await authFetch(`${API}/api/keywords/queue/${id}`, { method: "DELETE" });
      setMonthlyQueue(prev => prev.filter(r => r.id !== id));
      setQueueReplacing(id);
      setGapSuggestions([]);
      // Ensure library is loaded for this client's industry
      if (selectedClient?.industry && !library[selectedClient.industry]?.length) {
        loadKeywords(selectedClient.industry);
      }
    } catch (e) { console.error("Failed to remove queue item:", e); }
  };

  const addQueueKeyword = async (keyword, source, intent, volume) => {
    if (!selectedClient) return;
    try {
      const res = await authFetch(`${API}/api/keywords/queue/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id, keyword, source, intent, volume }),
      });
      const data = await res.json();
      if (data.keyword) {
        setMonthlyQueue(prev => [...prev, data.keyword]);
        setQueueReplacing(null);
        setGapSuggestions([]);
      }
    } catch (e) { console.error("Failed to add queue keyword:", e); }
  };

  const reorderQueue = (dragId, dropId) => {
    if (dragId === dropId) return;
    const items = [...monthlyQueue];
    const dragIdx = items.findIndex(r => r.id === dragId);
    const dropIdx = items.findIndex(r => r.id === dropId);
    if (dragIdx === -1 || dropIdx === -1) return;
    const [dragged] = items.splice(dragIdx, 1);
    items.splice(dropIdx, 0, dragged);
    setMonthlyQueue(items);
  };

  const loadGapSuggestions = async () => {
    if (!selectedClient) return;
    setQueueGapLoading(true);
    setGapSuggestions([]);
    try {
      const res = await authFetch(`${API}/api/keywords/queue/gap-single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id }),
      });
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setGapSuggestions(data.suggestions);
      } else {
        setGapSuggestions(["__error__: " + (data.error || "No suggestions returned")]);
      }
    } catch (e) {
      console.error("Gap suggestions failed:", e);
      setGapSuggestions(["__error__: " + e.message]);
    }
    setQueueGapLoading(false);
  };

  const loadGbpStatus = async (clientId) => {
    try {
      const res = await authFetch(`${API}/api/gbp/status/${clientId}`);
      const data = await res.json();
      setGbpStatus(data);
      setGbpAgencyConnected(data.agencyConnected);
      if (data.connected) loadGbpPosts(clientId);
    } catch (e) {}
  };

  const checkAgencyGbp = async () => {
    try {
      const res = await authFetch(`${API}/api/gbp/agency-status`);
      const data = await res.json();
      setGbpAgencyConnected(data.connected);
    } catch (e) {}
  };

  const loadGbpPosts = async (clientId) => {
    try {
      const res = await authFetch(`${API}/api/gbp/posts/${clientId}`);
      const data = await res.json();
      setGbpPosts(data.posts || []);
    } catch (e) {}
  };

  const loadGbpLocations = async () => {
    setGbpLocationsLoading(true);
    setGbpLocationsError(null);
    try {
      const res = await authFetch(`${API}/api/gbp/locations`);
      const data = await res.json();
      if (data.error) {
        setGbpLocationsError(data.error);
      } else {
        setGbpLocations(data.locations || []);
        if ((data.locations || []).length === 0) setGbpLocationsError("No locations found in your Google Business account.");
      }
    } catch (e) {
      setGbpLocationsError("Failed to load locations: " + e.message);
    } finally {
      setGbpLocationsLoading(false);
    }
  };

  const connectAgencyGbp = () => {
    const popup = window.open(`${API}/api/gbp/oauth/start`, "gbp_oauth", "width=500,height=600,scrollbars=yes");
    const handler = async (e) => {
      if (e.data?.type === "gbp_connected") {
        window.removeEventListener("message", handler);
        setGbpAgencyConnected(true);
        await loadGbpLocations();
      } else if (e.data?.type === "gbp_error") {
        window.removeEventListener("message", handler);
        alert("GBP connection failed: " + e.data.error);
      }
    };
    window.addEventListener("message", handler);
  };

  const assignGbpLocation = async (clientId, location) => {
    await authFetch(`${API}/api/gbp/assign/${clientId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationName: location.name, locationTitle: location.title, accountName: location.accountName }),
    });
    setGbpStatus(prev => ({ ...prev, connected: true, locationTitle: location.title, locationName: location.name }));
  };

  const disconnectGbp = async (clientId) => {
    if (!window.confirm("Unassign GBP location from this client?")) return;
    await authFetch(`${API}/api/gbp/disconnect/${clientId}`, { method: "POST" });
    setGbpStatus(prev => ({ ...prev, connected: false, locationTitle: null, locationName: null }));
    setGbpPosts([]);
  };

  const submitGbpPost = async () => {
    if (!gbpPost.summary.trim() || !selectedClient) return;
    setGbpPosting(true);
    setGbpPostResult(null);
    try {
      const res = await authFetch(`${API}/api/gbp/post/${selectedClient.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gbpPost),
      });
      const data = await res.json();
      if (data.success) {
        setGbpPostResult({ ok: true, msg: "Post published to Google Business Profile!" });
        setGbpPost({ summary: "", ctaUrl: "", ctaType: "LEARN_MORE", imageUrl: "" });
        setShowGbpComposer(false);
        loadGbpPosts(selectedClient.id);
      } else {
        setGbpPostResult({ ok: false, msg: data.error || "Post failed" });
      }
    } catch (e) {
      setGbpPostResult({ ok: false, msg: "Could not connect to backend" });
    }
    setGbpPosting(false);
  };

  const uploadClientLogo = async (e, clientId) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await authFetch(`${API}/api/clients/${clientId}/logo`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.logo_url) {
        setSelectedClient(prev => ({ ...prev, logo_url: data.logo_url }));
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, logo_url: data.logo_url } : c));
      } else {
        alert("Logo upload failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      console.error("Logo upload failed:", e);
      alert("Logo upload error: " + e.message);
    }
    setLogoUploading(false);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const loadClientImages = async (clientId) => {
    try {
      const res = await authFetch(`${API}/api/images/client/${clientId}`);
      const data = await res.json();
      setClientImages(data.images || []);
    } catch (e) { console.error("Failed to load client images:", e); }
  };

  const uploadClientImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setClientImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("industry", selectedClient.industry);
      formData.append("category", clientImageCategory.trim() || "general");
      formData.append("client_id", selectedClient.id);
      const res = await authFetch(`${API}/api/images/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.image) setClientImages(prev => [data.image, ...prev]);
      setClientImageCategory("");
    } catch (e) { console.error("Failed to upload image:", e); }
    setClientImageUploading(false);
    if (clientImageInputRef.current) clientImageInputRef.current.value = "";
  };

  const deleteClientImage = async (imageId) => {
    try {
      await authFetch(`${API}/api/images/${imageId}`, { method: "DELETE" });
      setClientImages(prev => prev.filter(img => img.id !== imageId));
    } catch (e) { console.error("Failed to delete image:", e); }
  };

  // ─── SEO AUDIT ──────────────────────────────────────────────────
  const runSeoAudit = async (overrideUrl) => {
    const url = overrideUrl || seoUrl;
    if (!url || !url.trim()) return;
    setSeoUrl(url);
    setSeoAuditLoading(true);
    setSeoAudit(null);
    setSeoFixResults({});
    setSeoAuditError(null);
    try {
      const res = await authFetch(`${API}/api/seo/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), clientId: seoClient || null }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSeoAuditError(data.error || "Audit failed. Check the URL and try again.");
      } else {
        setSeoAudit(data);
      }
    } catch (e) {
      setSeoAuditError("Could not connect to backend. Make sure the server is running.");
      console.error("SEO audit failed:", e);
    }
    setSeoAuditLoading(false);
  };

  const runSiteCrawl = async (overrideUrl) => {
    const url = overrideUrl || seoUrl;
    if (!url || !url.trim()) return;
    setSeoUrl(url);
    setSiteCrawlData(null);
    setSiteCrawlProgress({ phase: "start", message: "Connecting...", pagesFound: 0, pagesDone: 0, total: 0 });
    setSiteCrawlRunning(true);
    setSiteCrawlError(null);
    setSiteAuditPage(null);
    setSeoFixResults({}); // clear fix states — crawl re-audits live page, old results are stale

    if (siteEvtRef.current) siteEvtRef.current.close();

    const token = (await supabase.auth.getSession()).data.session?.access_token || "";
    const evtUrl = `${API}/api/seo/site-audit?url=${encodeURIComponent(url.trim())}&maxPages=100&token=${encodeURIComponent(token)}`;
    const es = new EventSource(evtUrl);
    siteEvtRef.current = es;

    es.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "start") {
        setSiteCrawlProgress(p => ({ ...p, message: msg.message }));
      } else if (msg.type === "progress") {
        setSiteCrawlProgress(p => ({ ...p, phase: msg.phase, message: msg.message, total: msg.total || p?.total || 0 }));
      } else if (msg.type === "page_done") {
        setSiteCrawlProgress(p => ({ ...p, pagesDone: msg.progress, total: msg.total, message: `Auditing pages… ${msg.progress}/${msg.total}` }));
      } else if (msg.type === "complete") {
        setSiteCrawlData(msg);
        setSiteCrawlRunning(false);
        setSiteCrawlProgress(null);
        es.close();
      } else if (msg.type === "error") {
        setSiteCrawlError(msg.message);
        setSiteCrawlRunning(false);
        setSiteCrawlProgress(null);
        es.close();
      }
    };
    es.onerror = () => {
      setSiteCrawlError("Connection to audit server lost. Check that the backend is running.");
      setSiteCrawlRunning(false);
      setSiteCrawlProgress(null);
      es.close();
    };
  };

  // fixKey = "pageUrl::issueId" so fixes on different pages don't collide
  const fixKey = (pageUrl, issueId) => `${pageUrl}::${issueId}`;

  const fixSeoIssue = async (issue, pageUrl) => {
    const targetUrl = (pageUrl || seoUrl || "").trim();
    const key = fixKey(targetUrl, issue.id);
    const client = clients.find(c => c.id === seoClient);
    if (!client?.wordpress_url || !client?.wordpress_username || !client?.wordpress_password) {
      setSeoFixResults(prev => ({ ...prev, [key]: "no_creds" }));
      return;
    }
    setSeoFixing(prev => ({ ...prev, [key]: true }));
    try {
      const res = await authFetch(`${API}/api/seo/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue,
          url: targetUrl,
          clientId: seoClient || null,
          wordpressUrl: client.wordpress_url,
          wpUsername: client.wordpress_username,
          wpPassword: client.wordpress_password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const fixState = data.verified === false ? "fixed_unverified" : "fixed";
        setSeoFixResults(prev => ({
          ...prev,
          [key]: fixState,
          [key+"_attempts"]: data.attempts || [],
        }));
        setSiteCrawlData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            pages: prev.pages.map(p => {
              if (p.url !== targetUrl) return p;
              return { ...p, issues: p.issues.map(i => i.id !== issue.id ? i : { ...i, severity: "pass", description: i.description + " ✓ Fixed" }) };
            })
          };
        });
      } else {
        const errState = data.code === "POST_NOT_FOUND" ? "not_found" : data.code === "YOAST_WRITE_FAILED" ? "plugin_needed" : (data.code || "error");
        setSeoFixResults(prev => ({ ...prev, [key]: errState, [key+"_msg"]: data.error || "Fix failed" }));
        if (data.pluginRequired) setPluginBannerVisible(true);
        console.error("[Fix error]", data.error, data.code);
      }
    } catch (e) {
      setSeoFixResults(prev => ({ ...prev, [key]: "error", [key+"_msg"]: e.message }));
      console.error("[Fix catch]", e);
    }
    setSeoFixing(prev => ({ ...prev, [key]: false }));
  };

  const fixAllSeoIssues = async () => {
    if (!seoAudit) return;
    const client = clients.find(c => c.id === seoClient);
    if (!client?.wordpress_url || !client?.wordpress_username || !client?.wordpress_password) return;
    const fixableIssues = seoAudit.issues.filter(
      i => i.fixable && i.fixType !== "alt_tags" && !["fixed","fixed_unverified"].includes(seoFixResults[i.id])
    );
    for (const issue of fixableIssues) {
      await fixSeoIssue(issue);
    }
  };

  const loadScheduleJobs = async (clientId) => {
    try {
      const res = await authFetch(`${API}/api/schedule/${clientId}`);
      const data = await res.json();
      setScheduleJobs(data.jobs || []);
    } catch (e) {}
  };

  const reorderScheduleJobs = async (dragId, dropId) => {
    if (dragId === dropId) return;
    const jobs = [...scheduleJobs];
    const dragIdx = jobs.findIndex(j => j.id === dragId);
    const dropIdx = jobs.findIndex(j => j.id === dropId);
    if (dragIdx === -1 || dropIdx === -1) return;
    // Only reorder pending jobs — swap their scheduled_times so DB order is preserved
    const dragJob = jobs[dragIdx];
    const dropJob = jobs[dropIdx];
    if (dragJob.status !== "pending" || dropJob.status !== "pending") return;
    // Swap times in local state immediately
    const dragTime = dragJob.scheduled_time;
    const dropTime = dropJob.scheduled_time;
    jobs[dragIdx] = { ...dragJob, scheduled_time: dropTime };
    jobs[dropIdx] = { ...dropJob, scheduled_time: dragTime };
    // Re-sort by scheduled_time descending to match server order
    jobs.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
    setScheduleJobs(jobs);
    // Persist both swapped times to DB
    try {
      await Promise.all([
        authFetch(`${API}/api/schedule/job/${dragJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduled_time: dropTime }),
        }),
        authFetch(`${API}/api/schedule/job/${dropJob.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduled_time: dragTime }),
        }),
      ]);
    } catch (e) { console.error("Reorder failed:", e); }
  };

  const toggleSchedule = async (clientId, enabled) => {
    try {
      const res = await authFetch(`${API}/api/schedule/${clientId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      setSelectedClient(prev => ({ ...prev, schedule_enabled: data.client.schedule_enabled }));
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, schedule_enabled: data.client.schedule_enabled } : c));
    } catch (e) {}
  };

  const saveScheduleSettings = async () => {
    setSavingSchedule(true);
    try {
      const res = await authFetch(`${API}/api/schedule/${selectedClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleSettings),
      });
      const data = await res.json();
      setSelectedClient(prev => ({ ...prev, ...data.client }));
    } catch (e) {}
    setSavingSchedule(false);
  };

  const startEditClient = () => {
    setClientEdits({
      wordpress_url: selectedClient.wordpress_url || "",
      wordpress_username: selectedClient.wordpress_username || "",
      wordpress_password: selectedClient.wordpress_password || "",
      brand_voice: selectedClient.brand_voice || "",
      domain: selectedClient.domain || "",
    });
    setEditingClient(true);
  };

  const saveClientEdits = async () => {
    setSavingClient(true);
    try {
      const res = await authFetch(`${API}/api/clients/${selectedClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientEdits),
      });
      const data = await res.json();
      setSelectedClient({ ...selectedClient, ...data.client });
      setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, ...data.client } : c));
      setEditingClient(false);
    } catch (e) {
      console.error("Failed to save client:", e);
    } finally {
      setSavingClient(false);
    }
  };

  const publishToWordPress = async () => {
    console.log("Publish clicked", { generatedPost: !!generatedPost, activeClient });
    if (!generatedPost || !activeClient) {
      alert("Missing post or client data. Please regenerate the post.");
      return;
    }
    if (!activeClient.wordpress_url) {
      alert("No WordPress URL set for this client. Edit the client profile to add one.");
      return;
    }
    setPublishLoading(true);
    setPublishResult(null);
    try {
      const res = await authFetch(`${API}/api/publish/wordpress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: generatedPost.id,
          clientId: activeClient.id,
          title: generatedPost.title,
          content: generatedPost.content,
          slug: generatedPost.slug,
          metaDescription: generatedPost.metaDescription,
          keyword: generatingPost,
          wordpressUrl: activeClient.wordpress_url,
          wpUsername: activeClient.wordpress_username || activeClient.wp_username,
          wpPassword: activeClient.wordpress_password || activeClient.wp_password,
          featuredImageUrl: featuredImage?.storage_path || null,
          featuredImageSlug: generatedPost?.slug || null,
          featuredImageId: featuredImage?.id || null,
          industry: activeClient?.industry || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishResult({ success: true, url: data.wpPostUrl, qa: data.qa || null, repairHistory: data.repairHistory || [] });
        loadClients();
      } else {
        setPublishResult({ success: false, error: data.detail || data.error });
      }
    } catch (e) {
      setPublishResult({ success: false, error: "Could not connect to backend." });
    } finally {
      setPublishLoading(false);
    }
  };

  const generatePost = async (keyword, client) => {
    setGeneratingPost(keyword);
    setGeneratedPost(null);
    setFeaturedImage(null);
    setPublishResult(null);
    setActiveClient(client);
    setContentLoading(true);
    setContentError(null);
    setActiveTab("content");
    setSelectedClient(null);
    try {
      const res = await authFetch(`${API}/api/content/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          industry: client.industry,
          clientName: client.name,
          clientId: client.id,
          brandVoice: client.brand_voice || "",
          wordpressUrl: client.wordpress_url || "",
        }),
      });
      const data = await res.json();
      if (data.post) {
        setGeneratedPost(data.post);
        setFeaturedImage(data.featuredImage);
        loadClients();
      } else {
        setContentError(data.error || "Failed to generate post.");
      }
    } catch (e) {
      setContentError("Could not connect to backend.");
    } finally {
      setContentLoading(false);
    }
  };

  const handleLibSort = (field) => {
    if (libSortField === field) setLibSortDir(libSortDir === "asc" ? "desc" : "asc");
    else { setLibSortField(field); setLibSortDir("desc"); }
  };

  const getSortedLibrary = (keywords) => {
    if (!keywords) return [];
    return [...keywords].sort((a, b) => {
      if (libSortField === "volume") return libSortDir === "asc" ? a.volume - b.volume : b.volume - a.volume;
      if (libSortField === "keyword") return libSortDir === "asc" ? a.keyword.localeCompare(b.keyword) : b.keyword.localeCompare(a.keyword);
      return 0;
    });
  };

  const getIntentColor = (intent) => {
    if (intent === "Transactional") return "#22c55e";
    if (intent === "Commercial") return "#f59e0b";
    return "#60a5fa";
  };

  const totalKeywords = Object.values(library).reduce((a, b) => a + (b?.length || 0), 0);

  // Loading auth state
  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d60000", animation: "pulse 1s infinite" }} />
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <LoginScreen onLogin={(s) => setSession(s)} />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div style={styles.root}>
      {/* Mobile backdrop */}
      {mobileMenuOpen && <div className="f-backdrop" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <div className={`f-sidebar${mobileMenuOpen ? " open" : ""}`} style={{ width: sidebarOpen ? 240 : 64 }}>
        <div style={styles.logo}>
          {sidebarOpen ? <div><div style={styles.logoText}>FORTITUDE</div><div style={styles.logoSub}>CREATIVE</div></div> : <div style={styles.logoIcon}>F</div>}
          <div style={{ display: "flex", gap: 6 }}>
            <button className="f-close-btn" style={{ display: "none", background: "none", border: "1px solid #2a2a2a", color: "#555", cursor: "pointer", padding: "4px 8px", fontSize: 12 }} onClick={() => setMobileMenuOpen(false)}>✕</button>
            <button style={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? "←" : "→"}</button>
          </div>
        </div>
        <nav style={styles.nav}>
          {[
            { id: "clients", icon: "◈", label: "Clients" },
            { id: "library", icon: "⌕", label: "Keyword Library" },
            { id: "gap", icon: "⊕", label: "Competitor Gap" },
            { id: "content", icon: "✦", label: "Content" },
            { id: "seo", icon: "◎", label: "SEO Audit" },
            { id: "publishing", icon: "⟳", label: "Publishing" },
            { id: "settings", icon: "⚙", label: "Settings" },
          ].map((item) => (
            <button key={item.id} style={{ ...styles.navItem, ...(activeTab === item.id ? styles.navItemActive : {}) }} onClick={() => { setActiveTab(item.id); setSelectedClient(null); setMobileMenuOpen(false); }}>
              <span style={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span style={styles.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && (
          <div style={styles.sidebarFooter}>
            <div style={styles.apiStatus}><div style={styles.statusDot} /><span style={styles.statusText}>Connected</span></div>
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.08em", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.email}</div>
              <button
                onClick={handleLogout}
                style={{ fontSize: 10, color: "#555", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", padding: 0, fontFamily: "'Barlow Condensed', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = "#d60000"}
                onMouseLeave={e => e.currentTarget.style.color = "#555"}
              >Sign Out →</button>
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="f-main">
        <div style={styles.header} className="f-header-pad">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="f-hamburger" onClick={() => setMobileMenuOpen(true)}>☰</button>
            <div>
              <div style={styles.headerTitle}>
              {activeTab === "clients" && !selectedClient && "Client Management"}
              {activeTab === "clients" && selectedClient && selectedClient.name}
              {activeTab === "library" && "Keyword Library"}
              {activeTab === "images" && "Image Library"}
              {activeTab === "gap" && "Competitor Gap Analysis"}
              {activeTab === "content" && "Content Pipeline"}
              {activeTab === "publishing" && "Auto Publishing"}
              {activeTab === "settings" && "Settings"}
              {activeTab === "seo" && "SEO Audit"}
            </div>
            <div style={styles.headerSub}>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          </div>
          <div className="f-header-badge" style={styles.headerRight}>
            <div style={styles.headerBadge}>{clients.filter(c => c.status === "active").length} Active Clients</div>
          </div>
        </div>

        <div style={styles.content} className="f-content-pad">

          {/* CLIENTS */}
          {activeTab === "clients" && !selectedClient && (
            <div>
              <div className="f-stats-grid">
                {[
                  { label: "Total Clients", value: clients.length, icon: "◈" },
                  { label: "Keywords", value: totalKeywords, icon: "⌕" },
                  { label: "Images", value: images.length, icon: "◻" },
                  { label: "Posts Published", value: clients.reduce((a, c) => a + (c.posts_published || 0), 0), icon: "✦" },
                ].map((stat) => (
                  <div key={stat.label} style={styles.statCard}>
                    <div style={styles.statIcon}>{stat.icon}</div>
                    <div style={styles.statValue}>{stat.value}</div>
                    <div style={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={styles.sectionHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={styles.sectionTitle}>All Clients</div>
                  <div style={{ display: "flex", border: "1px solid #222", borderRadius: 4, overflow: "hidden" }}>
                    <button onClick={() => setClientsViewMode("grid")} style={{ padding: "4px 10px", background: clientsViewMode === "grid" ? "#d60000" : "none", border: "none", color: clientsViewMode === "grid" ? "#fff" : "#555", cursor: "pointer", fontSize: 14, lineHeight: 1 }} title="Grid view">⊞</button>
                    <button onClick={() => setClientsViewMode("list")} style={{ padding: "4px 10px", background: clientsViewMode === "list" ? "#d60000" : "none", border: "none", color: clientsViewMode === "list" ? "#fff" : "#555", cursor: "pointer", fontSize: 14, lineHeight: 1 }} title="List view">☰</button>
                  </div>
                </div>
                <button style={styles.addBtn} onClick={() => setShowAddClient(!showAddClient)}>+ Add Client</button>
              </div>

              {showAddClient && (
                <div style={styles.addClientForm}>
                  <div className="f-form-grid" style={styles.formGrid}>
                    <input style={styles.searchInput} placeholder="Client name" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
                    <select style={styles.selectInput} value={newClient.industry} onChange={e => setNewClient({ ...newClient, industry: e.target.value })}>
                      {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                    </select>
                    <input style={styles.searchInput} placeholder="Domain (e.g. clientsite.com)" value={newClient.domain} onChange={e => setNewClient({ ...newClient, domain: e.target.value })} />
                    <input style={styles.searchInput} placeholder="WordPress URL (e.g. https://clientsite.com)" value={newClient.wordpress_url} onChange={e => setNewClient({ ...newClient, wordpress_url: e.target.value })} />
                  </div>
                  <textarea style={styles.textArea} placeholder="Brand voice (tone, style, keywords to use...)" value={newClient.brand_voice} onChange={e => setNewClient({ ...newClient, brand_voice: e.target.value })} />
                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <button style={styles.addBtn} onClick={addClient}>Save Client</button>
                    <button style={{ ...styles.addBtn, background: "none", border: "1px solid #333", color: "#666" }} onClick={() => setShowAddClient(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {clientsLoading ? (
                <div style={styles.comingSoon}><div style={styles.comingSoonSub}>Loading clients...</div></div>
              ) : clients.length === 0 ? (
                <div style={styles.comingSoon}>
                  <div style={styles.comingSoonIcon}>◈</div>
                  <div style={styles.comingSoonTitle}>No Clients Yet</div>
                  <div style={styles.comingSoonSub}>Click "Add Client" to get started.</div>
                </div>
              ) : clientsViewMode === "grid" ? (
                <div style={styles.clientGrid}>
                  {clients.map((client) => {
                    const handleClientClick = () => {
                      setSelectedClient(client);
                      loadScheduleJobs(client.id);
                      loadMonthlyQueue(client.id);
                      loadGbpStatus(client.id);
                      loadClientImages(client.id);
                      setGbpPostResult(null);
                      setShowGbpComposer(false);
                      setCompetitors(client.competitors || []);
                      setScheduleSettings({
                        schedule_frequency: client.schedule_frequency || "daily",
                        schedule_days: client.schedule_days || ["Mon","Tue","Wed","Thu","Fri"],
                        schedule_start_hour: client.schedule_start_hour || 9,
                        schedule_end_hour: client.schedule_end_hour || 12,
                        schedule_timezone: client.schedule_timezone || "America/New_York",
                      });
                    };
                    return (
                      <div key={client.id} style={styles.clientCard} onClick={handleClientClick} onMouseEnter={e => e.currentTarget.style.borderColor = "#dc2626"} onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}>
                        <div style={styles.clientCardTop}>
                          <div style={styles.clientAvatar}>
                            {client.logo_url
                              ? <img src={client.logo_url} alt={client.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                              : client.name.charAt(0)}
                          </div>
                          <div style={{ ...styles.clientStatus, background: client.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: client.status === "active" ? "#22c55e" : "#f59e0b" }}>{client.status}</div>
                        </div>
                        <div style={styles.clientName}>{client.name}</div>
                        <div style={styles.clientIndustry}>{client.industry}</div>
                        <div style={styles.clientStats}>
                          <div style={styles.clientStat}>
                            <div style={styles.clientStatValue}>{library[client.industry]?.length || 0}</div>
                            <div style={styles.clientStatLabel}>Keywords</div>
                          </div>
                          <div style={styles.clientStatDivider} />
                          <div style={styles.clientStat}>
                            <div style={styles.clientStatValue}>{client.posts_published || 0}</div>
                            <div style={styles.clientStatLabel}>Posts</div>
                          </div>
                        </div>
                        <div style={styles.clientArrow}>View Client →</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {clients.map((client) => {
                    const handleClientClick = () => {
                      setSelectedClient(client);
                      loadScheduleJobs(client.id);
                      loadMonthlyQueue(client.id);
                      loadGbpStatus(client.id);
                      setGbpPostResult(null);
                      setShowGbpComposer(false);
                      setCompetitors(client.competitors || []);
                      setScheduleSettings({
                        schedule_frequency: client.schedule_frequency || "daily",
                        schedule_days: client.schedule_days || ["Mon","Tue","Wed","Thu","Fri"],
                        schedule_start_hour: client.schedule_start_hour || 9,
                        schedule_end_hour: client.schedule_end_hour || 12,
                        schedule_timezone: client.schedule_timezone || "America/New_York",
                      });
                    };
                    return (
                      <div key={client.id} onClick={handleClientClick}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.background = "#111"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.background = "#0d0d0d"; }}
                        style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", background: "#0d0d0d", borderTop: "2px solid #1a1a1a", cursor: "pointer", transition: "all 0.15s" }}>
                        <div style={{ ...styles.clientAvatar, flexShrink: 0, width: 36, height: 36, fontSize: 15 }}>
                          {client.logo_url
                            ? <img src={client.logo_url} alt={client.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }} />
                            : client.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{client.name}</div>
                          <div style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{client.industry} · {client.domain || "No domain"}</div>
                        </div>
                        <div style={{ display: "flex", gap: 24, alignItems: "center", flexShrink: 0 }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif" }}>{library[client.industry]?.length || 0}</div>
                            <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>Keywords</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif" }}>{client.posts_published || 0}</div>
                            <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>Posts</div>
                          </div>
                          <div style={{ ...styles.clientStatus, background: client.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: client.status === "active" ? "#22c55e" : "#f59e0b" }}>{client.status}</div>
                          <div style={{ color: "#d60000", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>→</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CLIENT DETAIL */}
          {activeTab === "clients" && selectedClient && (
            <div>
              <button style={styles.backBtn} onClick={() => setSelectedClient(null)}>← Back to Clients</button>
              <div style={styles.clientDetail} className="f-client-detail-pad">
                <div style={styles.clientDetailHeader} className="f-client-detail-header">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ ...styles.clientDetailAvatar, overflow: "hidden", position: "relative", cursor: "pointer" }}
                      onClick={() => logoInputRef.current && logoInputRef.current.click()}
                      title="Click to upload logo">
                      {selectedClient.logo_url
                        ? <img src={selectedClient.logo_url} alt={selectedClient.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
                        : selectedClient.name.charAt(0)}
                      {logoUploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>...</div>}
                      <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadClientLogo(e, selectedClient.id)} />
                    </div>
                    <div style={{ fontSize: 9, color: "#d60000", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", cursor: "pointer" }}
                      onClick={() => logoInputRef.current && logoInputRef.current.click()}>
                      {logoUploading ? "Uploading..." : "Upload Logo"}
                    </div>
                  </div>
                  <div>
                    <div style={styles.clientDetailName}>{selectedClient.name}</div>
                    <div style={styles.clientDetailIndustry}>{selectedClient.industry} · {selectedClient.domain || "No domain set"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  {!editingClient ? (
                    <button style={{ ...styles.connectBtn, fontSize: 12, padding: "8px 16px" }} onClick={startEditClient}>✎ Edit Client</button>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...styles.addBtn, background: "none", border: "1px solid #333", color: "#666", fontSize: 12 }} onClick={() => setEditingClient(false)}>Cancel</button>
                      <button style={{ ...styles.addBtn, fontSize: 12 }} onClick={saveClientEdits} disabled={savingClient}>{savingClient ? "Saving..." : "Save Changes"}</button>
                    </div>
                  )}
                </div>

                {editingClient ? (
                  <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 24, marginBottom: 24 }}>
                    <div style={{ fontSize: 11, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Edit Client Settings</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <div style={styles.postMetaLabel}>Domain</div>
                        <input style={{ ...styles.searchInput, marginTop: 6 }} value={clientEdits.domain} onChange={e => setClientEdits({ ...clientEdits, domain: e.target.value })} placeholder="clientsite.com" />
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>WordPress URL</div>
                        <input style={{ ...styles.searchInput, marginTop: 6 }} value={clientEdits.wordpress_url} onChange={e => setClientEdits({ ...clientEdits, wordpress_url: e.target.value })} placeholder="https://clientsite.com" />
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>WordPress Username</div>
                        <input style={{ ...styles.searchInput, marginTop: 6 }} value={clientEdits.wordpress_username} onChange={e => setClientEdits({ ...clientEdits, wordpress_username: e.target.value })} placeholder="admin username" />
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>WordPress App Password</div>
                        <input style={{ ...styles.searchInput, marginTop: 6 }} type="password" value={clientEdits.wordpress_password} onChange={e => setClientEdits({ ...clientEdits, wordpress_password: e.target.value })} placeholder="xxxx xxxx xxxx xxxx" />
                      </div>
                    </div>
                    <div>
                      <div style={styles.postMetaLabel}>Brand Voice</div>
                      <textarea style={{ ...styles.textArea, marginTop: 6 }} value={clientEdits.brand_voice} onChange={e => setClientEdits({ ...clientEdits, brand_voice: e.target.value })} placeholder="Describe the client's tone, style, and any specific keywords or phrases to use..." />
                    </div>
                  </div>
                ) : (
                  <div className="f-detail-grid" style={styles.detailGrid}>
                    {[
                      { label: "WordPress", status: selectedClient.wordpress_url && selectedClient.wordpress_username ? "Connected" : "Not Connected", icon: "W" },
                      { label: "Google Business", status: gbpStatus.connected ? "Connected" : "Not Connected", icon: "G", gbp: true },
                      { label: "Brand Voice", status: selectedClient.brand_voice ? "Set" : "Not Set", icon: "✦" },
                      { label: "SEMrush", status: "Ready", icon: "S" },
                    ].map((item) => (
                      <div key={item.label} style={styles.integrationCard}>
                        <div style={styles.integrationIcon}>{item.icon}</div>
                        <div style={styles.integrationLabel}>{item.label}</div>
                        <div style={{ ...styles.integrationStatus, color: item.status === "Connected" || item.status === "Ready" || item.status === "Set" ? "#22c55e" : "#666" }}>{item.status}</div>
                        <button style={styles.connectBtn} onClick={() => {
                          if (item.gbp) {
                            if (!gbpAgencyConnected) {
                              connectAgencyGbp();
                            } else if (gbpStatus.connected) {
                              disconnectGbp(selectedClient.id);
                            } else {
                              loadGbpLocations().then(() => {});
                            }
                          } else {
                            startEditClient();
                          }
                        }}>
                          {item.gbp
                            ? (!gbpAgencyConnected ? "Connect Google" : gbpStatus.connected ? "Unassign" : "Assign Location")
                            : (item.status === "Not Connected" || item.status === "Not Set" ? "Connect" : "Configure")}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!editingClient && selectedClient.brand_voice && (
                  <div style={{ marginBottom: 24, padding: 16, background: "#111", borderRadius: 8, border: "1px solid #1f1f1f" }}>
                    <div style={styles.postMetaLabel}>Brand Voice</div>
                    <div style={{ fontSize: 13, color: "#aaa", marginTop: 8, lineHeight: 1.6 }}>{selectedClient.brand_voice}</div>
                  </div>
                )}

                {/* SCHEDULING */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={styles.sectionTitle}>Publishing Schedule</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: selectedClient.schedule_enabled ? "#22c55e" : "#555" }}>
                        {selectedClient.schedule_enabled ? "● Active" : "○ Inactive"}
                      </span>
                      <button style={{ ...styles.connectBtn, background: selectedClient.schedule_enabled ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", borderColor: selectedClient.schedule_enabled ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)", color: selectedClient.schedule_enabled ? "#ef4444" : "#22c55e" }}
                        onClick={() => toggleSchedule(selectedClient.id, !selectedClient.schedule_enabled)}>
                        {selectedClient.schedule_enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                  <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                      <div>
                        <div style={styles.postMetaLabel}>Frequency</div>
                        <select style={{ ...styles.selectInput, width: "100%", marginTop: 6 }} value={scheduleSettings.schedule_frequency || "daily"} onChange={async e => {
                          const newSettings = { ...scheduleSettings, schedule_frequency: e.target.value };
                          setScheduleSettings(newSettings);
                          try { const res = await authFetch(`${API}/api/schedule/${selectedClient.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSettings) }); const data = await res.json(); setSelectedClient(prev => ({ ...prev, ...data.client })); } catch(e) {}
                        }}>
                          <option value="daily">Daily</option>
                          <option value="every_other_day">Every Other Day</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>Publish Window Start</div>
                        <select style={{ ...styles.selectInput, width: "100%", marginTop: 6 }} value={scheduleSettings.schedule_start_hour || 9} onChange={async e => {
                          const newSettings = { ...scheduleSettings, schedule_start_hour: parseInt(e.target.value) };
                          setScheduleSettings(newSettings);
                          try { const res = await authFetch(`${API}/api/schedule/${selectedClient.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSettings) }); const data = await res.json(); setSelectedClient(prev => ({ ...prev, ...data.client })); } catch(e) {}
                        }}>
                          {[6,7,8,9,10,11,12,13,14,15,16,17].map(h => <option key={h} value={h}>{h > 12 ? `${h-12}pm` : h === 12 ? "12pm" : `${h}am`}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>Publish Window End</div>
                        <select style={{ ...styles.selectInput, width: "100%", marginTop: 6 }} value={scheduleSettings.schedule_end_hour || 12} onChange={async e => {
                          const newSettings = { ...scheduleSettings, schedule_end_hour: parseInt(e.target.value) };
                          setScheduleSettings(newSettings);
                          try { const res = await authFetch(`${API}/api/schedule/${selectedClient.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSettings) }); const data = await res.json(); setSelectedClient(prev => ({ ...prev, ...data.client })); } catch(e) {}
                        }}>
                          {[7,8,9,10,11,12,13,14,15,16,17,18].map(h => <option key={h} value={h}>{h > 12 ? `${h-12}pm` : h === 12 ? "12pm" : `${h}am`}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={styles.postMetaLabel}>Publish Days</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => {
                          const days = scheduleSettings.schedule_days || ["Mon","Tue","Wed","Thu","Fri"];
                          const active = days.includes(day);
                          return (
                            <button key={day} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit", border: "1px solid", background: active ? "rgba(220,38,38,0.1)" : "none", borderColor: active ? "rgba(220,38,38,0.3)" : "#1f1f1f", color: active ? "#dc2626" : "#555" }}
                              onClick={async () => {
                                const updated = active ? days.filter(d => d !== day) : [...days, day];
                                const newSettings = { ...scheduleSettings, schedule_days: updated };
                                setScheduleSettings(newSettings);
                                try {
                                  const res = await authFetch(`${API}/api/schedule/${selectedClient.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSettings) });
                                  const data = await res.json();
                                  setSelectedClient(prev => ({ ...prev, ...data.client }));
                                } catch (e) {}
                              }}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>✓ Changes save automatically</div>
                  </div>

                  {scheduleJobs.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", marginBottom: 10 }}>SCHEDULED JOBS</div>
                      <div style={styles.table}>
                        <div style={styles.tableHeader}>
                          <div style={{ flex: "0 0 20px" }}></div>
                          <div style={{ flex: 3 }}>Keyword</div>
                          <div style={{ flex: 2 }}>Scheduled Time</div>
                          <div style={{ flex: 1, textAlign: "center" }}>Status</div>
                        </div>
                        {scheduleJobs.map(job => (
                          <div
                            key={job.id}
                            draggable={job.status === "pending"}
                            onDragStart={() => { if (job.status === "pending") setDragJobId(job.id); }}
                            onDragOver={e => { e.preventDefault(); if (job.status === "pending") setDragOverJobId(job.id); }}
                            onDragLeave={() => setDragOverJobId(null)}
                            onDrop={() => { reorderScheduleJobs(dragJobId, job.id); setDragJobId(null); setDragOverJobId(null); }}
                            onDragEnd={() => { setDragJobId(null); setDragOverJobId(null); }}
                            style={{
                              ...styles.tableRow,
                              cursor: job.status === "pending" ? "grab" : "default",
                              borderLeft: dragOverJobId === job.id && dragJobId !== job.id ? "2px solid #d60000" : "2px solid transparent",
                              opacity: dragJobId === job.id ? 0.4 : 1,
                              transition: "border-color 0.1s, opacity 0.1s",
                            }}
                          >
                            <div style={{ flex: "0 0 20px", color: job.status === "pending" ? "#333" : "transparent", fontSize: 13, userSelect: "none" }}>⠿</div>
                            <div style={{ flex: 3, color: "#fff" }}>{job.keyword}</div>
                            <div style={{ flex: 2, color: "#aaa" }}>{new Date(job.scheduled_time).toLocaleString()}</div>
                            <div style={{ flex: 1, textAlign: "center" }}>
                              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid", color: job.status === "published" ? "#22c55e" : job.status === "failed" ? "#ef4444" : job.status === "running" ? "#f59e0b" : "#555", background: job.status === "published" ? "rgba(34,197,94,0.1)" : job.status === "failed" ? "rgba(239,68,68,0.1)" : job.status === "running" ? "rgba(245,158,11,0.1)" : "#111", borderColor: job.status === "published" ? "rgba(34,197,94,0.2)" : job.status === "failed" ? "rgba(239,68,68,0.2)" : "#1f1f1f" }}>
                                {job.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* COMPETITORS */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={styles.sectionTitle}>Competitors</div>
                    <button style={styles.connectBtn} onClick={findCompetitors} disabled={findingCompetitors}>
                      {findingCompetitors ? "Searching..." : "⟳ Auto-Find"}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {competitors.map((comp, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#111", border: "1px solid #1f1f1f", borderRadius: 6, padding: "6px 12px" }}>
                        <span style={{ fontSize: 12, color: "#ccc" }}>{comp}</span>
                        <button style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, lineHeight: 1 }} onClick={() => { const updated = competitors.filter((_, idx) => idx !== i); setCompetitors(updated); saveCompetitors(updated); }}>×</button>
                      </div>
                    ))}
                    {competitors.length < 5 && (
                      <button style={{ ...styles.connectBtn, fontSize: 11 }} onClick={() => {
                        const domain = prompt("Enter competitor domain (e.g. competitor.com):");
                        if (domain && competitors.length < 5) { const updated = [...competitors, domain.trim()]; setCompetitors(updated); saveCompetitors(updated); }
                      }}>+ Add</button>
                    )}
                  </div>
                  {competitors.length > 0 && <div style={{ fontSize: 11, color: "#444" }}>{competitors.length}/5 competitors saved. Monthly keyword refresh uses these to find gaps.</div>}
                </div>

                {/* GOOGLE BUSINESS PROFILE POSTS */}
                {gbpAgencyConnected && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <div style={styles.sectionTitle}>Google Business Profile</div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
                          {gbpStatus.connected ? gbpStatus.locationTitle : "No location assigned"}
                        </div>
                      </div>
                      {gbpStatus.connected && (
                        <button style={styles.addBtn} onClick={() => { setShowGbpComposer(!showGbpComposer); setGbpPostResult(null); }}>
                          {showGbpComposer ? "Cancel" : "+ New Post"}
                        </button>
                      )}
                    </div>

                    {!gbpStatus.connected && (
                      <div style={{ background: "#0d0d0d", borderTop: "3px solid #d60000", padding: 20, marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: "#d60000", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 12 }}>
                          Assign GBP Location to This Client
                        </div>

                        {/* Manual entry — always shown first */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, color: "#666", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", marginBottom: 8 }}>
                            BUSINESS NAME (display label)
                          </div>
                          <input
                            style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#fff", padding: "10px 12px", fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif", borderRadius: 4, boxSizing: "border-box", marginBottom: 10 }}
                            placeholder="e.g. David & Goliath HVAC"
                            value={gbpManualTitle || ""}
                            onChange={e => setGbpManualTitle(e.target.value)}
                          />
                          <div style={{ fontSize: 11, color: "#666", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", marginBottom: 8 }}>
                            GBP LOCATION ID — find it at <span style={{ color: "#d60000" }}>business.google.com → Info → Business Profile ID</span>
                          </div>
                          <input
                            style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#fff", padding: "10px 12px", fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif", borderRadius: 4, boxSizing: "border-box", marginBottom: 10 }}
                            placeholder="e.g. 12345678901234567"
                            value={gbpManualLocationId || ""}
                            onChange={e => setGbpManualLocationId(e.target.value.trim())}
                          />
                          <button
                            style={{ ...styles.addBtn, opacity: (gbpManualTitle && gbpManualLocationId) ? 1 : 0.4 }}
                            disabled={!gbpManualTitle || !gbpManualLocationId}
                            onClick={() => {
                              const loc = {
                                name: `locations/${gbpManualLocationId}`,
                                title: gbpManualTitle,
                                accountName: "",
                              };
                              assignGbpLocation(selectedClient.id, loc);
                            }}
                          >
                            Assign Location
                          </button>
                        </div>

                        {/* Auto-load fallback */}
                        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 14, marginTop: 4 }}>
                          <div style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", marginBottom: 8 }}>OR AUTO-DETECT FROM YOUR ACCOUNT</div>
                          <button style={styles.searchBtn} onClick={loadGbpLocations} disabled={gbpLocationsLoading}>
                            {gbpLocationsLoading ? "Loading..." : "Load My Locations"}
                          </button>
                          {gbpLocationsError && (
                            <div style={{ marginTop: 10, padding: "10px 14px", background: "#1a0000", border: "1px solid #d60000", borderRadius: 4, fontSize: 11, color: "#ff6b6b", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>
                              ⚠ {gbpLocationsError}{gbpLocationsError.includes("429") ? " — Google rate limit. Wait 1 min and retry, or use manual entry above." : ""}
                            </div>
                          )}
                          {gbpLocations.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                              {gbpLocations.map((loc, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#111", borderLeft: "2px solid #1a1a1a" }}>
                                  <div>
                                    <div style={{ fontSize: 13, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.05em" }}>{loc.title}</div>
                                    {loc.address && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{loc.address}</div>}
                                    <div style={{ fontSize: 10, color: "#333", marginTop: 2, fontFamily: "monospace" }}>{loc.name}</div>
                                  </div>
                                  <button style={styles.addBtn} onClick={() => assignGbpLocation(selectedClient.id, loc)}>Assign</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {showGbpComposer && gbpStatus.connected && (
                      <div style={{ background: "#0d0d0d", borderTop: "3px solid #d60000", padding: 24, marginBottom: 16 }}>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 10, color: "#d60000", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 8 }}>Post Content</div>
                          <textarea style={{ ...styles.textArea, minHeight: 120 }} placeholder="Write your Google Business update... (max 1500 characters)" maxLength={1500} value={gbpPost.summary} onChange={e => setGbpPost({ ...gbpPost, summary: e.target.value })} />
                          <div style={{ fontSize: 10, color: "#444", textAlign: "right", marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>{gbpPost.summary.length}/1500</div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 12, marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: 10, color: "#d60000", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 8 }}>Call-To-Action URL (optional)</div>
                            <input style={styles.searchInput} placeholder="https://yoursite.com/contact" value={gbpPost.ctaUrl} onChange={e => setGbpPost({ ...gbpPost, ctaUrl: e.target.value })} />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: "#d60000", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 8 }}>CTA Type</div>
                            <select style={styles.selectInput} value={gbpPost.ctaType} onChange={e => setGbpPost({ ...gbpPost, ctaType: e.target.value })}>
                              <option value="LEARN_MORE">Learn More</option>
                              <option value="BOOK">Book</option>
                              <option value="ORDER">Order</option>
                              <option value="SHOP">Shop</option>
                              <option value="SIGN_UP">Sign Up</option>
                              <option value="CALL">Call Now</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 10, color: "#d60000", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 8 }}>Featured Image URL (optional)</div>
                          <input style={styles.searchInput} placeholder="https://yoursite.com/image.jpg" value={gbpPost.imageUrl} onChange={e => setGbpPost({ ...gbpPost, imageUrl: e.target.value })} />
                          {gbpPost.imageUrl ? (
                            <img src={gbpPost.imageUrl} alt="preview" onError={e => e.target.style.display='none'} style={{ marginTop: 8, maxHeight: 120, maxWidth: "100%", objectFit: "cover", borderRadius: 4, border: "1px solid #222" }} />
                          ) : null}
                        </div>
                        {gbpPostResult && (
                          <div style={{ ...styles.errorBox, background: gbpPostResult.ok ? "rgba(34,197,94,0.08)" : undefined, borderColor: gbpPostResult.ok ? "#22c55e" : undefined, color: gbpPostResult.ok ? "#22c55e" : undefined, marginBottom: 12 }}>
                            {gbpPostResult.msg}
                          </div>
                        )}
                        <button style={{ ...styles.addBtn, opacity: gbpPosting ? 0.6 : 1 }} onClick={submitGbpPost} disabled={gbpPosting || !gbpPost.summary.trim()}>
                          {gbpPosting ? "Publishing..." : "Publish to Google Business"}
                        </button>
                      </div>
                    )}

                    {gbpPosts.length > 0 && (
                      <div style={styles.table}>
                        <div style={styles.tableHeader}>
                          <span style={{ flex: 3 }}>Post</span>
                          <span style={{ flex: 1 }}>Status</span>
                          <span style={{ flex: 1 }}>Date</span>
                        </div>
                        {gbpPosts.slice(0, 5).map((post, i) => (
                          <div key={i} style={{ ...styles.tableRow, gap: 12 }}>
                            <span style={{ flex: 3, color: "#ccc", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.summary}</span>
                            <span style={{ flex: 1 }}><span style={{ ...styles.intentBadge, color: "#22c55e", borderColor: "#22c55e" }}>{post.state || "LIVE"}</span></span>
                            <span style={{ flex: 1, color: "#555", fontSize: 11 }}>{post.createTime ? new Date(post.createTime).toLocaleDateString() : "—"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* MONTHLY KEYWORD QUEUE */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={styles.sectionTitle}>Monthly Keyword Queue {queueMonth ? `— ${queueMonth}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...styles.addBtn, background: "transparent", border: "1px solid #d60000", color: "#d60000" }} onClick={() => { setShowManualKeywordInput(v => !v); setManualKeywordText(""); }}>
                        {showManualKeywordInput ? "✕ Cancel" : "+ Add Keyword"}
                      </button>
                      <button style={styles.addBtn} onClick={refreshMonthlyQueue} disabled={refreshingQueue}>
                        {refreshingQueue ? "Refreshing..." : "⟳ Refresh Queue"}
                      </button>
                    </div>
                  </div>

                  {showManualKeywordInput && (
                    <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 8, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <input
                        style={{ ...styles.searchInput, flex: "1 1 200px", minWidth: 160 }}
                        placeholder="Enter keyword..."
                        value={manualKeywordText}
                        onChange={e => setManualKeywordText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addManualKeyword()}
                        autoFocus
                      />
                      <select
                        value={manualKeywordIntent}
                        onChange={e => setManualKeywordIntent(e.target.value)}
                        style={{ background: "#111", border: "1px solid #333", color: "#ccc", borderRadius: 6, padding: "8px 12px", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", cursor: "pointer" }}
                      >
                        <option value="Transactional">Transactional</option>
                        <option value="Informational">Informational</option>
                        <option value="Navigational">Navigational</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                      <button
                        style={{ ...styles.addBtn, opacity: addingManualKeyword || !manualKeywordText.trim() ? 0.5 : 1 }}
                        onClick={addManualKeyword}
                        disabled={addingManualKeyword || !manualKeywordText.trim()}
                      >
                        {addingManualKeyword ? "Adding..." : "Add to Queue"}
                      </button>
                    </div>
                  )}

                  {monthlyQueue.length === 0 && !queueReplacing ? (
                    <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: 24, textAlign: "center" }}>
                      <div style={{ color: "#444", fontSize: 13, marginBottom: 12 }}>No monthly queue yet. Click "Refresh Queue" to generate 30 keywords (15 from competitor gaps + 15 from library).</div>
                      <button style={styles.addBtn} onClick={refreshMonthlyQueue} disabled={refreshingQueue}>{refreshingQueue ? "Generating..." : "Generate Queue"}</button>
                    </div>
                  ) : (
                    <div style={styles.table}>
                      <div style={styles.tableHeader}>
                        <div style={{ flex: "0 0 20px" }}></div>
                        <div style={{ flex: 3 }}>Keyword</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Source</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Intent</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Status</div>
                        <div style={{ flex: "0 0 32px" }}></div>
                      </div>
                      {monthlyQueue.map(row => (
                        <div
                          key={row.id}
                          draggable={!row.used}
                          onDragStart={() => { if (!row.used) setDragQueueId(row.id); }}
                          onDragOver={e => { e.preventDefault(); if (!row.used) setDragOverQueueId(row.id); }}
                          onDragLeave={() => setDragOverQueueId(null)}
                          onDrop={() => { reorderQueue(dragQueueId, row.id); setDragQueueId(null); setDragOverQueueId(null); }}
                          onDragEnd={() => { setDragQueueId(null); setDragOverQueueId(null); }}
                          style={{
                            ...styles.tableRow,
                            opacity: dragQueueId === row.id ? 0.35 : row.used ? 0.4 : 1,
                            cursor: row.used ? "default" : "grab",
                            borderLeft: dragOverQueueId === row.id && dragQueueId !== row.id ? "2px solid #d60000" : "2px solid transparent",
                            transition: "border-color 0.1s, opacity 0.1s",
                          }}
                        >
                          <div style={{ flex: "0 0 20px", color: row.used ? "transparent" : "#333", fontSize: 13, userSelect: "none" }}>⠿</div>
                          <div style={{ flex: 3, color: "#fff", fontWeight: 500 }}>{row.keyword}</div>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid", color: row.source === "gap" ? "#f59e0b" : row.source === "manual" ? "#a78bfa" : "#60a5fa", background: row.source === "gap" ? "rgba(245,158,11,0.1)" : row.source === "manual" ? "rgba(167,139,250,0.1)" : "rgba(96,165,250,0.1)", borderColor: row.source === "gap" ? "rgba(245,158,11,0.2)" : row.source === "manual" ? "rgba(167,139,250,0.2)" : "rgba(96,165,250,0.2)" }}>
                              {row.source === "gap" ? "Gap" : row.source === "manual" ? "Manual" : "Library"}
                            </span>
                          </div>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <span style={{ ...styles.intentBadge, color: getIntentColor(row.intent), background: getIntentColor(row.intent) + "22", borderColor: getIntentColor(row.intent) + "44" }}>{row.intent}</span>
                          </div>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <span style={{ fontSize: 11, color: row.used ? "#555" : "#22c55e" }}>{row.used ? "Used" : "Queued"}</span>
                          </div>
                          <div style={{ flex: "0 0 32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <button
                              onClick={() => removeQueueItem(row.id)}
                              title="Remove from queue"
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#333", fontSize: 14, lineHeight: 1, padding: "2px 4px", borderRadius: 3, transition: "color 0.15s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                              onMouseLeave={e => e.currentTarget.style.color = "#333"}
                            >✕</button>
                          </div>
                        </div>
                      ))}

                      {/* ── Replacement panel ── */}
                      {queueReplacing && (
                        <div style={{ borderTop: "1px solid #1a1a1a", padding: "16px 12px", background: "#0a0a0a" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: "#d60000", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>+ Add Replacement Keyword</span>
                            <button onClick={() => { setQueueReplacing(null); setGapSuggestions([]); }} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 13 }}>✕ Cancel</button>
                          </div>

                          {/* Gap suggestions */}
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                              <span style={{ fontSize: 11, color: "#888", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>From Competitor Gap</span>
                              <button
                                onClick={loadGapSuggestions}
                                disabled={queueGapLoading}
                                style={{ fontSize: 11, padding: "3px 10px", background: "transparent", border: "1px solid #f59e0b44", color: "#f59e0b", borderRadius: 4, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em", opacity: queueGapLoading ? 0.5 : 1 }}
                              >{queueGapLoading ? "Generating..." : "⟳ Generate Suggestions"}</button>
                            </div>
                            {gapSuggestions.length > 0 && (
                              gapSuggestions[0].startsWith("__error__:") ? (
                                <div style={{ fontSize: 11, color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif" }}>{gapSuggestions[0].replace("__error__: ", "")}</div>
                              ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                  {gapSuggestions.map((kw, i) => (
                                    <button
                                      key={i}
                                      onClick={() => addQueueKeyword(kw, "gap", "Transactional", 0)}
                                      style={{ fontSize: 11, padding: "4px 12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", borderRadius: 20, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", transition: "background 0.15s" }}
                                      onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.18)"}
                                      onMouseLeave={e => e.currentTarget.style.background = "rgba(245,158,11,0.08)"}
                                    >{kw}</button>
                                  ))}
                                </div>
                              )
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={styles.sectionTitle}>Keyword Queue — {selectedClient.industry}</div>
                <div style={{ marginTop: 16 }}>
                  {(library[selectedClient.industry] || []).length > 0 ? (
                    <div style={styles.table}>
                      <div style={styles.tableHeader}>
                        <div style={{ flex: 3 }}>Keyword</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Volume</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Intent</div>
                        <div style={{ flex: 1, textAlign: "center" }}>Action</div>
                      </div>
                      {(library[selectedClient.industry] || []).map((row) => (
                        <div key={row.id} style={styles.tableRow} onMouseEnter={e => e.currentTarget.style.background = "#111"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div style={{ flex: 3, color: "#fff", fontWeight: 500 }}>{row.keyword}</div>
                          <div style={{ flex: 1, textAlign: "center", color: "#aaa" }}>{(row.volume || 0).toLocaleString()}</div>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <span style={{ ...styles.intentBadge, color: getIntentColor(row.intent), background: getIntentColor(row.intent) + "22", borderColor: getIntentColor(row.intent) + "44" }}>{row.intent}</span>
                          </div>
                          <div style={{ flex: 1, textAlign: "center", display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                            <button style={styles.addKeywordBtn} onClick={() => generatePost(row.keyword, selectedClient)}>Generate Post</button>
                            <button
                              style={{ ...styles.addKeywordBtn, background: "transparent", border: "1px solid #d6000033", color: "#d60000", opacity: monthlyQueue.find(q => q.keyword.toLowerCase() === row.keyword.toLowerCase()) ? 0.35 : 1 }}
                              disabled={!!monthlyQueue.find(q => q.keyword.toLowerCase() === row.keyword.toLowerCase())}
                              title={monthlyQueue.find(q => q.keyword.toLowerCase() === row.keyword.toLowerCase()) ? "Already in queue" : "Add to monthly queue"}
                              onClick={() => addQueueKeyword(row.keyword, "library", row.intent, row.volume)}
                            >{monthlyQueue.find(q => q.keyword.toLowerCase() === row.keyword.toLowerCase()) ? "In Queue" : "+ Queue"}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#444", fontSize: 13 }}>No keywords in library for {selectedClient.industry} yet. Add some in the Keyword Library tab.</div>
                  )}
                </div>

                {/* CLIENT IMAGE LIBRARY */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ ...styles.sectionTitle, marginBottom: 16 }}>Client Image Library</div>
                  <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 12 }}>
                    These images are used as featured images when generating posts.
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
                    <input style={{ ...styles.searchInput, flex: 1, maxWidth: 220 }} placeholder="Category (e.g. technician, truck)" value={clientImageCategory} onChange={e => setClientImageCategory(e.target.value)} />
                    <label style={{ ...styles.addBtn, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {clientImageUploading ? "Uploading..." : "+ Upload Image"}
                      <input ref={clientImageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadClientImage} disabled={clientImageUploading} />
                    </label>
                  </div>
                  {clientImages.length === 0 ? (
                    <div style={{ padding: "24px", background: "#0d0d0d", border: "1px solid #1a1a1a", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>No images yet — upload some to get started</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                      {clientImages.map(img => (
                        <div key={img.id} style={{ position: "relative", background: "#0d0d0d", border: "1px solid #1a1a1a", overflow: "hidden" }}
                          onMouseEnter={e => e.currentTarget.querySelector(".del-btn").style.opacity = "1"}
                          onMouseLeave={e => e.currentTarget.querySelector(".del-btn").style.opacity = "0"}>
                          <img src={img.storage_path} alt={img.category} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                          <div style={{ padding: "4px 6px", fontSize: 10, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.category || "general"}</div>
                          <button className="del-btn" onClick={() => deleteClientImage(img.id)}
                            style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s", borderRadius: 2 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* KEYWORD LIBRARY */}
          {activeTab === "library" && (
            <div>
              <div style={styles.industryTabs}>
                {INDUSTRIES.map((ind) => (
                  <button key={ind} style={{ ...styles.industryTab, ...(activeIndustry === ind ? styles.industryTabActive : {}) }} onClick={() => setActiveIndustry(ind)}>
                    {ind}<span style={styles.industryCount}>{library[ind]?.length || 0}</span>
                  </button>
                ))}
              </div>
              <div style={styles.addKeywordRow}>
                <input style={{ ...styles.searchInput, flex: 3 }} placeholder="Add a keyword..." value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyDown={e => e.key === "Enter" && addKeyword()} />
                <input style={{ ...styles.searchInput, flex: 1, maxWidth: 120 }} placeholder="Volume" type="number" value={newVolume} onChange={e => setNewVolume(e.target.value)} />
                <select style={styles.selectInput} value={newIntent} onChange={e => setNewIntent(e.target.value)}>
                  {INTENTS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <button style={styles.addBtn} onClick={addKeyword}>+ Add</button>
              </div>
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <div style={{ flex: 3, cursor: "pointer", color: libSortField === "keyword" ? "#dc2626" : "#444" }} onClick={() => handleLibSort("keyword")}>Keyword {libSortField === "keyword" ? (libSortDir === "asc" ? "↑" : "↓") : "↕"}</div>
                  <div style={{ flex: 1, textAlign: "center", cursor: "pointer", color: libSortField === "volume" ? "#dc2626" : "#444" }} onClick={() => handleLibSort("volume")}>Volume {libSortField === "volume" ? (libSortDir === "asc" ? "↑" : "↓") : "↕"}</div>
                  <div style={{ flex: 1, textAlign: "center" }}>Intent</div>
                  <div style={{ flex: 1, textAlign: "center" }}>Remove</div>
                </div>
                {getSortedLibrary(library[activeIndustry] || []).map((row) => (
                  <div key={row.id} style={styles.tableRow} onMouseEnter={e => e.currentTarget.style.background = "#111"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ flex: 3, color: "#fff", fontWeight: 500 }}>{row.keyword}</div>
                    <div style={{ flex: 1, textAlign: "center", color: "#aaa" }}>{(row.volume || 0).toLocaleString()}</div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span style={{ ...styles.intentBadge, color: getIntentColor(row.intent), background: getIntentColor(row.intent) + "22", borderColor: getIntentColor(row.intent) + "44" }}>{row.intent}</span>
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <button style={{ ...styles.addKeywordBtn, color: "#ef4444", borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.1)" }} onClick={() => removeKeyword(row.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMAGE LIBRARY */}
          {activeTab === "images" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <button style={{ ...styles.industryTab, ...(imageMode === "industry" ? styles.industryTabActive : {}) }} onClick={() => { setImageMode("industry"); loadImages(imageIndustry); }}>Industry Library</button>
                <button style={{ ...styles.industryTab, ...(imageMode === "client" ? styles.industryTabActive : {}) }} onClick={() => setImageMode("client")}>Client Library</button>
              </div>
              {imageMode === "industry" && (
                <div style={styles.industryTabs}>
                  {INDUSTRIES.map((ind) => (
                    <button key={ind} style={{ ...styles.industryTab, ...(imageIndustry === ind ? styles.industryTabActive : {}) }} onClick={() => { setImageIndustry(ind); loadImages(ind); }}>
                      {ind}
                    </button>
                  ))}
                </div>
              )}
              {imageMode === "client" && (
                <div style={{ marginBottom: 20 }}>
                  <select style={{ ...styles.selectInput, width: "100%", maxWidth: 320 }} value={imageClientId} onChange={e => { setImageClientId(e.target.value); if (e.target.value) { const c = clients.find(c => c.id === e.target.value); if (c) setImageIndustry(c.industry); authFetch(`${API}/api/images/client/${e.target.value}`).then(r => r.json()).then(d => setImages(d.images || [])); } }}>
                    <option value="">— Select a client —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div style={styles.uploadRow}>
                <input style={{ ...styles.searchInput, flex: 2 }} placeholder="Category (e.g. AC Repair, Heat Pumps, Furnace)" value={imageCategory} onChange={e => setImageCategory(e.target.value)} />
                <label style={{ ...styles.uploadBtn, opacity: (imageMode === "client" && !imageClientId) ? 0.4 : 1 }}>
                  {imageUploading ? "Uploading..." : "Upload Image"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={uploadImage} disabled={imageUploading || (imageMode === "client" && !imageClientId)} />
                </label>
              </div>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 20 }}>
                {imageMode === "industry" ? "Industry images are shared across all clients in that industry." : "Client images are used first. Industry images are the fallback."}
              </div>
              {images.length === 0 ? (
                <div style={styles.comingSoon}>
                  <div style={styles.comingSoonIcon}>◻</div>
                  <div style={styles.comingSoonTitle}>No Images Yet</div>
                  <div style={styles.comingSoonSub}>{imageMode === "industry" ? `Upload images for ${imageIndustry}.` : "Select a client and upload their images."}</div>
                </div>
              ) : (
                <div style={styles.imageGrid}>
                  {images.map((img) => (
                    <div key={img.id} style={styles.imageCard}>
                      <img src={img.storage_path} alt={img.category} style={styles.imageThumb} />
                      <div style={styles.imageInfo}>
                        <div style={styles.imageName}>{img.category}</div>
                        <div style={styles.imageFilename}>{img.filename}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COMPETITOR GAP */}
          {activeTab === "gap" && (
            <div>
              <div style={styles.keywordSearch}>
                <div style={styles.searchLabel}>Enter your client's domain and up to 2 competitor domains</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input style={styles.searchInput} placeholder="Client domain (e.g. clogheroes.com)" value={gapDomain} onChange={e => setGapDomain(e.target.value)} />
                  <input style={styles.searchInput} placeholder="Competitor 1" value={gapComp1} onChange={e => setGapComp1(e.target.value)} />
                  <input style={styles.searchInput} placeholder="Competitor 2 (optional)" value={gapComp2} onChange={e => setGapComp2(e.target.value)} />
                  <button style={{ ...styles.searchBtn, alignSelf: "flex-start" }} onClick={runGapAnalysis} disabled={gapLoading}>{gapLoading ? "Analyzing..." : "Run Gap Analysis"}</button>
                </div>
              </div>
              {gapError && <div style={styles.errorBox}>⚠ {gapError}</div>}
              {gapResults && (
                <div>
                  <div style={styles.resultsHeader}>
                    <div style={styles.sectionTitle}>{gapResults.length} Gap Keywords Found</div>
                  </div>
                  <div style={styles.table}>
                    <div style={styles.tableHeader}>
                      <div style={{ flex: 3 }}>Keyword</div>
                      <div style={{ flex: 1, textAlign: "center" }}>Volume</div>
                      <div style={{ flex: 1, textAlign: "center" }}>KD</div>
                      <div style={{ flex: 1, textAlign: "center" }}>CPC</div>
                      <div style={{ flex: 1, textAlign: "center" }}>Add to Library</div>
                    </div>
                    {gapResults.map((row, i) => (
                      <div key={i} style={styles.tableRow} onMouseEnter={e => e.currentTarget.style.background = "#111"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ flex: 3, color: "#fff", fontWeight: 500 }}>{row.keyword}</div>
                        <div style={{ flex: 1, textAlign: "center", color: "#aaa" }}>{row.volume.toLocaleString()}</div>
                        <div style={{ flex: 1, textAlign: "center", color: "#aaa" }}>{row.kd}</div>
                        <div style={{ flex: 1, textAlign: "center", color: "#aaa" }}>{row.cpc}</div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <button style={styles.addKeywordBtn}>+ Add</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONTENT */}
          {activeTab === "content" && (
            <div>
              {contentLoading && (
                <div style={styles.comingSoon}>
                  <div style={{ fontSize: 48, color: "#dc2626", opacity: 0.6 }}>✦</div>
                  <div style={styles.comingSoonTitle}>Generating Post...</div>
                  <div style={styles.comingSoonSub}>Writing a blog post for "{generatingPost}"</div>
                </div>
              )}
              {contentError && !contentLoading && <div style={styles.errorBox}>⚠ {contentError}</div>}
              {!contentLoading && !generatedPost && !contentError && (
                <div style={styles.comingSoon}>
                  <div style={styles.comingSoonIcon}>✦</div>
                  <div style={styles.comingSoonTitle}>Content Pipeline</div>
                  <div style={styles.comingSoonSub}>Go to a client profile and click "Generate Post" next to any keyword.</div>
                </div>
              )}
              {generatedPost && !contentLoading && (
                <div>
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitle}>Generated Post — {generatingPost}</div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button style={{ ...styles.addBtn, background: "none", border: "1px solid #dc2626", color: "#dc2626" }} onClick={() => { setGeneratedPost(null); setGeneratingPost(null); }}>Clear</button>
                      <button style={{ ...styles.addBtn, opacity: publishLoading ? 0.6 : 1 }} onClick={publishToWordPress} disabled={publishLoading}>
                        {publishLoading ? "Publishing..." : "Publish to WordPress"}
                      </button>
                    </div>
                  </div>
                  <div style={styles.postPreview}>
                    <div style={styles.postMeta}>
                      <div style={styles.postMetaItem}><div style={styles.postMetaLabel}>Title</div><div style={styles.postMetaValue}>{generatedPost.title}</div></div>
                      <div style={styles.postMetaItem}><div style={styles.postMetaLabel}>Meta Description</div><div style={styles.postMetaValue}>{generatedPost.metaDescription}</div></div>
                      <div style={styles.postMetaItem}><div style={styles.postMetaLabel}>Slug</div><div style={styles.postMetaValue}>/{generatedPost.slug}</div></div>
                      <div style={styles.postMetaItem}><div style={styles.postMetaLabel}>Word Count</div><div style={styles.postMetaValue}>{generatedPost.wordCount} words</div></div>
                    </div>
                    {featuredImage && (
                      <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={featuredImage.storage_path} alt={featuredImage.category} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                        <div>
                          <div style={styles.postMetaLabel}>Featured Image</div>
                          <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{featuredImage.category} — will be renamed to {generatedPost.slug}.jpg</div>
                        </div>
                      </div>
                    )}
                    <div style={styles.postContent} dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
                  </div>
                  {publishResult && (
                    <div style={{ marginTop: 16 }}>
                      {/* Publish status */}
                      <div style={{ padding: "10px 14px", background: publishResult.success ? "#0a1a0a" : "#1a0a0a", border: `1px solid ${publishResult.success ? "#22c55e33" : "#ef444433"}`, borderRadius: 3, marginBottom: publishResult.qa ? 10 : 0 }}>
                        {publishResult.success
                          ? <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif" }}>✓ Published — <a href={publishResult.url} target="_blank" rel="noreferrer" style={{ color: "#22c55e" }}>{publishResult.url}</a></span>
                          : <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif" }}>✗ {publishResult.error}</span>}
                      </div>

                      {/* QA results */}
                      {publishResult.qa && (() => {
                        const qa = publishResult.qa;
                        const scoreColor = qa.score >= 80 ? "#22c55e" : qa.score >= 50 ? "#f59e0b" : "#ef4444";
                        return (
                          <div style={{ padding: "14px 16px", background: "#080808", border: `1px solid ${qa.passed ? "#22c55e22" : "#ef444422"}`, borderRadius: 3 }}>
                            {/* Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444" }}>Live QA</span>
                                <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 2, background: qa.passed ? "#22c55e18" : "#ef444418", color: qa.passed ? "#22c55e" : "#ef4444", border: `1px solid ${qa.passed ? "#22c55e33" : "#ef444433"}`, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                                  {qa.passed ? "✓ PASSED" : "✗ NEEDS REVIEW"}
                                </span>
                                {publishResult.repairHistory?.length > 1 && (() => {
                                  const cycles = publishResult.repairHistory.filter(h => h.action === "rewrite_and_recheck").length;
                                  return (
                                    <span style={{ fontSize: 9, color: cycles > 0 ? "#f59e0b" : "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
                                      {cycles === 0 ? "no rewrites needed" : `auto-repaired ${cycles}×`}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 9, color: "#333", fontFamily: "'Barlow Condensed', sans-serif" }}>{qa.wordCount ? `~${qa.wordCount} words` : ""}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor, fontFamily: "'Oswald', sans-serif" }}>{qa.score}</span>
                                <span style={{ fontSize: 9, color: "#333", fontFamily: "'Barlow Condensed', sans-serif" }}>/100</span>
                              </div>
                            </div>

                            {/* Repair cycle timeline */}
                            {publishResult.repairHistory?.length > 1 && (
                              <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #111" }}>
                                <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                                  {publishResult.repairHistory.map((h, i) => {
                                    const c = h.qa?.score >= 80 ? "#22c55e" : h.qa?.score >= 50 ? "#f59e0b" : "#ef4444";
                                    const label = h.action === "initial_check" ? "Initial" : `Rewrite ${h.cycle}`;
                                    return (
                                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                        {i > 0 && <span style={{ color: "#222", fontSize: 10 }}>→</span>}
                                        <div style={{ padding: "2px 7px", background: "#0d0d0d", border: `1px solid ${c}44`, borderRadius: 2 }}>
                                          <span style={{ fontSize: 9, color: c, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>{label}</span>
                                          <span style={{ fontSize: 9, color: "#333", fontFamily: "'Barlow Condensed', sans-serif", marginLeft: 4 }}>{h.qa?.score ?? "—"}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* AI notes */}
                            {qa.aiNotes && (
                              <div style={{ fontSize: 11, color: "#888", fontFamily: "'Barlow', sans-serif", lineHeight: 1.5, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #111" }}>
                                {qa.aiNotes}
                              </div>
                            )}

                            {/* Errors */}
                            {qa.issues?.length > 0 && (
                              <div style={{ marginBottom: 8 }}>
                                {qa.issues.map((issue, i) => (
                                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid #0e0e0e" }}>
                                    <span style={{ fontSize: 9, color: "#ef4444", marginTop: 1, flexShrink: 0 }}>✗</span>
                                    <span style={{ fontSize: 10, color: "#ef4444", fontFamily: "'Barlow', sans-serif", lineHeight: 1.4 }}>{issue.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Warnings */}
                            {qa.warnings?.length > 0 && (
                              <div>
                                {qa.warnings.map((w, i) => (
                                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid #0e0e0e" }}>
                                    <span style={{ fontSize: 9, color: "#f59e0b", marginTop: 1, flexShrink: 0 }}>⚠</span>
                                    <span style={{ fontSize: 10, color: "#888", fontFamily: "'Barlow', sans-serif", lineHeight: 1.4 }}>{w.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {qa.passed && !qa.warnings?.length && (
                              <div style={{ fontSize: 10, color: "#22c55e55", fontFamily: "'Barlow Condensed', sans-serif" }}>All checks passed — post looks good on live site.</div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SEO AUDIT */}
          {activeTab === "seo" && (() => {
            const selectedClientForFix = clients.find(c => c.id === seoClient);
            const hasWpCreds = !!(selectedClientForFix?.wordpress_url && selectedClientForFix?.wordpress_username && selectedClientForFix?.wordpress_password);
            const auditUrl = selectedClientForFix?.domain || selectedClientForFix?.wordpress_url || "";

            // ── Semrush-style tab bar ─────────────────────────────────────────
            const AUDIT_TABS = [
              { id: "overview",   label: "Overview" },
              { id: "issues",     label: "Issues" },
              { id: "pages",      label: "Crawled Pages" },
              { id: "statistics", label: "Statistics" },
            ];
            const tabBar = (
              <div style={{ display: "flex", borderBottom: "2px solid #111", marginBottom: 24, gap: 0 }}>
                {AUDIT_TABS.map(t => (
                  <button key={t.id} onClick={() => { setSeoAuditTab(t.id); setExpandedIssueId(null); }}
                    style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: seoAuditTab === t.id ? "2px solid #d60000" : "2px solid transparent", marginBottom: -2, color: seoAuditTab === t.id ? "#fff" : "#444", cursor: "pointer", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: seoAuditTab === t.id ? 700 : 400, transition: "color 0.15s", whiteSpace: "nowrap" }}>
                    {t.label}
                    {t.id === "issues" && siteCrawlData && (() => {
                      const e = siteCrawlData.totalErrors || 0;
                      const w = siteCrawlData.totalWarnings || 0;
                      if (!e && !w) return null;
                      return <span style={{ marginLeft: 6, fontSize: 9, padding: "1px 5px", background: e > 0 ? "#ef444422" : "#f59e0b22", color: e > 0 ? "#ef4444" : "#f59e0b", borderRadius: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>{e + w}</span>;
                    })()}
                  </button>
                ))}
              </div>
            );

            // ── Issue renderer ──────────────────────────────────────────────────
            const renderIssue = (issue, pageUrl) => {
              const key       = fixKey(pageUrl || seoUrl || "", issue.id);
              const fixResult = seoFixResults[key];
              const isFixing  = seoFixing[key];
              const isFixed   = fixResult === "fixed" || fixResult === "fixed_unverified";
              const isVerified = fixResult === "fixed";
              const color     = isFixed ? (isVerified ? "#22c55e" : "#f59e0b") : issue.severity === "error" ? "#ef4444" : issue.severity === "warning" ? "#f59e0b" : issue.severity === "info" ? "#60a5fa" : "#22c55e";
              const canAutoFix = issue.fixable && seoClient && hasWpCreds && !isFixed && fixResult !== "not_found";
              const hasManualHint = !issue.fixable && issue.suggestion && issue.severity !== "pass" && issue.severity !== "info";
              return (
                <div key={issue.id} style={{ borderBottom: "1px solid #111", padding: "14px 0", display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 3, height: 36, background: color, borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e8e8e8", fontFamily: "'Barlow', sans-serif" }}>{issue.title}</span>
                      <span style={{ fontSize: 9, padding: "1px 6px", background: color + "18", color, border: `1px solid ${color}33`, borderRadius: 2, letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", flexShrink: 0 }}>
                        {isFixed ? (isVerified ? "Fixed ✓" : "Fixed") : issue.severity}
                      </span>
                      {canAutoFix && <span style={{ fontSize: 9, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif" }}>✦ Auto-fixable</span>}
                      {hasManualHint && <span style={{ fontSize: 9, color: "#555", fontFamily: "'Barlow Condensed', sans-serif" }}>● Manual</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#666", lineHeight: 1.6 }}>{issue.description}</div>
                    {issue.current && !isFixed && <div style={{ fontSize: 10, color: "#444", marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif", wordBreak: "break-all" }}>Current: <span style={{ color: "#555" }}>{issue.current}</span></div>}
                    {hasManualHint && <div style={{ fontSize: 10, color: "#444", marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.5 }}>How to fix: <span style={{ color: "#666" }}>{issue.suggestion}</span></div>}
                    {fixResult === "no_creds" && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>⚠ Add WordPress credentials to enable auto-fix.</div>}
                    {fixResult === "not_found" && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 4 }}>✗ Page not found in WordPress — fix manually.</div>}
                    {fixResult === "plugin_needed" && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>⚠ Install the Fortitude plugin to enable meta/title fixes. <span style={{ color: "#d60000", cursor: "pointer", textDecoration: "underline" }} onClick={() => setPluginBannerVisible(true)}>See instructions →</span></div>}
                    {(fixResult === "error" || (fixResult && fixResult !== "fixed" && fixResult !== "fixed_unverified" && fixResult !== "no_creds" && fixResult !== "not_found" && fixResult !== "plugin_needed")) && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 4 }}>✗ {seoFixResults[key+"_msg"] || "Fix failed"}</div>}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {canAutoFix && (
                      <button onClick={() => fixSeoIssue(issue, pageUrl)} disabled={isFixing}
                        style={{ padding: "5px 14px", background: "#d60000", border: "none", color: "#fff", cursor: isFixing ? "not-allowed" : "pointer", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", opacity: isFixing ? 0.6 : 1, borderRadius: 2, whiteSpace: "nowrap" }}>
                        {isFixing ? "Fixing..." : "Fix →"}
                      </button>
                    )}
                    {isFixed && isVerified && <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif" }}>
                      ✓ Verified on live site{seoFixResults[key+"_attempts"]?.length > 1 ? ` (${seoFixResults[key+"_attempts"].length} attempts)` : ""}
                    </span>}
                    {isFixed && !isVerified && <span style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif" }}>⚠ Written to WP — run a new crawl to confirm</span>}
                  </div>
                </div>
              );
            };

            const renderGroupedIssues = (issues, pageUrl) => {
              const errI  = issues.filter(i => i.severity === "error");
              const warnI = issues.filter(i => i.severity === "warning");
              const infoI = issues.filter(i => i.severity === "info");
              const passI = issues.filter(i => i.severity === "pass");
              return (
                <div>
                  {errI.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} /> Errors — {errI.length}
                      </div>
                      {errI.map(i => renderIssue(i, pageUrl))}
                    </div>
                  )}
                  {warnI.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} /> Warnings — {warnI.length}
                      </div>
                      {warnI.map(i => renderIssue(i, pageUrl))}
                    </div>
                  )}
                  {infoI.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, color: "#60a5fa", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} /> Notices — {infoI.length}
                      </div>
                      {infoI.map(i => renderIssue(i, pageUrl))}
                    </div>
                  )}
                  {passI.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Passing — {passI.length}
                      </div>
                      {passI.map(i => renderIssue(i, pageUrl))}
                    </div>
                  )}
                </div>
              );
            };

            // ── Page drill-down ─────────────────────────────────────────────────
            if (siteAuditPage && siteCrawlData) {
              const pg = siteCrawlData.pages.find(p => p.url === siteAuditPage);
              if (!pg) return <div style={styles.tabContent}><button onClick={() => setSiteAuditPage(null)} style={{ ...styles.backBtn }}>← Back</button></div>;
              const scoreColor = pg.score >= 80 ? "#22c55e" : pg.score >= 50 ? "#f59e0b" : "#ef4444";
              return (
                <div style={styles.tabContent}>
                  {/* Breadcrumb */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    <button onClick={() => setSiteAuditPage(null)}
                      style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.08em", padding: 0, textTransform: "uppercase" }}>
                      ← Site Overview
                    </button>
                    <span style={{ color: "#333", fontSize: 11 }}>/</span>
                    <span style={{ fontSize: 11, color: "#888", fontFamily: "'Barlow Condensed', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{pg.url}</span>
                  </div>

                  {/* Page score header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, padding: "16px 20px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4 }}>
                    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="#1a1a1a" strokeWidth="6" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke={scoreColor} strokeWidth="6"
                          strokeDasharray={`${(pg.score / 100) * 163} 163`}
                          strokeLinecap="round" transform="rotate(-90 32 32)" />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: scoreColor, fontFamily: "'Oswald', sans-serif" }}>{pg.score}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "#e8e8e8", fontFamily: "'Barlow', sans-serif", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pg.title || pg.url}</div>
                      <div style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pg.url}</div>
                      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                        {pg.errors > 0 && <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif" }}>{pg.errors} Error{pg.errors !== 1 ? "s" : ""}</span>}
                        {pg.warnings > 0 && <span style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif" }}>{pg.warnings} Warning{pg.warnings !== 1 ? "s" : ""}</span>}
                        {pg.errors === 0 && pg.warnings === 0 && <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif" }}>✓ No issues</span>}
                      </div>
                    </div>
                    {!hasWpCreds && <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif", textAlign: "right" }}>⚠ No WP credentials — auto-fix disabled</div>}
                  </div>

                  {/* Issues */}
                  {renderGroupedIssues(pg.issues || [], pg.url)}
                </div>
              );
            }

            // ── Site overview — Semrush-style tabbed layout ──────────────────
            return (
              <div style={styles.tabContent}>
                {/* Plugin install banner */}
                {pluginBannerVisible && (
                  <div style={{ background: "#0a0808", border: "1px solid #d60000", borderRadius: 4, padding: "16px 20px", marginBottom: 20, position: "relative" }}>
                    <button onClick={() => setPluginBannerVisible(false)} style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>
                    <div style={{ fontSize: 12, color: "#fff", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.06em", marginBottom: 8 }}>PLUGIN REQUIRED FOR META / TITLE FIXES</div>
                    <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7, marginBottom: 12 }}>
                      Yoast Premium v20+ does not expose meta description, title, or canonical fields through the WordPress REST API.
                      To enable auto-fix for these issues, install the Fortitude plugin on each client's WordPress site.
                    </div>
                    <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.8, fontFamily: "'Barlow Condensed', sans-serif" }}>
                      <div style={{ color: "#d60000", fontWeight: 700, marginBottom: 4 }}>Installation (takes 30 seconds):</div>
                      <div>1. Download <span style={{ color: "#fff" }}>fortitude-seo-meta-writer.php</span> from your dashboard files</div>
                      <div>2. In WordPress Admin → Plugins → Add New → Upload Plugin</div>
                      <div>3. Upload the .php file and click <span style={{ color: "#fff" }}>Activate</span></div>
                      <div>4. Re-run the audit and fix buttons will work for meta/title/canonical</div>
                    </div>
                  </div>
                )}

                {/* ── Client selector + Start Audit ── */}
                {/* Top bar: Start Audit alone top-right */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 14 }}>
                  <button onClick={() => runSiteCrawl(auditUrl, seoClient)}
                    disabled={!auditUrl || siteCrawlRunning}
                    style={{ padding: "8px 22px", background: (!auditUrl || siteCrawlRunning) ? "#111" : "#d60000", border: `1px solid ${(!auditUrl || siteCrawlRunning) ? "#1e1e1e" : "#d60000"}`, color: (!auditUrl || siteCrawlRunning) ? "#333" : "#fff", cursor: (!auditUrl || siteCrawlRunning) ? "not-allowed" : "pointer", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.16em", textTransform: "uppercase", borderRadius: 2, whiteSpace: "nowrap", fontWeight: 700 }}>
                    {siteCrawlRunning ? "Crawling..." : siteCrawlData ? "↺ Rerun Audit" : "▶ Start Audit"}
                  </button>
                </div>

                {/* Client cards — wraps into multiple rows as clients grow */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {clients.map(c => {
                    const isActive = seoClient === c.id;
                    const cHasWp = !!(c.wordpress_url && c.wordpress_username && c.wordpress_password);
                    return (
                      <button key={c.id}
                        onClick={() => { setSeoClient(c.id); setSeoUrl(c.domain || c.wordpress_url || ""); setSeoAudit(null); setSiteCrawlData(null); setSiteAuditPage(null); setSeoAuditTab("overview"); setExpandedIssueId(null); }}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", background: isActive ? "#140000" : "#0a0a0a", border: `1px solid ${isActive ? "#d60000" : "#1a1a1a"}`, borderLeft: `3px solid ${isActive ? "#d60000" : "#1a1a1a"}`, cursor: "pointer", borderRadius: 2, transition: "border-color 0.15s, background 0.15s", textAlign: "left", minWidth: 160, maxWidth: 220 }}>
                        {/* Logo or initial */}
                        {c.logo_url
                          ? <img src={c.logo_url} alt={c.name} style={{ width: 22, height: 22, objectFit: "contain", borderRadius: 2, flexShrink: 0, filter: isActive ? "none" : "grayscale(60%) brightness(0.7)" }} />
                          : <div style={{ width: 22, height: 22, background: isActive ? "#d60000" : "#1a1a1a", border: `1px solid ${isActive ? "#d60000" : "#222"}`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: 10, color: isActive ? "#fff" : "#444", fontFamily: "'Oswald', sans-serif", fontWeight: 700, lineHeight: 1 }}>{(c.name || "?")[0].toUpperCase()}</span>
                            </div>
                        }
                        {/* Name + domain */}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 10, color: isActive ? "#fff" : "#777", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                          {c.domain && <div style={{ fontSize: 8, color: isActive ? "#444" : "#2a2a2a", fontFamily: "'Barlow Condensed', sans-serif", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.domain.replace(/^https?:\/\//, "")}</div>}
                        </div>
                        {/* WP badge */}
                        <span style={{ fontSize: 7, padding: "1px 4px", borderRadius: 2, border: `1px solid ${cHasWp ? "#22c55e33" : "#f59e0b22"}`, color: cHasWp ? "#22c55e" : "#f59e0b55", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", flexShrink: 0 }}>
                          {cHasWp ? "WP" : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>

{siteCrawlError && <div style={{ padding: "10px 14px", background: "#1a0a0a", border: "1px solid #3a1a1a", color: "#ef4444", fontSize: 11, marginBottom: 16, borderRadius: 4 }}>⚠ {siteCrawlError}</div>}

                {/* Crawl progress bar */}
                {siteCrawlRunning && siteCrawlProgress && (
                  <div style={{ marginBottom: 20, padding: "14px 18px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4 }}>
                    <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 8 }}>{siteCrawlProgress.message}</div>
                    {siteCrawlProgress.total > 0 && (
                      <>
                        <div style={{ background: "#111", height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ background: "#d60000", height: "100%", width: `${Math.round((siteCrawlProgress.pagesDone / siteCrawlProgress.total) * 100)}%`, transition: "width 0.3s", borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#333", fontFamily: "'Barlow Condensed', sans-serif" }}>{siteCrawlProgress.pagesDone} / {siteCrawlProgress.total} pages</div>
                      </>
                    )}
                  </div>
                )}

                {/* No data yet */}
                {!siteCrawlData && !siteCrawlRunning && (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "#333", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                    {selectedClientForFix ? "Click RERUN to crawl this site and generate an SEO audit." : "Select a client to begin."}
                  </div>
                )}

                {/* ── Main tabbed content ── */}
                {siteCrawlData && !siteCrawlRunning && (() => {
                  const totalErrors   = siteCrawlData.totalErrors   || 0;
                  const totalWarnings = siteCrawlData.totalWarnings  || 0;
                  const totalNotices  = siteCrawlData.issueSummary?.filter(i => i.severity === "info").reduce((s, i) => s + i.affectedPages, 0) || 0;
                  const siteScore     = siteCrawlData.siteScore      || 0;
                  const pagesAudited  = siteCrawlData.pagesAudited   || 0;
                  const scoreColor    = siteScore >= 80 ? "#22c55e" : siteScore >= 50 ? "#f59e0b" : "#ef4444";
                  const circumference = 2 * Math.PI * 52;

                  // Build cross-site issue groups (used by Issues tab)
                  const buildIssueGroups = (severityFilter) => {
                    const allIssues = [];
                    for (const pg of siteCrawlData.pages) {
                      for (const iss of (pg.issues || [])) {
                        if (!severityFilter || iss.severity === severityFilter) {
                          allIssues.push({ ...iss, pageUrl: pg.url });
                        }
                      }
                    }
                    // Also include site-wide issues
                    for (const iss of (siteCrawlData.siteIssues || [])) {
                      if (!severityFilter || iss.severity === severityFilter) {
                        allIssues.push({ ...iss, pageUrl: null });
                      }
                    }
                    const grouped = {};
                    for (const iss of allIssues) {
                      if (!grouped[iss.id]) {
                        // For site-wide issues, preserve the pages array already on the issue object
                        // For per-page issues, start with the pageUrl
                        const initPages = iss.pageUrl ? [iss.pageUrl] : (iss.pages || []);
                        grouped[iss.id] = { ...iss, pages: initPages };
                      } else if (iss.pageUrl && !grouped[iss.id].pages.includes(iss.pageUrl)) {
                        grouped[iss.id].pages.push(iss.pageUrl);
                      }
                    }
                    return Object.values(grouped).sort((a, b) => {
                      const sev = { error: 0, warning: 1, info: 2 };
                      if (sev[a.severity] !== sev[b.severity]) return (sev[a.severity] || 3) - (sev[b.severity] || 3);
                      if (a.fixable !== b.fixable) return a.fixable ? -1 : 1;
                      return b.pages.length - a.pages.length;
                    });
                  };

                  return (
                    <>
                      {tabBar}

                      {/* ══════════════════════════════════════════════════════════════
                          OVERVIEW TAB
                      ══════════════════════════════════════════════════════════════ */}
                      {seoAuditTab === "overview" && (
                        <div>
                          {/* Stat row */}
                          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>

                            {/* Site Health ring */}
                            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, flex: "0 0 auto" }}>
                              <div style={{ position: "relative", width: 120, height: 120 }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                  <circle cx="60" cy="60" r="52" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                                  <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="8"
                                    strokeDasharray={`${(siteScore / 100) * circumference} ${circumference}`}
                                    strokeLinecap="round" transform="rotate(-90 60 60)"
                                    style={{ transition: "stroke-dasharray 0.8s ease" }} />
                                </svg>
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                  <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor, fontFamily: "'Oswald', sans-serif", lineHeight: 1 }}>{siteScore}</div>
                                  <div style={{ fontSize: 9, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Site Score</div>
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: 13, color: "#e8e8e8", fontFamily: "'Barlow', sans-serif", fontWeight: 600, marginBottom: 4 }}>Site Health</div>
                                <div style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 6 }}>{pagesAudited} pages crawled</div>
                                <div style={{ fontSize: 11, color: scoreColor, fontFamily: "'Barlow Condensed', sans-serif" }}>
                                  {siteScore >= 80 ? "Good — minor issues only" : siteScore >= 50 ? "Needs attention" : "Critical issues found"}
                                </div>
                              </div>
                            </div>

                            {/* Crawled Pages breakdown */}
                            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, padding: "20px 24px", flex: "1 1 180px", minWidth: 180 }}>
                              <div style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Crawled Pages</div>
                              <div style={{ fontSize: 28, fontWeight: 700, color: "#e8e8e8", fontFamily: "'Oswald', sans-serif", lineHeight: 1, marginBottom: 12 }}>{pagesAudited}</div>
                              {(() => {
                                const pages = siteCrawlData.pages || [];
                                const pagesWithErrors   = pages.filter(p => p.errors > 0).length;
                                const pagesWithWarnings = pages.filter(p => p.warnings > 0 && p.errors === 0).length;
                                const pagesWithNotices  = pages.filter(p => p.notices > 0 && p.errors === 0 && p.warnings === 0).length;
                                const pagesWithIssues   = pages.filter(p => (p.errors + p.warnings) > 0).length;
                                const healthyPages      = pagesAudited - pagesWithIssues;
                                return [
                                  { label: "Healthy",     val: healthyPages,      color: "#22c55e" },
                                  { label: "Have issues", val: pagesWithIssues,   color: "#f59e0b" },
                                  { label: "Errors",      val: pagesWithErrors,   color: "#ef4444" },
                                  { label: "Notices",     val: pagesWithNotices,  color: "#60a5fa" },
                                ];
                              })().map(r => (
                                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                                  <span style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", flex: 1 }}>{r.label}</span>
                                  <span style={{ fontSize: 13, color: r.val > 0 ? r.color : "#333", fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>{r.val}</span>
                                </div>
                              ))}
                            </div>

                            {/* Errors tile */}
                            <div onClick={() => setSeoAuditTab("issues")}
                              style={{ background: "#0a0a0a", border: `1px solid ${totalErrors > 0 ? "#ef444422" : "#1a1a1a"}`, borderRadius: 4, padding: "20px 24px", flex: "1 1 120px", minWidth: 120, cursor: "pointer", transition: "border-color 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = "#ef444444"}
                              onMouseLeave={e => e.currentTarget.style.borderColor = totalErrors > 0 ? "#ef444422" : "#1a1a1a"}>
                              <div style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Errors</div>
                              <div style={{ fontSize: 36, fontWeight: 700, color: totalErrors > 0 ? "#ef4444" : "#333", fontFamily: "'Oswald', sans-serif", lineHeight: 1, marginBottom: 6 }}>{totalErrors}</div>
                              <div style={{ fontSize: 9, color: "#ef444466", fontFamily: "'Barlow Condensed', sans-serif" }}>View issues →</div>
                            </div>

                            {/* Warnings tile */}
                            <div onClick={() => setSeoAuditTab("issues")}
                              style={{ background: "#0a0a0a", border: `1px solid ${totalWarnings > 0 ? "#f59e0b22" : "#1a1a1a"}`, borderRadius: 4, padding: "20px 24px", flex: "1 1 120px", minWidth: 120, cursor: "pointer", transition: "border-color 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = "#f59e0b44"}
                              onMouseLeave={e => e.currentTarget.style.borderColor = totalWarnings > 0 ? "#f59e0b22" : "#1a1a1a"}>
                              <div style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Warnings</div>
                              <div style={{ fontSize: 36, fontWeight: 700, color: totalWarnings > 0 ? "#f59e0b" : "#333", fontFamily: "'Oswald', sans-serif", lineHeight: 1, marginBottom: 6 }}>{totalWarnings}</div>
                              <div style={{ fontSize: 9, color: "#f59e0b66", fontFamily: "'Barlow Condensed', sans-serif" }}>View issues →</div>
                            </div>

                            {/* Notices tile */}
                            <div onClick={() => setSeoAuditTab("issues")}
                              style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, padding: "20px 24px", flex: "1 1 120px", minWidth: 120, cursor: "pointer", transition: "border-color 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = "#60a5fa44"}
                              onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>
                              <div style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Notices</div>
                              <div style={{ fontSize: 36, fontWeight: 700, color: totalNotices > 0 ? "#60a5fa" : "#333", fontFamily: "'Oswald', sans-serif", lineHeight: 1, marginBottom: 6 }}>{totalNotices}</div>
                              <div style={{ fontSize: 9, color: "#60a5fa66", fontFamily: "'Barlow Condensed', sans-serif" }}>View issues →</div>
                            </div>
                          </div>

                          {/* Top issues list — most impactful first */}
                          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, marginBottom: 24 }}>
                            <div style={{ padding: "14px 20px", borderBottom: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ fontSize: 10, color: "#888", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Top Issues</div>
                              <button onClick={() => setSeoAuditTab("issues")} style={{ background: "none", border: "none", color: "#d60000", cursor: "pointer", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>View all issues →</button>
                            </div>
                            {buildIssueGroups(null).slice(0, 8).map(grp => {
                              const color = grp.severity === "error" ? "#ef4444" : grp.severity === "info" ? "#60a5fa" : "#f59e0b";
                              const label = grp.severity === "info" ? "notice" : grp.severity;
                              return (
                                <div key={grp.id} onClick={() => setSeoAuditTab("issues")}
                                  style={{ padding: "12px 20px", borderBottom: "1px solid #0d0d0d", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "#0d0d0d"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                  <div style={{ width: 3, height: 32, background: color, borderRadius: 2, flexShrink: 0 }} />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                      <span style={{ fontSize: 12, color: "#ccc", fontFamily: "'Barlow', sans-serif", fontWeight: 500 }}>{grp.title}</span>
                                      {grp.fixable && <span style={{ fontSize: 9, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif" }}>✦ auto-fix</span>}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif" }}>{grp.pages.length} page{grp.pages.length !== 1 ? "s" : ""} affected</div>
                                  </div>
                                  <span style={{ fontSize: 9, padding: "2px 7px", background: color + "18", color, border: `1px solid ${color}33`, borderRadius: 2, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>{label}</span>
                                  <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'Oswald', sans-serif", flexShrink: 0, width: 30, textAlign: "right" }}>{grp.pages.length}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ══════════════════════════════════════════════════════════════
                          ISSUES TAB
                      ══════════════════════════════════════════════════════════════ */}
                      {seoAuditTab === "issues" && (() => {
                        const allGroups = buildIssueGroups(null);
                        const errGroups  = allGroups.filter(g => g.severity === "error");
                        const warnGroups = allGroups.filter(g => g.severity === "warning");
                        const infoGroups = allGroups.filter(g => g.severity === "info");
                        const drilled = expandedIssueId ? allGroups.find(g => g.id === expandedIssueId) : null;

                        // ── Drilled-in page list (like Semrush "4 pages returned 4XX") ──
                        if (drilled) {
                          const dColor = drilled.severity === "error" ? "#ef4444" : drilled.severity === "warning" ? "#f59e0b" : "#60a5fa";
                          const dLabel = drilled.severity === "info" ? "Notice" : drilled.severity.charAt(0).toUpperCase() + drilled.severity.slice(1);
                          const fixablePages = drilled.pages.filter(pu => drilled.fixable && !["fixed","fixed_unverified"].includes(seoFixResults[fixKey(pu, drilled.id)]));
                          return (
                            <div>
                              {/* Breadcrumb header */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <button onClick={() => setExpandedIssueId(null)}
                                    style={{ background: "none", border: "none", color: "#d60000", cursor: "pointer", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", padding: 0 }}>
                                    ← Issues
                                  </button>
                                  <span style={{ color: "#333", fontSize: 11 }}>/</span>
                                  <span style={{ fontSize: 12, color: "#ccc", fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>{drilled.title}</span>
                                  <span style={{ fontSize: 9, padding: "2px 8px", background: dColor + "18", color: dColor, border: `1px solid ${dColor}33`, borderRadius: 2, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>{dLabel}</span>
                                </div>
                                {fixablePages.length > 0 && (
                                  <button onClick={async () => { setSiteIssuesFixingAll(true); for (const pu of fixablePages) await fixSeoIssue(drilled, pu); setSiteIssuesFixingAll(false); }}
                                    disabled={siteIssuesFixingAll}
                                    style={{ padding: "6px 16px", background: "#d60000", border: "none", color: "#fff", cursor: "pointer", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 2, opacity: siteIssuesFixingAll ? 0.5 : 1 }}>
                                    {siteIssuesFixingAll ? "Fixing..." : `Fix All (${fixablePages.length}) →`}
                                  </button>
                                )}
                              </div>

                              {/* Issue description card */}
                              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderLeft: `3px solid ${dColor}`, borderRadius: 4, padding: "14px 18px", marginBottom: 20 }}>
                                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7 }}>{drilled.description}</div>
                                {drilled.suggestion && <div style={{ fontSize: 10, color: "#555", marginTop: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>How to fix: <span style={{ color: "#666" }}>{drilled.suggestion}</span></div>}
                                {drilled.fixable && <div style={{ fontSize: 10, color: "#22c55e", marginTop: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>✦ Auto-fixable via WordPress API</div>}
                              </div>

                              {/* Stats row */}
                              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                                <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, padding: "10px 20px", display: "flex", gap: 16, alignItems: "center" }}>
                                  <span style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif" }}>Affected:</span>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: drilled.pages.length > 0 ? dColor : "#22c55e", fontFamily: "'Oswald', sans-serif" }}>{drilled.pages.length}</span>
                                  <div style={{ width: 1, height: 16, background: "#1a1a1a" }} />
                                  <span style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif" }}>Clean:</span>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: "#22c55e", fontFamily: "'Oswald', sans-serif" }}>{Math.max(0, (siteCrawlData.pagesAudited || 0) - drilled.pages.length)}</span>
                                  {/* mini bar */}
                                  <div style={{ width: 80, height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden", marginLeft: 4 }}>
                                    <div style={{ width: `${drilled.pages.length === 0 ? 100 : Math.max(2, Math.round(Math.max(0, (siteCrawlData.pagesAudited || 0) - drilled.pages.length) / (siteCrawlData.pagesAudited || 1) * 100))}%`, height: "100%", background: "#22c55e", borderRadius: 3 }} />
                                  </div>
                                </div>
                              </div>

                              {/* Page URL table */}
                              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, overflow: "hidden" }}>
                                {/* Table header */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px", padding: "8px 16px", borderBottom: "1px solid #111", background: "#050505" }}>
                                  {["Page URL", "Discovered", "Action"].map((h, i) => (
                                    <div key={h} style={{ fontSize: 9, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", textAlign: i > 0 ? "center" : "left" }}>{h}</div>
                                  ))}
                                </div>
                                {drilled.pages.length === 0 && (
                                  <div style={{ padding: "24px 20px", color: "#444", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1.7 }}>
                                    <div style={{ color: "#666", marginBottom: 6 }}>This is a site-wide configuration issue — it doesn't affect individual pages.</div>
                                    <div>Resolve it by following the fix instructions above.</div>
                                  </div>
                                )}
                                {drilled.pages.map((pu, idx) => {
                                  const rowKey = fixKey(pu, drilled.id);
                                  const rowResult = seoFixResults[rowKey];
                                  const rowFixed = rowResult === "fixed" || rowResult === "fixed_unverified";
                                  const rowVerified = rowResult === "fixed";
                                  const rowFixing = seoFixing[rowKey];
                                  const rowError = rowResult === "not_found" || rowResult === "error";
                                  const canFix = drilled.fixable && hasWpCreds && !rowFixed && rowResult !== "not_found";
                                  const slug = pu.replace(/https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/";
                                  return (
                                    <div key={pu} style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px", padding: "12px 16px", borderBottom: idx < drilled.pages.length - 1 ? "1px solid #0d0d0d" : "none", alignItems: "center" }}
                                      onMouseEnter={e => e.currentTarget.style.background = "#0d0d0d"}
                                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                      {/* URL */}
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 12, color: "#d60000", fontFamily: "'Barlow', sans-serif", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                          onClick={() => setSiteAuditPage(pu)} title={pu}>
                                          {slug}
                                        </div>
                                        {rowFixed && rowVerified && <div style={{ fontSize: 9, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif", marginTop: 2 }}>✓ Verified on live site</div>}
                                        {rowFixed && !rowVerified && <div style={{ fontSize: 9, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif", marginTop: 2 }}>⚠ Written — re-crawl to confirm</div>}
                                        {rowError && <div style={{ fontSize: 9, color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif", marginTop: 2 }}>✗ Fix failed — check manually</div>}
                                        {rowResult === "plugin_needed" && <div style={{ fontSize: 9, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif", marginTop: 2 }}>⚠ Plugin required</div>}
                                      </div>
                                      {/* Discovered */}
                                      <div style={{ textAlign: "center", fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif" }}>
                                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                      </div>
                                      {/* Action */}
                                      <div style={{ textAlign: "center" }}>
                                        {rowFixed
                                          ? <span style={{ fontSize: 10, color: rowVerified ? "#22c55e" : "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif" }}>{rowVerified ? "✓ Verified" : "⚠ Check"}</span>
                                          : canFix
                                            ? <button onClick={() => fixSeoIssue(drilled, pu)} disabled={rowFixing}
                                                style={{ padding: "4px 12px", background: "#d60000", border: "none", color: "#fff", cursor: rowFixing ? "not-allowed" : "pointer", fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 2, opacity: rowFixing ? 0.5 : 1 }}>
                                                {rowFixing ? "Fixing…" : "Fix →"}
                                              </button>
                                            : drilled.fixable && !hasWpCreds
                                              ? <span style={{ fontSize: 9, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif" }}>No WP creds</span>
                                              : <button onClick={() => setSiteAuditPage(pu)}
                                                  style={{ padding: "4px 12px", background: "transparent", border: "1px solid #222", color: "#555", cursor: "pointer", fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 2 }}>
                                                  View page →
                                                </button>
                                        }
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        // ── Issues list view (top level) ──
                        const renderIssueRow = (grp, sectionColor) => {
                          const isExpanded = expandedIssueId === grp.id;
                          const fixedCount = grp.pages.filter(pu => ["fixed","fixed_unverified"].includes(seoFixResults[fixKey(pu, grp.id)])).length;
                          const fixableCount = grp.fixable ? grp.pages.length - fixedCount : 0;
                          const allFixed = fixedCount === grp.pages.length && grp.pages.length > 0;
                          const rowColor = allFixed ? "#22c55e" : sectionColor;
                          return (
                            <div key={grp.id}
                              style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #0d0d0d", cursor: "pointer", transition: "background 0.1s", gap: 14 }}
                              onClick={() => setExpandedIssueId(isExpanded ? null : grp.id)}
                              onMouseEnter={e => e.currentTarget.style.background = "#0d0d0d"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              {/* Left color bar */}
                              <div style={{ width: 3, height: 36, background: rowColor, borderRadius: 2, flexShrink: 0 }} />
                              {/* Issue title + description */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: allFixed ? "#22c55e" : "#e8e8e8", fontFamily: "'Barlow', sans-serif" }}>{grp.title}</span>
                                  {grp.fixable && !allFixed && <span style={{ fontSize: 9, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif" }}>✦ Auto-fixable</span>}
                                  {allFixed && <span style={{ fontSize: 9, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif" }}>✓ All fixed</span>}
                                </div>
                                <div style={{ fontSize: 11, color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{grp.description}</div>
                              </div>
                              {/* Pages affected count + bar */}
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                {fixedCount > 0 && <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif" }}>{fixedCount} fixed</span>}
                                {grp.pages.length > 0 && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 60, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                                      <div style={{ width: `${fixedCount > 0 ? Math.round(fixedCount / grp.pages.length * 100) : 100}%`, height: "100%", background: allFixed ? "#22c55e" : rowColor, opacity: allFixed ? 1 : 0.5, borderRadius: 2 }} />
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: rowColor, fontFamily: "'Oswald', sans-serif", minWidth: 20, textAlign: "right" }}>
                                      {grp.pages.length}
                                    </span>
                                    <span style={{ fontSize: 9, color: "#444", fontFamily: "'Barlow Condensed', sans-serif" }}>pages</span>
                                  </div>
                                )}
                              </div>
                              {/* Fix All button */}
                              {fixableCount > 0 && (
                                <button onClick={async e => { e.stopPropagation(); setSiteIssuesFixingAll(true); for (const pu of grp.pages.filter(pu => !["fixed","fixed_unverified"].includes(seoFixResults[fixKey(pu, grp.id)]))) await fixSeoIssue(grp, pu); setSiteIssuesFixingAll(false); }}
                                  style={{ padding: "5px 14px", background: "#d60000", border: "none", color: "#fff", cursor: "pointer", fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 2, flexShrink: 0, whiteSpace: "nowrap" }}>
                                  Fix All →
                                </button>
                              )}
                              {/* Arrow */}
                              <span style={{ fontSize: 10, color: "#333", flexShrink: 0, marginLeft: 4 }}>›</span>
                            </div>
                          );
                        };

                        return (
                          <div>
                            {/* Fix All auto-fixable button */}
                            {allGroups.filter(g => g.fixable).length > 0 && (
                              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                                <button onClick={async () => {
                                  setSiteIssuesFixingAll(true);
                                  for (const grp of allGroups.filter(g => g.fixable)) {
                                    for (const pu of grp.pages) await fixSeoIssue(grp, pu);
                                  }
                                  setSiteIssuesFixingAll(false);
                                }} disabled={siteIssuesFixingAll}
                                  style={{ padding: "7px 18px", background: "#d60000", border: "none", color: "#fff", cursor: "pointer", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 2, opacity: siteIssuesFixingAll ? 0.5 : 1 }}>
                                  {siteIssuesFixingAll ? "Fixing..." : `Fix All Auto-Fixable (${allGroups.filter(g => g.fixable).length}) →`}
                                </button>
                              </div>
                            )}

                            {/* Errors section */}
                            {errGroups.length > 0 && (
                              <div style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#0f0808", borderLeft: "3px solid #ef4444", marginBottom: 0, borderRadius: "4px 4px 0 0" }}>
                                  <span style={{ fontSize: 10, color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Errors</span>
                                  <span style={{ fontSize: 12, color: "#ef4444", fontFamily: "'Oswald', sans-serif", fontWeight: 700 }}>{errGroups.length}</span>
                                </div>
                                <div style={{ background: "#0a0a0a", border: "1px solid #1a0a0a", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
                                  {errGroups.map(g => renderIssueRow(g, "#ef4444"))}
                                </div>
                              </div>
                            )}

                            {/* Warnings section */}
                            {warnGroups.length > 0 && (
                              <div style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#0f0c07", borderLeft: "3px solid #f59e0b", marginBottom: 0, borderRadius: "4px 4px 0 0" }}>
                                  <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Warnings</span>
                                  <span style={{ fontSize: 12, color: "#f59e0b", fontFamily: "'Oswald', sans-serif", fontWeight: 700 }}>{warnGroups.length}</span>
                                </div>
                                <div style={{ background: "#0a0a0a", border: "1px solid #1a150a", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
                                  {warnGroups.map(g => renderIssueRow(g, "#f59e0b"))}
                                </div>
                              </div>
                            )}

                            {/* Notices section */}
                            {infoGroups.length > 0 && (
                              <div style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#070a0f", borderLeft: "3px solid #60a5fa", marginBottom: 0, borderRadius: "4px 4px 0 0" }}>
                                  <span style={{ fontSize: 10, color: "#60a5fa", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Notices</span>
                                  <span style={{ fontSize: 12, color: "#60a5fa", fontFamily: "'Oswald', sans-serif", fontWeight: 700 }}>{infoGroups.length}</span>
                                </div>
                                <div style={{ background: "#0a0a0a", border: "1px solid #0a0f1a", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
                                  {infoGroups.map(g => renderIssueRow(g, "#60a5fa"))}
                                </div>
                              </div>
                            )}

                            {allGroups.length === 0 && (
                              <div style={{ padding: "40px 20px", textAlign: "center", color: "#333", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif" }}>No issues found — site is clean ✓</div>
                            )}
                          </div>
                        );
                      })()}

                      {/* ══════════════════════════════════════════════════════════════
                          CRAWLED PAGES TAB
                      ══════════════════════════════════════════════════════════════ */}
                      {seoAuditTab === "pages" && (
                        <div>
                          {/* Filter bar */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                            <div style={{ fontSize: 10, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>{siteCrawlData.pages.length} pages crawled</div>
                            <div style={{ display: "flex", gap: 2 }}>
                              {[["all","All"],["error","Errors only"],["warning","Warnings only"]].map(([f,label]) => (
                                <button key={f} onClick={() => setIssueFilter(f)}
                                  style={{ padding: "5px 12px", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", background: issueFilter===f ? "#d60000" : "transparent", color: issueFilter===f ? "#fff" : "#444", border: `1px solid ${issueFilter===f ? "#d60000" : "#1e1e1e"}`, cursor: "pointer", borderRadius: 2 }}>
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Table header */}
                          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 80px 80px 60px", gap: 0, padding: "8px 16px", borderBottom: "1px solid #111" }}>
                            {["", "URL / Title", "Score", "Issues", ""].map((h, i) => (
                              <div key={i} style={{ fontSize: 9, color: "#333", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: i >= 2 ? "center" : "left" }}>{h}</div>
                            ))}
                          </div>

                          {/* Page rows */}
                          <div>
                            {siteCrawlData.pages
                              .filter(p => issueFilter === "all" || (issueFilter === "error" && p.errors > 0) || (issueFilter === "warning" && p.warnings > 0))
                              .sort((a,b) => (b.errors*3 + b.warnings) - (a.errors*3 + a.warnings))
                              .map(pg => {
                                const sc = pg.score >= 80 ? "#22c55e" : pg.score >= 50 ? "#f59e0b" : "#ef4444";
                                const circ = 2 * Math.PI * 10;
                                return (
                                  <div key={pg.url} onClick={() => { setSiteAuditPage(pg.url); }}
                                    style={{ display: "grid", gridTemplateColumns: "36px 1fr 80px 80px 60px", gap: 0, padding: "10px 16px", borderBottom: "1px solid #0d0d0d", cursor: "pointer", alignItems: "center" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#0d0d0d"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    {/* Mini score ring */}
                                    <div style={{ position: "relative", width: 26, height: 26 }}>
                                      <svg width="26" height="26" viewBox="0 0 26 26">
                                        <circle cx="13" cy="13" r="10" fill="none" stroke="#1a1a1a" strokeWidth="3" />
                                        <circle cx="13" cy="13" r="10" fill="none" stroke={sc} strokeWidth="3"
                                          strokeDasharray={`${(pg.score / 100) * circ} ${circ}`}
                                          strokeLinecap="round" transform="rotate(-90 13 13)" />
                                      </svg>
                                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6, fontWeight: 700, color: sc, fontFamily: "'Oswald', sans-serif" }}>{pg.score}</div>
                                    </div>
                                    {/* URL + title */}
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ fontSize: 11, color: "#888", fontFamily: "'Barlow Condensed', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {pg.url.replace(/https?:\/\/[^/]+/, "") || "/"}
                                      </div>
                                      {pg.title && <div style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pg.title}</div>}
                                    </div>
                                    {/* Score number */}
                                    <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: sc, fontFamily: "'Oswald', sans-serif" }}>{pg.score}</div>
                                    {/* Issue counts */}
                                    <div style={{ textAlign: "center", display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                                      {pg.errors > 0 && <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>{pg.errors}E</span>}
                                      {pg.warnings > 0 && <span style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif" }}>{pg.warnings}W</span>}
                                      {pg.errors === 0 && pg.warnings === 0 && <span style={{ fontSize: 10, color: "#22c55e44" }}>✓</span>}
                                    </div>
                                    {/* Arrow */}
                                    <div style={{ textAlign: "right", fontSize: 11, color: "#333" }}>→</div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* ══════════════════════════════════════════════════════════════
                          STATISTICS TAB
                      ══════════════════════════════════════════════════════════════ */}
                      {seoAuditTab === "statistics" && (() => {
                        const pages = siteCrawlData.pages || [];
                        const total = pages.length || 1;
                        const pct = (n) => Math.round((n / total) * 100);

                        const withCanonical = pages.filter(p => p.issues && !p.issues.some(i => i.id === "missing_canonical")).length;
                        const selfCanonical = pages.filter(p => {
                          const ci = p.issues?.find(i => i.id === "canonical_mismatch" || i.id === "missing_canonical");
                          return !ci;
                        }).length;
                        const noSchema = pages.filter(p => p.issues?.some(i => i.id === "no_schema")).length;
                        const hasSchema = total - noSchema;

                        const statCards = [
                          {
                            title: "HTTP Status Codes",
                            items: [
                              { label: "2xx OK", val: pct(pages.filter(p => p.statusCode >= 200 && p.statusCode < 300).length), color: "#22c55e" },
                              { label: "3xx Redirects", val: pct(pages.filter(p => p.statusCode >= 300 && p.statusCode < 400).length), color: "#60a5fa" },
                              { label: "4xx Errors", val: pct(pages.filter(p => p.statusCode >= 400 && p.statusCode < 500).length), color: "#ef4444" },
                              { label: "No status", val: pct(pages.filter(p => !p.statusCode).length), color: "#333" },
                            ]
                          },
                          {
                            title: "Canonicalization",
                            headline: `${pct(withCanonical)}%`,
                            headlineLabel: "pages with canonical tag",
                            headlineColor: withCanonical / total > 0.8 ? "#22c55e" : "#f59e0b",
                            items: [
                              { label: "With canonical", val: pct(withCanonical), color: "#22c55e" },
                              { label: "Missing canonical", val: pct(total - withCanonical), color: "#f59e0b" },
                            ]
                          },
                          {
                            title: "H1 Coverage",
                            items: [
                              { label: "Pages with H1", val: pct(pages.filter(p => !p.issues?.some(i => i.id === "missing_h1")).length), color: "#22c55e" },
                              { label: "Missing H1", val: pct(pages.filter(p => p.issues?.some(i => i.id === "missing_h1")).length), color: "#ef4444" },
                              { label: "Multiple H1s", val: pct(pages.filter(p => p.issues?.some(i => i.id === "h1_multiple" || i.id === "multiple_h1")).length), color: "#f59e0b" },
                            ]
                          },
                          {
                            title: "Meta Description",
                            items: [
                              { label: "Has meta desc", val: pct(pages.filter(p => !p.issues?.some(i => i.id === "missing_meta_desc")).length), color: "#22c55e" },
                              { label: "Missing", val: pct(pages.filter(p => p.issues?.some(i => i.id === "missing_meta_desc")).length), color: "#ef4444" },
                              { label: "Too long", val: pct(pages.filter(p => p.issues?.some(i => i.id === "meta_desc_too_long")).length), color: "#f59e0b" },
                            ]
                          },
                          {
                            title: "Structured Data",
                            items: [
                              { label: "Has schema", val: pct(hasSchema), color: "#22c55e" },
                              { label: "Missing schema", val: pct(noSchema), color: "#f59e0b" },
                            ]
                          },
                          {
                            title: "Page Word Count",
                            items: [
                              { label: "Low content (<300w)", val: pct(pages.filter(p => p.issues?.some(i => i.id === "low_word_count")).length), color: "#f59e0b" },
                              { label: "Low text ratio", val: pct(pages.filter(p => p.issues?.some(i => i.id === "low_text_ratio")).length), color: "#60a5fa" },
                              { label: "Good content", val: pct(pages.filter(p => !p.issues?.some(i => i.id === "low_word_count" || i.id === "low_text_ratio")).length), color: "#22c55e" },
                            ]
                          },
                        ];

                        return (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                            {statCards.map(card => (
                              <div key={card.title} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 4, padding: "18px 20px" }}>
                                <div style={{ fontSize: 11, color: "#888", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>{card.title}</div>
                                {card.headline && (
                                  <div style={{ marginBottom: 10 }}>
                                    <span style={{ fontSize: 28, fontWeight: 700, color: card.headlineColor, fontFamily: "'Oswald', sans-serif", lineHeight: 1 }}>{card.headline}</span>
                                    <div style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", marginTop: 2 }}>{card.headlineLabel}</div>
                                  </div>
                                )}
                                {card.items.map(item => (
                                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                        <span style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif" }}>{item.label}</span>
                                        <span style={{ fontSize: 11, color: item.color, fontFamily: "'Oswald', sans-serif", fontWeight: 700 }}>{item.val}%</span>
                                      </div>
                                      <div style={{ background: "#111", height: 3, borderRadius: 2, overflow: "hidden" }}>
                                        <div style={{ width: `${item.val}%`, height: "100%", background: item.color + "88", borderRadius: 2, transition: "width 0.6s ease" }} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </>
                  );
                })()}
              </div>
            );
          })()}

          {/* COMING SOON */}
          {(activeTab === "publishing" || activeTab === "settings") && (
            <div style={styles.comingSoon}>
              <div style={styles.comingSoonIcon}>⚡</div>
              <div style={styles.comingSoonTitle}>Coming Soon</div>
              <div style={styles.comingSoonSub}>
                {activeTab === "publishing" && "Auto-publishing to WordPress and Google Business Profiles on a schedule."}
                {activeTab === "settings" && "Brand voice editor, WordPress connections, and account settings."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const R = "#d60000";
const styles = {
  root: { display: "flex", minHeight: "100vh", background: "#000", fontFamily: "'Barlow', sans-serif", color: "#fff" },
  sidebar: { background: "#0a0a0a", borderRight: "2px solid #1a1a1a", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden", flexShrink: 0 },
  logo: { padding: "20px 16px", borderBottom: "2px solid #d60000", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#000" },
  logoText: { fontSize: 15, fontWeight: 700, letterSpacing: "0.25em", color: "#fff", fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" },
  logoSub: { fontSize: 9, letterSpacing: "0.4em", color: "#d60000", marginTop: 2, textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" },
  logoIcon: { fontSize: 22, fontWeight: 700, color: "#d60000", width: 32, textAlign: "center", fontFamily: "'Oswald', sans-serif" },
  toggleBtn: { background: "none", border: "1px solid #2a2a2a", color: "#555", cursor: "pointer", padding: "4px 8px", fontSize: 12 },
  nav: { flex: 1, padding: "12px 0", display: "flex", flexDirection: "column", gap: 0 },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "none", border: "none", borderLeft: "3px solid transparent", color: "#555", cursor: "pointer", textAlign: "left", fontSize: 12, letterSpacing: "0.12em", transition: "all 0.15s", whiteSpace: "nowrap", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", fontWeight: 600 },
  navItemActive: { background: "rgba(214,0,0,0.08)", color: "#fff", borderLeft: "3px solid #d60000" },
  navIcon: { fontSize: 14, width: 18, textAlign: "center", color: "#d60000" },
  navLabel: { fontSize: 12 },
  sidebarFooter: { padding: "16px 20px", borderTop: "1px solid #1a1a1a" },
  apiStatus: { display: "flex", alignItems: "center", gap: 8 },
  statusDot: { width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" },
  statusText: { fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  header: { borderBottom: "2px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#000", minHeight: 64, borderTop: "3px solid #d60000" },
  headerTitle: { fontSize: 20, fontWeight: 700, letterSpacing: "0.15em", color: "#fff", textTransform: "uppercase", fontFamily: "'Oswald', sans-serif" },
  headerSub: { fontSize: 10, color: "#444", marginTop: 3, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" },
  headerRight: { display: "flex", gap: 12, alignItems: "center" },
  headerBadge: { padding: "5px 14px", background: "#d60000", color: "#fff", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 },
  content: { flex: 1, background: "#000" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginBottom: 32 },
  statCard: { background: "#0d0d0d", borderTop: "3px solid #d60000", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 6 },
  statIcon: { fontSize: 16, color: "#d60000" },
  statValue: { fontSize: 36, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif", lineHeight: 1 },
  statLabel: { fontSize: 10, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", color: "#d60000", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" },
  addBtn: { padding: "10px 20px", background: "#d60000", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", letterSpacing: "0.12em", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase" },
  addClientForm: { background: "#0d0d0d", border: "1px solid #1a1a1a", borderTop: "3px solid #d60000", padding: 24, marginBottom: 24 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
  textArea: { width: "100%", background: "#111", border: "1px solid #222", borderBottom: "2px solid #d60000", color: "#fff", padding: "12px 16px", fontSize: 13, fontFamily: "'Barlow', sans-serif", outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box" },
  clientGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 2 },
  clientCard: { background: "#0d0d0d", borderTop: "3px solid transparent", padding: "24px", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" },
  clientCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  clientAvatar: { width: 40, height: 40, background: "#d60000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif" },
  clientStatus: { padding: "3px 10px", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 },
  clientName: { fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4, fontFamily: "'Oswald', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" },
  clientIndustry: { fontSize: 10, color: "#555", letterSpacing: "0.12em", marginBottom: 20, textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" },
  clientStats: { display: "flex", alignItems: "center", gap: 20, marginBottom: 16 },
  clientStat: { display: "flex", flexDirection: "column", gap: 2 },
  clientStatValue: { fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif" },
  clientStatLabel: { fontSize: 9, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" },
  clientStatDivider: { width: 1, height: 30, background: "#1f1f1f" },
  clientArrow: { fontSize: 10, color: "#d60000", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", fontWeight: 700 },
  backBtn: { background: "none", border: "1px solid #222", color: "#555", cursor: "pointer", padding: "8px 20px", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 },
  clientDetail: { background: "#0d0d0d", borderTop: "3px solid #d60000", padding: 32 },
  clientDetailHeader: { display: "flex", gap: 20, alignItems: "center", marginBottom: 32 },
  clientDetailAvatar: { width: 60, height: 60, background: "#d60000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif" },
  clientDetailName: { fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" },
  clientDetailIndustry: { fontSize: 11, color: "#555", marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginBottom: 32 },
  integrationCard: { background: "#111", borderTop: "2px solid #1a1a1a", padding: 20, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", textAlign: "center" },
  integrationIcon: { width: 40, height: 40, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#888", fontFamily: "'Oswald', sans-serif" },
  integrationLabel: { fontSize: 12, color: "#fff", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" },
  integrationStatus: { fontSize: 10, letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase" },
  connectBtn: { padding: "6px 16px", background: "transparent", border: "1px solid #d60000", color: "#d60000", fontSize: 10, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 },
  industryTabs: { display: "flex", gap: 2, marginBottom: 24, flexWrap: "wrap" },
  industryTab: { padding: "10px 20px", background: "none", border: "1px solid #222", color: "#555", cursor: "pointer", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 },
  industryTabActive: { background: "#d60000", border: "1px solid #d60000", color: "#fff" },
  industryCount: { background: "rgba(255,255,255,0.1)", padding: "2px 8px", fontSize: 10 },
  addKeywordRow: { display: "flex", gap: 8, marginBottom: 20, alignItems: "center" },
  uploadRow: { display: "flex", gap: 8, marginBottom: 12, alignItems: "center" },
  uploadBtn: { padding: "12px 24px", background: "#d60000", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" },
  imageGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 2 },
  imageCard: { background: "#0d0d0d", overflow: "hidden" },
  imageThumb: { width: "100%", height: 120, objectFit: "cover", filter: "grayscale(30%)" },
  imageInfo: { padding: "10px 12px", borderTop: "2px solid #d60000" },
  imageName: { fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif" },
  imageFilename: { fontSize: 9, color: "#555", marginTop: 3, fontFamily: "'Barlow Condensed', sans-serif" },
  searchInput: { flex: 1, background: "#111", border: "none", borderBottom: "2px solid #222", color: "#fff", padding: "12px 16px", fontSize: 13, fontFamily: "'Barlow', sans-serif", outline: "none" },
  selectInput: { background: "#111", border: "none", borderBottom: "2px solid #222", color: "#fff", padding: "12px 16px", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", outline: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" },
  table: { background: "#0d0d0d", overflow: "auto", border: "1px solid #1a1a1a" },
  tableHeader: { display: "flex", padding: "10px 20px", borderBottom: "2px solid #d60000", fontSize: 9, color: "#d60000", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, background: "#000", minWidth: 500 },
  tableRow: { display: "flex", padding: "14px 20px", borderBottom: "1px solid #111", fontSize: 13, alignItems: "center", transition: "background 0.1s", cursor: "default", minWidth: 500 },
  intentBadge: { padding: "2px 10px", fontSize: 10, border: "1px solid", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 },
  addKeywordBtn: { padding: "4px 14px", background: "transparent", border: "1px solid #d60000", color: "#d60000", fontSize: 10, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 },
  keywordSearch: { background: "#0d0d0d", borderTop: "3px solid #d60000", padding: 28, marginBottom: 28 },
  searchLabel: { fontSize: 11, color: "#555", marginBottom: 16, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" },
  searchBtn: { padding: "12px 28px", background: "#d60000", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 },
  errorBox: { background: "rgba(214,0,0,0.08)", borderLeft: "3px solid #d60000", color: "#ff4444", padding: "12px 16px", fontSize: 12, marginBottom: 20, fontFamily: "'Barlow', sans-serif" },
  resultsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  resultsMeta: { fontSize: 11, color: "#444", fontFamily: "'Barlow Condensed', sans-serif" },
  comingSoon: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 },
  comingSoonIcon: { fontSize: 56, color: "#d60000", opacity: 0.3 },
  comingSoonTitle: { fontSize: 32, fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.2em", fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" },
  comingSoonSub: { fontSize: 13, color: "#333", maxWidth: 400, textAlign: "center", lineHeight: 1.7, fontFamily: "'Barlow', sans-serif" },
  postPreview: { background: "#0d0d0d", borderTop: "3px solid #d60000", overflow: "hidden" },
  postMeta: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "#000", borderBottom: "1px solid #1a1a1a" },
  postMetaItem: { background: "#0d0d0d", padding: "16px 20px" },
  postMetaLabel: { fontSize: 9, color: "#d60000", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 },
  postMetaValue: { fontSize: 13, color: "#ccc", lineHeight: 1.5, fontFamily: "'Barlow', sans-serif" },
  postContent: { padding: "32px", color: "#ccc", lineHeight: 1.8, fontSize: 14, maxWidth: 800, fontFamily: "'Barlow', sans-serif" },
};

export default App;