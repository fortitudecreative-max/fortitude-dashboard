import { useState } from "react";

const clients = [
  { id: 1, name: "Clog Heroes Plumbing", industry: "Plumbing", status: "active", keywords: 24, posts: 12 },
  { id: 2, name: "Summer's Comfort HVAC", industry: "HVAC", status: "active", keywords: 18, posts: 9 },
  { id: 3, name: "Advanced Comfort Solutions", industry: "HVAC", status: "active", keywords: 31, posts: 15 },
  { id: 4, name: "Client Four", industry: "Electrical", status: "pending", keywords: 0, posts: 0 },
  { id: 5, name: "Client Five", industry: "Roofing", status: "pending", keywords: 0, posts: 0 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [keywordResults, setKeywordResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("kd");
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "kd" ? "asc" : "desc");
    }
  };

  const getSortedResults = (results) => {
    if (!results) return [];
    return [...results].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  };

  const searchKeyword = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setKeywordResults(null);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:3001/api/keywords/suggestions?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setKeywordResults(data.results);
      } else {
        setKeywordResults([]);
        setError("No results found for that keyword. Try a different term.");
      }
    } catch (err) {
      console.error("Error fetching keywords:", err);
      setError("Could not connect to backend. Make sure your server is running on port 3001.");
      setKeywordResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getKdColor = (kd) => {
    if (kd <= 20) return "#22c55e";
    if (kd <= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getKdLabel = (kd) => {
    if (kd <= 20) return "Easy";
    if (kd <= 40) return "Medium";
    return "Hard";
  };

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, width: sidebarOpen ? 240 : 64 }}>
        <div style={styles.logo}>
          {sidebarOpen ? (
            <div>
              <div style={styles.logoText}>FORTITUDE</div>
              <div style={styles.logoSub}>CREATIVE</div>
            </div>
          ) : (
            <div style={styles.logoIcon}>F</div>
          )}
          <button style={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav style={styles.nav}>
          {[
            { id: "clients", icon: "◈", label: "Clients" },
            { id: "keywords", icon: "⌕", label: "Keywords" },
            { id: "content", icon: "✦", label: "Content" },
            { id: "publishing", icon: "⟳", label: "Publishing" },
            { id: "settings", icon: "⚙", label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(activeTab === item.id ? styles.navItemActive : {}),
              }}
              onClick={() => { setActiveTab(item.id); setSelectedClient(null); }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span style={styles.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div style={styles.sidebarFooter}>
            <div style={styles.apiStatus}>
              <div style={styles.statusDot} />
              <span style={styles.statusText}>SEMrush Connected</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.headerTitle}>
              {activeTab === "clients" && !selectedClient && "Client Management"}
              {activeTab === "clients" && selectedClient && selectedClient.name}
              {activeTab === "keywords" && "Keyword Research"}
              {activeTab === "content" && "Content Pipeline"}
              {activeTab === "publishing" && "Auto Publishing"}
              {activeTab === "settings" && "Settings"}
            </div>
            <div style={styles.headerSub}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.headerBadge}>{clients.filter(c => c.status === "active").length} Active Clients</div>
          </div>
        </div>

        {/* Content Area */}
        <div style={styles.content}>

          {/* CLIENTS TAB */}
          {activeTab === "clients" && !selectedClient && (
            <div>
              <div style={styles.statsRow}>
                {[
                  { label: "Total Clients", value: clients.length, icon: "◈" },
                  { label: "Keywords Tracked", value: clients.reduce((a, c) => a + c.keywords, 0), icon: "⌕" },
                  { label: "Posts Published", value: clients.reduce((a, c) => a + c.posts, 0), icon: "✦" },
                  { label: "API Units Left", value: "50,000", icon: "⚡" },
                ].map((stat) => (
                  <div key={stat.label} style={styles.statCard}>
                    <div style={styles.statIcon}>{stat.icon}</div>
                    <div style={styles.statValue}>{stat.value}</div>
                    <div style={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>All Clients</div>
                <button style={styles.addBtn}>+ Add Client</button>
              </div>

              <div style={styles.clientGrid}>
                {clients.map((client) => (
                  <div
                    key={client.id}
                    style={styles.clientCard}
                    onClick={() => setSelectedClient(client)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#dc2626"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
                  >
                    <div style={styles.clientCardTop}>
                      <div style={styles.clientAvatar}>
                        {client.name.charAt(0)}
                      </div>
                      <div style={{
                        ...styles.clientStatus,
                        background: client.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                        color: client.status === "active" ? "#22c55e" : "#f59e0b",
                      }}>
                        {client.status}
                      </div>
                    </div>
                    <div style={styles.clientName}>{client.name}</div>
                    <div style={styles.clientIndustry}>{client.industry}</div>
                    <div style={styles.clientStats}>
                      <div style={styles.clientStat}>
                        <div style={styles.clientStatValue}>{client.keywords}</div>
                        <div style={styles.clientStatLabel}>Keywords</div>
                      </div>
                      <div style={styles.clientStatDivider} />
                      <div style={styles.clientStat}>
                        <div style={styles.clientStatValue}>{client.posts}</div>
                        <div style={styles.clientStatLabel}>Posts</div>
                      </div>
                    </div>
                    <div style={styles.clientArrow}>View Client →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLIENT DETAIL */}
          {activeTab === "clients" && selectedClient && (
            <div>
              <button style={styles.backBtn} onClick={() => setSelectedClient(null)}>← Back to Clients</button>
              <div style={styles.clientDetail}>
                <div style={styles.clientDetailHeader}>
                  <div style={styles.clientDetailAvatar}>{selectedClient.name.charAt(0)}</div>
                  <div>
                    <div style={styles.clientDetailName}>{selectedClient.name}</div>
                    <div style={styles.clientDetailIndustry}>{selectedClient.industry}</div>
                  </div>
                </div>
                <div style={styles.detailGrid}>
                  {[
                    { label: "WordPress", status: "Not Connected", icon: "W" },
                    { label: "Google Business", status: "Not Connected", icon: "G" },
                    { label: "SEMrush", status: "Ready", icon: "S" },
                    { label: "Brand Voice", status: "Not Set", icon: "✦" },
                  ].map((item) => (
                    <div key={item.label} style={styles.integrationCard}>
                      <div style={styles.integrationIcon}>{item.icon}</div>
                      <div style={styles.integrationLabel}>{item.label}</div>
                      <div style={{
                        ...styles.integrationStatus,
                        color: item.status === "Ready" ? "#22c55e" : "#666"
                      }}>{item.status}</div>
                      <button style={styles.connectBtn}>
                        {item.status === "Ready" ? "Configure" : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* KEYWORDS TAB */}
          {activeTab === "keywords" && (
            <div>
              <div style={styles.keywordSearch}>
                <div style={styles.searchLabel}>Enter a seed keyword to find low-difficulty opportunities</div>
                <div style={styles.searchRow}>
                  <input
                    style={styles.searchInput}
                    placeholder="e.g. HVAC repair, plumbing services, roofing..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && searchKeyword()}
                  />
                  <button style={styles.searchBtn} onClick={searchKeyword}>
                    {loading ? "Searching..." : "Search Keywords"}
                  </button>
                </div>
              </div>

              {loading && (
                <div style={styles.loadingRow}>
                  <div style={styles.loadingDot} />
                  <div style={styles.loadingDot} />
                  <div style={styles.loadingDot} />
                  <span style={{ color: "#666", marginLeft: 12 }}>Pulling from SEMrush...</span>
                </div>
              )}

              {keywordResults && (
                <div>
                  <div style={styles.resultsHeader}>
                    <div style={styles.sectionTitle}>{keywordResults.length} Keywords Found</div>
                    <div style={styles.resultsMeta}>Sorted by difficulty (easiest first)</div>
                  </div>
                  <div style={styles.table}>
                    <div style={styles.tableHeader}>
                      <div style={{ flex: 3 }}>Keyword</div>
                      <div style={{ flex: 1, textAlign: "center", cursor: "pointer", userSelect: "none", color: sortField === "volume" ? "#dc2626" : "#444" }} onClick={() => handleSort("volume")}>
                        Volume {sortField === "volume" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </div>
                      <div style={{ flex: 1, textAlign: "center", cursor: "pointer", userSelect: "none", color: sortField === "kd" ? "#dc2626" : "#444" }} onClick={() => handleSort("kd")}>
                        Difficulty {sortField === "kd" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </div>
                      <div style={{ flex: 1, textAlign: "center" }}>CPC</div>
                      <div style={{ flex: 1, textAlign: "center" }}>Action</div>
                    </div>
                    {getSortedResults(keywordResults)
                      .map((row, i) => (
                        <div key={i} style={styles.tableRow}
                          onMouseEnter={e => e.currentTarget.style.background = "#111"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <div style={{ flex: 3, color: "#fff", fontWeight: 500 }}>{row.keyword}</div>
                          <div style={{ flex: 1, textAlign: "center", color: "#aaa" }}>{row.volume.toLocaleString()}</div>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <span style={{
                              ...styles.kdBadge,
                              background: getKdColor(row.kd) + "22",
                              color: getKdColor(row.kd),
                              borderColor: getKdColor(row.kd) + "44",
                            }}>
                              {row.kd} · {getKdLabel(row.kd)}
                            </span>
                          </div>
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

          {/* COMING SOON TABS */}
          {(activeTab === "content" || activeTab === "publishing" || activeTab === "settings") && (
            <div style={styles.comingSoon}>
              <div style={styles.comingSoonIcon}>⚡</div>
              <div style={styles.comingSoonTitle}>Coming Soon</div>
              <div style={styles.comingSoonSub}>
                {activeTab === "content" && "AI content generation pipeline — create blog posts from your keyword queue automatically."}
                {activeTab === "publishing" && "Auto-publishing to WordPress and Google Business Profiles on a schedule."}
                {activeTab === "settings" && "SEMrush API configuration, brand voice editor, and account settings."}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#080808",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    color: "#fff",
  },
  sidebar: {
    background: "#0d0d0d",
    borderRight: "1px solid #1a1a1a",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.2s ease",
    overflow: "hidden",
    flexShrink: 0,
  },
  logo: {
    padding: "24px 16px",
    borderBottom: "1px solid #1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoText: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#dc2626",
  },
  logoSub: {
    fontSize: 10,
    letterSpacing: "0.3em",
    color: "#444",
    marginTop: 2,
  },
  logoIcon: {
    fontSize: 20,
    fontWeight: 700,
    color: "#dc2626",
    width: 32,
    textAlign: "center",
  },
  toggleBtn: {
    background: "none",
    border: "1px solid #1f1f1f",
    color: "#444",
    cursor: "pointer",
    padding: "4px 8px",
    fontSize: 12,
    borderRadius: 4,
  },
  nav: {
    flex: 1,
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    background: "none",
    border: "none",
    color: "#555",
    cursor: "pointer",
    borderRadius: 6,
    textAlign: "left",
    fontSize: 13,
    letterSpacing: "0.05em",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
  navItemActive: {
    background: "rgba(220,38,38,0.1)",
    color: "#dc2626",
    borderLeft: "2px solid #dc2626",
  },
  navIcon: { fontSize: 16, width: 20, textAlign: "center" },
  navLabel: { fontSize: 13 },
  sidebarFooter: {
    padding: "16px",
    borderTop: "1px solid #1a1a1a",
  },
  apiStatus: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
  },
  statusText: { fontSize: 11, color: "#555", letterSpacing: "0.05em" },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
  },
  header: {
    padding: "24px 32px",
    borderBottom: "1px solid #1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0a0a0a",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: "#fff",
  },
  headerSub: {
    fontSize: 11,
    color: "#444",
    marginTop: 4,
    letterSpacing: "0.08em",
  },
  headerRight: { display: "flex", gap: 12 },
  headerBadge: {
    padding: "6px 14px",
    background: "rgba(220,38,38,0.1)",
    border: "1px solid rgba(220,38,38,0.2)",
    color: "#dc2626",
    borderRadius: 20,
    fontSize: 12,
    letterSpacing: "0.05em",
  },
  content: { padding: "32px", flex: 1 },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: 10,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  statIcon: { fontSize: 18, color: "#dc2626" },
  statValue: { fontSize: 28, fontWeight: 700, color: "#fff" },
  statLabel: { fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase" },
  addBtn: {
    padding: "8px 16px",
    background: "#dc2626",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    fontSize: 12,
    cursor: "pointer",
    letterSpacing: "0.05em",
    fontFamily: "inherit",
  },
  clientGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 16,
  },
  clientCard: {
    background: "#0d0d0d",
    border: "1px solid #1f1f1f",
    borderRadius: 10,
    padding: "20px",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  clientCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  clientAvatar: {
    width: 36,
    height: 36,
    background: "rgba(220,38,38,0.15)",
    border: "1px solid rgba(220,38,38,0.3)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#dc2626",
  },
  clientStatus: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 10,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  clientName: { fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 },
  clientIndustry: { fontSize: 11, color: "#555", letterSpacing: "0.08em", marginBottom: 16 },
  clientStats: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
  clientStat: { display: "flex", flexDirection: "column", gap: 2 },
  clientStatValue: { fontSize: 18, fontWeight: 700, color: "#fff" },
  clientStatLabel: { fontSize: 10, color: "#555", letterSpacing: "0.08em" },
  clientStatDivider: { width: 1, height: 30, background: "#1f1f1f" },
  clientArrow: { fontSize: 11, color: "#dc2626", letterSpacing: "0.05em" },
  backBtn: {
    background: "none",
    border: "1px solid #1f1f1f",
    color: "#666",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "inherit",
    marginBottom: 24,
  },
  clientDetail: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: 12,
    padding: 28,
  },
  clientDetailHeader: { display: "flex", gap: 16, alignItems: "center", marginBottom: 28 },
  clientDetailAvatar: {
    width: 52,
    height: 52,
    background: "rgba(220,38,38,0.15)",
    border: "1px solid rgba(220,38,38,0.3)",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    color: "#dc2626",
  },
  clientDetailName: { fontSize: 18, fontWeight: 700, color: "#fff" },
  clientDetailIndustry: { fontSize: 12, color: "#555", marginTop: 4 },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  integrationCard: {
    background: "#111",
    border: "1px solid #1f1f1f",
    borderRadius: 10,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
    textAlign: "center",
  },
  integrationIcon: {
    width: 40,
    height: 40,
    background: "#1a1a1a",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#888",
  },
  integrationLabel: { fontSize: 13, color: "#fff", fontWeight: 600 },
  integrationStatus: { fontSize: 11, letterSpacing: "0.05em" },
  connectBtn: {
    padding: "6px 14px",
    background: "rgba(220,38,38,0.1)",
    border: "1px solid rgba(220,38,38,0.2)",
    color: "#dc2626",
    borderRadius: 6,
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 4,
  },
  keywordSearch: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: 12,
    padding: 28,
    marginBottom: 28,
  },
  searchLabel: { fontSize: 13, color: "#666", marginBottom: 16, letterSpacing: "0.05em" },
  searchRow: { display: "flex", gap: 12 },
  searchInput: {
    flex: 1,
    background: "#111",
    border: "1px solid #1f1f1f",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  },
  searchBtn: {
    padding: "12px 24px",
    background: "#dc2626",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    padding: "20px 0",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#dc2626",
    marginRight: 6,
    animation: "pulse 1s infinite",
  },
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  resultsMeta: { fontSize: 12, color: "#444" },
  table: {
    background: "#0d0d0d",
    border: "1px solid #1a1a1a",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    padding: "12px 20px",
    borderBottom: "1px solid #1a1a1a",
    fontSize: 10,
    color: "#444",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  tableRow: {
    display: "flex",
    padding: "14px 20px",
    borderBottom: "1px solid #111",
    fontSize: 13,
    alignItems: "center",
    transition: "background 0.15s",
    cursor: "default",
  },
  kdBadge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    border: "1px solid",
    letterSpacing: "0.05em",
  },
  intentBadge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    background: "rgba(255,255,255,0.05)",
    color: "#888",
    border: "1px solid #1f1f1f",
  },
  addKeywordBtn: {
    padding: "4px 12px",
    background: "rgba(220,38,38,0.1)",
    border: "1px solid rgba(220,38,38,0.2)",
    color: "#dc2626",
    borderRadius: 6,
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  comingSoon: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    gap: 16,
  },
  comingSoonIcon: { fontSize: 48, color: "#dc2626", opacity: 0.4 },
  comingSoonTitle: { fontSize: 24, fontWeight: 700, color: "#333", letterSpacing: "0.1em" },
  comingSoonSub: { fontSize: 14, color: "#444", maxWidth: 400, textAlign: "center", lineHeight: 1.7 },
};
