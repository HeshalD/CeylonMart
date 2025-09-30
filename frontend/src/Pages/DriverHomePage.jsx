import React from 'react'

function HomePage() {
  return (
    <div className="pb-16">
      <section className="hero">
        <h1 className="hero-title">Smarter Driver Management. Faster Deliveries.</h1>
        <p className="hero-sub">Search drivers instantly, manage availability in real-time, and deliver with digital proof — all in one place.</p>
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">S</div>
          <div className="feature-title">Search & Filter</div>
          <div className="feature-desc">Find drivers by name, vehicle type, or capacity with powerful filters.</div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">A</div>
          <div className="feature-title">Availability Control</div>
          <div className="feature-desc">Drivers update status to Available, Busy, or Unavailable to prevent misassignments.</div>
        </div>
        <div className="feature-card">
          <div className="feature-icon">D</div>
          <div className="feature-title">Digital Confirmation</div>
          <div className="feature-desc">Collect signature or photo as proof for every delivery, reducing disputes.</div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
