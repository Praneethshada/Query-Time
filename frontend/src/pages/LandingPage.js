import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <p className="landing-badge">A calm space for classroom questions</p>
          <h1>Query Time</h1>
          <p className="landing-subtitle">
            Give every student a voice without interrupting the lesson. Ask
            quietly, answer clearly, and keep the class flowing.
          </p>
          <div className="landing-actions">
            <Link to="/auth?mode=register" className="btn-primary">
              Get Started
            </Link>
            <Link to="/auth?mode=login" className="btn-secondary">
              Login
            </Link>
          </div>
        </div>
        <div className="landing-hero-card">
          <div className="landing-card-top">
            <span className="landing-pill">Teacher view</span>
            <span className="landing-dot" />
            <span className="landing-dot" />
            <span className="landing-dot" />
          </div>
          <div className="landing-card-body">
            <p className="landing-card-title">Question board</p>
            <ul className="landing-card-list">
              <li>Students can ask without pressure</li>
              <li>Teachers can mark what matters most</li>
              <li>Answers stay easy to find</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-steps">
        <h2>How it works</h2>
        <div className="landing-step-grid">
          <div className="landing-step">
            <h3>1. Start a class</h3>
            <p>Create a class and share a simple join code.</p>
          </div>
          <div className="landing-step">
            <h3>2. Students join</h3>
            <p>Students join with the code and ask questions anytime.</p>
          </div>
          <div className="landing-step">
            <h3>3. Keep it clear</h3>
            <p>Mark what is answered and highlight what matters.</p>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h2>Built for clarity</h2>
        <div className="landing-feature-grid">
          <div className="landing-feature">
            <h4>Comfort for students</h4>
            <p>Students ask without worrying about being judged.</p>
          </div>
          <div className="landing-feature">
            <h4>Always up to date</h4>
            <p>Everyone sees the latest answers right away.</p>
          </div>
          <div className="landing-feature">
            <h4>Teacher focus</h4>
            <p>Keep the board organized and easy to scan.</p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <h2>Ready for your next class?</h2>
          <p>Start a classroom in seconds and keep every question in view.</p>
        </div>
        <Link to="/auth?mode=register" className="btn-primary">
          Create a Classroom
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;
