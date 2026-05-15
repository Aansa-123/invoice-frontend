import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  CreditCard,
  Users,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Star,
  Quote,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/* ───────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -80 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 80 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function LandingPage({ isLoggedIn, globalRole, hasOrg }) {
  const [availablePlans, setAvailablePlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/plans`);
        if (response.ok) {
          const data = await response.json();
          setAvailablePlans(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      }
    };
    fetchPlans();
  }, []);

  const dashboardLink = isLoggedIn 
    ? (globalRole === "Admin" ? "/admin" : (hasOrg ? "/dashboard" : "/setup"))
    : "/login";

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050816] text-white selection:bg-purple-500/30">
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut",
          }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[1200px] rounded-full bg-purple-600/20 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
          }}
          className="absolute top-[35%] right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-indigo-500/10 blur-[100px]"
        />
      </div>

      <Navbar isLoggedIn={isLoggedIn} dashboardLink={dashboardLink} />
      <Hero isLoggedIn={isLoggedIn} dashboardLink={dashboardLink} />
     
      <Features />
      <Showcase dashboardLink={dashboardLink} />
     
      <Testimonials />
      <CTA dashboardLink={dashboardLink} />
      <Footer />
    </div>
  );
}

/* ───────────── NAVBAR ───────────── */

function Navbar({ isLoggedIn, dashboardLink }) {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="h-9 w-9 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 grid place-items-center shadow-lg shadow-purple-500/30"
          >
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </motion.div>

          <span className="font-bold text-base tracking-tight text-white">Invoice Pro</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400">
          {links.map((link) => (
            <motion.a
              whileHover={{ y: -1 }}
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to={dashboardLink}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/30"
              >
                Visit Dashboard
              </Link>
            </motion.div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/30"
                >
                  Get started
                </Link>
              </motion.div>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden h-9 w-9 grid place-items-center rounded-lg bg-white/5 border border-white/10"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-white/10 px-5 py-4 bg-black/60 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 text-sm font-medium">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-gray-400 hover:text-white">
                {l.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10">
              {isLoggedIn ? (
                <Link to={dashboardLink} className="font-semibold text-purple-400">Visit Dashboard</Link>
              ) : (
                <Link to="/login" className="font-semibold text-purple-400">Sign in</Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

/* ───────────── HERO ───────────── */

function Hero({ isLoggedIn, dashboardLink }) {
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 pt-20 pb-20 text-center">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-[10px] font-semibold uppercase tracking-widest text-purple-300"
      >
        <Sparkles className="h-3 w-3" />
        AI-powered invoice insights
      </motion.div>

      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.2}
        className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight"
      >
        Beautiful invoicing
        <br />
        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          for modern businesses
        </span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.35}
        className="mt-8 max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed font-medium"
      >
        Send stunning invoices, get paid faster, and track every dollar across
        your clients — all from a workspace that feels as good as it looks.
      </motion.p>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.5}
        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to={dashboardLink}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold shadow-2xl shadow-purple-500/30"
          >
            {isLoggedIn ? "Visit dashboard" : "Start free — no card required"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.a
          whileHover={{ scale: 1.03 }}
          href="#features"
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all"
        >
          See how it works
        </motion.a>
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        custom={0.7}
        className="mt-20 relative max-w-5xl mx-auto"
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl opacity-30 -z-10" />
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
          className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-3 shadow-2xl"
        >
          <div className="rounded-[24px] overflow-hidden border border-white/10 bg-[#0b1023]">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
              </div>
              <div className="text-[10px] text-gray-500 font-mono tracking-tight">app.invoicepro.io/dashboard</div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 p-5">
              {[
                { label: "Revenue", value: "$48,560" },
                { label: "Outstanding", value: "$8,420" },
                { label: "Paid", value: "$40,140" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-left">
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{item.label}</div>
                  <div className="mt-1 text-2xl font-black tracking-tight">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5">
              <div className="h-[180px] rounded-2xl bg-gradient-to-b from-purple-500/10 to-transparent border border-white/5 flex items-end p-5 overflow-hidden">
                <div className="w-full h-full relative">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d="M0 35 Q 10 32, 20 34 T 40 28 T 60 25 T 80 18 T 100 12" fill="none" stroke="url(#line-grad)" strokeWidth="1.5" />
                    <defs>
                      <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="absolute inset-0 bg-[#0b1023] origin-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ───────────── FEATURES ───────────── */

function Features() {
  const feats = [
    {
      icon: FileText,
      title: "Smart invoices",
      desc: "Drag, drop, send. Templates auto-adapt to your brand and currency.",
    },
    {
      icon: CreditCard,
      title: "Get paid faster",
      desc: "Accept cards, bank transfers and wallets. Auto-reconcile every payment.",
    },
    {
      icon: Users,
      title: "Client CRM",
      desc: "Profiles, lifetime value, and history — all in one tidy view.",
    },
    {
      icon: BarChart3,
      title: "Live analytics",
      desc: "Revenue, MRR, overdue and trends visualized in real-time.",
    },
    {
      icon: Shield,
      title: "Bank-grade security",
      desc: "End-to-end encryption, SSO and granular role permissions.",
    },
    {
      icon: Globe,
      title: "Multi-currency",
      desc: "Bill in 130+ currencies with daily FX rates baked in.",
    },
  ];

  return (
    <section id="features" className="max-w-7xl mx-auto px-5 py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-bold">Features</div>
        <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight">Everything you need to bill clients</h2>
        <p className="mt-4 text-gray-400 text-sm font-medium">A complete billing toolkit that scales from your first invoice to your thousandth.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {feats.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5, borderColor: "rgba(168,85,247,0.3)" }}
            className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition-all"
          >
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <f.icon className="h-5 w-5 text-purple-400" />
            </div>

            <h3 className="mt-6 text-base font-bold text-white tracking-tight">{f.title}</h3>
            <p className="mt-3 text-xs leading-relaxed text-gray-400 font-medium">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ───────────── SHOWCASE ───────────── */

function Showcase({ dashboardLink }) {
  return (
    <section className="max-w-7xl mx-auto px-5 py-24 border-t border-white/5">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <motion.div variants={fadeLeft} initial="hidden" whileInView="show">
          <div className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-bold">Workflow</div>
          <h2 className="mt-5 text-4xl sm:text-5xl font-black leading-tight tracking-tight">From draft to paid in minutes</h2>
          <p className="mt-6 text-gray-400 text-sm leading-relaxed font-medium">Create polished invoices, send them with a single click, and watch payments land with real-time notifications.</p>

          <ul className="mt-8 space-y-3">
            {[
              "Custom branded invoices with your logo & accent color",
              "Send via email or shareable secure link",
              "Track opens, views and payment status live",
              "Automate reminders for overdue invoices",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-gray-300 font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <Link to={dashboardLink} className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
            Try the live dashboard
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div variants={fadeRight} initial="hidden" whileInView="show" className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <div className="text-[10px] text-gray-500 font-mono">INVOICE</div>
                <div className="text-sm font-bold">INV-2026-00128</div>
              </div>
              <div className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-[10px] font-bold">Paid</div>
            </div>

            <Row label="Client" value="Aansa Rani" />
            <Row label="Issue date" value="May 9, 2026" />
            <Row label="Due date" value="May 23, 2026" />

            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2 font-medium">
                <span>Brand identity design</span>
                <span>$640</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-4 font-medium">
                <span>Landing page</span>
                <span>$300</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total due</span>
                <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">$940.00</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-bold text-gray-200">{value}</span>
    </div>
  );
}

/* ───────────── TESTIMONIALS ───────────── */

function Testimonials() {
  const reviews = [
    { text: "Invoice Pro paid for itself in the first week. My clients actually compliment the invoices!", author: "Sara K.", role: "Brand designer", stars: 5 },
    { text: "We replaced three tools with this. The analytics alone are worth it.", author: "Marcus T.", role: "Studio owner", stars: 5 },
    { text: "Finally an invoicing app that doesn't look like a spreadsheet from 2008.", author: "Aansa R.", role: "Freelance developer", stars: 5 },
  ];

  return (
    <section id="testimonials" className="max-w-7xl mx-auto px-5 py-24">
      <div className="text-center mb-16">
        <div className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-bold">Loved by makers</div>
        <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-white">What teams are saying</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((rev, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl relative"
          >
            <Quote className="absolute right-7 top-7 h-10 w-10 text-white/5" />
            <div className="flex gap-1 mb-4">
              {[...Array(rev.stars)].map((_, s) => <Star key={s} className="h-3 w-3 fill-orange-400 text-orange-400" />)}
            </div>
            <p className="text-xs leading-relaxed text-gray-300 font-medium italic">"{rev.text}"</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">{rev.author.charAt(0)}</div>
              <div>
                <div className="text-xs font-bold text-white">{rev.author}</div>
                <div className="text-[10px] text-gray-500 font-medium">{rev.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ───────────── CTA ───────────── */

function CTA({ dashboardLink }) {
  return (
    <section className="max-w-7xl mx-auto px-5 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="rounded-[40px] border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-black to-cyan-500/10 p-12 sm:p-20 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-purple-500/10 blur-[100px] -z-10" />
        <div className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-bold mb-6 flex items-center justify-center gap-2">
          <Zap className="h-3 w-3 fill-current" />
          14-day free trial · no card
        </div>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">Ready to send your best invoice yet?</h2>
        <p className="mt-6 text-gray-400 text-sm max-w-xl mx-auto font-medium">Join thousands of freelancers and teams who get paid faster with Invoice Pro.</p>

        <motion.div whileHover={{ scale: 1.05 }} className="mt-10">
          <Link to={dashboardLink} className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold shadow-2xl shadow-purple-500/40">
            Open the dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ───────────── FOOTER ───────────── */

function Footer() {
  return (
    <footer className="border-t border-white/10 mt-10">
      <div className="max-w-7xl mx-auto px-5 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-sm tracking-tight text-white">Invoice Pro</span>
          </div>
          <span className="text-[10px] text-gray-600 font-mono">© 2026</span>
        </div>

        <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-gray-500">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Status</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
