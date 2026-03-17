import { useState, useEffect, useRef } from "react";
import React from "react";
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

const DEFAULT_INDUSTRIES = ["HVAC", "Plumbing", "Electrical", "Roofing"];

// Color palette for industry tabs — keyed by lowercase industry name
const INDUSTRY_COLORS = {
  hvac:        { color: "#f97316", border: "#f97316", bg: "rgba(249,115,22,0.12)" },   // orange
  plumbing:    { color: "#3b82f6", border: "#3b82f6", bg: "rgba(59,130,246,0.12)" },   // blue
  electrical:  { color: "#a855f7", border: "#a855f7", bg: "rgba(168,85,247,0.12)" },   // purple
  roofing:     { color: "#22c55e", border: "#22c55e", bg: "rgba(34,197,94,0.12)" },    // green
  landscaping: { color: "#84cc16", border: "#84cc16", bg: "rgba(132,204,22,0.12)" },   // lime
  painting:    { color: "#ec4899", border: "#ec4899", bg: "rgba(236,72,153,0.12)" },   // pink
  flooring:    { color: "#eab308", border: "#eab308", bg: "rgba(234,179,8,0.12)" },    // yellow
  cleaning:    { color: "#06b6d4", border: "#06b6d4", bg: "rgba(6,182,212,0.12)" },    // cyan
  pest:        { color: "#f43f5e", border: "#f43f5e", bg: "rgba(244,63,94,0.12)" },    // rose
  concrete:    { color: "#94a3b8", border: "#94a3b8", bg: "rgba(148,163,184,0.12)" },  // slate
  default:     { color: "#d60000", border: "#d60000", bg: "rgba(214,0,0,0.12)" },      // red fallback
};

const getIndustryColor = (ind) => {
  if (!ind) return INDUSTRY_COLORS.default;
  const key = ind.toLowerCase().split(" ")[0]; // match on first word
  return INDUSTRY_COLORS[key] || INDUSTRY_COLORS.default;
};

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

