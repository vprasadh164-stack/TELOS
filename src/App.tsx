function App() {
  return (
    <main className="setup-page">
      <a className="brand" href="/" aria-label="TELOS home">
        TELOS<span aria-hidden="true">.</span>
      </a>

      <section className="setup-card" aria-labelledby="welcome-heading">
        <p className="eyebrow">CLIENT JOURNEY WORKSPACE</p>
        <h1 id="welcome-heading">A clearer path from first hello to final handoff.</h1>
        <p className="setup-copy">
          The project foundation is ready. We can now build the TELOS dashboard and client journey
          around your prototype brief.
        </p>
        <div className="setup-status">
          <span className="status-dot" aria-hidden="true" />
          Local development is ready
        </div>
      </section>

      <p className="setup-footer">Built for the people behind great work.</p>
    </main>
  );
}

export default App;
