export default function LearnCTA() {
  return (
    <div className="tool">
      <div className="tool-head">
        <span className="eyebrow">Learn</span>
        <h2>Learn to use this, with me</h2>
        <p className="tool-desc">
          The tools on this terminal are free to use. If you'd rather learn how to actually build strategies,
          read the screener properly, and think through mutual fund selection with guidance, I run sessions
          <b> Saturdays and Sundays only.</b>
        </p>
      </div>

      <div className="card learn-card">
        <h3>What's covered</h3>
        <ul className="learn-list">
          <li>Reading the technical watchlist — what the criteria actually mean and how to use them</li>
          <li>Building and adjusting options strategies with the Greeks & payoff builder</li>
          <li>Using the comparison tool to shortlist stocks before deeper research</li>
          <li>Mutual fund selection basics, if that's more your focus</li>
        </ul>
        <div className="learn-cta-row">
          <a className="btn-p" href="https://wa.me/918928793627" target="_blank" rel="noreferrer">
            Message on WhatsApp
          </a>
          <a className="btn-o" href="mailto:joy@igriscapital.in?subject=Weekend%20session%20enquiry" >
            Email joy@igriscapital.in
          </a>
        </div>
        <p className="learn-note mono">Weekend sessions only · Igris Capital</p>
      </div>
    </div>
  )
}