function IlImageCard({ img, selected, view, onToggleSelect, onSave, onDelete, industries }) {
  const [editing, setEditing] = React.useState(false);
  const [cat, setCat] = React.useState(img.category || "");
  const [desc, setDesc] = React.useState(img.description || "");
  const [ind, setInd] = React.useState(img.industry || "");
  const [saving, setSaving] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    setCat(img.category || "");
    setDesc(img.description || "");
    setInd(img.industry || "");
  }, [img.category, img.description, img.industry]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(img.id, cat, desc, ind);
    setSaving(false);
    setEditing(false);
  };

  const cbStyle = { width: 18, height: 18, borderRadius: 3, border: "2px solid " + (selected ? "#d60000" : "rgba(255,255,255,0.25)"), background: selected ? "#d60000" : "rgba(0,0,0,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.1s" };

  const editForm = (
    <div>
      <select value={ind} onChange={e => setInd(e.target.value)}
        style={{ width: "100%", background: "#141414", border: "1px solid #333", color: ind ? "#fff" : "#555", borderRadius: 3, padding: "6px 8px", fontSize: 11, fontFamily: "'Barlow', sans-serif", boxSizing: "border-box", marginBottom: 6, cursor: "pointer" }}>
        <option value="">-- Industry --</option>
        {(industries || []).map(i => <option key={i} value={i}>{i}</option>)}
      </select>
      <input value={cat} onChange={e => setCat(e.target.value)} placeholder="Category (e.g. Water Heaters)"
        style={{ width: "100%", background: "#141414", border: "1px solid #333", color: "#fff", borderRadius: 3, padding: "6px 8px", fontSize: 11, fontFamily: "'Barlow', sans-serif", boxSizing: "border-box", marginBottom: 6 }} />
      <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what is in the photo..."
        style={{ width: "100%", background: "#141414", border: "1px solid #333", color: "#fff", borderRadius: 3, padding: "6px 8px", fontSize: 11, fontFamily: "'Barlow', sans-serif", boxSizing: "border-box", resize: "none", height: 60, marginBottom: 8 }} />
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={handleSave} disabled={saving}
          style={{ flex: 1, background: "#d60000", color: "#fff", border: "none", borderRadius: 3, padding: "5px 0", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={() => { setEditing(false); setCat(img.category || ""); setDesc(img.description || ""); }}
          style={{ flex: 1, background: "transparent", color: "#555", border: "1px solid #2a2a2a", borderRadius: 3, padding: "5px 0", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );

  if (view === "list") {
    return (
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", background: selected ? "rgba(214,0,0,0.04)" : hovered ? "#111" : "transparent", borderBottom: "1px solid #1a1a1a", transition: "background 0.1s" }}>
        <div onClick={e => { e.stopPropagation(); onToggleSelect(img.id); }} style={{ ...cbStyle, marginTop: 2 }}>
          {selected && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1, fontWeight: 700 }}>✓</span>}
        </div>
        <img src={img.storage_path} alt={img.filename} style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? editForm : (
            <div onDoubleClick={() => setEditing(true)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <div style={{ fontSize: 12, color: cat ? "#ddd" : "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", fontStyle: cat ? "normal" : "italic" }}>{cat || "No category"}</div>
                {ind && <div style={{ fontSize: 9, color: "#d60000", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid rgba(214,0,0,0.3)", padding: "1px 5px", borderRadius: 2 }}>{ind}</div>}
              </div>
              <div style={{ fontSize: 10, color: desc ? "#666" : "#333", lineHeight: 1.4, fontStyle: desc ? "normal" : "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{desc || "No description — double-click to add"}</div>
              <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>{img.filename}</div>
            </div>
          )}
        </div>
        {!editing && (
          <button onClick={() => onDelete(img.id)}
            style={{ flexShrink: 0, background: "none", border: "none", color: hovered ? "#ef4444" : "#2a2a2a", cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1, transition: "color 0.15s" }}>x</button>
        )}
      </div>
    );
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "#0d0d0d", border: "1px solid " + (selected ? "#d60000" : editing ? "#333" : "#1a1a1a"), borderRadius: 4, overflow: "hidden", position: "relative", transition: "border-color 0.1s" }}>
      <div onClick={e => { e.stopPropagation(); onToggleSelect(img.id); }} style={{ ...cbStyle, position: "absolute", top: 8, left: 8, zIndex: 2 }}>
        {selected && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1, fontWeight: 700 }}>✓</span>}
      </div>
      <button onClick={() => onDelete(img.id)}
        style={{ position: "absolute", top: 6, right: 6, zIndex: 2, background: "rgba(0,0,0,0.7)", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>x</button>
      <div style={{ position: "relative" }} onDoubleClick={() => { if (!editing) setEditing(true); }}>
        <img src={img.storage_path} alt={img.filename} style={{ width: "100%", height: 140, objectFit: "cover", display: "block", cursor: "pointer" }} />
        {!editing && hovered && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 8px", background: "rgba(0,0,0,0.6)", fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", textAlign: "center" }}>Double-click to edit</div>
        )}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 9, color: "#2a2a2a", marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Barlow Condensed', sans-serif" }}>{img.filename}</div>
        {editing ? editForm : (
          <div onDoubleClick={() => setEditing(true)} style={{ cursor: "pointer" }}>
            {ind && <div style={{ fontSize: 9, color: "#d60000", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{ind}</div>}
            <div style={{ fontSize: 11, color: cat ? "#ccc" : "#333", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", fontStyle: cat ? "normal" : "italic", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat || "No category"}</div>
            <div style={{ fontSize: 10, color: desc ? "#555" : "#2a2a2a", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontStyle: desc ? "normal" : "italic" }}>{desc || "No description"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [activeTab, setActiveTab] = useState("clients");
  const [previousView, setPreviousView] = useState(null); // { tab, client } for back button
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
  const [industries, setIndustries] = useState(DEFAULT_INDUSTRIES);
  const [showAddIndustry, setShowAddIndustry] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState("");
  const [addingIndustryFor, setAddingIndustryFor] = useState(null); // "new" | "edit" | null
  const [inlineIndustryInput, setInlineIndustryInput] = useState("");
  const [editingRow, setEditingRow] = useState(null); // { id, keyword, volume, kd, intent }
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingIndustryTab, setEditingIndustryTab] = useState(null); // industry name being renamed
  const [editingIndustryVal, setEditingIndustryVal] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newVolume, setNewVolume] = useState("");
  const [newKd, setNewKd] = useState("");
  const [newIntent, setNewIntent] = useState("Transactional");
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState(null); // { imported, total, errors }
  const [libSortField, setLibSortField] = useState("volume");
  const [libSortDir, setLibSortDir] = useState("desc");
  const [selectedKwIds, setSelectedKwIds] = useState(new Set());
  const [kwSelectMode, setKwSelectMode] = useState(false);
  const [editingKwId, setEditingKwId] = useState(null);
  const [dragOverIndustry, setDragOverIndustry] = useState(null);
  const [usedKeywords, setUsedKeywords] = useState([]);
  const [newUsedKw, setNewUsedKw] = useState("");
  const [libSubTab, setLibSubTab] = useState("library");
  const [showAddToClientModal, setShowAddToClientModal] = useState(false);
  const [addToClientTargets, setAddToClientTargets] = useState(new Set()); // client ids
  const [addToClientDest, setAddToClientDest] = useState("clientlist"); // "clientlist" | "queue" | "schedule"
  const [addToClientBusy, setAddToClientBusy] = useState(false);
  const [addToClientResult, setAddToClientResult] = useState(null);

  // Image Library
  const [images, setImages] = useState([]);
  const [imageMode, setImageMode] = useState("industry");
  const [ilImages, setIlImages] = useState([]); // image library tab: staged + saved images
  const [ilDragging, setIlDragging] = useState(false);
  const [ilUploading, setIlUploading] = useState(false);
  const [ilUploadProgress, setIlUploadProgress] = useState({ done: 0, total: 0 });
  const [ilSelected, setIlSelected] = useState(new Set()); // selected image ids
  const [clientImgSelected, setClientImgSelected] = useState(new Set()); // selected client image ids
  const [ilAssigning, setIlAssigning] = useState(false); // assign panel open
  const [ilAssignClients, setIlAssignClients] = useState(new Set()); // client ids to assign to
  const [ilAssignLoading, setIlAssignLoading] = useState(false);
  const [ilFilter, setIlFilter] = useState("all"); // all | untagged | tagged
  const [ilIndustry, setIlIndustry] = useState("all"); // "all" or a specific industry name
  const [ilView, setIlView] = useState("grid"); // grid | list
  const [ilUploadIndustry, setIlUploadIndustry] = useState(""); // industry for new uploads
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
  const [wpCategories, setWpCategories] = useState([]);
  const [editingImage, setEditingImage] = useState(null); // { id, category, description } — modal open when set
  const [editImageCategory, setEditImageCategory] = useState("");
  const [editImageDescription, setEditImageDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [generatedSchemaHtml, setGeneratedSchemaHtml] = useState(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [regenPrompt, setRegenPrompt] = useState("");
  const [showRegenPrompt, setShowRegenPrompt] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showHtmlInput, setShowHtmlInput] = useState(false);
  const [htmlInsertText, setHtmlInsertText] = useState("");
  const [savedSelection, setSavedSelection] = useState(null);
  const [selectedQueueRowId, setSelectedQueueRowId] = useState(null);
  const [queueRowPosts, setQueueRowPosts] = useState({}); // { [rowId]: { post, featuredImage, loading, error } }
  const [featuredImage, setFeaturedImage] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerImages, setImagePickerImages] = useState([]);
  const [imagePickerLoading, setImagePickerLoading] = useState(false);
  const [imagePickerSearch, setImagePickerSearch] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [yoastRetrying, setYoastRetrying] = useState(false);
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
  const [scheduleSettingsDirty, setScheduleSettingsDirty] = useState(false);
  const [scheduleSettingsSaved, setScheduleSettingsSaved] = useState(false);
  const [competitors, setCompetitors] = useState([]);
  const [findingCompetitors, setFindingCompetitors] = useState(false);
  const [monthlyQueue, setMonthlyQueue] = useState([]);
  const [clientUsedKeywords, setClientUsedKeywords] = useState([]);
  const [clientUsedPage, setClientUsedPage] = useState(1);
  const [clientUsedTotal, setClientUsedTotal] = useState(0);
  const [clientKeywords, setClientKeywords] = useState([]);
  const [clientKeywordsPage, setClientKeywordsPage] = useState(1);
  const [clientKeywordsTotal, setClientKeywordsTotal] = useState(0);
  const [clientListPage, setClientListPage] = useState(1);
  const [monthlyQueuePage, setMonthlyQueuePage] = useState(1);
  const [clientTab, setClientTab] = useState('monthly'); // 'monthly' | 'clientlist' | 'used'
  const [refreshingQueue, setRefreshingQueue] = useState(false);
  const [refreshingResearch, setRefreshingResearch] = useState(false);
  const [refreshingGap, setRefreshingGap] = useState(false);
  const [queueError, setQueueError] = useState(null);
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
  const [showGbpAssignPanel, setShowGbpAssignPanel] = useState(false);
  const [gbpLocations, setGbpLocations] = useState([]);
  const [gbpLocationsLoading, setGbpLocationsLoading] = useState(false);
  const [gbpLocationsError, setGbpLocationsError] = useState(null);
  const [gbpManualTitle, setGbpManualTitle] = useState("");
  const [gbpManualLocationId, setGbpManualLocationId] = useState("");
  const [gbpAgencyConnected, setGbpAgencyConnected] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [clientsViewMode, setClientsViewMode] = useState("list");
  const logoInputRef = useRef(null);
  const [clientImages, setClientImages] = useState([]);
  const [clientImageCategory, setClientImageCategory] = useState("");
  const [clientImageUploading, setClientImageUploading] = useState(false);
  const [clientImageUploadQueue, setClientImageUploadQueue] = useState([]);
  const [imageDragOver, setImageDragOver] = useState(false);
  const clientImageInputRef = useRef(null);
  const [queueMonth, setQueueMonth] = useState("");
  // Expandable section states
  const [clientProfileExpanded, setClientProfileExpanded] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const [gbpExpanded, setGbpExpanded] = useState(false);
  const [personalityExpanded, setPersonalityExpanded] = useState(false);
  const [personalityEdits, setPersonalityEdits] = useState(null); // working copy while editing
  const [savingPersonality, setSavingPersonality] = useState(false);
  const [newExcludedWord, setNewExcludedWord] = useState("");
  const [scheduledPostsExpanded, setScheduledPostsExpanded] = useState(false);
  const [archivedPostsExpanded, setArchivedPostsExpanded] = useState(false);
  const [scheduledQueueExpanded, setScheduledQueueExpanded] = useState(false);
  const [imageGalleryExpanded, setImageGalleryExpanded] = useState(false);

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
    loadIndustries();
    loadImages();
    loadUsedKeywords();
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

  const loadIndustries = async () => {
    try {
      const res = await authFetch(`${API}/api/keywords/industries`);
      const data = await res.json();
      if (data.industries && data.industries.length > 0) {
        // Merge DB industries with DEFAULT_INDUSTRIES, deduplicate, keep all
        const merged = [...new Set([...data.industries, ...DEFAULT_INDUSTRIES])];
        setIndustries(merged);
        // Load ALL industries in parallel so tab counts are accurate immediately
        await Promise.all(merged.map(ind => loadKeywords(ind)));
      }
    } catch (e) { console.error("Failed to load industries:", e); }
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
      // Auto-open the new client — mirror handleClientClick so all state is set correctly
      const c = data.client;
      setSelectedClient(c);
      setCompetitors(c.competitors || []);
      setScheduleSettings({
        schedule_frequency: c.schedule_frequency || "daily",
        schedule_days: c.schedule_days || ["Mon","Tue","Wed","Thu","Fri"],
        schedule_start_hour: c.schedule_start_hour || 9,
        schedule_end_hour: c.schedule_end_hour || 12,
        schedule_timezone: c.schedule_timezone || "America/New_York",
      });
      setScheduleSettingsDirty(false);
      setScheduleSettingsSaved(false);
      setGbpPostResult(null);
      setShowGbpComposer(false);
      setShowGbpAssignPanel(false);
      loadMonthlyQueue(c.id);
      loadScheduleJobs(c.id);
      loadGbpStatus(c.id);
      loadClientImages(c.id);
      loadClientUsedKeywords(c.id);
      loadClientKeywords(c.id);
      setClientTab("clientkeywords");
      setClientListPage(1);
      setMonthlyQueuePage(1);
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
        body: JSON.stringify({ keyword: newKeyword.trim(), industry: activeIndustry, volume: parseInt(newVolume) || 0, kd: parseInt(newKd) || 0, intent: newIntent }),
      });
      const data = await res.json();
      setLibrary(prev => ({ ...prev, [activeIndustry]: [data.keyword, ...(prev[activeIndustry] || [])] }));
      setNewKeyword(""); setNewVolume(""); setNewKd("");
    } catch (e) {
      console.error("Failed to add keyword:", e);
    }
  };

  const updateKeyword = async (id, updates) => {
    setSavingEdit(true);
    try {
      const res = await authFetch(`${API}/api/keywords/library/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      // If industry changed, move row to new industry list
      if (updates.industry && updates.industry !== activeIndustry) {
        setLibrary(prev => ({
          ...prev,
          [activeIndustry]: (prev[activeIndustry] || []).filter(k => k.id !== id),
          [updates.industry]: [...(prev[updates.industry] || []), { ...data.keyword }],
        }));
        // Ensure new industry exists in tab list
        setIndustries(prev => prev.includes(updates.industry) ? prev : [...prev, updates.industry]);
      } else {
        setLibrary(prev => ({ ...prev, [activeIndustry]: (prev[activeIndustry] || []).map(k => k.id === id ? { ...k, ...data.keyword } : k) }));
      }
      setEditingRow(null);
    } catch (e) { console.error("Failed to update keyword:", e); }
    setSavingEdit(false);
  };

  const addIndustry = () => {
    const name = newIndustryName.trim().toUpperCase();
    if (!name || industries.includes(name)) return;
    const updated = [...industries, name];
    setIndustries(updated);
    try { localStorage.setItem("fortitude_industries", JSON.stringify(updated)); } catch {}
    setActiveIndustry(name);
    setNewIndustryName("");
    setShowAddIndustry(false);
  };

  const renameIndustry = async (oldName, newName) => {
    newName = newName.trim().toUpperCase();
    if (!newName || newName === oldName || industries.includes(newName)) {
      setEditingIndustryTab(null);
      return;
    }
    // Update all keywords in this industry in DB
    const ids = (library[oldName] || []).map(k => k.id);
    if (ids.length > 0) {
      await Promise.all(ids.map(id => authFetch(`${API}/api/keywords/library/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: newName }),
      })));
    }
    setIndustries(prev => prev.map(i => i === oldName ? newName : i));
    setLibrary(prev => {
      const updated = { ...prev };
      updated[newName] = (updated[oldName] || []).map(k => ({ ...k, industry: newName }));
      delete updated[oldName];
      return updated;
    });
    if (activeIndustry === oldName) setActiveIndustry(newName);
    setEditingIndustryTab(null);
  };

  const removeKeyword = async (id) => {
    try {
      await authFetch(`${API}/api/keywords/library/${id}`, { method: "DELETE" });
      setLibrary(prev => ({ ...prev, [activeIndustry]: prev[activeIndustry].filter(k => k.id !== id) }));
    } catch (e) {
      console.error("Failed to remove keyword:", e);
    }
  };
  // Move selected keywords to a different industry
  const moveKeywordsToIndustry = async (targetIndustry, draggedId) => {
    if (targetIndustry === activeIndustry) return;
    // If dragged item is in selection, move all selected; otherwise just the one dragged
    const ids = draggedId && selectedKwIds.has(draggedId)
      ? [...selectedKwIds]
      : draggedId ? [draggedId] : [...selectedKwIds];
    if (!ids.length) return;
    try {
      await Promise.all(ids.map(id => authFetch(`${API}/api/keywords/library/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: targetIndustry }),
      })));
      // Update source industry optimistically, then reload target from DB to confirm save
      setLibrary(prev => ({
        ...prev,
        [activeIndustry]: (prev[activeIndustry] || []).filter(k => !ids.includes(k.id)),
      }));
      setSelectedKwIds(new Set());
      // Reload target industry from DB now that PUTs are complete
      await loadKeywords(targetIndustry);
    } catch(e) { console.error('Move failed:', e); }
  };

  // Used keywords
  const loadUsedKeywords = async () => {
    try {
      const res = await authFetch(`${API}/api/keywords/used`);
      const data = await res.json();
      setUsedKeywords(data.keywords || []);
    } catch(e) {}
  };
  const loadClientUsedKeywords = async (clientId, page = 1) => {
    if (!clientId) return;
    try {
      const res = await authFetch(`${API}/api/keywords/used/${clientId}?page=${page}`);
      const data = await res.json();
      setClientUsedKeywords(data.keywords || []);
      setClientUsedTotal(data.total || 0);
      setClientUsedPage(page);
    } catch(e) {}
  };

  const loadClientKeywords = async (clientId, page = 1) => {
    if (!clientId) return;
    try {
      const res = await authFetch(`${API}/api/clients/${clientId}/keywords?page=${page}`);
      const data = await res.json();
      setClientKeywords(data.keywords || []);
      setClientKeywordsTotal(data.total || 0);
      setClientKeywordsPage(page);
    } catch(e) {}
  };

  const removeClientUsedKeyword = async (id) => {
    try {
      await authFetch(`${API}/api/keywords/used-client/${id}`, { method: 'DELETE' });
      setClientUsedKeywords(prev => prev.filter(k => k.id !== id));
      setClientUsedTotal(prev => prev - 1);
    } catch(e) {}
  };

  const addUsedKeyword = async (kw) => {
    const keyword = (kw || newUsedKw).trim();
    if (!keyword) return;
    try {
      const res = await authFetch(`${API}/api/keywords/used`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      if (data.keyword) { setUsedKeywords(prev => [data.keyword, ...prev]); setNewUsedKw(''); }
    } catch(e) {}
  };

  const removeUsedKeyword = async (id) => {
    try {
      await authFetch(`${API}/api/keywords/used/${id}`, { method: 'DELETE' });
      setUsedKeywords(prev => prev.filter(k => k.id !== id));
    } catch(e) {}
  };
  // Add selected library keywords to one or more clients
  const addToClients = async () => {
    if (!addToClientTargets.size || !selectedKwIds.size) return;
    setAddToClientBusy(true);
    setAddToClientResult(null);
    const kws = (library[activeIndustry] || []).filter(k => selectedKwIds.has(k.id));
    const clientIds = [...addToClientTargets];
    let successCount = 0, errorCount = 0;
    for (const clientId of clientIds) {
      for (const kw of kws) {
        try {
          if (addToClientDest === 'clientlist') {
            // Add to client's keyword list
            const res = await authFetch(`${API}/api/clients/${clientId}/keywords`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ keyword: kw.keyword, source: 'library', intent: kw.intent || 'Informational', volume: kw.volume || 0, kd: kw.kd || 0 }),
            });
            const d = await res.json();
            if (d.keyword) successCount++; else errorCount++;
          } else if (addToClientDest === 'queue') {
            // Add to monthly keyword queue
            const res = await authFetch(`${API}/api/keywords/queue/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientId, keyword: kw.keyword, source: 'library', intent: kw.intent || 'Transactional', volume: kw.volume || 0 }),
            });
            const d = await res.json();
            if (d.success) successCount++; else errorCount++;
          } else {
            // Add to scheduled queue
            const res = await authFetch(`${API}/api/schedule/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientId, keyword: kw.keyword }),
            });
            const d = await res.json();
            if (d.success || d.job) successCount++; else errorCount++;
          }
        } catch(e) { errorCount++; }
      }
    }
    setAddToClientBusy(false);
    setAddToClientResult({ success: successCount, errors: errorCount, dest: addToClientDest });
  };

  const importCsv = async (file) => {
    if (!file) return;
    setCsvImporting(true);
    setCsvResult(null);
    const text = await file.text();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) { setCsvImporting(false); return; }

    // Detect if first row is a header
    const firstLower = lines[0].toLowerCase();
    const hasHeader = firstLower.includes("keyword") || firstLower.includes("volume") || firstLower.includes("intent");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    // Parse columns: keyword, volume (optional), intent (optional)
    // Supported formats:
    //   keyword
    //   keyword, volume
    //   keyword, volume, intent
    //   keyword, intent  (if second col is a word not a number)
    const keywords = [];
    const errors = [];
    dataLines.forEach((line, i) => {
      const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
      const kw = cols[0];
      if (!kw) return;
      const second = cols[1] || "";
      const third = cols[2] || "";
      let volume = 0, intent = "Transactional";
      if (second && !isNaN(second)) {
        volume = parseInt(second) || 0;
        if (third && INTENTS.includes(third)) intent = third;
        else if (third) {
          const match = INTENTS.find(i => i.toLowerCase().startsWith(third.toLowerCase()));
          if (match) intent = match;
        }
      } else if (second) {
        const match = INTENTS.find(i => i.toLowerCase().startsWith(second.toLowerCase()));
        if (match) intent = match;
      }
      keywords.push({ keyword: kw, industry: activeIndustry, volume, intent });
    });

    if (keywords.length === 0) {
      setCsvResult({ imported: 0, total: 0, errors: ["No valid keywords found in file"] });
      setCsvImporting(false);
      return;
    }

    try {
      const res = await authFetch(`${API}/api/keywords/library/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLibrary(prev => ({ ...prev, [activeIndustry]: [...(data.keywords || []), ...(prev[activeIndustry] || [])] }));
      setCsvResult({ imported: data.imported, total: keywords.length, errors });
    } catch (e) {
      setCsvResult({ imported: 0, total: keywords.length, errors: [e.message] });
    }
    setCsvImporting(false);
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const industry = (selectedClient.industry_tags && selectedClient.industry_tags.length > 0 ? selectedClient.industry_tags[0] : selectedClient.industry);
      const res = await authFetch(`${API}/api/competitors/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: selectedClient.name, industry, domain: selectedClient.domain, serviceArea: selectedClient.service_area }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.competitors) {
        setCompetitors(data.competitors);
        await saveCompetitors(data.competitors);
      } else {
        alert("Auto-find failed: " + (data.error || "Unknown error") + (data.detail ? "\n\n" + data.detail : ""));
      }
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === "AbortError") {
        alert("Auto-find timed out. The search is taking longer than usual — try again.");
      } else {
        alert("Auto-find failed: " + e.message);
      }
    }
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
    setQueueError(null);
    try {
      const res = await authFetch(`${API}/api/keywords/queue/${clientId}`);
      const data = await res.json();
      const keywords = data.keywords || [];
      setMonthlyQueue(keywords);
      setQueueMonth(data.month || "");
      // Restore any previously generated posts from sessionStorage
      const restored = {};
      keywords.forEach(row => {
        try {
          const saved = sessionStorage.getItem("qrp_" + row.id);
          if (saved) restored[row.id] = JSON.parse(saved);
        } catch(e) {}
      });
      if (Object.keys(restored).length > 0) {
        setQueueRowPosts(prev => ({ ...prev, ...restored }));
      }
    } catch (e) {}
  };

  const refreshMonthlyQueue = async () => {
    if (!selectedClient) return;
    setRefreshingQueue(true);
    setQueueError(null);
    try {
      const res = await authFetch(`${API}/api/keywords/monthly-refresh/${selectedClient.id}`, { method: "POST" });
      const data = await res.json();
      console.log("Refresh result:", data);
      if (data.error) { setQueueError(data.error + (data.detail ? `: ${data.detail}` : "")); }
      else { await loadMonthlyQueue(selectedClient.id); }
    } catch (e) {
      console.error("Failed to refresh queue:", e);
      setQueueError("Network error — could not reach the server. Is the backend running?");
    }
    setRefreshingQueue(false);
  };


  const refreshResearchKeywords = async () => {
    if (!selectedClient) return;
    setRefreshingResearch(true);
    try {
      const res = await authFetch(`${API}/api/keywords/queue/refresh-research/${selectedClient.id}`, { method: "POST" });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      const newKws = (data.keywords || []).map(k => ({ ...k, id: k.id || Date.now() + Math.random() }));
      setMonthlyQueue(prev => [...prev, ...newKws]);
    } catch(e) { console.error("Refresh research error:", e); }
    finally { setRefreshingResearch(false); }
  };

  const refreshGapKeywords = async () => {
    if (!selectedClient) return;
    setRefreshingGap(true);
    try {
      const res = await authFetch(`${API}/api/keywords/queue/refresh-gap/${selectedClient.id}`, { method: "POST" });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      const newKws = (data.keywords || []).map(k => ({ ...k, id: k.id || Date.now() + Math.random() }));
      setMonthlyQueue(prev => [...prev, ...newKws]);
    } catch(e) { console.error("Refresh gap error:", e); }
    finally { setRefreshingGap(false); }
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
      setShowGbpAssignPanel(false);
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
    setClientImgSelected(new Set());
    try {
      const res = await authFetch(`${API}/api/images/client/${clientId}`);
      const data = await res.json();
      setClientImages(data.images || []);
    } catch (e) { console.error("Failed to load client images:", e); }
  };

  const loadIlImages = async (industry) => {
    try {
      const ind = industry !== undefined ? industry : ilIndustry;
      const qs = ind && ind !== "all" ? `?industry=${encodeURIComponent(ind)}` : "";
      const res = await authFetch(`${API}/api/images${qs}`);
      const data = await res.json();
      setIlImages(data.images || data || []);
    } catch (e) { console.error("loadIlImages:", e); }
  };

  const openImagePicker = async () => {
    setShowImagePicker(true);
    setImagePickerSearch("");
    setImagePickerLoading(true);
    try {
      // Load client images first, fall back to all images
      const clientId = activeClient?.id || selectedClient?.id;
      let imgs = [];
      if (clientId) {
        const r = await authFetch(`${API}/api/images/client/${clientId}`);
        const d = await r.json();
        imgs = d.images || [];
      }
      if (imgs.length === 0) {
        const r = await authFetch(`${API}/api/images?all=true`);
        const d = await r.json();
        imgs = d.images || [];
      }
      setImagePickerImages(imgs);
    } catch (e) { console.error("openImagePicker:", e); }
    finally { setImagePickerLoading(false); }
  };

  const ilDeleteImage = async (id) => {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    await authFetch(`${API}/api/images/${id}`, { method: "DELETE" });
    setIlImages(prev => prev.filter(img => img.id !== id));
    setIlSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const ilHandleDrop = async (e) => {
    e.preventDefault();
    setIlDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    setIlUploading(true);
    setIlUploadProgress({ done: 0, total: files.length });
    const batchSize = 5;
    const allUploaded = [];
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const formData = new FormData();
      batch.forEach(f => formData.append("images", f));
      if (ilUploadIndustry) formData.append("industry", ilUploadIndustry);
      try {
        const res = await authFetch(`${API}/api/images/upload-bulk`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.uploaded) allUploaded.push(...data.uploaded);
        setIlUploadProgress(prev => ({ ...prev, done: prev.done + batch.length }));
      } catch (e2) { console.error("batch upload error", e2); alert("Upload error: " + e2.message); }
    }
    setIlImages(prev => [...allUploaded, ...prev]);
    setIlUploading(false);
    setIlUploadProgress({ done: 0, total: 0 });

    // Poll for auto-tags in background - refresh each uploaded image after Claude tags it
    if (allUploaded.length > 0) {
      setTimeout(async () => {
        try {
          const ids = allUploaded.map(i => i.id);
          const res2 = await authFetch(`${API}/api/images?all=true`);
          const d2 = await res2.json();
          const refreshed = (d2.images || []).filter(img => ids.includes(img.id));
          if (refreshed.length > 0) {
            setIlImages(prev => prev.map(img => {
              const r = refreshed.find(x => x.id === img.id);
              return r ? r : img;
            }));
          }
        } catch (e4) { /* silent */ }
      }, 8000);
    }
  };

  const ilSaveImage = async (id, category, description, industry) => {
    await authFetch(`${API}/api/images/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, description, industry }),
    });
    setIlImages(prev => prev.map(img => img.id === id ? { ...img, category, description, industry } : img));
  };

  const ilToggleSelect = (id) => {
    setIlSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const ilSelectAll = () => {
    const filtered = ilImages.filter(img => ilFilter === "all" || (ilFilter === "untagged" ? !img.category : !!img.category));
    setIlSelected(new Set(filtered.map(img => img.id)));
  };

  const ilClearSelect = () => setIlSelected(new Set());

  const ilDoAssign = async () => {
    if (!ilSelected.size || !ilAssignClients.size) return;
    setIlAssignLoading(true);
    try {
      const res = await authFetch(`${API}/api/images/assign-clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: Array.from(ilSelected), clientIds: Array.from(ilAssignClients) }),
      });
      const data = await res.json();
      const assignedClientIds = Array.from(ilAssignClients);
      const clientCount = ilAssignClients.size;
      setIlAssigning(false);
      setIlSelected(new Set());
      setIlAssignClients(new Set());
      // Refresh client image library if the selected client was one of the targets
      if (selectedClient && assignedClientIds.includes(selectedClient.id)) {
        loadClientImages(selectedClient.id);
      }
      alert(`Assigned ${data.assigned} image${data.assigned !== 1 ? "s" : ""} to ${clientCount} client${clientCount !== 1 ? "s" : ""}.`);
    } catch (e3) { alert("Assign fetch failed: " + e3.message); console.error("assign error", e3); }
    finally { setIlAssignLoading(false); }
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

  const uploadClientImageBulk = async (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setClientImageUploadQueue(fileArray.map(f => ({ name: f.name, status: "pending" })));
    const category = clientImageCategory.trim() || "general";
    const results = [];
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setClientImageUploadQueue(prev => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f));
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("industry", selectedClient.industry);
        formData.append("category", category);
        formData.append("client_id", selectedClient.id);
        const res = await authFetch(`${API}/api/images/upload`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.image) { results.push(data.image); setClientImages(prev => [data.image, ...prev]); }
        setClientImageUploadQueue(prev => prev.map((f, idx) => idx === i ? { ...f, status: "done" } : f));
      } catch (err) {
        setClientImageUploadQueue(prev => prev.map((f, idx) => idx === i ? { ...f, status: "error" } : f));
      }
    }
    setTimeout(() => { setClientImageUploadQueue([]); setClientImageCategory(""); }, 1500);
    if (clientImageInputRef.current) clientImageInputRef.current.value = "";
  };

  const deleteClientImage = async (imageId) => {
    try {
      await authFetch(`${API}/api/images/${imageId}`, { method: "DELETE" });
      setClientImages(prev => prev.filter(img => img.id !== imageId));
      setClientImgSelected(prev => { const n = new Set(prev); n.delete(imageId); return n; });
    } catch (e) { console.error("Failed to delete image:", e); }
  };

  const deleteClientImagesSelected = async () => {
    if (!clientImgSelected.size) return;
    if (!window.confirm(`Delete ${clientImgSelected.size} selected image${clientImgSelected.size !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    const ids = Array.from(clientImgSelected);
    for (const id of ids) {
      try { await authFetch(`${API}/api/images/${id}`, { method: "DELETE" }); } catch (e) { console.error("Delete failed:", e); }
    }
    setClientImages(prev => prev.filter(img => !ids.includes(img.id)));
    setClientImgSelected(new Set());
  };

  const deleteIlImagesSelected = async () => {
    if (!ilSelected.size) return;
    if (!window.confirm(`Delete ${ilSelected.size} selected image${ilSelected.size !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    const ids = Array.from(ilSelected);
    for (const id of ids) {
      try { await authFetch(`${API}/api/images/${id}`, { method: "DELETE" }); } catch (e) { console.error("Delete failed:", e); }
    }
    setIlImages(prev => prev.filter(img => !ids.includes(img.id)));
    setIlSelected(new Set());
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
      service_area: selectedClient.service_area || "",
      industry: selectedClient.industry || "",
      industry_tags: Array.isArray(selectedClient.industry_tags) ? selectedClient.industry_tags.join(", ") : (selectedClient.industry_tags || ""),
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
      if (data.error) { alert("Save failed: " + data.error); return; }
      setSelectedClient({ ...selectedClient, ...data.client });
      setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, ...data.client } : c));
      setEditingClient(false);
      // Auto-add any new industry tags as library industry tabs
      const savedTags = data.client.industry_tags;
      if (Array.isArray(savedTags) && savedTags.length > 0) {
        setIndustries(prev => {
          const newInds = savedTags
            .map(t => t.trim())
            .filter(t => t && !prev.some(p => p.toLowerCase() === t.toLowerCase()))
            .map(t => t.charAt(0).toUpperCase() + t.slice(1));
          return newInds.length > 0 ? [...prev, ...newInds] : prev;
        });
      }
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSavingClient(false);
    }
  };

  const deleteClient = async (client) => {
    const input = window.prompt(`Type the client name to confirm deletion:\n\n"${client.name}"\n\nThis permanently removes the client, all scheduled jobs, keyword queue, posts, and images.`);
    if (input === null) return;
    if (input.trim() !== client.name) { alert(`Name didn't match. Type exactly: ${client.name}`); return; }
    try {
      const res = await authFetch(`${API}/api/clients/${client.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) { alert("Delete failed: " + data.error); return; }
      setClients(prev => prev.filter(c => c.id !== client.id));
      setSelectedClient(null);
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  const retryYoastOptimize = async () => {
    if (!publishResult?.wpPostId || !selectedClient?.id) return;
    setYoastRetrying(true);
    try {
      const res = await authFetch(`${API}/api/yoast-optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          wpPostId: publishResult.wpPostId,
          title: generatedPost?.title || "",
          keyword: generatedPost?.keyword || "",
          metaDescription: generatedPost?.metaDescription || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishResult(prev => ({ ...prev, yoastOpt: data }));
      }
    } catch(e) {
      console.error("Yoast retry failed:", e);
    }
    setYoastRetrying(false);
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
          schemaHtml: generatedSchemaHtml || null,
          selectedCategoryId: selectedCategoryId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishResult({ success: true, wpPostId: data.wpPostId, url: data.wpPostUrl, qa: data.qa || null, repairHistory: data.repairHistory || [], yoastEdition: data.yoastEdition, longtailKeyphrase: data.longtailKeyphrase, fortitudePlugin: data.fortitudePlugin, canWriteSeoMeta: data.canWriteSeoMeta, yoastOpt: data.yoastOpt || null, imageUploadError: data.imageUploadError || null });
        loadClients();
        // Reload schedule jobs so published post moves to Archived Posts
        if (activeClient?.id) loadScheduleJobs(activeClient.id);
        if (selectedClient?.id) loadScheduleJobs(selectedClient.id);
        // Clear only the sessionStorage entry for the published keyword so other generated posts survive
        try {
          const publishedRow = monthlyQueue.find(r => r.keyword === generatingPost);
          if (publishedRow) {
            sessionStorage.removeItem("qrp_" + publishedRow.id);
            setQueueRowPosts(prev => { const next = { ...prev }; delete next[publishedRow.id]; return next; });
          }
        } catch(e) {}


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
    setPreviousView({ tab: "clients", client: selectedClient || client });
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
          aiPersonality: client.ai_personality || null,
        }),
      });
      const data = await res.json();
      if (data.post) {
        setGeneratedPost(data.post);
        setFeaturedImage(data.featuredImage);
        setGeneratedSchemaHtml(data.schemaHtml || null);
        setSelectedCategoryId(null);
        // Fetch WP categories and auto-select best match via backend
        if (client.wordpress_url && client.wordpress_username) {
          try {
            const catRes = await authFetch(`${API}/api/wordpress/categories`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                wordpressUrl: client.wordpress_url,
                wpUsername: client.wordpress_username || client.wp_username,
                wpPassword: client.wordpress_password || client.wp_password,
                keyword,
                title: data.post.title,
                industry: client.industry,
              }),
            });
            const catData = await catRes.json();
            if (catData.categories) {
              setWpCategories(catData.categories);
              setSelectedCategoryId(catData.bestMatchId || null);
            }
          } catch(e) { /* non-fatal */ }
        }
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

  // Generate a post for a specific queue row and store it in queueRowPosts state + sessionStorage
  const regeneratePost = async () => {
    if (!generatingPost || !activeClient || !regenPrompt.trim()) return;
    setRegenLoading(true);
    setGeneratedPost(null);
    setPublishResult(null);
    setContentLoading(true);
    setContentError(null);
    setShowRegenPrompt(false);
    try {
      const res = await authFetch(`${API}/api/content/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: generatingPost,
          industry: activeClient.industry,
          clientName: activeClient.name,
          clientId: activeClient.id,
          brandVoice: activeClient.brand_voice || "",
          wordpressUrl: activeClient.wordpress_url || "",
          aiPersonality: activeClient.ai_personality || null,
          regenPrompt: regenPrompt.trim(),
        }),
      });
      const data = await res.json();
      if (data.post) {
        setGeneratedPost(data.post);
        setFeaturedImage(data.featuredImage);
        setGeneratedSchemaHtml(data.schemaHtml || null);
        setRegenPrompt("");
      } else {
        setContentError(data.error || "Regeneration failed");
      }
    } catch (e) {
      setContentError(e.message);
    } finally {
      setContentLoading(false);
      setRegenLoading(false);
    }
  };

  const generateQueueRowPost = async (rowId, keyword, client) => {
    setQueueRowPosts(prev => ({ ...prev, [rowId]: { loading: true, error: null, post: null } }));
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
          aiPersonality: client.ai_personality || null,
        }),
      });
      const data = await res.json();
      if (data.post) {
        const rowData = { loading: false, post: data.post, featuredImage: data.featuredImage, schemaHtml: data.schemaHtml, error: null };
        setQueueRowPosts(prev => ({ ...prev, [rowId]: rowData }));
        try { sessionStorage.setItem("qrp_" + rowId, JSON.stringify(rowData)); } catch(e) {}
      } else {
        setQueueRowPosts(prev => ({ ...prev, [rowId]: { loading: false, post: null, error: data.error || "Failed to generate" } }));
      }
    } catch (e) {
      setQueueRowPosts(prev => ({ ...prev, [rowId]: { loading: false, post: null, error: "Connection error" } }));
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
      if (libSortField === "kd") return libSortDir === "asc" ? (a.kd || 0) - (b.kd || 0) : (b.kd || 0) - (a.kd || 0);
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
          {sidebarOpen ? (
            <>
              <img src="https://fortitudecreative.com/wp-content/uploads/2025/04/Fortitude-Logo32.svg" alt="Fortitude Creative" style={{ height: 90, display: "block", transition: "height 0.2s", padding: "3px" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button className="f-close-btn" style={{ display: "none", background: "none", border: "1px solid #2a2a2a", color: "#555", cursor: "pointer", padding: "4px 8px", fontSize: 12 }} onClick={() => setMobileMenuOpen(false)}>✕</button>
                <button style={styles.toggleBtn} onClick={() => setSidebarOpen(false)}>←</button>
              </div>
            </>
          ) : (
            <button onClick={() => setSidebarOpen(true)} title="Expand sidebar" style={{ width: "100%", height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18, transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "#555"}>
              →
            </button>
          )}
        </div>
        <nav style={styles.nav}>
          {[
            { id: "clients", icon: "◈", label: "Clients" },
            { id: "library", icon: "⌕", label: "Keyword Library" },
            { id: "imagelib", icon: "▣", label: "Image Library" },

            { id: "content", icon: "✦", label: "Content" },
            { id: "seo", icon: "◎", label: "SEO Audit" },
            { id: "publishing", icon: "⟳", label: "Publishing" },
            { id: "settings", icon: "⚙", label: "Settings" },
          ].map((item) => (
            <button key={item.id} style={{ ...styles.navItem, ...(activeTab === item.id ? styles.navItemActive : {}) }} onClick={() => { setActiveTab(item.id); setSelectedClient(null); setPreviousView(null); setMobileMenuOpen(false); if (item.id === "imagelib") { loadIlImages(); } }}>
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
              {activeTab === "imagelib" && "Image Library"}
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
                    {addingIndustryFor === "new" ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input autoFocus style={{ ...styles.searchInput, flex: 1 }} placeholder="New industry name..." value={inlineIndustryInput} onChange={e => setInlineIndustryInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              const name = inlineIndustryInput.trim().toUpperCase();
                              if (name && !industries.includes(name)) setIndustries(prev => [...prev, name]);
                              if (name) setNewClient(prev => ({ ...prev, industry: name || prev.industry }));
                              setAddingIndustryFor(null); setInlineIndustryInput("");
                            }
                            if (e.key === "Escape") { setAddingIndustryFor(null); setInlineIndustryInput(""); }
                          }} />
                        <button style={{ ...styles.addBtn, padding: "8px 14px", fontSize: 11, flexShrink: 0 }} onClick={() => {
                          const name = inlineIndustryInput.trim().toUpperCase();
                          if (name && !industries.includes(name)) setIndustries(prev => [...prev, name]);
                          if (name) setNewClient(prev => ({ ...prev, industry: name || prev.industry }));
                          setAddingIndustryFor(null); setInlineIndustryInput("");
                        }}>Add</button>
                        <button style={{ ...styles.addBtn, background: "none", border: "1px solid #333", color: "#666", padding: "8px 14px", fontSize: 11, flexShrink: 0 }} onClick={() => { setAddingIndustryFor(null); setInlineIndustryInput(""); }}>Cancel</button>
                      </div>
                    ) : (
                      <select style={styles.selectInput} value={newClient.industry} onChange={e => {
                        if (e.target.value === "__ADD_NEW__") { setAddingIndustryFor("new"); setInlineIndustryInput(""); }
                        else setNewClient({ ...newClient, industry: e.target.value });
                      }}>
                        {industries.map(i => <option key={i} value={i}>{i}</option>)}
                        <option value="__ADD_NEW__">+ Add New...</option>
                      </select>
                    )}
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
                      setEditingClient(false);
                      setClientEdits({});
                      loadScheduleJobs(client.id);
                      loadMonthlyQueue(client.id);
                      loadGbpStatus(client.id);
                      loadClientImages(client.id);
                      setGbpPostResult(null);
                      setShowGbpComposer(false);
                      setShowGbpAssignPanel(false);
                      setCompetitors(client.competitors || []);
                      setClientProfileExpanded(false);
                      setProfileExpanded(false);
                      setScheduleExpanded(false);
                      setGbpExpanded(false);
                      setPersonalityExpanded(false);
                      setPersonalityEdits(null);
                      setScheduledPostsExpanded(false);
                      setArchivedPostsExpanded(false);
                      setScheduledQueueExpanded(false);
                                            setImageGalleryExpanded(false);
                      setScheduleSettings({
                        schedule_frequency: client.schedule_frequency || "daily",
                        schedule_days: client.schedule_days || ["Mon","Tue","Wed","Thu","Fri"],
                        schedule_start_hour: client.schedule_start_hour || 9,
                        schedule_end_hour: client.schedule_end_hour || 12,
                        schedule_timezone: client.schedule_timezone || "America/New_York",
                      });
                      setScheduleSettingsDirty(false);
                      setScheduleSettingsSaved(false);
                    };
                    return (
                      <div key={client.id} style={styles.clientCard} onClick={handleClientClick} onMouseEnter={e => e.currentTarget.style.borderColor = "#dc2626"} onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}>
                        <div style={styles.clientCardTop}>
                          <div style={styles.clientAvatar}>
                            {client.logo_url
                              ? <img src={client.logo_url} alt={client.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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
                      setShowGbpAssignPanel(false);
                      setCompetitors(client.competitors || []);
                      setClientProfileExpanded(false);
                      setProfileExpanded(false);
                      setScheduleExpanded(false);
                      setGbpExpanded(false);
                      setPersonalityExpanded(false);
                      setPersonalityEdits(null);
                      setScheduledPostsExpanded(false);
                      setArchivedPostsExpanded(false);
                      setScheduledQueueExpanded(false);
                                            setImageGalleryExpanded(false);
                      setScheduleSettings({
                        schedule_frequency: client.schedule_frequency || "daily",
                        schedule_days: client.schedule_days || ["Mon","Tue","Wed","Thu","Fri"],
                        schedule_start_hour: client.schedule_start_hour || 9,
                        schedule_end_hour: client.schedule_end_hour || 12,
                        schedule_timezone: client.schedule_timezone || "America/New_York",
                      });
                      setScheduleSettingsDirty(false);
                      setScheduleSettingsSaved(false);
                    };
                    return (
                      <div key={client.id} onClick={handleClientClick}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.background = "#111"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.background = "#0d0d0d"; }}
                        style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", background: "#0d0d0d", borderTop: "2px solid #1a1a1a", cursor: "pointer", transition: "all 0.15s" }}>
                        <div style={{ ...styles.clientAvatar, flexShrink: 0, width: 36, height: 36, fontSize: 15 }}>
                          {client.logo_url
                            ? <img src={client.logo_url} alt={client.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 2 }} />
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

                {/* ── CLIENT PROFILE DROPDOWN ── */}
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => setClientProfileExpanded(v => !v)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", padding: "0 0 12px 0" }}
                  >
                    <div style={{ ...styles.clientDetailAvatar, overflow: "hidden", flexShrink: 0 }}>
                      {selectedClient.logo_url
                        ? <img src={selectedClient.logo_url} alt={selectedClient.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : selectedClient.name.charAt(0)}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={styles.clientDetailName}>{selectedClient.name}</div>
                      <div style={styles.clientDetailIndustry}>{selectedClient.industry} · {selectedClient.domain || "No domain set"}</div>
                    </div>
                    {clientProfileExpanded && !editingClient && (
                      <button
                        style={{ fontSize: 11, padding: "4px 12px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", border: "1px solid #333", background: "transparent", color: "#888", borderRadius: 2, flexShrink: 0 }}
                        onClick={e => { e.stopPropagation(); startEditClient(); }}
                      >✎ Edit</button>
                    )}
                    <span style={{ fontSize: 18, color: "#fff", transition: "transform 0.2s", display: "inline-block", transform: clientProfileExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>▾</span>
                  </button>

                  {clientProfileExpanded && (
                    <div style={{ paddingTop: 8 }}>
                      {editingClient ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                          <button style={{ ...styles.addBtn, fontSize: 11, padding: "6px 14px" }} onClick={saveClientEdits} disabled={savingClient}>{savingClient ? "Saving..." : "Save Changes"}</button>
                          <button style={{ ...styles.addBtn, background: "none", border: "1px solid #d60000", color: "#d60000", fontSize: 11, padding: "6px 14px" }} onClick={() => setEditingClient(false)}>Cancel</button>
                          <div style={{ flex: 1 }} />
                          <button style={{ ...styles.connectBtn, fontSize: 11, padding: "6px 14px", borderColor: "#333", color: "#555" }} onClick={() => deleteClient(selectedClient)}>✕ Delete Client</button>
                        </div>
                      ) : (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                            {[
                              { label: "Domain", value: selectedClient.domain },
                              { label: "Service Area", value: selectedClient.service_area },
                              { label: "Industry", value: selectedClient.industry },
                              { label: "Industry Tags", value: Array.isArray(selectedClient.industry_tags) ? selectedClient.industry_tags.join(", ") : selectedClient.industry_tags },
                              { label: "WordPress URL", value: selectedClient.wordpress_url },
                              { label: "WP Username", value: selectedClient.wordpress_username },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 3 }}>{label}</div>
                                <div style={{ fontSize: 12, color: value ? "#ccc" : "#333", fontFamily: "'Barlow Condensed', sans-serif" }}>{value || "Not set"}</div>
                              </div>
                            ))}
                            <div style={{ gridColumn: "1 / -1" }}>
                              <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 3 }}>Brand Voice</div>
                              <div style={{ fontSize: 12, color: selectedClient.brand_voice ? "#ccc" : "#333", fontFamily: "'Barlow Condensed', sans-serif", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{selectedClient.brand_voice || "Not set"}</div>
                            </div>
                          </div>
                          <div style={{ marginTop: 14, marginBottom: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                              <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>Competitors</div>
                              <button style={{ ...styles.connectBtn, fontSize: 10, padding: "3px 10px" }} onClick={findCompetitors} disabled={findingCompetitors}>{findingCompetitors ? "Searching..." : "⟳ Auto-Find"}</button>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {competitors.map((comp, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#111", border: "1px solid #1f1f1f", borderRadius: 6, padding: "4px 10px" }}>
                                  <span style={{ fontSize: 12, color: "#ccc", fontFamily: "'Barlow Condensed', sans-serif" }}>{comp}</span>
                                  <button style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }} onClick={() => { const u = competitors.filter((_, idx) => idx !== i); setCompetitors(u); saveCompetitors(u); }}>x</button>
                                </div>
                              ))}
                              {competitors.length < 5 && (
                                <button style={{ ...styles.connectBtn, fontSize: 11 }} onClick={() => {
                                  const domain = prompt("Enter competitor domain (e.g. competitor.com):");
                                  if (domain && competitors.length < 5) { const updated = [...competitors, domain.trim().replace(/^https?:\/\//, "")]; setCompetitors(updated); saveCompetitors(updated); }
                                }}>+ Add</button>
                              )}
                            </div>
                            {competitors.length > 0 && <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>{competitors.length}/5 competitors tracked</div>}
                            {competitors.length === 0 && <div style={{ fontSize: 11, color: "#333", marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>No competitors set</div>}
                          </div>

                        </div>
                      )}

                      {editingClient && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ position: "relative", cursor: "pointer" }}
                              onClick={() => logoInputRef.current && logoInputRef.current.click()}
                              title="Click to upload logo">
                              <div style={{ ...styles.clientDetailAvatar, overflow: "hidden", width: 48, height: 48 }}>
                                {selectedClient.logo_url
                                  ? <img src={selectedClient.logo_url} alt={selectedClient.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                  : selectedClient.name.charAt(0)}
                                {logoUploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>...</div>}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, color: "#d60000", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", cursor: "pointer" }}
                                onClick={() => logoInputRef.current && logoInputRef.current.click()}>
                                {logoUploading ? "Uploading..." : "Upload Logo"}
                              </div>
                              <div style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif" }}>Click avatar to replace</div>
                            </div>
                            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => uploadClientLogo(e, selectedClient.id)} />
                          </div>
                        </div>
                      )}


                {editingClient ? (
                  <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 24, marginBottom: 24 }}>
                    <div style={{ fontSize: 11, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Edit Client Settings</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <div style={styles.postMetaLabel}>Domain</div>
                        <input style={{ ...styles.searchInput, marginTop: 6 }} value={clientEdits.domain} onChange={e => setClientEdits({ ...clientEdits, domain: e.target.value })} placeholder="clientsite.com" />
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>Service Area</div>
                        <input style={{ ...styles.searchInput, marginTop: 6 }} value={clientEdits.service_area} onChange={e => setClientEdits({ ...clientEdits, service_area: e.target.value })} placeholder="City and state (e.g. Charlotte, NC)" />
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>Industry</div>
                        {addingIndustryFor === "edit" ? (
                          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                            <input autoFocus style={{ ...styles.searchInput, flex: 1 }} placeholder="New industry name..." value={inlineIndustryInput} onChange={e => setInlineIndustryInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  const name = inlineIndustryInput.trim().toUpperCase();
                                  if (name && !industries.includes(name)) setIndustries(prev => [...prev, name]);
                                  if (name) setClientEdits(prev => ({ ...prev, industry: name || prev.industry }));
                                  setAddingIndustryFor(null); setInlineIndustryInput("");
                                }
                                if (e.key === "Escape") { setAddingIndustryFor(null); setInlineIndustryInput(""); }
                              }} />
                            <button style={{ ...styles.addBtn, padding: "8px 14px", fontSize: 11, flexShrink: 0 }} onClick={() => {
                              const name = inlineIndustryInput.trim().toUpperCase();
                              if (name && !industries.includes(name)) setIndustries(prev => [...prev, name]);
                              if (name) setClientEdits(prev => ({ ...prev, industry: name || prev.industry }));
                              setAddingIndustryFor(null); setInlineIndustryInput("");
                            }}>Add</button>
                            <button style={{ ...styles.addBtn, background: "none", border: "1px solid #333", color: "#666", padding: "8px 14px", fontSize: 11, flexShrink: 0 }} onClick={() => { setAddingIndustryFor(null); setInlineIndustryInput(""); }}>Cancel</button>
                          </div>
                        ) : (
                          <select style={{ ...styles.selectInput, marginTop: 6, width: "100%" }} value={clientEdits.industry || ""} onChange={e => {
                            if (e.target.value === "__ADD_NEW__") { setAddingIndustryFor("edit"); setInlineIndustryInput(""); }
                            else setClientEdits({ ...clientEdits, industry: e.target.value });
                          }}>
                            <option value="">-- Select Industry --</option>
                            {industries.map(i => <option key={i} value={i}>{i}</option>)}
                            <option value="__ADD_NEW__">+ Add New...</option>
                          </select>
                        )}
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>Industry Tags</div>
                        <input style={{ ...styles.searchInput, marginTop: 6 }} value={clientEdits.industry_tags || ""} onChange={e => setClientEdits({ ...clientEdits, industry_tags: e.target.value })} placeholder="hvac, plumbing, electrical..." />
                        <div style={{ fontSize: 10, color: "#555", marginTop: 4, fontFamily: "'Barlow', sans-serif" }}>Comma-separated — used to pull matching keywords from the library</div>
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
                    <div style={{ marginBottom: 16 }}>
                      <div style={styles.postMetaLabel}>Brand Voice</div>
                      <textarea style={{ ...styles.textArea, marginTop: 6 }} value={clientEdits.brand_voice} onChange={e => setClientEdits({ ...clientEdits, brand_voice: e.target.value })} placeholder="Describe the client's tone, style, and any specific keywords or phrases to use..." />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={styles.postMetaLabel}>Competitors</div>
                        <button style={{ ...styles.connectBtn, fontSize: 10 }} onClick={findCompetitors} disabled={findingCompetitors}>
                          {findingCompetitors ? "Searching..." : "⟳ Auto-Find"}
                        </button>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {competitors.map((comp, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, padding: "4px 10px" }}>
                            <span style={{ fontSize: 12, color: "#ccc" }}>{comp}</span>
                            <button style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }} onClick={() => { const u=[...competitors]; u.splice(i,1); setCompetitors(u); saveCompetitors(selectedClient.id, u); }}>×</button>
                          </div>
                        ))}
                        {competitors.length < 5 && (
                          <button style={{ ...styles.connectBtn, fontSize: 11 }} onClick={() => {
                            const domain = prompt("Enter competitor domain (e.g. competitor.com):");
                            if (domain && competitors.length < 5) { const updated = [...competitors, domain.trim().replace(/^https?:\/\//,"")]; setCompetitors(updated); saveCompetitors(selectedClient.id, updated); }
                          }}>+ Add</button>
                        )}
                      </div>
                      {competitors.length > 0 && <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>{competitors.length}/5 competitors tracked</div>}
                    </div>
                  </div>
                ) : null}
                    </div>
                  )}
                </div>

                {/* ── CONNECTED APPS DROPDOWN ── */}
                <div style={{ marginBottom: 20 }}>
                    <button
                      onClick={() => setProfileExpanded(v => !v)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "0 0 12px 0" }}
                    >
                      <div style={styles.sectionTitle}>Connected Apps</div>
                      <span style={{ fontSize: 18, color: "#fff", transition: "transform 0.2s", display: "inline-block", transform: profileExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                    </button>
                    {profileExpanded && (
                  <div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                    {[
                      { label: "WordPress", status: selectedClient.wordpress_url && selectedClient.wordpress_username ? "Connected" : "Not Connected", icon: "W" },
                      { label: "Google Business", status: gbpStatus.connected ? "Connected" : "Not Connected", icon: "G", gbp: true },
                      { label: "Brand Voice", status: selectedClient.brand_voice ? "Set" : "Not Set", icon: "✦" },
                    ].map((item) => (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#111", border: "1px solid #1a1a1a", borderRadius: 6 }}>
                        <div style={{ width: 24, height: 24, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#888", fontFamily: "'Oswald', sans-serif", borderRadius: 3, flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ flex: 1, fontSize: 11, color: "#fff", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</div>
                        <div style={{ fontSize: 10, letterSpacing: "0.06em", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", color: item.status === "Connected" || item.status === "Set" ? "#22c55e" : "#444" }}>{item.status}</div>
                        <button style={{ ...styles.connectBtn, fontSize: 9, padding: "4px 10px" }} onClick={() => {
                          if (item.gbp) {
                            if (!gbpAgencyConnected) {
                              connectAgencyGbp();
                            } else if (gbpStatus.connected) {
                              disconnectGbp(selectedClient.id);
                            } else {
                              setShowGbpAssignPanel(v => !v);
                            }
                          } else {
                            startEditClient();
                          }
                        }}>
                          {item.gbp
                            ? (!gbpAgencyConnected ? "Connect" : gbpStatus.connected ? "Unassign" : "Assign")
                            : (item.status === "Not Connected" || item.status === "Not Set" ? "Connect" : "Configure")}
                        </button>
                      </div>
                    ))}
                  </div>

                  </div>
                  )}
                </div>

                {/* GBP ASSIGN PANEL — dropdown from G tile */}
                {!editingClient && gbpAgencyConnected && !gbpStatus.connected && showGbpAssignPanel && (
                  <div style={{ marginBottom: 24, background: "#0a0a0a", border: "1px solid #1f1f1f", borderTop: "2px solid #d60000", borderRadius: "0 0 8px 8px", padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ fontSize: 10, color: "#d60000", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                        Assign GBP Location to This Client
                      </div>
                      <button onClick={() => setShowGbpAssignPanel(false)} style={{ background: "none", border: "none", color: "#555", fontSize: 16, cursor: "pointer", lineHeight: 1 }}>✕</button>
                    </div>

                    {/* Manual entry */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 10, color: "#666", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Business Name (display label)</div>
                      <input
                        style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#fff", padding: "10px 12px", fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif", borderRadius: 4, boxSizing: "border-box", marginBottom: 10 }}
                        placeholder="e.g. David & Goliath HVAC"
                        value={gbpManualTitle || ""}
                        onChange={e => setGbpManualTitle(e.target.value)}
                      />
                      <div style={{ fontSize: 10, color: "#666", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                        GBP Location ID — <span style={{ color: "#d60000", textTransform: "none" }}>business.google.com → Info → Business Profile ID</span>
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
                          assignGbpLocation(selectedClient.id, { name: `locations/${gbpManualLocationId}`, title: gbpManualTitle, accountName: "" });
                          setShowGbpAssignPanel(false);
                        }}
                      >
                        Assign Location
                      </button>
                    </div>

                    {/* Auto-detect */}
                    <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 14 }}>
                      <div style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Or Auto-Detect from Your Account</div>
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
                              <button style={styles.addBtn} onClick={() => { assignGbpLocation(selectedClient.id, loc); setShowGbpAssignPanel(false); }}>Assign</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SCHEDULING */}
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => setScheduleExpanded(v => !v)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: scheduleExpanded ? 16 : 0 }}
                  >
                    <div style={styles.sectionTitle}>Publishing Schedule</div>
                    <span style={{ fontSize: 18, color: "#fff", transition: "transform 0.2s", display: "inline-block", transform: scheduleExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                    <span style={{ fontSize: 12, color: selectedClient.schedule_enabled ? "#22c55e" : "#555", marginLeft: "auto" }}>
                      {selectedClient.schedule_enabled ? "● Active" : "○ Inactive"}
                    </span>
                  </button>
                  {scheduleExpanded && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                      <button style={{ ...styles.connectBtn, background: selectedClient.schedule_enabled ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", borderColor: selectedClient.schedule_enabled ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)", color: selectedClient.schedule_enabled ? "#ef4444" : "#22c55e" }}
                        onClick={() => toggleSchedule(selectedClient.id, !selectedClient.schedule_enabled)}>
                        {selectedClient.schedule_enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                    <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                      <div>
                        <div style={styles.postMetaLabel}>Frequency</div>
                        <select style={{ ...styles.selectInput, width: "100%", marginTop: 6 }} value={scheduleSettings.schedule_frequency || "daily"} onChange={e => {
                          setScheduleSettings(prev => ({ ...prev, schedule_frequency: e.target.value }));
                          setScheduleSettingsDirty(true);
                          setScheduleSettingsSaved(false);
                        }}>
                          <option value="daily">Daily</option>
                          <option value="every_other_day">Every Other Day</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>Publish Window Start</div>
                        <select style={{ ...styles.selectInput, width: "100%", marginTop: 6 }} value={scheduleSettings.schedule_start_hour || 9} onChange={e => {
                          setScheduleSettings(prev => ({ ...prev, schedule_start_hour: parseInt(e.target.value) }));
                          setScheduleSettingsDirty(true);
                          setScheduleSettingsSaved(false);
                        }}>
                          {[6,7,8,9,10,11,12,13,14,15,16,17].map(h => <option key={h} value={h}>{h > 12 ? `${h-12}pm` : h === 12 ? "12pm" : `${h}am`}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={styles.postMetaLabel}>Publish Window End</div>
                        <select style={{ ...styles.selectInput, width: "100%", marginTop: 6 }} value={scheduleSettings.schedule_end_hour || 12} onChange={e => {
                          setScheduleSettings(prev => ({ ...prev, schedule_end_hour: parseInt(e.target.value) }));
                          setScheduleSettingsDirty(true);
                          setScheduleSettingsSaved(false);
                        }}>
                          {[7,8,9,10,11,12,13,14,15,16,17,18].map(h => <option key={h} value={h}>{h > 12 ? `${h-12}pm` : h === 12 ? "12pm" : `${h}am`}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <div style={styles.postMetaLabel}>Publish Days</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => {
                          const days = scheduleSettings.schedule_days || ["Mon","Tue","Wed","Thu","Fri"];
                          const active = days.includes(day);
                          return (
                            <button key={day} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "inherit", border: "1px solid", background: active ? "rgba(220,38,38,0.1)" : "none", borderColor: active ? "rgba(220,38,38,0.3)" : "#1f1f1f", color: active ? "#dc2626" : "#555" }}
                              onClick={() => {
                                const updated = active ? days.filter(d => d !== day) : [...days, day];
                                setScheduleSettings(prev => ({ ...prev, schedule_days: updated }));
                                setScheduleSettingsDirty(true);
                                setScheduleSettingsSaved(false);
                              }}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
                      {scheduleSettingsSaved && !scheduleSettingsDirty && (
                        <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>
                          ✓ Saved
                        </span>
                      )}
                      <button
                        onClick={async () => {
                          setSavingSchedule(true);
                          try {
                            const res = await authFetch(`${API}/api/schedule/${selectedClient.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(scheduleSettings)
                            });
                            const data = await res.json();
                            setSelectedClient(prev => ({ ...prev, ...data.client }));
                            setScheduleSettingsDirty(false);
                            setScheduleSettingsSaved(true);
                          } catch (e) {
                            alert("Failed to save schedule settings. Please try again.");
                          }
                          setSavingSchedule(false);
                        }}
                        disabled={savingSchedule || !scheduleSettingsDirty}
                        style={{ padding: "8px 20px", borderRadius: 6, border: "none", cursor: scheduleSettingsDirty ? "pointer" : "default", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", background: scheduleSettingsDirty ? "#d60000" : "#1a1a1a", color: scheduleSettingsDirty ? "#fff" : "#444", transition: "background 0.15s, color 0.15s" }}
                      >
                        {savingSchedule ? "Saving..." : "Save Schedule"}
                      </button>
                    </div>
                  </div>
                  </div>
                  )}

                </div>

                {/* GOOGLE BUSINESS PROFILE POSTS */}
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => setGbpExpanded(v => !v)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: gbpExpanded ? 16 : 0 }}
                  >
                    <div style={styles.sectionTitle}>Google Business Profile</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {gbpStatus.connected && gbpExpanded && (
                        <button style={styles.addBtn} onClick={e => { e.stopPropagation(); setShowGbpComposer(!showGbpComposer); setGbpPostResult(null); }}>
                          {showGbpComposer ? "Cancel" : "+ New Post"}
                        </button>
                      )}
                      <span style={{ fontSize: 18, color: "#fff", transition: "transform 0.2s", display: "inline-block", transform: gbpExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                    </div>
                  </button>
                  {gbpExpanded && (
                  <div>
                    {gbpStatus.connected && gbpStatus.locationTitle && (
                      <div style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", marginBottom: 10, paddingTop: 4 }}>
                        {gbpStatus.locationTitle}
                      </div>
                    )}
                    {!gbpAgencyConnected && (
                      <div style={{ padding: "20px 0", textAlign: "center" }}>
                        <div style={{ color: "#555", fontSize: 13, marginBottom: 12 }}>Google account not connected to this agency.</div>
                        <button style={styles.addBtn} onClick={connectAgencyGbp}>Connect Google Account</button>
                      </div>
                    )}
                    {gbpAgencyConnected && !gbpStatus.connected && (
                      <div style={{ padding: "16px 0" }}>
                        <div style={{ color: "#555", fontSize: 12, marginBottom: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>No location assigned — select one to link this client</div>
                        {gbpLocationsLoading && <div style={{ color: "#555", fontSize: 12 }}>Loading locations...</div>}
                        {gbpLocationsError && <div style={{ color: "#d60000", fontSize: 12, marginBottom: 10 }}>{gbpLocationsError}</div>}
                        {!gbpLocationsLoading && gbpLocations.length === 0 && !gbpLocationsError && (
                          <button style={{ ...styles.connectBtn, marginBottom: 10 }} onClick={loadGbpLocations}>Load Locations</button>
                        )}
                        {gbpLocations.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                            {gbpLocations.map((loc, i) => (
                              <button key={i} style={{ ...styles.connectBtn, textAlign: "left", padding: "8px 14px" }} onClick={() => assignGbpLocation(selectedClient.id, loc)}>
                                {loc.title || loc.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {gbpAgencyConnected && gbpStatus.connected && showGbpComposer && (
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
                    {gbpAgencyConnected && gbpStatus.connected && gbpPosts.length === 0 && !showGbpComposer && (
                      <div style={{ padding: "16px 0", color: "#444", fontSize: 12, textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif" }}>No GBP posts yet. Click + New Post above to publish your first update.</div>
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
                </div>


                {/* ── AI PERSONALITY SECTION ── */}
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => {
                      const opening = !personalityExpanded;
                      setPersonalityExpanded(opening);
                      if (opening && !personalityEdits) {
                        const p = selectedClient.ai_personality || {};
                        const defaultRules = [
                          { text: "Write for homeowners — friendly, helpful, and trustworthy tone", disabled: false },
                          { text: "Never write DIY repair instructions — help readers identify and diagnose problems only", disabled: false },
                          { text: "Always recommend hiring a licensed professional for actual repairs", disabled: false },
                          { text: "Use proper HTML tags only (h2, h3, p, ul, li, strong) — no markdown", disabled: false },
                          { text: "Include exactly 4 FAQs with natural conversational questions homeowners ask", disabled: false },
                          { text: "Meta description must be 120-156 characters and include the target keyword", disabled: false },
                          { text: "Title must be 50-60 characters and SEO optimized", disabled: false },
                          { text: "Link to 1 relevant service page and 1 contact/quote page internally", disabled: false },
                          { text: "Use inclusive language as defined by Yoast SEO — avoid gendered terms, ableist language, and exclusionary phrases", disabled: false },
                        ];
                        setPersonalityEdits({
                          tone: p.tone || "professional",
                          rules: (p.rules && p.rules.length > 0) ? p.rules : defaultRules,
                          excluded_words: p.excluded_words || [],
                        });
                      }
                    }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "0 0 12px 0" }}
                  >
                    <div style={styles.sectionTitle}>AI Personality</div>
                    <span style={{ fontSize: 18, color: "#fff", transition: "transform 0.2s", display: "inline-block", transform: personalityExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                  </button>
                  {personalityExpanded && personalityEdits && (
                    <div style={{ paddingBottom: 8 }}>

                      {/* Tone */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Content Tone</div>
                        <select
                          value={personalityEdits.tone}
                          onChange={e => setPersonalityEdits(prev => ({ ...prev, tone: e.target.value }))}
                          style={{ ...styles.selectInput, width: "100%" }}
                        >
                          <option value="professional">Professional and Trustworthy</option>
                          <option value="friendly">Friendly and Approachable</option>
                          <option value="playful">Playful and Animated</option>
                          <option value="authoritative">Authoritative and Expert</option>
                          <option value="conversational">Casual and Conversational</option>
                          <option value="urgent">Urgent and Direct</option>
                        </select>
                        <div style={{ fontSize: 10, color: "#333", fontFamily: "'Barlow', sans-serif", marginTop: 6 }}>
                          Brand voice from the client profile is always applied automatically — this tone setting layers on top of it.
                        </div>
                      </div>

                      {/* Content Rules */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Content Rules</div>
                        <div style={{ fontSize: 10, color: "#333", fontFamily: "'Barlow', sans-serif", marginBottom: 10 }}>Check to enable, uncheck to disable. Click x to delete. Edit any rule inline.</div>
                        {personalityEdits.rules.map((rule, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                            <div
                              onClick={() => setPersonalityEdits(prev => ({ ...prev, rules: prev.rules.map((r, i) => i === idx ? { ...r, disabled: !r.disabled } : r) }))}
                              style={{ width: 14, height: 14, borderRadius: 2, border: "1px solid " + (rule.disabled ? "#2a2a2a" : "#d60000"), background: rule.disabled ? "transparent" : "rgba(214,0,0,0.15)", cursor: "pointer", flexShrink: 0, marginTop: 4 }}
                            />
                            <input
                              value={rule.text}
                              onChange={e => setPersonalityEdits(prev => ({ ...prev, rules: prev.rules.map((r, i) => i === idx ? { ...r, text: e.target.value } : r) }))}
                              style={{ flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a", color: rule.disabled ? "#2a2a2a" : "#ccc", borderRadius: 3, padding: "5px 8px", fontSize: 11, fontFamily: "'Barlow', sans-serif", textDecoration: rule.disabled ? "line-through" : "none" }}
                            />
                            <button
                              onClick={() => setPersonalityEdits(prev => ({ ...prev, rules: prev.rules.filter((_, i) => i !== idx) }))}
                              style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 15, padding: "0 2px", flexShrink: 0, lineHeight: 1 }}
                              onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                              onMouseLeave={e => e.currentTarget.style.color = "#333"}
                            >x</button>
                          </div>
                        ))}
                        <button
                          onClick={() => setPersonalityEdits(prev => ({ ...prev, rules: [...prev.rules, { text: "", disabled: false }] }))}
                          style={{ marginTop: 6, fontSize: 10, color: "#555", background: "none", border: "1px dashed #2a2a2a", borderRadius: 3, padding: "5px 12px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", width: "100%" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "#d60000"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}
                        >+ Add Rule</button>
                      </div>

                      {/* Excluded Words */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 10, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Excluded Words / Phrases</div>
                        <div style={{ fontSize: 10, color: "#333", fontFamily: "'Barlow', sans-serif", marginBottom: 8 }}>These words and phrases will never appear in generated content.</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                          {personalityEdits.excluded_words.map((w, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 3, padding: "3px 8px" }}>
                              <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif" }}>{w}</span>
                              <button
                                onClick={() => setPersonalityEdits(prev => ({ ...prev, excluded_words: prev.excluded_words.filter((_, i) => i !== idx) }))}
                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1, opacity: 0.6 }}
                              >x</button>
                            </div>
                          ))}
                          {personalityEdits.excluded_words.length === 0 && (
                            <div style={{ fontSize: 11, color: "#2a2a2a", fontStyle: "italic", fontFamily: "'Barlow', sans-serif" }}>No excluded words yet</div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            value={newExcludedWord}
                            onChange={e => setNewExcludedWord(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter" && newExcludedWord.trim()) {
                                setPersonalityEdits(prev => ({ ...prev, excluded_words: [...prev.excluded_words, newExcludedWord.trim()] }));
                                setNewExcludedWord("");
                              }
                            }}
                            placeholder="e.g. cheap, best price, guarantee..."
                            style={{ flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a", color: "#ccc", borderRadius: 3, padding: "6px 8px", fontSize: 11, fontFamily: "'Barlow', sans-serif" }}
                          />
                          <button
                            onClick={() => {
                              if (newExcludedWord.trim()) {
                                setPersonalityEdits(prev => ({ ...prev, excluded_words: [...prev.excluded_words, newExcludedWord.trim()] }));
                                setNewExcludedWord("");
                              }
                            }}
                            style={{ ...styles.addKeywordBtn, padding: "6px 14px", fontSize: 11, flexShrink: 0 }}
                          >Add</button>
                        </div>
                      </div>

                      {/* Save */}
                      <button
                        disabled={savingPersonality}
                        onClick={async () => {
                          setSavingPersonality(true);
                          try {
                            const res = await authFetch(`${API}/api/clients/${selectedClient.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ai_personality: personalityEdits }),
                            });
                            const data = await res.json();
                            if (data.client) {
                              setClients(prev => prev.map(c => c.id === selectedClient.id ? data.client : c));
                              setSelectedClient(data.client);
                            }
                          } catch(e) { console.error("Personality save error:", e); }
                          setSavingPersonality(false);
                        }}
                        style={{ ...styles.addBtn, width: "100%", opacity: savingPersonality ? 0.6 : 1 }}
                      >{savingPersonality ? "Saving..." : "Save AI Personality"}</button>
                    </div>
                  )}
                </div>

                {/* ── KEYWORD QUEUE SECTION ── */}
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => setScheduledQueueExpanded(v => !v)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "0 0 12px 0" }}
                  >
                    <div style={styles.sectionTitle}>Keyword Queue</div>
                    <span style={{ fontSize: 18, color: "#fff", transition: "transform 0.2s", display: "inline-block", transform: scheduledQueueExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                  </button>
                  {scheduledQueueExpanded && (
                    <div>
                      {scheduleJobs.filter(j => j.status !== "published").length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 10, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                            Scheduled Posts ({scheduleJobs.filter(j => j.status !== "published").length})
                          </div>
                          <div style={styles.table}>
                        <div style={styles.tableHeader}>
                          <div style={{ flex: "0 0 20px" }}></div>
                          <div style={{ flex: 3 }}>Keyword</div>
                          <div style={{ flex: 2 }}>Scheduled Time</div>
                          <div style={{ flex: 1, textAlign: "center" }}>Status</div>
                        </div>
                        {scheduleJobs.filter(j => j.status !== "published").map(job => (
                          <div
                            key={job.id}
                            draggable={job.status === "pending"}
                            onDragStart={() => { if (job.status === "pending") setDragJobId(job.id); }}
                            onDragOver={e => { e.preventDefault(); if (job.status === "pending") setDragOverJobId(job.id); }}
                            onDragLeave={() => setDragOverJobId(null)}
                            onDrop={() => { reorderScheduleJobs(dragJobId, job.id); setDragJobId(null); setDragOverJobId(null); }}
                            onDragEnd={() => { setDragJobId(null); setDragOverJobId(null); }}
                            style={{ ...styles.tableRow, cursor: job.status === "pending" ? "grab" : "default", borderLeft: dragOverJobId === job.id && dragJobId !== job.id ? "2px solid #d60000" : "2px solid transparent", opacity: dragJobId === job.id ? 0.4 : 1, transition: "border-color 0.1s, opacity 0.1s" }}
                          >
                            <div style={{ flex: "0 0 20px", color: job.status === "pending" ? "#333" : "transparent", fontSize: 13, userSelect: "none" }}>⠿</div>
                            <div style={{ flex: 3, color: "#fff" }}>{job.keyword}</div>
                            <div style={{ flex: 2, color: "#aaa" }}>{new Date(job.scheduled_time).toLocaleString()}</div>
                            <div style={{ flex: 1, textAlign: "center" }}>
                              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid", color: job.status === "failed" ? "#ef4444" : job.status === "running" ? "#f59e0b" : "#555", background: job.status === "failed" ? "rgba(239,68,68,0.1)" : job.status === "running" ? "rgba(245,158,11,0.1)" : "#111", borderColor: job.status === "failed" ? "rgba(239,68,68,0.2)" : "#1f1f1f" }}>
                                {job.status}
                              </span>
                            </div>
                          </div>
                        ))}
                          </div>
                        </div>
                      )}
                        {/* Tab Bar */}
                    <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid #222", paddingBottom: 0 }}>
                      {[
                        { key: "monthly", label: `Scheduled Queue${monthlyQueue.length ? ` (${monthlyQueue.length})` : ""}` },
                        { key: "clientkeywords", label: `Client Keywords${clientKeywordsTotal ? ` (${clientKeywordsTotal})` : ""}` },
                                      ].map(t => (
                        <button key={t.key} onClick={() => { setClientTab(t.key); if (t.key === "clientkeywords") loadClientKeywords(selectedClient.id, 1); }} style={{ ...styles.industryTab, ...(clientTab === t.key ? styles.industryTabActive : {}), marginBottom: -1, borderBottom: clientTab === t.key ? "2px solid #d60000" : "1px solid transparent" }}>{t.label}</button>
                      ))}
                    </div>

                    {/* ── MONTHLY QUEUE TAB ── */}
                    {clientTab === "monthly" && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                          <button style={{ ...styles.addBtn, fontSize: 11, padding: "6px 16px" }} onClick={refreshMonthlyQueue} disabled={refreshingQueue}>
                            {refreshingQueue ? "Regenerating..." : "⟳ Regenerate Queue"}
                          </button>
                          <button style={{ ...styles.addBtn, background: "transparent", border: "1px solid #d60000", color: "#d60000", fontSize: 11, padding: "6px 16px" }} onClick={() => { setShowManualKeywordInput(v => !v); setManualKeywordText(""); }}>
                            {showManualKeywordInput ? "✕ Cancel" : "+ Add Keyword"}
                          </button>
                        </div>
                        <>
                        {showManualKeywordInput && (
                          <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: 8, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <input style={{ ...styles.searchInput, flex: "1 1 200px", minWidth: 160 }} placeholder="Enter keyword..." value={manualKeywordText} onChange={e => setManualKeywordText(e.target.value)} onKeyDown={e => e.key === "Enter" && addManualKeyword()} autoFocus />
                            <select value={manualKeywordIntent} onChange={e => setManualKeywordIntent(e.target.value)} style={{ background: "#111", border: "1px solid #333", color: "#ccc", borderRadius: 6, padding: "8px 12px", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", cursor: "pointer" }}>
                              {["Transactional","Informational","Navigational","Commercial"].map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                            <button style={{ ...styles.addBtn, opacity: addingManualKeyword || !manualKeywordText.trim() ? 0.5 : 1 }} onClick={addManualKeyword} disabled={addingManualKeyword || !manualKeywordText.trim()}>{addingManualKeyword ? "Adding..." : "Add to Queue"}</button>
                          </div>
                        )}

                        {monthlyQueue.length === 0 && !queueReplacing ? (
                          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: 24, textAlign: "center" }}>
                            <div style={{ color: "#444", fontSize: 13, marginBottom: 12 }}>No keywords yet. Click "Regenerate Queue" to populate both sections.</div>
                            {queueError && <div style={{ color: "#d60000", fontSize: 12, marginBottom: 12, background: "#1a0000", border: "1px solid #330000", borderRadius: 6, padding: "8px 12px" }}>{queueError}</div>}
                          </div>
                        ) : (
                          <div>
                            {queueReplacing && <div style={{ color: "#d60000", fontSize: 12, marginBottom: 12, padding: "8px 12px", background: "#0d0000", border: "1px solid #330000" }}>⟳ Generating new keyword queue...</div>}
                            {(() => {
                              const startHour = selectedClient.schedule_start_hour || 9;
                              const endHour = selectedClient.schedule_end_hour || 12;
                              const scheduleDays = selectedClient.schedule_days || ["Mon","Tue","Wed","Thu","Fri"];
                              const dayMap = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

                              const renderQueueRows = (rows, baseOffset) => {
                                // Build enough scheduled dates for this batch, skipping non-publish days
                                const scheduledDates = [];
                                const cursor = new Date();
                                cursor.setHours(0,0,0,0);
                                const needed = rows.length + (baseOffset || 0) + 7;
                                while (scheduledDates.length < needed) {
                                  cursor.setDate(cursor.getDate() + 1);
                                  const dayName = dayMap[cursor.getDay()];
                                  if (scheduleDays.includes(dayName)) scheduledDates.push(new Date(cursor));
                                }
                                // Build set of already-used/published keywords for cannibalization warning
                                const normalize = kw => (kw || "").toLowerCase().trim();
                                const publishedKws = new Set(scheduleJobs.filter(j => j.status === "published").map(j => normalize(j.keyword)));
                                const usedKws = new Set(usedKeywords.map(k => normalize(k.keyword || k)));
                                const queueKws = {};
                                rows.forEach(r => {
                                  const n = normalize(r.keyword);
                                  queueKws[n] = (queueKws[n] || 0) + 1;
                                });

                                return rows.map((row, idx) => {
                                const globalIdx = (baseOffset || 0) + idx;
                                const normKw = normalize(row.keyword);
                                const isPublished = publishedKws.has(normKw);
                                const isUsed = usedKws.has(normKw);
                                const isDupeInQueue = queueKws[normKw] > 1;
                                const hasCannibalization = isPublished || isUsed || isDupeInQueue;
                                const cannibalizationTitle = isPublished ? "Already published — keyword cannibalization risk" : isUsed ? "In used keywords list — may already be published" : isDupeInQueue ? "Duplicate keyword in this queue" : "";
                                // Deterministic random minutes per row — seeded from row.id so stable across renders
                                const seed = row.id ? String(row.id).split("").reduce((a,c) => a + c.charCodeAt(0), 0) : idx;
                                const windowMinutes = Math.max(1, (endHour - startHour) * 60);
                                const randMinutes = seed % windowMinutes;
                                const schedDate = scheduledDates[globalIdx] || new Date();
                                const displayHour = startHour + Math.floor(randMinutes / 60);
                                const displayMin = randMinutes % 60;
                                const ampm = displayHour >= 12 ? "PM" : "AM";
                                const h12 = displayHour > 12 ? displayHour - 12 : displayHour === 0 ? 12 : displayHour;
                                const timeStr = `${h12}:${String(displayMin).padStart(2,"0")} ${ampm} EST`;
                                const isSelected = selectedQueueRowId === row.id;
                                const rowPostData = queueRowPosts[row.id];
                                const hasPost = rowPostData && rowPostData.post;
                                const isGenerating = rowPostData && rowPostData.loading;
                                return (
                                  <div key={row.id}
                                    draggable
                                    onDragStart={e => { setDragQueueId(row.id); e.dataTransfer.effectAllowed = "move"; }}
                                    onDragOver={e => { e.preventDefault(); setDragOverQueueId(row.id); }}
                                    onDragEnd={() => { setDragQueueId(null); setDragOverQueueId(null); }}
                                    onDrop={() => reorderQueue(dragQueueId, row.id)}
                                    onClick={() => setSelectedQueueRowId(isSelected ? null : row.id)}
                                    style={{ ...styles.tableRow, cursor: "pointer", borderLeft: isSelected ? "2px solid #d60000" : dragOverQueueId === row.id ? "2px solid #555" : "2px solid transparent", opacity: row.used ? 0.4 : 1, background: isSelected ? "rgba(214,0,0,0.07)" : "transparent" }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#111"; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                                  >
                                    <div style={{ flex: "0 0 28px", color: "#333", fontSize: 11, textAlign: "center" }}>{globalIdx + 1}</div>
                                    <div style={{ flex: 3, color: row.used ? "#555" : "#fff", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                      {hasCannibalization && (
                                        <span title={cannibalizationTitle} style={{ fontSize: 13, cursor: "default", flexShrink: 0 }}>⚠️</span>
                                      )}
                                      <span>{row.keyword}</span>
                                      {row.used && <span style={{ fontSize: 10, color: "#555" }}>used</span>}
                                      {hasPost && <span style={{ fontSize: 10, color: "#22c55e" }}>● post ready</span>}
                                      {hasCannibalization && (
                                        <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                          {isPublished ? "published" : isUsed ? "used" : "duplicate"}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ flex: 1, textAlign: "center" }}>
                                      <span style={{ ...styles.intentBadge, color: getIntentColor(row.intent), background: getIntentColor(row.intent) + "22", borderColor: getIntentColor(row.intent) + "44" }}>{row.intent}</span>
                                    </div>
                                    <div style={{ flex: "0 0 130px", textAlign: "center" }}>
                                      {row.used ? (
                                        <span style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>PUBLISHED</span>
                                      ) : (
                                        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                          <span style={{ fontSize: 12, color: "#ccc", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", fontWeight: 600 }}>
                                            {schedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                          </span>
                                          <span style={{ fontSize: 10, color: "#666", fontFamily: "'Barlow', sans-serif" }}>{timeStr}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ flex: "0 0 220px", display: "flex", gap: 4, justifyContent: "center" }} onClick={e => e.stopPropagation()}>
                                      {hasPost ? (
                                        <button style={{ ...styles.addKeywordBtn, color: "#22c55e", borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)" }} onClick={() => {
                                          setGeneratedPost(rowPostData.post);
                                          setGeneratingPost(row.keyword);
                                          setFeaturedImage(rowPostData.featuredImage || null);
                                          setGeneratedSchemaHtml(rowPostData.schemaHtml || null);
                                          setActiveClient(selectedClient);
                                          setPreviousView({ tab: "clients", client: selectedClient });
                                          setActiveTab("content");
                                        }}>👁 View Post</button>
                                      ) : (
                                        <button style={{ ...styles.addKeywordBtn, opacity: isGenerating ? 0.6 : 1 }} disabled={isGenerating} onClick={() => generateQueueRowPost(row.id, row.keyword, selectedClient)}>{isGenerating ? "⟳ Generating..." : "Generate"}</button>
                                      )}
                                      <button style={{ ...styles.addKeywordBtn, color: "#ef4444", borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)" }} onClick={async () => { await authFetch(`${API}/api/keywords/queue/${row.id}`, { method: "DELETE" }); setMonthlyQueue(prev => prev.filter(r => r.id !== row.id)); }}>✕</button>
                                    </div>
                                  </div>
                                );
                              }); }; // end renderQueueRows

                              const researchRows = monthlyQueue.filter(r => r.source === "library" || r.source === "ai");
                              const gapRows = monthlyQueue.filter(r => r.source === "gap");
                              const otherRows = monthlyQueue.filter(r => !["library","ai","gap"].includes(r.source));
                              const allRows = [...researchRows, ...otherRows]; // research section includes manually-added

                              return (
                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                                  {/* ── KEYWORD RESEARCH SECTION ── */}
                                  <div style={{ border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden" }}>
                                    <div style={{ background: "#0a0a0a", padding: "10px 16px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #1a1a1a", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", color: "#a78bfa", fontWeight: 600 }}>Keyword Research</span>
                                      <button style={{ ...styles.addKeywordBtn, fontSize: 13, padding: "8px 18px", color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.07)" }} onClick={refreshResearchKeywords} disabled={refreshingResearch}>
                                        {refreshingResearch ? "⟳ Loading..." : "↻ Refresh List"}
                                      </button>
                                      <span style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", marginLeft: "auto" }}>{allRows.filter(r => !r.used).length} active</span>
                                    </div>
                                    {allRows.length === 0 ? (
                                      <div style={{ padding: "20px 16px", color: "#444", fontSize: 12, textAlign: "center" }}>No keyword research yet — click Refresh List or Regenerate Queue</div>
                                    ) : (
                                      <div style={styles.table}>
                                        <div style={styles.tableHeader}>
                                          <div style={{ flex: "0 0 28px" }}></div>
                                          <div style={{ flex: 3 }}>Keyword</div>
                                          <div style={{ flex: 1, textAlign: "center" }}>Intent</div>
                                          <div style={{ flex: "0 0 130px", textAlign: "center" }}>Scheduled</div>
                                          <div style={{ flex: "0 0 220px", textAlign: "center" }}>Actions</div>
                                        </div>
                                        {renderQueueRows(allRows, 0)}
                                      </div>
                                    )}
                                  </div>

                                  {/* ── COMPETITOR GAP SECTION ── */}
                                  <div style={{ border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden" }}>
                                    <div style={{ background: "#0a0a0a", padding: "10px 16px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #1a1a1a", flexWrap: "wrap" }}>
                                      <span style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f59e0b", fontWeight: 600 }}>Competitor Gap</span>
                                      <button style={{ ...styles.addKeywordBtn, fontSize: 13, padding: "8px 18px", color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.07)" }} onClick={refreshGapKeywords} disabled={refreshingGap}>
                                        {refreshingGap ? "⟳ Loading..." : "↻ Refresh List"}
                                      </button>
                                      <span style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", marginLeft: "auto" }}>{gapRows.filter(r => !r.used).length} active</span>
                                    </div>
                                    {gapRows.length === 0 ? (
                                      <div style={{ padding: "20px 16px", color: "#444", fontSize: 12, textAlign: "center" }}>No competitor gap keywords — add competitors in Competitors tab, then click Refresh List</div>
                                    ) : (
                                      <div style={styles.table}>
                                        <div style={styles.tableHeader}>
                                          <div style={{ flex: "0 0 28px" }}></div>
                                          <div style={{ flex: 3 }}>Keyword</div>
                                          <div style={{ flex: 1, textAlign: "center" }}>Intent</div>
                                          <div style={{ flex: "0 0 130px", textAlign: "center" }}>Scheduled</div>
                                          <div style={{ flex: "0 0 220px", textAlign: "center" }}>Actions</div>
                                        </div>
                                        {renderQueueRows(gapRows, allRows.length)}
                                      </div>
                                    )}
                                  </div>

                                </div>
                              );
                            })()}
                          </div>
                        )}
                        </>
                      </div>
                    )}

                    {/* ── CLIENT KEYWORDS TAB ── */}
                    {clientTab === "clientkeywords" && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <div style={styles.sectionTitle}>Client Keywords</div>
                          <div style={{ fontSize: 11, color: "#555" }}>Drag a row or click → Queue to move it to Scheduled Queue • ✕ to remove</div>
                        </div>
                        {clientKeywords.length === 0 ? (
                          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: 24, textAlign: "center" }}>
                            <div style={{ color: "#444", fontSize: 13 }}>No keywords assigned to this client yet.</div>
                            <div style={{ color: "#333", fontSize: 11, marginTop: 6 }}>Go to the Keyword Library, select keywords, click "Add to Client" and choose "Client Keywords".</div>
                          </div>
                        ) : (
                          <div>
                            <div style={styles.table}>
                              <div style={styles.tableHeader}>
                                <div style={{ flex: 3 }}>Keyword</div>
                                <div style={{ flex: 1, textAlign: "center" }}>Volume</div>
                                <div style={{ flex: 1, textAlign: "center" }}>Intent</div>
                                <div style={{ flex: "0 0 120px", textAlign: "center" }}>Actions</div>
                              </div>
                              {clientKeywords.map(row => {
                                const normKw = (row.keyword || "").toLowerCase().trim();
                                const ckPublished = new Set(scheduleJobs.filter(j => j.status === "published").map(j => (j.keyword || "").toLowerCase().trim()));
                                const ckUsed = new Set(usedKeywords.map(k => ((k.keyword || k) + "").toLowerCase().trim()));
                                const ckInQueue = new Set(monthlyQueue.map(q => (q.keyword || "").toLowerCase().trim()));
                                const ckCannib = ckPublished.has(normKw) || ckUsed.has(normKw) || ckInQueue.has(normKw);
                                const ckLabel = ckPublished.has(normKw) ? "published" : ckUsed.has(normKw) ? "used" : ckInQueue.has(normKw) ? "in queue" : "";
                                const ckTitle = ckPublished.has(normKw) ? "Already published — keyword cannibalization risk" : ckUsed.has(normKw) ? "In used keywords list" : ckInQueue.has(normKw) ? "Already in Scheduled Queue" : "";
                                return (
                                <div key={row.id}
                                  draggable
                                  onDragStart={e => { e.dataTransfer.setData("clientKwId", row.id); e.dataTransfer.setData("clientKwKeyword", row.keyword); e.dataTransfer.setData("clientKwIntent", row.intent || "Informational"); e.dataTransfer.setData("clientKwVolume", String(row.volume || 0)); e.dataTransfer.effectAllowed = "move"; }}
                                  style={{ ...styles.tableRow, cursor: "grab" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "#111"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                  <div style={{ flex: 3, color: "#fff", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                    <span style={{ color: "#333", fontSize: 13 }}>⠿</span>
                                    {ckCannib && <span title={ckTitle} style={{ fontSize: 13, cursor: "default", flexShrink: 0 }}>⚠️</span>}
                                    <span>{row.keyword}</span>
                                    {ckCannib && <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>{ckLabel}</span>}
                                  </div>
                                  <div style={{ flex: 1, textAlign: "center", color: "#aaa" }}>{(row.volume || 0).toLocaleString()}</div>
                                  <div style={{ flex: 1, textAlign: "center" }}>
                                    <span style={{ ...styles.intentBadge, color: getIntentColor(row.intent), background: getIntentColor(row.intent) + "22", borderColor: getIntentColor(row.intent) + "44" }}>{row.intent}</span>
                                  </div>
                                  <div style={{ flex: "0 0 120px", display: "flex", gap: 4, justifyContent: "center" }}>
                                    <button style={styles.addKeywordBtn} title="Move to Scheduled Queue" onClick={async () => {
                                      await addQueueKeyword(row.keyword, "clientlist", row.intent, row.volume);
                                      await authFetch(`${API}/api/clients/${selectedClient.id}/keywords/${row.id}`, { method: "DELETE" });
                                      setClientKeywords(prev => prev.filter(k => k.id !== row.id));
                                      setClientKeywordsTotal(prev => Math.max(0, prev - 1));
                                    }}>→ Queue</button>
                                    <button style={{ ...styles.addKeywordBtn, color: "#ef4444", borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)" }} onClick={async () => {
                                      await authFetch(`${API}/api/clients/${selectedClient.id}/keywords/${row.id}`, { method: "DELETE" });
                                      setClientKeywords(prev => prev.filter(k => k.id !== row.id));
                                      setClientKeywordsTotal(prev => Math.max(0, prev - 1));
                                    }}>✕</button>
                                  </div>
                                </div>
                                ); })}
                            </div>
                            {clientKeywordsTotal > 20 && (
                              <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
                                <button style={{ ...styles.addKeywordBtn, opacity: clientKeywordsPage === 1 ? 0.3 : 1 }} disabled={clientKeywordsPage === 1} onClick={() => loadClientKeywords(selectedClient.id, clientKeywordsPage - 1)}>← Prev</button>
                                {Array.from({ length: Math.ceil(clientKeywordsTotal / 20) }, (_, i) => i + 1).map(p => (
                                  <button key={p} style={{ ...styles.addKeywordBtn, ...(p === clientKeywordsPage ? { color: "#d60000", borderColor: "#d60000", background: "rgba(214,0,0,0.08)" } : {}) }} onClick={() => loadClientKeywords(selectedClient.id, p)}>{p}</button>
                                ))}
                                <button style={{ ...styles.addKeywordBtn, opacity: clientKeywordsPage >= Math.ceil(clientKeywordsTotal / 20) ? 0.3 : 1 }} disabled={clientKeywordsPage >= Math.ceil(clientKeywordsTotal / 20)} onClick={() => loadClientKeywords(selectedClient.id, clientKeywordsPage + 1)}>Next →</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── USED KEYWORDS TAB ── */}
                    </div>
                  )}
                </div>

                {/* ARCHIVED POSTS — standalone section */}
                <div style={{ marginBottom: 20 }}>
                    <button
                      onClick={() => setArchivedPostsExpanded(v => !v)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "0 0 12px 0" }}
                    >
                      <div style={styles.sectionTitle}>
                        Archived Posts <span style={{ fontSize: 12, color: "#555", fontWeight: 400, fontFamily: "'Barlow Condensed', sans-serif" }}>({scheduleJobs.filter(j => j.status === "published").length})</span>
                      </div>
                      <span style={{ fontSize: 18, color: "#fff", transition: "transform 0.2s", display: "inline-block", transform: archivedPostsExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                    </button>
                    {archivedPostsExpanded && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {scheduleJobs.filter(j => j.status === "published").length === 0 && (
                          <div style={{ fontSize: 12, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em", padding: "10px 0" }}>No published posts yet.</div>
                        )}
                        {scheduleJobs.filter(j => j.status === "published").map(job => {
                          const handleDelete = async (trashWp) => {
                            if (!window.confirm(trashWp ? "Remove from dashboard AND trash the WordPress post?" : "Remove this entry from the dashboard? (WordPress post will NOT be deleted)")) return;
                            try {
                              const r = await authFetch(`${API}/api/schedule/${job.id}?trashWp=${trashWp ? 1 : 0}`, { method: "DELETE" });
                              const d = await r.json();
                              if (d.success) {
                                setScheduleJobs(prev => prev.filter(j => j.id !== job.id));
                              } else {
                                alert("Delete failed: " + (d.error || "Unknown error"));
                              }
                            } catch(err) {
                              alert("Delete failed: " + err.message);
                            }
                          };
                          return (
                            <div key={job.id} style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: 6, padding: "10px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                <span style={{ fontSize: 11, color: "#22c55e", flexShrink: 0 }}>&#x2713;</span>
                                <span style={{ flex: 1, fontSize: 12, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em", fontWeight: 600 }}>{job.keyword}</span>
                                <span style={{ fontSize: 10, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", flexShrink: 0 }}>{new Date(job.published_at || job.scheduled_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                <div style={{ position: "relative", flexShrink: 0 }} className="delete-menu-wrap">
                                  <button
                                    onClick={e => { e.stopPropagation(); const m = e.currentTarget.nextSibling; m.style.display = m.style.display === "block" ? "none" : "block"; }}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#333", fontSize: 14, padding: "0 4px", lineHeight: 1 }}
                                    title="Delete">&#x2715;</button>
                                  <div style={{ display: "none", position: "absolute", right: 0, top: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, zIndex: 100, minWidth: 180, padding: 4 }}>
                                    <button onClick={() => handleDelete(false)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 11, padding: "6px 10px", fontFamily: "'Barlow Condensed', sans-serif" }}
                                      onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#ccc"}>
                                      Remove from dashboard only
                                    </button>
                                    <button onClick={() => handleDelete(true)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "#d60000", fontSize: 11, padding: "6px 10px", fontFamily: "'Barlow Condensed', sans-serif" }}
                                      onMouseEnter={e => e.currentTarget.style.color = "#ff4444"} onMouseLeave={e => e.currentTarget.style.color = "#d60000"}>
                                      Remove + trash WordPress post
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 20 }}>
                                {job.published_url ? (
                                  <a href={job.published_url} target="_blank" rel="noopener noreferrer"
                                    style={{ fontSize: 11, color: "#555", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}
                                    onMouseEnter={e => e.currentTarget.style.color = "#d60000"}
                                    onMouseLeave={e => e.currentTarget.style.color = "#555"}>
                                    &#x2197; {job.published_url.replace(/^https?:\/\//, "")}
                                  </a>
                                ) : (
                                  <span style={{ flex: 1, fontSize: 11, color: "#333" }}>No URL recorded</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>

                                {/* CLIENT IMAGE LIBRARY */}
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={() => { const next = !imageGalleryExpanded; setImageGalleryExpanded(next); if (next && selectedClient) loadClientImages(selectedClient.id); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: imageGalleryExpanded ? 12 : 0 }}
                  >
                    <div style={styles.sectionTitle}>Client Image Library</div>
                    <span style={{ fontSize: 18, color: "#fff", transition: "transform 0.2s", display: "inline-block", transform: imageGalleryExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                  </button>
                  {imageGalleryExpanded && (
                  <div>
                  <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 12 }}>
                    These images are used as featured images when generating posts.
                  </div>

                  {/* Drag-drop upload zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setImageDragOver(true); }}
                    onDragLeave={() => setImageDragOver(false)}
                    onDrop={e => { e.preventDefault(); setImageDragOver(false); uploadClientImageBulk(e.dataTransfer.files); }}
                    style={{
                      border: `2px dashed ${imageDragOver ? "#d60000" : "#2a2a2a"}`,
                      borderRadius: 8,
                      padding: "24px 20px",
                      marginBottom: 16,
                      textAlign: "center",
                      background: imageDragOver ? "rgba(214,0,0,0.05)" : "#0a0a0a",
                      transition: "border-color 0.15s, background 0.15s",
                      cursor: "pointer",
                    }}
                    onClick={() => clientImageInputRef.current?.click()}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8, color: imageDragOver ? "#d60000" : "#333" }}>⬆</div>
                    <div style={{ fontSize: 12, color: imageDragOver ? "#d60000" : "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
                      {imageDragOver ? "DROP TO UPLOAD" : "DRAG & DROP IMAGES HERE, OR CLICK TO BROWSE"}
                    </div>
                    <div style={{ fontSize: 10, color: "#333", marginTop: 4, fontFamily: "'Barlow Condensed', sans-serif" }}>Supports bulk upload — drop multiple files at once</div>
                    <input ref={clientImageInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => uploadClientImageBulk(e.target.files)} />
                  </div>

                  {/* Category + upload queue status */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                    <input style={{ ...styles.searchInput, flex: 1, maxWidth: 220 }} placeholder="Category tag (e.g. technician, truck)" value={clientImageCategory} onChange={e => setClientImageCategory(e.target.value)} />
                    <div style={{ fontSize: 11, color: "#444", fontFamily: "'Barlow Condensed', sans-serif" }}>Applied to all uploads</div>
                  </div>

                  {/* Upload progress */}
                  {clientImageUploadQueue.length > 0 && (
                    <div style={{ marginBottom: 12, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6, padding: "10px 14px" }}>
                      {clientImageUploadQueue.map((f, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#aaa", fontFamily: "'Barlow Condensed', sans-serif", marginBottom: i < clientImageUploadQueue.length - 1 ? 4 : 0 }}>
                          <span style={{ color: f.status === "done" ? "#22c55e" : f.status === "error" ? "#ef4444" : f.status === "uploading" ? "#d60000" : "#444" }}>
                            {f.status === "done" ? "✓" : f.status === "error" ? "✕" : f.status === "uploading" ? "⟳" : "○"}
                          </span>
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                          <span style={{ color: f.status === "done" ? "#22c55e" : f.status === "error" ? "#ef4444" : "#555", fontSize: 10 }}>{f.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {clientImages.length === 0 ? (
                    <div style={{ padding: "24px", background: "#0d0d0d", border: "1px solid #1a1a1a", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>No images yet -- drop some above to get started</div>
                    </div>
                  ) : (
                    <>
                      {/* Client image toolbar */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <button onClick={() => setClientImgSelected(clientImgSelected.size === clientImages.length ? new Set() : new Set(clientImages.map(i => i.id)))}
                          style={{ padding: "4px 12px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid #222", background: "transparent", color: "#555", cursor: "pointer", borderRadius: 3 }}>
                          {clientImgSelected.size === clientImages.length && clientImages.length > 0 ? "Deselect All" : "Select All"}
                        </button>
                        {clientImgSelected.size > 0 && (
                          <>
                            <button onClick={deleteClientImagesSelected}
                              style={{ padding: "4px 14px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid #7f1d1d", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", borderRadius: 3 }}>
                              Delete {clientImgSelected.size} Selected
                            </button>
                            <button onClick={() => setClientImgSelected(new Set())}
                              style={{ padding: "4px 10px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid #222", background: "transparent", color: "#555", cursor: "pointer", borderRadius: 3 }}>Clear</button>
                          </>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                        {clientImages.map(img => {
                          const ciSel = clientImgSelected.has(img.id);
                          return (
                            <div key={img.id} style={{ position: "relative", background: "#0d0d0d", border: `1px solid ${ciSel ? "#d60000" : "#1a1a1a"}`, overflow: "hidden", cursor: "pointer", outline: ciSel ? "1px solid #d60000" : "none" }}
                              onClick={e => {
                                if (e.target.closest(".del-btn")) return;
                                setClientImgSelected(prev => { const n = new Set(prev); if (n.has(img.id)) n.delete(img.id); else n.add(img.id); return n; });
                              }}
                              onDoubleClick={e => { e.stopPropagation(); setEditingImage({ id: img.id, category: img.category || "", description: img.description || "", storage_path: img.storage_path, filename: img.filename, isClientImage: true }); setEditImageCategory(img.category || ""); setEditImageDescription(img.description || ""); }}
                              onMouseEnter={e => { const b = e.currentTarget.querySelector(".del-btn"); if (b) b.style.opacity = "1"; }}
                              onMouseLeave={e => { const b = e.currentTarget.querySelector(".del-btn"); if (b) b.style.opacity = "0"; }}>
                              {ciSel && <div style={{ position: "absolute", top: 4, left: 4, width: 16, height: 16, background: "#d60000", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", zIndex: 2, lineHeight: 1 }}>✓</div>}
                              <img src={img.storage_path} alt={img.category} style={{ width: "100%", height: 90, objectFit: "cover", display: "block", opacity: ciSel ? 0.75 : 1 }} />
                              <div style={{ padding: "4px 6px", fontSize: 10, color: "#555", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.category || "general"}</div>
                              {img.description && <div style={{ padding: "0 6px 4px", fontSize: 9, color: "#444", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{img.description}</div>}
                              <button className="del-btn" onClick={e => { e.stopPropagation(); deleteClientImage(img.id); }}
                                style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s", borderRadius: 2 }}>x</button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* KEYWORD LIBRARY */}
          {activeTab === "library" && (
            <div>


              <div>
                <div>
                  {/* Industry Tabs — drop targets for drag-to-move */}
                  <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 24, flexWrap: "wrap" }}>
                    {industries.map((ind) => (
                      editingIndustryTab === ind ? (
                        <input
                          key={ind}
                          autoFocus
                          style={{ ...styles.searchInput, width: 120, flex: "none", fontSize: 12, padding: "6px 10px" }}
                          value={editingIndustryVal}
                          onChange={e => setEditingIndustryVal(e.target.value)}
                          onBlur={() => renameIndustry(ind, editingIndustryVal)}
                          onKeyDown={e => {
                            if (e.key === "Enter") renameIndustry(ind, editingIndustryVal);
                            if (e.key === "Escape") setEditingIndustryTab(null);
                          }}
                        />
                      ) : (
                        <button
                          key={ind}
                          style={(() => {
                            const col = getIndustryColor(ind);
                            const isActive = activeIndustry === ind;
                            const isDragOver = dragOverIndustry === ind && ind !== activeIndustry;
                            return {
                              ...styles.industryTab,
                              ...(col ? {
                                borderColor: col.border,
                                color: isActive ? "#fff" : col.color,
                                background: isActive ? col.color : col.bg,
                              } : {
                                ...(isActive ? styles.industryTabActive : {}),
                              }),
                              ...(isDragOver ? { background: "rgba(214,0,0,0.25)", borderColor: "#d60000", color: "#fff" } : {}),
                              transition: "all 0.15s",
                            };
                          })()}
                          onClick={() => { setActiveIndustry(ind); setSelectedKwIds(new Set()); setKwSelectMode(false); setEditingKwId(null); }}
                          onDoubleClick={() => { setEditingIndustryTab(ind); setEditingIndustryVal(ind); }}
                          onDragOver={e => { e.preventDefault(); if (ind !== activeIndustry) setDragOverIndustry(ind); }}
                          onDragLeave={() => setDragOverIndustry(null)}
                          onDrop={e => { e.preventDefault(); setDragOverIndustry(null); const draggedId = e.dataTransfer.getData("kwId"); moveKeywordsToIndustry(ind, draggedId); }}
                          title="Double-click to rename"
                        >
                          {ind}<span style={styles.industryCount}>{library[ind]?.length || 0}</span>
                        </button>
                      )
                    ))}
                    {showAddIndustry ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input autoFocus style={{ ...styles.searchInput, width: 140, flex: "none", fontSize: 12, padding: "8px 12px" }} placeholder="Industry name..." value={newIndustryName} onChange={e => setNewIndustryName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addIndustry(); if (e.key === "Escape") { setShowAddIndustry(false); setNewIndustryName(""); } }} />
                        <button style={{ ...styles.addBtn, padding: "8px 14px", fontSize: 11 }} onClick={addIndustry}>Add</button>
                        <button style={{ ...styles.backBtn, marginBottom: 0, padding: "8px 12px" }} onClick={() => { setShowAddIndustry(false); setNewIndustryName(""); }}>✕</button>
                      </div>
                    ) : (
                      <button style={{ ...styles.industryTab, borderStyle: "dashed", color: "#d60000", borderColor: "#d60000" }} onClick={() => setShowAddIndustry(true)}>+ Add Industry</button>
                    )}
                  </div>

                  {/* Select Mode Toolbar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: kwSelectMode || selectedKwIds.size > 0 ? 10 : 16 }}>
                    <button
                      style={{ fontSize: 11, padding: "6px 14px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", border: kwSelectMode ? "1px solid #d60000" : "1px solid #333", background: kwSelectMode ? "rgba(214,0,0,0.12)" : "transparent", color: kwSelectMode ? "#d60000" : "#555", borderRadius: 2, transition: "all 0.15s" }}
                      onClick={() => { setKwSelectMode(m => { if (m) { setSelectedKwIds(new Set()); } return !m; }); setEditingKwId(null); }}
                    >{kwSelectMode ? "✕ Cancel Selection" : "☐ Select Multiple"}</button>
                    {kwSelectMode && selectedKwIds.size > 0 && (
                      <>
                        <button style={{ fontSize: 11, padding: "6px 14px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 2 }}
                          onClick={async () => {
                            if (!window.confirm(`Delete ${selectedKwIds.size} keyword(s)?`)) return;
                            const ids = [...selectedKwIds];
                            await Promise.all(ids.map(id => authFetch(`${API}/api/keywords/library/${id}`, { method: "DELETE" })));
                            setLibrary(prev => ({ ...prev, [activeIndustry]: (prev[activeIndustry] || []).filter(k => !ids.includes(k.id)) }));
                            setSelectedKwIds(new Set());
                          }}>🗑 Delete {selectedKwIds.size}</button>
                        <button style={{ fontSize: 11, padding: "6px 14px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", border: "1px solid rgba(59,130,246,0.4)", background: "rgba(59,130,246,0.1)", color: "#3b82f6", borderRadius: 2 }}
                          onClick={() => { setAddToClientTargets(new Set()); setAddToClientDest("queue"); setAddToClientResult(null); setShowAddToClientModal(true); }}>➕ Add to Client</button>
                        <span style={{ fontSize: 11, color: "#555", fontFamily: "'Barlow Condensed', sans-serif" }}>{selectedKwIds.size} selected — drag to move industry</span>
                      </>
                    )}
                  </div>

                  {/* Add Keyword Row */}
                  <div style={styles.addKeywordRow}>
                    <input style={{ ...styles.searchInput, flex: 3 }} placeholder="Add a keyword..." value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyDown={e => e.key === "Enter" && addKeyword()} />
                    <input style={{ ...styles.searchInput, flex: 1, maxWidth: 100 }} placeholder="Volume" type="number" value={newVolume} onChange={e => setNewVolume(e.target.value)} />
                    <input style={{ ...styles.searchInput, flex: "0 0 70px" }} placeholder="KD" type="number" min="0" max="100" value={newKd} onChange={e => setNewKd(e.target.value)} />
                    <select style={styles.selectInput} value={newIntent} onChange={e => setNewIntent(e.target.value)}>
                      {INTENTS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <button style={styles.addBtn} onClick={addKeyword}>+ Add</button>
                    <label style={{ ...styles.addBtn, background: "transparent", border: "1px solid #d60000", color: "#d60000", cursor: csvImporting ? "not-allowed" : "pointer", opacity: csvImporting ? 0.5 : 1, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {csvImporting ? "⟳ Importing..." : "⬆ Import CSV"}
                      <input type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) importCsv(e.target.files[0]); e.target.value = ""; }} disabled={csvImporting} />
                    </label>
                  </div>

                  {/* CSV Result Toast */}
                  {csvResult && (
                    <div style={{ background: csvResult.errors?.length && !csvResult.imported ? "rgba(214,0,0,0.08)" : "rgba(34,197,94,0.08)", borderLeft: `3px solid ${csvResult.errors?.length && !csvResult.imported ? "#d60000" : "#22c55e"}`, padding: "10px 16px", marginBottom: 16, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'Barlow', sans-serif" }}>
                      <span style={{ color: csvResult.errors?.length && !csvResult.imported ? "#ff4444" : "#22c55e" }}>
                        {csvResult.imported > 0 ? `✓ Imported ${csvResult.imported} of ${csvResult.total} keywords into ${activeIndustry}` : `✗ Import failed: ${csvResult.errors?.[0] || "Unknown error"}`}
                      </span>
                      <button onClick={() => setCsvResult(null)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>✕</button>
                    </div>
                  )}

                  {/* Table */}
                  <div style={styles.table}>
                    <div style={styles.tableHeader}>
                      <div style={{ flex: "0 0 36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {kwSelectMode ? (
                          <input
                            type="checkbox"
                            style={{ cursor: "pointer", accentColor: "#d60000" }}
                            checked={selectedKwIds.size > 0 && (library[activeIndustry] || []).every(r => selectedKwIds.has(r.id))}
                            onChange={e => {
                              const allIds = (library[activeIndustry] || []).map(r => r.id);
                              setSelectedKwIds(e.target.checked ? new Set(allIds) : new Set());
                            }}
                            title="Select all"
                          />
                        ) : (
                          <span style={{ color: "#333", fontSize: 14, userSelect: "none" }}>⠿</span>
                        )}
                      </div>
                      <div style={{ flex: 3, cursor: "pointer", color: libSortField === "keyword" ? "#dc2626" : "#444" }} onClick={() => handleLibSort("keyword")}>Keyword {libSortField === "keyword" ? (libSortDir === "asc" ? "↑" : "↓") : "↕"}</div>
                      <div style={{ flex: 1, textAlign: "center", cursor: "pointer", color: libSortField === "volume" ? "#dc2626" : "#444" }} onClick={() => handleLibSort("volume")}>Volume {libSortField === "volume" ? (libSortDir === "asc" ? "↑" : "↓") : "↕"}</div>
                      <div style={{ flex: "0 0 70px", textAlign: "center", cursor: "pointer", color: libSortField === "kd" ? "#dc2626" : "#444" }} onClick={() => handleLibSort("kd")}>KD {libSortField === "kd" ? (libSortDir === "asc" ? "↑" : "↓") : "↕"}</div>
                      <div style={{ flex: 1, textAlign: "center" }}>Intent</div>
                      <div style={{ flex: "0 0 130px", textAlign: "center" }}>Industry</div>
                      <div style={{ flex: "0 0 32px" }}></div>
                    </div>
                    {getSortedLibrary(library[activeIndustry] || []).map((row) => {
                      const isEditing = editingKwId === row.id;
                      const isSelected = selectedKwIds.has(row.id);
                      const ic = getIndustryColor(activeIndustry);
                      return (
                        <div
                          key={row.id}
                          draggable={!isEditing}
                          onDragStart={e => { e.dataTransfer.setData("kwId", row.id); }}
                          style={{ ...styles.tableRow, cursor: isEditing ? "default" : "grab", background: isEditing ? (ic ? ic.bg : "rgba(214,0,0,0.07)") : isSelected ? "rgba(214,0,0,0.06)" : "transparent", alignItems: "center", outline: isEditing ? ("1px solid " + (ic ? ic.border : "#d60000")) : "none", outlineOffset: -1, transition: "background 0.12s" }}
                          onMouseEnter={e => { if (!isSelected && !isEditing) e.currentTarget.style.background = "#111"; }}
                          onMouseLeave={e => { if (!isSelected && !isEditing) e.currentTarget.style.background = "transparent"; }}
                          onDoubleClick={e => { if (!kwSelectMode) { e.stopPropagation(); setEditingKwId(isEditing ? null : row.id); } }}
                        >
                          {/* Drag handle / checkbox */}
                          <div style={{ flex: "0 0 36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {kwSelectMode ? (
                              <input
                                type="checkbox"
                                style={{ cursor: "pointer", accentColor: "#d60000" }}
                                checked={isSelected}
                                onChange={e => {
                                  setSelectedKwIds(prev => {
                                    const next = new Set(prev);
                                    e.target.checked ? next.add(row.id) : next.delete(row.id);
                                    return next;
                                  });
                                }}
                              />
                            ) : (
                              <span style={{ color: "#444", fontSize: 16, cursor: "grab", userSelect: "none", lineHeight: 1 }} title="Drag to move industry">⠿</span>
                            )}
                          </div>

                          {/* Keyword — always editable on click */}
                          <input
                            style={{ flex: 3, background: "transparent", border: "none", borderBottom: "1px solid transparent", color: "#fff", fontWeight: 500, fontSize: 13, fontFamily: "inherit", padding: "2px 4px", outline: "none", minWidth: 100, cursor: "text" }}
                            defaultValue={row.keyword}
                            onFocus={e => e.currentTarget.style.borderBottomColor = "#d60000"}
                            onBlur={e => {
                              e.currentTarget.style.borderBottomColor = "transparent";
                              const val = e.currentTarget.value.trim();
                              if (val && val !== row.keyword) updateKeyword(row.id, { keyword: val });
                            }}
                            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { e.currentTarget.value = row.keyword; e.currentTarget.blur(); } }}
                            onClick={e => e.stopPropagation()}
                          />

                          {/* Volume — locked unless editing */}
                          {isEditing ? (
                            <input
                              type="number"
                              style={{ flex: 1, maxWidth: 90, background: "transparent", border: "none", borderBottom: "1px solid #555", color: "#aaa", fontSize: 13, fontFamily: "inherit", padding: "2px 4px", outline: "none", textAlign: "center", cursor: "text" }}
                              defaultValue={row.volume || 0}
                              onFocus={e => e.currentTarget.style.borderBottomColor = "#d60000"}
                              onBlur={e => {
                                e.currentTarget.style.borderBottomColor = "#555";
                                const val = parseInt(e.currentTarget.value) || 0;
                                if (val !== (row.volume || 0)) updateKeyword(row.id, { volume: val });
                              }}
                              onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <div style={{ flex: 1, maxWidth: 90, color: "#aaa", fontSize: 13, textAlign: "center", userSelect: "none" }}>{(row.volume || 0).toLocaleString()}</div>
                          )}

                          {/* KD — locked unless editing */}
                          <div style={{ flex: "0 0 70px", textAlign: "center" }}>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0" max="100"
                                style={{ width: 48, background: "transparent", border: "none", borderBottom: "1px solid #555", color: (row.kd || 0) <= 30 ? "#22c55e" : (row.kd || 0) <= 60 ? "#eab308" : "#ef4444", fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", padding: "2px 4px", outline: "none", textAlign: "center", cursor: "text" }}
                                defaultValue={row.kd || ""}
                                placeholder="--"
                                onFocus={e => e.currentTarget.style.borderBottomColor = "#d60000"}
                                onBlur={e => {
                                  e.currentTarget.style.borderBottomColor = "#555";
                                  const val = parseInt(e.currentTarget.value) || 0;
                                  if (val !== (row.kd || 0)) updateKeyword(row.id, { kd: val });
                                }}
                                onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              <span style={{ color: (row.kd || 0) <= 30 ? "#22c55e" : (row.kd || 0) <= 60 ? "#eab308" : "#ef4444", fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>{row.kd || "--"}</span>
                            )}
                          </div>

                          {/* Intent — locked unless editing */}
                          <div style={{ flex: 1, textAlign: "center" }}>
                            {isEditing ? (
                              <select
                                style={{ background: "#111", border: "1px solid #333", color: getIntentColor(row.intent), fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", padding: "2px 6px", outline: "none", cursor: "pointer", letterSpacing: "0.05em", borderRadius: 2 }}
                                defaultValue={row.intent || "Informational"}
                                onChange={e => {
                                  const val = e.currentTarget.value;
                                  if (val !== row.intent) updateKeyword(row.id, { intent: val });
                                }}
                                onClick={e => e.stopPropagation()}
                              >
                                {INTENTS.map(i => <option key={i} value={i} style={{ background: "#111", color: "#fff" }}>{i}</option>)}
                              </select>
                            ) : (
                              <span style={{ color: getIntentColor(row.intent), fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>{row.intent || "—"}</span>
                            )}
                          </div>

                          {/* Industry — locked unless editing */}
                          <div style={{ flex: "0 0 130px", textAlign: "center" }}>
                            {isEditing ? (
                              <select
                                style={{ background: "#111", border: "1px solid #333", color: "#aaa", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", padding: "2px 6px", outline: "none", cursor: "pointer", maxWidth: 125, borderRadius: 2 }}
                                value={row.industry || activeIndustry}
                                onChange={e => {
                                  const val = e.currentTarget.value;
                                  if (val !== (row.industry || activeIndustry)) updateKeyword(row.id, { industry: val });
                                }}
                                onClick={e => e.stopPropagation()}
                              >
                                {industries.map(i => <option key={i} value={i} style={{ background: "#111", color: "#fff" }}>{i}</option>)}
                              </select>
                            ) : (
                              (() => {
                                const ind = row.industry || activeIndustry;
                                const col = getIndustryColor(ind);
                                return (
                                  <span style={{ display: "inline-block", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, padding: "2px 8px", borderRadius: 2, border: "1px solid " + (col ? col.border : "#333"), color: col ? col.color : "#555", background: col ? col.bg : "transparent" }}>{ind}</span>
                                );
                              })()
                            )}
                          </div>

                          {/* Delete — only visible in edit mode */}
                          <div style={{ flex: "0 0 32px", textAlign: "center" }}>
                            {isEditing ? (
                              <button
                                style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, padding: "0 4px", lineHeight: 1 }}
                                onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                                onMouseLeave={e => e.currentTarget.style.color = "#444"}
                                onClick={e => { e.stopPropagation(); removeKeyword(row.id); setEditingKwId(null); }}
                                title="Delete"
                              >✕</button>
                            ) : (
                              <span style={{ color: "#222", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", userSelect: "none" }} title="Double-click row to edit">✎</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                  {industries.map((ind) => (
                    <button key={ind} style={{ ...styles.industryTab, color: imageIndustry === ind ? "#fff" : getIndustryColor(ind).color, borderColor: getIndustryColor(ind).border, background: imageIndustry === ind ? getIndustryColor(ind).border : "transparent" }} onClick={() => { setImageIndustry(ind); loadImages(ind); }}>
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
                    <div key={img.id} style={{ ...styles.imageCard, cursor: "pointer", position: "relative" }} onClick={() => { setEditingImage({ id: img.id, category: img.category || "", description: img.description || "", storage_path: img.storage_path, filename: img.filename }); setEditImageCategory(img.category || ""); setEditImageDescription(img.description || ""); }}>
                      <img src={img.storage_path} alt={img.category} style={styles.imageThumb} />
                      <div style={styles.imageInfo}>
                        <div style={styles.imageName}>{img.category || "general"}</div>
                        <div style={styles.imageFilename}>{img.filename}</div>
                        {img.description && <div style={{ fontSize: 10, color: "#555", marginTop: 3, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{img.description}</div>}
                        {!img.description && <div style={{ fontSize: 10, color: "#333", marginTop: 3, fontStyle: "italic" }}>Click to add description</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* IMAGE LIBRARY (top-level nav) */}
          {activeTab === "imagelib" && (() => {
            const ilFiltered = ilImages.filter(img =>
              ilFilter === "all" ? true : ilFilter === "untagged" ? !img.category : !!img.category
            );
            const allFilteredSelected = ilFiltered.length > 0 && ilFiltered.every(img => ilSelected.has(img.id));
            return (
              <div style={{ paddingBottom: 40 }}>

                {/* DRAG DROP ZONE */}
                <div
                  onDragOver={e => { e.preventDefault(); setIlDragging(true); }}
                  onDragLeave={() => setIlDragging(false)}
                  onDrop={ilHandleDrop}
                  style={{ border: `2px dashed ${ilDragging ? "#d60000" : "#222"}`, borderRadius: 6, padding: "32px 20px", textAlign: "center", marginBottom: 24, background: ilDragging ? "rgba(214,0,0,0.05)" : "#090909", transition: "all 0.15s" }}
                >
                  {ilUploading ? (
                    <div>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Uploading {ilUploadProgress.done} / {ilUploadProgress.total}</div>
                      <div style={{ width: "100%", maxWidth: 240, margin: "0 auto", height: 3, background: "#1a1a1a", borderRadius: 2 }}>
                        <div style={{ height: "100%", background: "#d60000", width: `${ilUploadProgress.total ? (ilUploadProgress.done / ilUploadProgress.total) * 100 : 0}%`, borderRadius: 2, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 8, color: ilDragging ? "#d60000" : "#2a2a2a" }}>▣</div>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: ilDragging ? "#fff" : "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                        {ilDragging ? "Drop to upload" : "Drag & drop images here"}
                      </div>
                      <div style={{ fontSize: 11, color: "#2a2a2a", marginBottom: 12 }}>JPG, PNG, WebP — up to 50 at once</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                        <select
                          value={ilUploadIndustry}
                          onChange={e => setIlUploadIndustry(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{ padding: "6px 10px", background: "#141414", border: "1px solid #2a2a2a", color: ilUploadIndustry ? "#fff" : "#555", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", borderRadius: 3, cursor: "pointer", minWidth: 160 }}
                        >
                          <option value="">-- Select Industry --</option>
                          {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                        <label style={{ display: "inline-block", padding: "6px 16px", background: "#141414", border: "1px solid #2a2a2a", color: "#666", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 3 }}>
                          Browse Files
                          <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={async e => {
                            const fakeDropEvent = { preventDefault: () => {}, dataTransfer: { files: e.target.files } };
                            await ilHandleDrop(fakeDropEvent);
                            e.target.value = "";
                          }} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* INDUSTRY TABS */}
                <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 16, flexWrap: "wrap" }}>
                  {["all", ...industries].map(ind => {
                    const isAll = ind === "all";
                    const active = ilIndustry === ind;
                    const col = isAll ? { color: "#d60000", border: "#d60000", bg: "rgba(214,0,0,0.12)" } : getIndustryColor(ind);
                    return (
                      <button key={ind} onClick={() => { setIlIndustry(ind); setIlSelected(new Set()); loadIlImages(isAll ? "all" : ind); }}
                        style={{ padding: "8px 16px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, border: "1px solid", borderColor: active ? col.border : "#1e1e1e", background: active ? col.bg : "transparent", color: active ? col.color : "#444", cursor: "pointer", transition: "all 0.1s" }}>
                        {isAll ? "All Industries" : ind}
                      </button>
                    );
                  })}
                </div>

                {/* TOOLBAR */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {/* Tagged filter */}
                  <div style={{ display: "flex", gap: 3, background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 4, padding: 3 }}>
                    {["all","untagged","tagged"].map(f => (
                      <button key={f} onClick={() => setIlFilter(f)}
                        style={{ padding: "4px 10px", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: 3, background: ilFilter === f ? "#1e1e1e" : "transparent", color: ilFilter === f ? "#fff" : "#444", cursor: "pointer" }}>
                        {f} ({f === "all" ? ilImages.length : f === "untagged" ? ilImages.filter(i => !i.category).length : ilImages.filter(i => !!i.category).length})
                      </button>
                    ))}
                  </div>

                  {/* View toggle */}
                  <div style={{ display: "flex", gap: 3, background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 4, padding: 3, marginLeft: 4 }}>
                    <button onClick={() => setIlView("grid")}
                      style={{ padding: "4px 10px", fontSize: 12, border: "none", borderRadius: 3, background: ilView === "grid" ? "#1e1e1e" : "transparent", color: ilView === "grid" ? "#fff" : "#444", cursor: "pointer" }} title="Grid view">⊞</button>
                    <button onClick={() => setIlView("list")}
                      style={{ padding: "4px 10px", fontSize: 12, border: "none", borderRadius: 3, background: ilView === "list" ? "#1e1e1e" : "transparent", color: ilView === "list" ? "#fff" : "#444", cursor: "pointer" }} title="List view">☰</button>
                  </div>

                  {/* Right-side actions */}
                  <div style={{ display: "flex", gap: 6, marginLeft: "auto", alignItems: "center" }}>
                    {ilSelected.size > 0 && (
                      <>
                        <button onClick={() => { setIlAssigning(true); setIlAssignClients(new Set()); }}
                          style={{ padding: "5px 14px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid #d60000", background: "#d60000", color: "#fff", cursor: "pointer", borderRadius: 3 }}>
                          Assign {ilSelected.size} to Clients
                        </button>
                        <button onClick={deleteIlImagesSelected}
                          style={{ padding: "5px 14px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid #7f1d1d", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", borderRadius: 3 }}>
                          Delete {ilSelected.size}
                        </button>
                        <button onClick={ilClearSelect}
                          style={{ padding: "5px 10px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid #222", background: "transparent", color: "#555", cursor: "pointer", borderRadius: 3 }}>Clear</button>
                      </>
                    )}
                    <button onClick={allFilteredSelected ? ilClearSelect : ilSelectAll}
                      style={{ padding: "5px 12px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid #222", background: "transparent", color: "#555", cursor: "pointer", borderRadius: 3 }}>
                      {allFilteredSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                </div>

                {/* ASSIGN PANEL */}
                {ilAssigning && (
                  <div style={{ background: "#0d0d0d", border: "1px solid #d60000", borderRadius: 4, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", marginBottom: 12 }}>Assign {ilSelected.size} Image{ilSelected.size !== 1 ? "s" : ""} to Clients</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                      {clients.map(c => {
                        const on = ilAssignClients.has(c.id);
                        return (
                          <button key={c.id} onClick={() => setIlAssignClients(prev => { const n = new Set(prev); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })}
                            style={{ padding: "6px 14px", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", border: "1px solid", borderColor: on ? "#d60000" : "#2a2a2a", background: on ? "rgba(214,0,0,0.15)" : "transparent", color: on ? "#fff" : "#555", cursor: "pointer", borderRadius: 3, transition: "all 0.1s" }}>
                            {on ? "✓ " : ""}{c.name}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={ilDoAssign} disabled={!ilAssignClients.size || ilAssignLoading}
                        style={{ padding: "8px 20px", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", background: ilAssignClients.size ? "#d60000" : "#1a1a1a", color: ilAssignClients.size ? "#fff" : "#333", border: "none", cursor: ilAssignClients.size ? "pointer" : "default", borderRadius: 3 }}>
                        {ilAssignLoading ? "Assigning..." : `Assign to ${ilAssignClients.size} Client${ilAssignClients.size !== 1 ? "s" : ""}`}
                      </button>
                      <button onClick={() => { setIlAssigning(false); setIlAssignClients(new Set()); }}
                        style={{ padding: "8px 16px", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", background: "transparent", color: "#555", border: "1px solid #2a2a2a", cursor: "pointer", borderRadius: 3 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* IMAGE GRID / LIST */}
                {ilFiltered.length === 0 && !ilUploading ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ fontSize: 28, marginBottom: 10, color: "#1e1e1e" }}>▣</div>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase" }}>{ilImages.length === 0 ? "No images yet — drop some above" : "No images match this filter"}</div>
                  </div>
                ) : ilView === "grid" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
                    {ilFiltered.map(img => (
                      <IlImageCard key={img.id} img={img} view="grid" selected={ilSelected.has(img.id)} onToggleSelect={ilToggleSelect} onSave={ilSaveImage} onDelete={ilDeleteImage} industries={industries} />
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "20px 64px 1fr 1fr 1fr auto", gap: 0, padding: "6px 12px", borderBottom: "1px solid #1a1a1a", background: "#111" }}>
                      <div />
                      <div />
                      <div style={{ fontSize: 9, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", paddingLeft: 4 }}>Filename</div>
                      <div style={{ fontSize: 9, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Category</div>
                      <div style={{ fontSize: 9, color: "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Description</div>
                      <div />
                    </div>
                    {ilFiltered.map(img => (
                      <IlImageCard key={img.id} img={img} view="list" selected={ilSelected.has(img.id)} onToggleSelect={ilToggleSelect} onSave={ilSaveImage} onDelete={ilDeleteImage} industries={industries} />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

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
                  {previousView && (
                    <button onClick={() => { setActiveTab(previousView.tab); setSelectedClient(previousView.client); setPreviousView(null); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer", padding: "10px 0 6px 0", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>
                      <span style={{ fontSize: 18, lineHeight: 1 }}>&#8592;</span> Back to {previousView.client ? previousView.client.name : "Clients"}
                    </button>
                  )}
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitle}>Generated Post — {generatingPost}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {isEditingPost ? (
                        <>
                          <button style={{ ...styles.addKeywordBtn, color: "#22c55e", borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", fontSize: 12, padding: "6px 14px" }}
                            onClick={() => {
                              const el = document.getElementById("post-editor-body");
                              if (el) setGeneratedPost(prev => ({ ...prev, content: el.innerHTML }));
                              setIsEditingPost(false);
                              setShowLinkInput(false);
                              setShowHtmlInput(false);
                            }}>✓ Save Edits</button>
                          <button style={{ ...styles.addKeywordBtn, color: "#888", fontSize: 12, padding: "6px 14px" }}
                            onClick={() => { setIsEditingPost(false); setShowLinkInput(false); setShowHtmlInput(false); }}>✕ Cancel</button>
                        </>
                      ) : (
                        <button style={{ ...styles.addKeywordBtn, fontSize: 12, padding: "6px 14px", color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.07)" }}
                          onClick={() => setIsEditingPost(true)}>✎ Edit</button>
                      )}
                      <button
                        style={{ ...styles.addKeywordBtn, fontSize: 12, padding: "6px 14px", color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)", background: showRegenPrompt ? "rgba(167,139,250,0.12)" : "rgba(167,139,250,0.05)" }}
                        onClick={() => { setShowRegenPrompt(v => !v); setRegenPrompt(""); }}>
                        ↺ Regenerate
                      </button>
                      <button style={{ ...styles.addBtn, background: "none", border: "1px solid #dc2626", color: "#dc2626" }} onClick={() => { setGeneratedPost(null); setGeneratingPost(null); setGeneratedSchemaHtml(null); setIsEditingPost(false); setWpCategories([]); setSelectedCategoryId(null); setShowRegenPrompt(false); setRegenPrompt(""); }}>Clear</button>
                      <button style={{ ...styles.addBtn, opacity: publishLoading ? 0.6 : 1 }} onClick={publishToWordPress} disabled={publishLoading}>
                        {publishLoading ? "Publishing..." : "Publish to WordPress"}
                      </button>
                    </div>
                  </div>

                  {/* ── Regenerate prompt panel ── */}
                  {showRegenPrompt && (
                    <div style={{ background: "#0a0a0a", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 6, padding: "16px 18px", marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", color: "#a78bfa", marginBottom: 8 }}>
                        Direction for Regeneration
                      </div>
                      <textarea
                        value={regenPrompt}
                        onChange={e => setRegenPrompt(e.target.value)}
                        placeholder="e.g. Make the tone more conversational, add a section about maintenance tips, focus more on cost savings, shorten the intro..."
                        style={{ width: "100%", minHeight: 80, background: "#111", border: "1px solid #2a2a2a", color: "#fff", fontSize: 13, fontFamily: "'Barlow', sans-serif", padding: "10px 12px", borderRadius: 4, resize: "vertical", boxSizing: "border-box", outline: "none" }}
                        onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) regeneratePost(); }}
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                        <button
                          onClick={regeneratePost}
                          disabled={!regenPrompt.trim() || regenLoading}
                          style={{ padding: "8px 20px", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", background: regenPrompt.trim() ? "rgba(167,139,250,0.9)" : "#1a1a1a", color: regenPrompt.trim() ? "#000" : "#333", border: "none", borderRadius: 3, cursor: regenPrompt.trim() ? "pointer" : "default", fontWeight: 700 }}>
                          {regenLoading ? "Regenerating..." : "↺ Regenerate Post"}
                        </button>
                        <button onClick={() => { setShowRegenPrompt(false); setRegenPrompt(""); }}
                          style={{ padding: "8px 14px", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", background: "transparent", color: "#555", border: "1px solid #2a2a2a", borderRadius: 3, cursor: "pointer" }}>
                          Cancel
                        </button>
                        <div style={{ fontSize: 11, color: "#333", fontFamily: "'Barlow Condensed', sans-serif" }}>Cmd+Enter to submit</div>
                      </div>
                    </div>
                  )}

                  <div style={styles.postPreview}>
                    {/* ── Formatting toolbar (edit mode only) ── */}
                    {isEditingPost && (() => {
                      const exec = (cmd, val) => { document.getElementById("post-editor-body")?.focus(); document.execCommand(cmd, false, val || null); };
                      const btnStyle = (active) => ({ background: active ? "rgba(214,0,0,0.15)" : "transparent", border: "1px solid " + (active ? "#d60000" : "#2a2a2a"), color: active ? "#d60000" : "#aaa", borderRadius: 4, cursor: "pointer", padding: "4px 10px", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", whiteSpace: "nowrap" });
                      return (
                        <div style={{ padding: "10px 16px", background: "#0a0a0a", borderBottom: "1px solid #1a1a1a", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("bold"); }} title="Bold"><strong>B</strong></button>
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("italic"); }} title="Italic"><em>I</em></button>
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("underline"); }} title="Underline"><u>U</u></button>
                          <div style={{ width: 1, height: 18, background: "#2a2a2a", margin: "0 4px" }} />
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("formatBlock", "h2"); }} title="Heading 2">H2</button>
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("formatBlock", "h3"); }} title="Heading 3">H3</button>
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("formatBlock", "h4"); }} title="Heading 4">H4</button>
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("formatBlock", "p"); }} title="Paragraph">¶</button>
                          <div style={{ width: 1, height: 18, background: "#2a2a2a", margin: "0 4px" }} />
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} title="Bullet List">• List</button>
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("insertOrderedList"); }} title="Numbered List">1. List</button>
                          <div style={{ width: 1, height: 18, background: "#2a2a2a", margin: "0 4px" }} />
                          <button style={btnStyle(showLinkInput)} onMouseDown={e => { e.preventDefault(); const sel = window.getSelection(); if (sel && sel.rangeCount) setSavedSelection(sel.getRangeAt(0).cloneRange()); setShowLinkInput(v => !v); setShowHtmlInput(false); }} title="Insert Link">🔗 Link</button>
                          <button style={btnStyle(showHtmlInput)} onMouseDown={e => { e.preventDefault(); setShowHtmlInput(v => !v); setShowLinkInput(false); }} title="Insert HTML">&lt;/&gt; HTML</button>
                          <div style={{ width: 1, height: 18, background: "#2a2a2a", margin: "0 4px" }} />
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("removeFormat"); }} title="Clear Formatting">✕ Format</button>
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("undo"); }} title="Undo">↩ Undo</button>
                          <button style={btnStyle(false)} onMouseDown={e => { e.preventDefault(); exec("redo"); }} title="Redo">↪ Redo</button>
                          {showLinkInput && (
                            <div style={{ width: "100%", display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                              <input style={{ ...styles.searchInput, flex: 1, fontSize: 12 }} placeholder="https://..." value={editLinkUrl} onChange={e => setEditLinkUrl(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const ed = document.getElementById("post-editor-body"); if (ed && savedSelection) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedSelection); } exec("createLink", editLinkUrl); setShowLinkInput(false); setEditLinkUrl(""); setSavedSelection(null); }}} autoFocus />
                              <button style={{ ...btnStyle(true), padding: "4px 14px" }} onMouseDown={e => { e.preventDefault(); const ed = document.getElementById("post-editor-body"); if (ed && savedSelection) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedSelection); } exec("createLink", editLinkUrl); setShowLinkInput(false); setEditLinkUrl(""); setSavedSelection(null); }}>Apply</button>
                              <button style={{ ...btnStyle(false), padding: "4px 10px" }} onMouseDown={e => { e.preventDefault(); exec("unlink"); }}>Unlink</button>
                            </div>
                          )}
                          {showHtmlInput && (
                            <div style={{ width: "100%", display: "flex", gap: 6, marginTop: 6, alignItems: "flex-start" }}>
                              <textarea style={{ ...styles.searchInput, flex: 1, fontSize: 12, minHeight: 60, resize: "vertical", fontFamily: "monospace" }} placeholder="Paste raw HTML to insert at cursor..." value={htmlInsertText} onChange={e => setHtmlInsertText(e.target.value)} autoFocus />
                              <button style={{ ...btnStyle(true), padding: "4px 14px", alignSelf: "flex-start" }} onMouseDown={e => { e.preventDefault(); document.getElementById("post-editor-body")?.focus(); exec("insertHTML", htmlInsertText); setShowHtmlInput(false); setHtmlInsertText(""); }}>Insert</button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div style={styles.postMeta}>
                      <div style={styles.postMetaItem}>
                        <div style={styles.postMetaLabel}>Title</div>
                        {isEditingPost ? (
                          <input style={{ ...styles.searchInput, marginTop: 4, fontSize: 13, fontWeight: 600, color: "#fff" }} value={generatedPost.title} onChange={e => setGeneratedPost(prev => ({ ...prev, title: e.target.value }))} />
                        ) : (
                          <div style={styles.postMetaValue}>{generatedPost.title}</div>
                        )}
                      </div>
                      <div style={styles.postMetaItem}>
                        <div style={styles.postMetaLabel}>Meta Description</div>
                        {isEditingPost ? (
                          <textarea style={{ ...styles.searchInput, marginTop: 4, fontSize: 12, resize: "vertical", minHeight: 48, fontFamily: "'Barlow', sans-serif" }} value={generatedPost.metaDescription} onChange={e => setGeneratedPost(prev => ({ ...prev, metaDescription: e.target.value }))} />
                        ) : (
                          <div style={styles.postMetaValue}>{generatedPost.metaDescription}</div>
                        )}
                      </div>
                      <div style={styles.postMetaItem}><div style={styles.postMetaLabel}>Slug</div><div style={styles.postMetaValue}>/{generatedPost.slug}</div></div>
                      <div style={styles.postMetaItem}><div style={styles.postMetaLabel}>Word Count</div><div style={styles.postMetaValue}>{generatedPost.wordCount} words</div></div>
                      {wpCategories.length > 0 && (
                        <div style={styles.postMetaItem}>
                          <div style={styles.postMetaLabel}>Category</div>
                          <select
                            value={selectedCategoryId || ""}
                            onChange={e => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                            style={{ ...styles.searchInput, marginTop: 4, fontSize: 12, color: "#fff", background: "#1a1a1a", cursor: "pointer" }}
                          >
                            <option value="">-- No category --</option>
                            {wpCategories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "12px 20px", borderBottom: "1px solid #1a1a1a" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: featuredImage ? 10 : 0 }}>
                        <div style={styles.postMetaLabel}>Featured Image</div>
                        <button onClick={openImagePicker}
                          style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", background: "none", border: "1px solid #333", color: "#888", cursor: "pointer", padding: "3px 10px", borderRadius: 3 }}>
                          {featuredImage ? "Change" : "Pick Image"}
                        </button>
                      </div>
                      {featuredImage ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <img src={featuredImage.storage_path} alt={featuredImage.category} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 4, display: "block" }} />
                            <button onClick={() => setFeaturedImage(null)}
                              style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#1a1a1a", border: "1px solid #333", color: "#ef4444", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: "#ccc", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{featuredImage.category || "No category"}</div>
                            <div style={{ fontSize: 10, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{featuredImage.filename}</div>
                            {generatedPost?.slug && <div style={{ fontSize: 10, color: "#333", marginTop: 2 }}>Renames to {generatedPost.slug}.jpg</div>}
                          </div>
                        </div>
                      ) : (
                        <div onClick={openImagePicker} style={{ border: "1px dashed #222", borderRadius: 4, padding: "14px", textAlign: "center", cursor: "pointer", color: "#333", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          No image selected — click to pick
                        </div>
                      )}
                    </div>
                    {isEditingPost ? (
                      <div
                        id="post-editor-body"
                        contentEditable
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{ __html: generatedPost.content }}
                        style={{ ...styles.postContent, outline: "none", minHeight: 400, borderTop: "1px solid #1a1a1a", caretColor: "#d60000" }}
                        onInput={() => {}} // handled on save
                      />
                    ) : (
                      <div style={styles.postContent} dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
                    )}
                  </div>
                  {publishResult && (
                    <div style={{ marginTop: 16 }}>
                      {/* ── Prominent publish status banner ── */}
                      <div style={{
                        padding: "16px 18px",
                        background: publishResult.success ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
                        border: `2px solid ${publishResult.success ? "#22c55e" : "#ef4444"}`,
                        borderRadius: 6,
                        marginBottom: publishResult.qa ? 12 : 0,
                        display: "flex", alignItems: "flex-start", gap: 12,
                      }}>
                        <div style={{ fontSize: 22, lineHeight: 1, marginTop: 1 }}>
                          {publishResult.success ? "✓" : "✗"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: publishResult.success ? "#22c55e" : "#ef4444", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                            {publishResult.success ? "Published Successfully" : "Publish Failed"}
                          </div>
                          {publishResult.success ? (
                            <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'Barlow', sans-serif", lineHeight: 1.5 }}>
                              <a href={publishResult.url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", wordBreak: "break-all" }}>{publishResult.url}</a>
                              {publishResult.imageUploadError && (
                                <div style={{ marginTop: 6, fontSize: 10, color: "#ef4444", fontFamily: "'Barlow Condensed', sans-serif", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 3, padding: "4px 8px" }}>
                                  ⚠ Featured image failed to upload: {publishResult.imageUploadError}
                                </div>
                              )}
                              {publishResult.yoastEdition && (
                                <span style={{ marginLeft: 10, fontSize: 10, padding: "2px 8px", borderRadius: 3, background: publishResult.yoastEdition === "none" ? "#1a1a1a" : "#0a1a0a", border: `1px solid ${publishResult.yoastEdition === "none" ? "#333" : "#22c55e33"}`, color: publishResult.yoastEdition === "none" ? "#555" : "#22c55e", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
                                  {publishResult.yoastEdition === "premium" ? "Yoast Premium ✓" : publishResult.yoastEdition === "free" ? "Yoast Free ✓" : "No Yoast detected"}
                                </span>
                              )}
                              {publishResult.yoastEdition && publishResult.yoastEdition !== "none" && !publishResult.canWriteSeoMeta && (
                                <div style={{ marginTop: 6, fontSize: 10, color: "#f59e0b", fontFamily: "'Barlow Condensed', sans-serif", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 3, padding: "4px 8px" }}>
                                  ⚠ Yoast meta not written — install <strong>fortitude-seo-meta-writer.php</strong> on this site to enable focus keyphrase + meta description writing
                                </div>
                              )}
                              {publishResult.yoastOpt && (
                                <div style={{ marginTop: 8, padding: "8px 10px", background: "#0a0a0a", border: `1px solid ${publishResult.yoastOpt.issues?.length === 0 ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`, borderRadius: 4 }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                    <div style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", color: publishResult.yoastOpt.issues?.length === 0 ? "#22c55e" : "#f59e0b", marginBottom: publishResult.yoastOpt.fixes?.length > 0 ? 4 : 0 }}>
                                      {publishResult.yoastOpt.issues?.length === 0
                                        ? `✓ YOAST OPTIMIZED — all checks passed (score ~${publishResult.yoastOpt.yoastScore})`
                                        : `⚠ YOAST SCORE ~${publishResult.yoastOpt.yoastScore} — ${publishResult.yoastOpt.issues?.length} issue(s) remain: ${publishResult.yoastOpt.issues?.map(i => i.type).join(", ")}`
                                      }
                                    </div>
                                    {publishResult.yoastOpt.issues?.length > 0 && (
                                      <button
                                        onClick={retryYoastOptimize}
                                        disabled={yoastRetrying}
                                        style={{ flexShrink: 0, fontSize: 9, padding: "3px 10px", background: "none", border: "1px solid rgba(245,158,11,0.4)", color: "#f59e0b", borderRadius: 3, cursor: yoastRetrying ? "not-allowed" : "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", opacity: yoastRetrying ? 0.5 : 1 }}>
                                        {yoastRetrying ? "RUNNING..." : "↻ RE-RUN FIX"}
                                      </button>
                                    )}
                                  </div>
                                  {publishResult.yoastOpt.fixes?.length > 0 && (
                                    <div style={{ fontSize: 9, color: "#555", fontFamily: "'Barlow Condensed', sans-serif" }}>
                                      {publishResult.yoastOpt.fixes.map((f, i) => (
                                        <span key={i} style={{ marginRight: 10 }}>Pass {f.pass}: {f.type} → {f.fix}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              {publishResult.longtailKeyphrase && (
                                <div style={{ marginTop: 5, fontSize: 10, color: "#555", fontFamily: "'Barlow Condensed', sans-serif" }}>
                                  Focus keyphrase set to: <span style={{ color: "#a78bfa" }}>"{publishResult.longtailKeyphrase}"</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: "#ef4444", fontFamily: "'Barlow', sans-serif", lineHeight: 1.5 }}>
                              {publishResult.error}
                            </div>
                          )}
                        </div>
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

            {/* FEATURED IMAGE PICKER MODAL */}
      {showImagePicker && (() => {
        const q = imagePickerSearch.toLowerCase();
        const filtered = imagePickerImages.filter(img =>
          !q || (img.category || "").toLowerCase().includes(q) || (img.description || "").toLowerCase().includes(q) || (img.filename || "").toLowerCase().includes(q)
        );
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) setShowImagePicker(false); }}>
            <div style={{ background: "#0d0d0d", border: "1px solid #222", borderTop: "3px solid #d60000", width: "100%", maxWidth: 780, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
              {/* Header */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>Select Featured Image</div>
                <input
                  value={imagePickerSearch}
                  onChange={e => setImagePickerSearch(e.target.value)}
                  placeholder="Search by category, description, filename..."
                  autoFocus
                  style={{ flex: 1, background: "#141414", border: "1px solid #2a2a2a", color: "#fff", borderRadius: 3, padding: "6px 10px", fontSize: 12, fontFamily: "'Barlow', sans-serif" }}
                />
                <button onClick={() => setShowImagePicker(false)}
                  style={{ background: "none", border: "none", color: "#444", fontSize: 20, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
              {/* Count */}
              <div style={{ padding: "6px 20px", borderBottom: "1px solid #111", fontSize: 10, color: "#333", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {imagePickerLoading ? "Loading..." : `${filtered.length} image${filtered.length !== 1 ? "s" : ""}${q ? " matching" : ""}`}
              </div>
              {/* Grid */}
              <div style={{ overflowY: "auto", padding: 16, flex: 1 }}>
                {imagePickerLoading ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#333", fontSize: 12 }}>Loading images...</div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#333", fontSize: 12 }}>No images found</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                    {filtered.map(img => {
                      const isSelected = featuredImage?.id === img.id;
                      return (
                        <div key={img.id}
                          onClick={() => { setFeaturedImage(img); setShowImagePicker(false); setImagePickerSearch(""); }}
                          style={{ cursor: "pointer", border: `2px solid ${isSelected ? "#d60000" : "#1a1a1a"}`, borderRadius: 4, overflow: "hidden", background: "#111", transition: "border-color 0.1s" }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "#333"; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "#1a1a1a"; }}>
                          <img src={img.storage_path} alt={img.category || img.filename} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
                          <div style={{ padding: "6px 8px" }}>
                            <div style={{ fontSize: 10, color: img.category ? "#bbb" : "#444", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: img.category ? "normal" : "italic" }}>{img.category || "No category"}</div>
                            {img.description && <div style={{ fontSize: 9, color: "#444", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.description}</div>}
                          </div>
                          {isSelected && <div style={{ padding: "3px 8px", background: "#d60000", fontSize: 9, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center" }}>Selected</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Footer */}
              <div style={{ padding: "10px 20px", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => { setShowImagePicker(false); setImagePickerSearch(""); }}
                  style={{ padding: "7px 20px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", background: "transparent", border: "1px solid #2a2a2a", color: "#555", cursor: "pointer", borderRadius: 3 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

            {/* IMAGE EDIT MODAL */}
      {editingImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditingImage(null); }}>
          <div style={{ background: "#0d0d0d", border: "1px solid #222", width: "100%", maxWidth: 480, borderTop: "3px solid #d60000" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>Edit Image</div>
              <button onClick={() => setEditingImage(null)} style={{ background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <img src={editingImage.storage_path} alt={editingImage.category} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 4, marginBottom: 16, display: "block" }} />
              <div style={{ fontSize: 10, color: "#444", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>{editingImage.filename}</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Category</div>
                <input
                  value={editImageCategory}
                  onChange={e => setEditImageCategory(e.target.value)}
                  placeholder="e.g. Water Heaters, Drain Cleaning, AC Repair..."
                  style={{ width: "100%", background: "#141414", border: "1px solid #333", color: "#fff", borderRadius: 4, padding: "8px 10px", fontSize: 13, fontFamily: "'Barlow', sans-serif", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Description <span style={{ color: "#555", textTransform: "none", letterSpacing: 0 }}>(helps match this image to the right blog posts)</span></div>
                <textarea
                  value={editImageDescription}
                  onChange={e => setEditImageDescription(e.target.value)}
                  placeholder="Describe what is in this photo — e.g. plumber installing water heater in basement, burst pipe repair under sink, technician on roof with AC unit..."
                  style={{ width: "100%", background: "#141414", border: "1px solid #333", color: "#fff", borderRadius: 4, padding: "8px 10px", fontSize: 13, fontFamily: "'Barlow', sans-serif", resize: "vertical", minHeight: 80, boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  style={{ flex: 1, background: "#d60000", color: "#fff", border: "none", borderRadius: 4, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
                  onClick={async () => {
                    await authFetch(`${API}/api/images/${editingImage.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ category: editImageCategory, description: editImageDescription }),
                    });
                    setImages(prev => prev.map(i => i.id === editingImage.id ? { ...i, category: editImageCategory, description: editImageDescription } : i));
                    setClientImages(prev => prev.map(i => i.id === editingImage.id ? { ...i, category: editImageCategory, description: editImageDescription } : i));
                    setEditingImage(null);
                  }}
                >Save Changes</button>
                <button
                  onClick={() => setEditingImage(null)}
                  style={{ flex: 1, background: "none", border: "1px solid #333", color: "#aaa", borderRadius: 4, padding: "10px 0", fontSize: 13, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}
                >Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* ADD TO CLIENT MODAL */}
      {showAddToClientModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddToClientModal(false); }}>
          <div style={{ background: '#0d0d0d', border: '1px solid #222', width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ borderBottom: '3px solid #d60000', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff' }}>Add to Client</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{selectedKwIds.size} keyword{selectedKwIds.size !== 1 ? 's' : ''} selected from {activeIndustry}</div>
              </div>
              <button onClick={() => setShowAddToClientModal(false)} style={{ background: 'none', border: 'none', color: '#444', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>✕</button>
            </div>

            <div style={{ overflowY: 'auto', padding: 20, flex: 1 }}>
              {/* Selected keywords preview */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#d60000', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 8 }}>Keywords Being Added</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(library[activeIndustry] || []).filter(k => selectedKwIds.has(k.id)).map(k => (
                    <span key={k.id} style={{ background: '#1a1a1a', border: '1px solid #333', padding: '3px 10px', fontSize: 11, color: '#ccc', fontFamily: "'Barlow', sans-serif" }}>{k.keyword}</span>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#d60000', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 10 }}>Add To</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { val: 'clientlist', label: 'Client Keywords', desc: "Adds to the client keyword list. From there you can drag keywords into the Monthly Queue when ready." },
                    { val: 'queue', label: 'Monthly Queue', desc: "Adds directly to the client monthly keyword queue to generate posts from." },
                    { val: 'schedule', label: 'Scheduled Queue', desc: 'Adds directly to the publishing schedule so posts generate automatically.' },
                  ].map(opt => (
                    <label key={opt.val} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', padding: '10px 14px', border: `1px solid ${addToClientDest === opt.val ? '#d60000' : '#222'}`, background: addToClientDest === opt.val ? 'rgba(214,0,0,0.06)' : 'transparent', transition: 'all 0.15s' }}>
                      <input type='radio' name='dest' value={opt.val} checked={addToClientDest === opt.val} onChange={() => setAddToClientDest(opt.val)} style={{ accentColor: '#d60000', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'Barlow', sans-serif" }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2, fontFamily: "'Barlow', sans-serif" }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Client selection */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#d60000', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Select Clients</span>
                  <button style={{ background: 'none', border: 'none', color: '#555', fontSize: 10, cursor: 'pointer', textDecoration: 'underline', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}
                    onClick={() => setAddToClientTargets(addToClientTargets.size === clients.length ? new Set() : new Set(clients.map(c => c.id)))}>
                    {addToClientTargets.size === clients.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {clients.map(c => (
                    <label key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', padding: '10px 14px', border: `1px solid ${addToClientTargets.has(c.id) ? '#d60000' : '#222'}`, background: addToClientTargets.has(c.id) ? 'rgba(214,0,0,0.06)' : 'transparent', transition: 'all 0.15s' }}>
                      <input type='checkbox' checked={addToClientTargets.has(c.id)} style={{ accentColor: '#d60000', flexShrink: 0 }}
                        onChange={e => setAddToClientTargets(prev => { const n = new Set(prev); e.target.checked ? n.add(c.id) : n.delete(c.id); return n; })} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: "'Barlow', sans-serif" }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: '#444', fontFamily: "'Barlow', sans-serif" }}>{c.industry}{c.domain ? ' · ' + c.domain : ''}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Result */}
              {addToClientResult && (
                <div style={{ padding: '10px 14px', background: addToClientResult.errors > 0 && addToClientResult.success === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', borderLeft: `3px solid ${addToClientResult.errors > 0 && addToClientResult.success === 0 ? '#ef4444' : '#22c55e'}`, fontSize: 12, color: addToClientResult.errors > 0 && addToClientResult.success === 0 ? '#ef4444' : '#22c55e', marginBottom: 4, fontFamily: "'Barlow', sans-serif" }}>
                  {addToClientResult.success > 0 && `✓ Added ${addToClientResult.success} keyword${addToClientResult.success !== 1 ? 's' : ''} to ${addToClientResult.dest === 'clientlist' ? 'client keywords' : addToClientResult.dest === 'queue' ? 'monthly queue' : 'scheduled queue'}${addToClientResult.errors > 0 ? ` (${addToClientResult.errors} failed)` : ''}`}
                  {addToClientResult.success === 0 && `✗ Failed to add keywords. Check that the client has WordPress configured.`}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #1a1a1a', padding: '14px 20px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={{ ...styles.backBtn, marginBottom: 0 }} onClick={() => setShowAddToClientModal(false)}>Cancel</button>
              <button
                disabled={addToClientTargets.size === 0 || addToClientBusy}
                style={{ ...styles.addBtn, opacity: addToClientTargets.size === 0 || addToClientBusy ? 0.5 : 1, cursor: addToClientTargets.size === 0 || addToClientBusy ? 'not-allowed' : 'pointer' }}
                onClick={addToClients}
              >
                {addToClientBusy ? 'Adding...' : `Add to ${addToClientTargets.size} Client${addToClientTargets.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

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
  sectionTitle: { fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" },
  addBtn: { padding: "10px 20px", background: "#d60000", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", letterSpacing: "0.12em", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase" },
  addClientForm: { background: "#0d0d0d", border: "1px solid #1a1a1a", borderTop: "3px solid #d60000", padding: 24, marginBottom: 24 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
  textArea: { width: "100%", background: "#111", border: "1px solid #222", borderBottom: "2px solid #d60000", color: "#fff", padding: "12px 16px", fontSize: 13, fontFamily: "'Barlow', sans-serif", outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box" },
  clientGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 2 },
  clientCard: { background: "#0d0d0d", borderTop: "3px solid transparent", padding: "24px", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" },
  clientCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  clientAvatar: { width: 40, height: 40, background: "#d60000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Oswald', sans-serif", overflow: "hidden", flexShrink: 0 },
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