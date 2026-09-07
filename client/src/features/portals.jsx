import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { http } from "../services/http";
import { useAuthStore } from "../store/authStore";
const Card = ({ children, className = "", id }) => (
  <article id={id} className={`card ${className}`}>
    {children}
  </article>
);
const Status = ({ children }) => (
  <span className="portal-status">
    {children?.replace("_", " ") || "pending"}
  </span>
);
export function StudentPortal() {
  const { user, setUser } = useAuthStore();
  const [saved, setSaved] = useState([]);
  const [reports, setReports] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [name, setName] = useState(user?.name || "");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const [a, b, h] = await Promise.all([
        http.get("/users/me/saved"),
        http.get("/reports/mine"),
        http.get("/help/mine"),
      ]);
      setSaved(a.data.consultancies);
      setReports(b.data.items);
      setHelpRequests(h.data.items);
    } catch {
      setMessage("Please log in again to refresh your account.");
    }
  }, []);
  useEffect(() => {
    if (user) load();
  }, [user, load]);
  if (!user)
    return (
      <section className="portal-empty">
        <h1>Your student space awaits.</h1>
        <Link className="button" to="/login">
          Log in →
        </Link>
      </section>
    );
  async function update(e) {
    e.preventDefault();
    try {
      const { data } = await http.patch("/users/me", { name });
      setUser(data);
      setMessage("Your profile has been updated.");
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to update your profile.");
    }
  }
  async function remove(id) {
    try {
      await http.delete(`/users/me/saved/consultancies/${id}`);
      await load();
    } catch (e) {
      setMessage(
        e.response?.data?.message || "Unable to remove this consultancy.",
      );
    }
  }
  async function submitHelp(e) {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      await http.post("/help", Object.fromEntries(new FormData(form)));
      form.reset();
      setMessage("Your help request has been sent.");
      await load();
    } catch (e) {
      setMessage(
        e.response?.data?.message || "Unable to send your help request.",
      );
    }
  }
  const openHelp = helpRequests.filter(
    (item) => item.status !== "resolved",
  ).length;
  return (
    <section className="portal student-portal">
      <aside className="portal-sidebar">
        <div>
          <p className="eyebrow">STUDENT SPACE</p>
          <h2>Hi, {user.name.split(" ")[0]}.</h2>
          <p>Plan your next chapter with confidence.</p>
        </div>
        <nav>
          <a href="#overview">Overview</a>
          <a href="#saved">Saved experts</a>
          <a href="#reports">My reports</a>
          <a href="#help">Help centre</a>
          <Link to="/study/visa">Visa information ↗</Link>
        </nav>
        <Link className="button" to="/consultancies">
          Find a consultancy →
        </Link>
      </aside>
      <div className="portal-content" id="overview">
        <div className="portal-title">
          <div>
            <p className="eyebrow">MY DREAM CHASER</p>
            <h1>Your decision desk.</h1>
          </div>
          <p>All the trusted people and information you need, in one place.</p>
        </div>
        {message && <p className="notice">{message}</p>}
        <div className="metric-row">
          <Card>
            <b>{saved.length}</b>
            <span>Saved experts</span>
          </Card>
          <Card>
            <b>{reports.length}</b>
            <span>Reports submitted</span>
          </Card>
          <Card>
            <b>{openHelp}</b>
            <span>Open help requests</span>
          </Card>
        </div>
        <section className="portal-panel" id="saved">
          <div className="panel-head">
            <div>
              <p className="eyebrow">SAVED EXPERTS</p>
              <h2>Come back to these later.</h2>
            </div>
            <Link to="/consultancies">Browse directory →</Link>
          </div>
          {saved.length ? (
            <div className="saved-list">
              {saved.map((x) => (
                <div key={x._id}>
                  <div>
                    <strong>{x.name}</strong>
                    <small>Verified consultancy</small>
                  </div>
                  <Link to={`/consultancies/${x._id}`}>Profile ↗</Link>
                  <button className="link" onClick={() => remove(x._id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>♡</span>
              <p>You have not saved any consultancies yet.</p>
              <Link to="/consultancies">Find one that fits →</Link>
            </div>
          )}
        </section>
        <section className="portal-split">
          <Card id="reports">
            <p className="eyebrow">MY REPORTS</p>
            <h2>Safety updates</h2>
            {reports.length ? (
              reports.map((x) => (
                <div className="report-row" key={x._id}>
                  <div>
                    <strong>{x.consultancyName}</strong>
                    <small>{x.scamType}</small>
                  </div>
                  <Status>{x.status}</Status>
                </div>
              ))
            ) : (
              <p>
                No reports submitted. If something feels wrong, you can safely
                tell us.
              </p>
            )}
            <Link to="/reports/new">Report a concern →</Link>
          </Card>
          <Card>
            <p className="eyebrow">YOUR PROFILE</p>
            <h2>Keep it current.</h2>
            <form onSubmit={update}>
              <label>
                Display name
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <small>{user.email}</small>
              <Button>Save changes</Button>
            </form>
          </Card>
        </section>
        <section className="portal-panel" id="help">
          <div className="panel-head">
            <div>
              <p className="eyebrow">HELP CENTRE</p>
              <h2>Ask us anything.</h2>
            </div>
            <span>
              {openHelp} open request{openHelp === 1 ? "" : "s"}
            </span>
          </div>
          <div className="support-layout">
            <form className="help-form" onSubmit={submitHelp}>
              <label>
                What do you need help with?
                <select name="category" required>
                  <option value="consultancy">Choosing a consultancy</option>
                  <option value="visa">Visa information</option>
                  <option value="account">My account</option>
                  <option value="safety">Safety concern</option>
                  <option value="technical">Technical problem</option>
                  <option value="other">Something else</option>
                </select>
              </label>
              <label>
                Subject
                <input
                  name="subject"
                  minLength="4"
                  placeholder="A quick summary"
                  required
                />
              </label>
              <label>
                Tell us more
                <textarea
                  name="message"
                  minLength="10"
                  placeholder="Share enough detail for our team to help"
                  required
                />
              </label>
              <Button>Send help request →</Button>
            </form>
            <div className="support-history">
              {helpRequests.length ? (
                helpRequests.map((item) => (
                  <article className="student-help-ticket" key={item._id}>
                    <div>
                      <span className="support-category">{item.category}</span>
                      <Status>{item.status}</Status>
                    </div>
                    <h3>{item.subject}</h3>
                    <p>{item.message}</p>
                    {item.adminReply && (
                      <div className="admin-reply">
                        <b>Dream Chaser replied</b>
                        <p>{item.adminReply}</p>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <span>?</span>
                  <p>You have not asked for help yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
export function AdminPortal() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [consultancies, setConsultancies] = useState([]);
  const [reports, setReports] = useState([]);
  const [content, setContent] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [supportReplies, setSupportReplies] = useState({});
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const [u, c, r, p, h] = await Promise.all([
        http.get("/users"),
        http.get("/consultancies"),
        http.get("/reports"),
        http.get("/content/admin/all"),
        http.get("/help"),
      ]);
      setUsers(u.data.items);
      setConsultancies(c.data.items);
      setReports(r.data.items);
      setContent(p.data.items);
      setHelpRequests(h.data.items);
    } catch (e) {
      setMessage(e.response?.data?.message || "Admin access required.");
    }
  }, []);
  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);
  if (user?.role !== "admin")
    return (
      <section className="portal-empty">
        <h1>Administrator access required.</h1>
        <p>Use an approved Dream Chaser admin account.</p>
      </section>
    );
  async function status(path, value) {
    try {
      await http.patch(path, { status: value });
      setMessage("Moderation record updated.");
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to update this record.");
    }
  }
  async function publish(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const title = String(f.get("title"));
    try {
      await http.post("/content", {
        title,
        type: f.get("type"),
        slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        summary: f.get("summary"),
        published: true,
      });
      form.reset();
      setMessage("Resource published.");
      await load();
    } catch (e) {
      setMessage(
        e.response?.data?.message || "Unable to publish this resource.",
      );
    }
  }
  async function updateHelp(id, statusValue, includeReply = false) {
    try {
      const body = { status: statusValue };
      if (includeReply) body.adminReply = supportReplies[id] || "";
      await http.patch(`/help/${id}`, body);
      setMessage(
        includeReply
          ? "Reply sent to the student."
          : "Support request updated.",
      );
      await load();
    } catch (e) {
      setMessage(
        e.response?.data?.message || "Unable to update this help request.",
      );
    }
  }
  const pendingConsultancies = consultancies.filter(
      (x) => x.verificationStatus !== "verified",
    ),
    openReports = reports.filter((x) => x.status !== "resolved"),
    openHelp = helpRequests.filter((x) => x.status !== "resolved");
  return (
    <section className="portal admin-portal">
      <aside className="portal-sidebar">
        <div>
          <p className="eyebrow">ADMIN CONSOLE</p>
          <h2>
            Dream Chaser
            <br />
            operations.
          </h2>
          <p>Protect trust, uphold standards.</p>
        </div>
        <nav>
          <a href="#support">Student support</a>
          <Link to="/admin/reports">Manage scam reports</Link>
          <Link to="/admin/consultancies">Manage consultancies</Link>
          <a href="#content">Content studio</a>
        </nav>
        <Link className="button" to="/">
          View public site ↗
        </Link>
      </aside>
      <div className="portal-content">
        <div className="portal-title">
          <div>
            <p className="eyebrow">OPERATIONS OVERVIEW</p>
            <h1>Trust, managed.</h1>
          </div>
          <p>Review the activity that needs your team’s attention today.</p>
        </div>
        {message && <p className="notice">{message}</p>}
        <div className="metric-row admin-metrics">
          <Card>
            <b>{pendingConsultancies.length}</b>
            <span>Provider checks</span>
          </Card>
          <Card>
            <b>{openReports.length}</b>
            <span>Open safety reports</span>
          </Card>
          <Card>
            <b>{openHelp.length}</b>
            <span>Open help requests</span>
          </Card>
        </div>
        <section className="portal-panel" id="support">
          <div className="panel-head">
            <div>
              <p className="eyebrow">STUDENT SUPPORT</p>
              <h2>Help students move forward.</h2>
            </div>
            <span>{openHelp.length} need attention</span>
          </div>
          {helpRequests.length ? (
            <div className="support-inbox">
              {helpRequests.map((item) => (
                <article
                  className={`support-ticket status-${item.status}`}
                  key={item._id}
                >
                  <div className="support-ticket-head">
                    <div>
                      <span className="support-category">{item.category}</span>
                      <h3>{item.subject}</h3>
                      <small>
                        {item.user?.name || "Student"} ·{" "}
                        {item.user?.email || "No email"}
                      </small>
                    </div>
                    <Status>{item.status}</Status>
                  </div>
                  <p className="support-message">{item.message}</p>
                  {item.adminReply && (
                    <div className="previous-reply">
                      <b>Latest reply</b>
                      <p>{item.adminReply}</p>
                    </div>
                  )}
                  <label>
                    Reply to the student
                    <textarea
                      value={supportReplies[item._id] ?? item.adminReply ?? ""}
                      onChange={(event) =>
                        setSupportReplies((current) => ({
                          ...current,
                          [item._id]: event.target.value,
                        }))
                      }
                      placeholder="Write a clear, helpful response"
                    />
                  </label>
                  <div className="support-actions">
                    <button
                      className="link"
                      onClick={() => updateHelp(item._id, "in_progress")}
                    >
                      Mark in progress
                    </button>
                    <button
                      className="button"
                      onClick={() => updateHelp(item._id, "resolved", true)}
                    >
                      Send reply & resolve
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>✓</span>
              <p>No student support requests yet.</p>
            </div>
          )}
        </section>
        <section className="admin-workspace">
          <Card>
            <p className="eyebrow">CONSULTANCY MANAGEMENT</p>
            <h2>Manage providers separately.</h2>
            <p>
              {pendingConsultancies.length} consultancies are waiting for
              verification.
            </p>
            <Link className="button" to="/admin/consultancies">
              Open consultancy manager →
            </Link>
          </Card>
          <Card>
            <p className="eyebrow">SAFETY REPORTS</p>
            <h2>Open reports</h2>
            {openReports.length ? (
              openReports.slice(0, 5).map((x) => (
                <div className="compact-row" key={x._id}>
                  <div>
                    <strong>{x.consultancyName}</strong>
                    <small>
                      {x.scamType} · {x.status}
                    </small>
                  </div>
                  <button
                    className="link"
                    onClick={() =>
                      status(`/reports/${x._id}/status`, "under_review")
                    }
                  >
                    Review
                  </button>
                  <button
                    className="link"
                    onClick={() =>
                      status(`/reports/${x._id}/status`, "resolved")
                    }
                  >
                    Resolve
                  </button>
                </div>
              ))
            ) : (
              <p>There are no open reports.</p>
            )}
            <Link className="button" to="/admin/reports">
              Open report manager →
            </Link>
          </Card>
        </section>
        <section className="portal-panel" id="content">
          <div className="panel-head">
            <div>
              <p className="eyebrow">CONTENT STUDIO</p>
              <h2>Publish useful information.</h2>
            </div>
            <span>{content.length} live resources</span>
          </div>
          <form className="content-form" onSubmit={publish}>
            <select name="type">
              <option value="visa">Visa guide</option>
              <option value="country">Country guide</option>
              <option value="university">University guide</option>
              <option value="scam_alert">Safety alert</option>
            </select>
            <input name="title" placeholder="Resource title" required />
            <textarea
              name="summary"
              placeholder="Clear, student-friendly summary"
              required
            />
            <Button>Publish resource →</Button>
          </form>
        </section>
      </div>
    </section>
  );
}
export function ConsultancyManagement() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const { data } = await http.get("/consultancies");
      setItems(data.items);
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to load consultancies.");
    }
  }, []);
  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);
  if (user?.role !== "admin")
    return (
      <section className="portal-empty">
        <h1>Administrator access required.</h1>
      </section>
    );
  const list = (value) =>
    String(value || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  async function save(e) {
    e.preventDefault();
    if (!selected) return;
    const f = new FormData(e.currentTarget);
    const visaApprovalRate = f.get("visaApprovalRate");
    try {
      await http.patch(`/consultancies/${selected._id}`, {
        name: f.get("name"),
        city: f.get("city"),
        logoUrl: String(f.get("logoUrl") || "").trim(),
        services: list(f.get("services")),
        destinations: list(f.get("destinations")),
        description: f.get("description"),
        verificationStatus: f.get("verificationStatus"),
        visaApprovalRate:
          visaApprovalRate === "" ? undefined : Number(visaApprovalRate),
        contact: {
          email: f.get("email"),
          phone: f.get("phone"),
          website: f.get("website"),
        },
        documents: list(f.get("documents")).map((url) => ({
          name: "Verification document",
          url,
        })),
      });
      setMessage("Consultancy details saved.");
      setSelected(null);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to save consultancy.");
    }
  }
  async function remove(item) {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    try {
      await http.delete(`/consultancies/${item._id}`);
      setMessage("Consultancy deleted.");
      if (selected?._id === item._id) setSelected(null);
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to delete consultancy.");
    }
  }
  async function create(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    try {
      await http.post("/consultancies", {
        name: f.get("name"),
        city: f.get("city"),
        logoUrl: String(f.get("logoUrl") || "").trim(),
        services: list(f.get("services")),
        destinations: list(f.get("destinations")),
        description: f.get("description"),
        contact: {
          email: f.get("email"),
          phone: f.get("phone"),
          website: f.get("website"),
        },
        verificationStatus: "pending",
      });
      form.reset();
      setMessage("Consultancy added to the verification queue.");
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to add consultancy.");
    }
  }
  return (
    <section className="portal management-page">
      <aside className="portal-sidebar">
        <div>
          <p className="eyebrow">ADMIN CONSOLE</p>
          <h2>
            Consultancy
            <br />
            management.
          </h2>
          <p>
            Add providers, update their public profile, or remove obsolete
            listings.
          </p>
        </div>
        <nav>
          <Link to="/admin">← Back to overview</Link>
          <a href="#directory">All consultancies</a>
          <a href="#new">Add consultancy</a>
        </nav>
      </aside>
      <div className="portal-content">
        <div className="portal-title">
          <div>
            <p className="eyebrow">PROVIDER DIRECTORY</p>
            <h1>Manage consultancies.</h1>
          </div>
          <p>
            Every directory detail, verification control, and public contact
            field is managed here.
          </p>
        </div>
        {message && <p className="notice">{message}</p>}
        <section className="portal-panel" id="directory">
          <div className="panel-head">
            <div>
              <p className="eyebrow">ALL PROVIDERS</p>
              <h2>{items.length} consultancy listings</h2>
            </div>
          </div>
          <div className="provider-table">
            {items.map((x) => (
              <div key={x._id}>
                <div>
                  <strong>{x.name}</strong>
                  <small>
                    {x.city} · {x.services?.join(", ") || "No services added"}
                  </small>
                </div>
                <Status>{x.verificationStatus}</Status>
                <div className="queue-actions">
                  <button className="link" onClick={() => setSelected(x)}>
                    Edit
                  </button>
                  <button className="link danger" onClick={() => remove(x)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        {selected && (
          <section className="portal-panel edit-provider">
            <div className="panel-head">
              <div>
                <p className="eyebrow">EDIT PROVIDER</p>
                <h2>{selected.name}</h2>
              </div>
              <button className="link" onClick={() => setSelected(null)}>
                Close ×
              </button>
            </div>
            <form className="provider-form" onSubmit={save}>
              <label>
                Name
                <input name="name" defaultValue={selected.name} required />
              </label>
              <label>
                City
                <input name="city" defaultValue={selected.city} required />
              </label>
              <label>
                Logo image URL
                <input
                  name="logoUrl"
                  type="url"
                  defaultValue={selected.logoUrl}
                  placeholder="https://example.com/logo.png"
                />
              </label>
              <label>
                Verification status
                <select
                  name="verificationStatus"
                  defaultValue={selected.verificationStatus}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label>
                Visa approval rate (%)
                <input
                  name="visaApprovalRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  defaultValue={selected.visaApprovalRate}
                  placeholder="e.g. 92.5"
                />
              </label>
              <label>
                Destinations
                <input
                  name="destinations"
                  defaultValue={selected.destinations?.join(", ")}
                  placeholder="Australia, Canada"
                />
              </label>
              <label>
                Services
                <input
                  name="services"
                  defaultValue={selected.services?.join(", ")}
                  required
                />
              </label>
              <label>
                Public email
                <input
                  name="email"
                  type="email"
                  defaultValue={selected.contact?.email}
                />
              </label>
              <label>
                Public phone
                <input name="phone" defaultValue={selected.contact?.phone} />
              </label>
              <label>
                Website
                <input
                  name="website"
                  type="url"
                  defaultValue={selected.contact?.website}
                />
              </label>
              <label className="wide-field">
                Description
                <textarea
                  name="description"
                  defaultValue={selected.description}
                  required
                />
              </label>
              <label className="wide-field">
                Document URLs, comma separated
                <input
                  name="documents"
                  defaultValue={selected.documents
                    ?.map((d) => d.url)
                    .join(", ")}
                  placeholder="https://..."
                />
              </label>
              <Button>Save all changes →</Button>
            </form>
          </section>
        )}
        <section className="portal-panel" id="new">
          <div className="panel-head">
            <div>
              <p className="eyebrow">NEW PROVIDER</p>
              <h2>Add a consultancy to review.</h2>
            </div>
          </div>
          <form className="provider-form" onSubmit={create}>
            <input name="name" placeholder="Consultancy name" required />
            <input name="city" placeholder="City" required />
            <input name="logoUrl" type="url" placeholder="Logo image URL (https://...)" />
            <input
              name="destinations"
              placeholder="Destinations, comma separated"
            />
            <input
              name="services"
              placeholder="Services, comma separated"
              required
            />
            <input name="email" type="email" placeholder="Public email" />
            <input name="phone" placeholder="Public phone" />
            <input name="website" type="url" placeholder="Website URL" />
            <textarea
              name="description"
              placeholder="Describe the consultancy and its support"
              required
            />
            <Button>Add to verification queue →</Button>
          </form>
        </section>
      </div>
    </section>
  );
}

export function ScamReportManagement() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await http.get("/reports");
      setItems(data.items);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load scam reports.");
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);

  if (user?.role !== "admin") {
    return <section className="portal-empty"><h1>Administrator access required.</h1></section>;
  }

  function choose(report) {
    setSelected(report);
    setAdminNotes(report.adminNotes || "");
  }

  async function save(status) {
    if (!selected) return;
    try {
      const { data } = await http.patch(`/reports/${selected._id}/status`, { status, adminNotes });
      setSelected(data);
      setAdminNotes(data.adminNotes || "");
      setMessage("Scam report updated.");
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update this scam report.");
    }
  }

  return (
    <section className="portal management-page">
      <aside className="portal-sidebar">
        <div>
          <p className="eyebrow">ADMIN CONSOLE</p>
          <h2>Scam report<br />manager.</h2>
          <p>Review every detail before approving, rejecting, or resolving a report.</p>
        </div>
        <nav>
          <Link to="/admin">← Back to overview</Link>
          <a href="#reports">All scam reports</a>
          {selected && <a href="#report-detail">Selected report</a>}
        </nav>
      </aside>
      <div className="portal-content">
        <div className="portal-title">
          <div>
            <p className="eyebrow">SAFETY CENTRE</p>
            <h1>Manage scam reports.</h1>
          </div>
          <p>Open a report to see the student’s description, evidence, and any administrative notes.</p>
        </div>
        {message && <p className="notice">{message}</p>}
        <section className="portal-panel" id="reports">
          <div className="panel-head">
            <div><p className="eyebrow">ALL REPORTS</p><h2>{items.length} submitted report{items.length === 1 ? "" : "s"}</h2></div>
            <button className="link" onClick={load}>Refresh reports ↻</button>
          </div>
          <div className="provider-table">
            {items.map((report) => (
              <div key={report._id}>
                <div>
                  <strong>{report.consultancyName || "Unknown consultancy"}</strong>
                  <small>{report.scamType} · {new Date(report.createdAt).toLocaleDateString()}</small>
                </div>
                <Status>{report.status}</Status>
                <button className="link" onClick={() => choose(report)}>View details</button>
              </div>
            ))}
          </div>
        </section>
        {selected && (
          <section className="portal-panel edit-provider" id="report-detail">
            <div className="panel-head">
              <div><p className="eyebrow">REPORT DETAILS</p><h2>{selected.consultancyName || "Unknown consultancy"}</h2></div>
              <button className="link" onClick={() => setSelected(null)}>Close ×</button>
            </div>
            <div className="support-inbox">
              <article className="support-ticket">
                <div className="support-ticket-head"><div><span className="support-category">{selected.scamType}</span><h3>Submitted by {selected.reporter?.name || "Student"}</h3><small>{selected.reporter?.email || "No reporter email"} · {new Date(selected.createdAt).toLocaleString()}</small></div><Status>{selected.status}</Status></div>
                <p className="support-message">{selected.description}</p>
                <div className="previous-reply"><b>Evidence</b>{selected.evidence?.length ? selected.evidence.map((item, index) => <p key={`${item.url}-${index}`}><a href={item.url} target="_blank" rel="noreferrer">{item.label || `Open evidence ${index + 1}`} ↗</a></p>) : <p>No evidence link was provided.</p>}</div>
                <label>Admin notes<textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} placeholder="Add notes for the review decision" /></label>
                <div className="queue-actions">
                  <button className="link" onClick={() => save("under_review")}>Mark under review</button>
                  <button className="link" onClick={() => save("verified")}>Approve report</button>
                  <button className="link danger" onClick={() => save("rejected")}>Reject report</button>
                  <button className="button" onClick={() => save("resolved")}>Resolve report</button>
                </div>
              </article>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
