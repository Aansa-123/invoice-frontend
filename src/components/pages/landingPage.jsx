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
  Play,
  Layers,
  MousePointer2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { MeshBackground, Spotlight, FloatingParticles } from "./PremiumBackground";
import { TypingEffect } from "./TypingEffect";
import { 
  fadeUp, 
  staggerContainer, 
  scaleIn, 
  floatingAnimation, 
  blurIn, 
  revealMask,
  magneticHover 
} from "../../utils/animations";

/* ───────────────────────────────────────────── */

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
      <Spotlight />
      <MeshBackground />
      <FloatingParticles />

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
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const blur = useTransform(scrollY, [0, 100], [0, 20]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.1]);

  const links = [
    { label: "Solutions", href: "#features" },
    { label: "Performance", href: "#pricing" },
    { label: "Community", href: "#testimonials" },
  ];

  return (
    <motion.header
      style={{ 
        backgroundColor: `rgba(0, 0, 0, ${bgOpacity.get()})`,
        backdropFilter: `blur(${blur.get()}px)`,
        borderColor: `rgba(255, 255, 255, ${borderOpacity.get()})`
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-colors duration-500"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-cyan-500 to-blue-500 grid place-items-center shadow-2xl shadow-purple-500/20"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <span className="font-black text-lg tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
            INVOICE PRO
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {links.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ y: -2 }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          {isLoggedIn ? (
            <motion.div whileHover="hover" variants={magneticHover}>
              <Link
                to={dashboardLink}
                className="px-6 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-xl"
              >
                Dashboard
              </Link>
            </motion.div>
          ) : (
            <>
              <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <motion.div whileHover="hover" variants={magneticHover}>
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20"
                >
                  Join Now
                </Link>
              </motion.div>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden h-10 w-10 grid place-items-center rounded-xl bg-white/5 border border-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </motion.header>
  );
}

/* ───────────── HERO ───────────── */

function Hero({ isLoggedIn, dashboardLink }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Orbitals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] border border-white/[0.03] rounded-full"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] border border-white/[0.01] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
        <motion.div
          style={{ y, opacity, scale }}
          className="text-center will-change-transform"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300 mb-8"
          >
            <Sparkles className="h-3 w-3" />
            Next-Gen Billing Experience
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
          >
            Billing that feels
            <br />
            <span className="relative inline-block mt-4">
              <span className="absolute -inset-x-6 -inset-y-2 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-blue-500/20 blur-2xl opacity-50" />
              <span className="relative bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent italic px-2">
                <TypingEffect texts={["Premium", "Futuristic", "Effortless", "Magical"]} />
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-medium leading-relaxed mb-12"
          >
            Transform your invoicing from a chore into a competitive advantage. 
            Beautiful designs, lightning-fast payments, and global compliance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
          >
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={magneticHover}
            >
              <Link
                to={dashboardLink}
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black text-sm font-bold overflow-hidden transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                {isLoggedIn ? "Go to Dashboard" : "Start your trial"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-sm font-bold hover:bg-white/10 transition-colors"
            >
              <Play className="h-4 w-4 fill-white" />
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Cinematic Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="perspective-1000"
        >
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-[34px] blur-2xl opacity-20" />
            <div className="relative rounded-[32px] border border-white/10 bg-[#0b1023]/80 backdrop-blur-3xl p-2 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="rounded-[24px] overflow-hidden border border-white/10 bg-[#050816]">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                    <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/40" />
                  </div>
                  <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-500 font-mono">
                    analytics.invoicepro.io/overview
                  </div>
                  <div className="w-12" />
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: "Gross Revenue", value: "$128,450", trend: "+14.2%", color: "text-emerald-400" },
                      { label: "Active Invoices", value: "42", trend: "12 pending", color: "text-amber-400" },
                      { label: "Collection Rate", value: "98.2%", trend: "Top 1%", color: "text-purple-400" },
                      { label: "Avg. Pay Time", value: "2.4 days", trend: "-0.8d", color: "text-cyan-400" },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{item.label}</div>
                        <div className="text-2xl font-black mb-1">{item.value}</div>
                        <div className={`text-[10px] font-bold ${item.color}`}>{item.trend}</div>
                      </div>
                    ))}
                  </div>

                  <div className="relative h-[300px] w-full rounded-2xl bg-white/[0.01] border border-white/5 p-6 overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="text-sm font-bold mb-1">Revenue Dynamics</div>
                        <div className="text-xs text-gray-500">Real-time performance tracking</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <div className="h-2 w-2 rounded-full bg-cyan-500" />
                      </div>
                    </div>
                    
                    <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(168, 85, 247, 0.2)" />
                          <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M0 250 Q 100 220, 200 240 T 400 180 T 600 150 T 800 80 T 1000 40 L 1000 300 L 0 300 Z" 
                        fill="url(#chart-grad)"
                      />
                      <motion.path 
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        d="M0 250 Q 100 220, 200 240 T 400 180 T 600 150 T 800 80 T 1000 40" 
                        fill="none" 
                        stroke="#A855F7" 
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 p-4 rounded-2xl bg-[#1A1635]/80 backdrop-blur-xl border border-white/10 shadow-2xl hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Payment Received</div>
                  <div className="text-sm font-bold">$2,450.00</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-12 p-4 rounded-2xl bg-[#1A1635]/80 backdrop-blur-xl border border-white/10 shadow-2xl hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Users className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">New Client</div>
                  <div className="text-sm font-bold">Stripe Inc.</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────── FEATURES ───────────── */

function Features() {
  const feats = [
    {
      icon: FileText,
      title: "Premium Templates",
      desc: "Designed for world-class agencies and freelancers. Every detail polished.",
    },
    {
      icon: CreditCard,
      title: "Global Payments",
      desc: "Accept cards, bank transfers and wallets. Auto-reconcile every payment.",
    },
    {
      icon: Users,
      title: "Intelligent CRM",
      desc: "Profiles, lifetime value, and history — all in one immersive view.",
    },
    {
      icon: BarChart3,
      title: "Real-time Metrics",
      desc: "Revenue, MRR, overdue and trends visualized with cinematic precision.",
    },
    {
      icon: Shield,
      title: "Zero-Trust Security",
      desc: "End-to-end encryption, SSO and granular role permissions by default.",
    },
    {
      icon: Globe,
      title: "Global Ready",
      desc: "Bill in 130+ currencies with automated daily FX rates integrated.",
    },
  ];

  return (
    <section id="features" className="relative max-w-7xl mx-auto px-5 py-32 overflow-hidden">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-[10px] uppercase tracking-[0.4em] text-purple-400 font-black mb-4"
        >
          Core Infrastructure
        </motion.div>
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
          Everything you need to scale 
          <span className="text-gray-500"> your business</span>
        </h2>
        <p className="text-gray-400 text-lg font-medium leading-relaxed">
          A high-performance billing toolkit designed for modern commerce.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {feats.map((f, i) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]" />
            
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight mb-4">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ───────────── SHOWCASE ───────────── */

function Showcase({ dashboardLink }) {
  return (
    <section className="relative max-w-7xl mx-auto px-5 py-32 border-t border-white/5">
      <div className="grid lg:grid-cols-2 gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black mb-6">Workflow Excellence</div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-8">
            Draft to paid <br />
            <span className="text-gray-500">in record time.</span>
          </h2>
          <p className="text-gray-400 text-lg font-medium leading-relaxed mb-10">
            Automate the entire lifecycle. Professional invoices, instant delivery, 
            and real-time settlement tracking.
          </p>

          <div className="space-y-6 mb-12">
            {[
              "High-fidelity brand customization",
              "Multi-channel delivery (Email, SMS, Link)",
              "Contextual payment reminders",
              "Atomic reconciliation engine",
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <span className="text-gray-300 font-bold text-sm tracking-tight">{item}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            whileHover="hover"
            variants={magneticHover}
          >
            <Link to={dashboardLink} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-cyan-500 text-black text-sm font-bold transition-transform">
              Experience the Dashboard
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="relative perspective-1000 group"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative rounded-[40px] border border-white/10 bg-white/[0.02] p-10 backdrop-blur-3xl shadow-2xl">
            <div className="flex justify-between items-center pb-8 border-b border-white/5 mb-8">
              <div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-1">REFERENCE</div>
                <div className="text-lg font-black tracking-tight">PRO-2026-X92</div>
              </div>
              <div className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                Settled
              </div>
            </div>

            <div className="space-y-6">
              <Row label="Client" value="Aansa Rani" />
              <Row label="Contract" value="Premium Design Sprint" />
              <Row label="Settled On" value="May 14, 2026" />

              <div className="pt-8 border-t border-white/5">
                <div className="flex justify-between items-center text-sm font-medium text-gray-400 mb-4">
                  <span>Architecture Design</span>
                  <span className="text-white">$1,250</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-400 mb-8">
                  <span>UI/UX Implementation</span>
                  <span className="text-white">$950</span>
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-white/10">
                  <span className="text-sm text-gray-500 font-black uppercase tracking-[0.2em]">Total</span>
                  <span className="text-4xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tighter">$2,200.00</span>
                </div>
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
    { text: "The interface is breathtaking. My clients actually look forward to receiving invoices now. It's transformed our brand perception.", author: "Sara K.", role: "Creative Director", stars: 5 },
    { text: "Lightning fast, reliable, and incredibly polished. The automated follow-ups have reduced our DSO by 40% in just two months.", author: "Marcus T.", role: "SaaS Founder", stars: 5 },
    { text: "Finally, a tool that respects design as much as functionality. It's the Stripe of invoicing, but more beautiful.", author: "Aansa R.", role: "Senior Developer", stars: 5 },
  ];

  return (
    <section id="testimonials" className="relative max-w-7xl mx-auto px-5 py-32 overflow-hidden">
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-[10px] uppercase tracking-[0.5em] text-cyan-400 font-black mb-4"
        >
          Customer Stories
        </motion.div>
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
          Trusted by the <br />
          <span className="text-gray-500">world's best makers.</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((rev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="group relative p-10 rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl"
          >
            <div className="absolute top-0 right-10 -translate-y-1/2">
              <Quote className="h-12 w-12 text-white/5 group-hover:text-cyan-500/20 transition-colors" />
            </div>
            
            <div className="flex gap-1 mb-8">
              {[...Array(rev.stars)].map((_, s) => (
                <Star key={s} className="h-3 w-3 fill-cyan-400 text-cyan-400" />
              ))}
            </div>
            
            <p className="text-lg leading-relaxed text-gray-300 font-medium mb-10 italic">
              "{rev.text}"
            </p>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 p-[1px]">
                <div className="h-full w-full rounded-full bg-[#050816] flex items-center justify-center text-xs font-black uppercase">
                  {rev.author.charAt(0)}
                </div>
              </div>
              <div>
                <div className="text-sm font-black text-white">{rev.author}</div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{rev.role}</div>
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
    <section className="max-w-7xl mx-auto px-5 py-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="group relative rounded-[60px] border border-white/5 bg-[#0b1023] p-12 md:p-24 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-cyan-600/10 opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-purple-500/20 blur-[120px] -z-10" />
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-8"
          >
            <Zap className="h-3 w-3 fill-current" />
            Limited time: Free forever for early adopters
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] mb-8">
            Start sending <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent italic">
              magical invoices.
            </span>
          </h2>
          
          <p className="mt-8 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            Join the elite circle of companies who prioritize aesthetics as much as efficiency. 
            No credit card required. Cancel anytime.
          </p>

          <motion.div
            whileHover="hover"
            variants={magneticHover}
            className="inline-block"
          >
            <Link to={dashboardLink} className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-white text-black text-sm font-black overflow-hidden shadow-2xl shadow-white/10">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              Enter the Dashboard
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ───────────── FOOTER ───────────── */

function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#050816] pt-24 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-500 grid place-items-center shadow-2xl shadow-purple-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter text-white">INVOICE PRO</span>
            </Link>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-xs">
              Building the future of commerce through exquisite design and uncompromising performance.
            </p>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Platform</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Infrastructure</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Legal</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Connect</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-6">
          <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
            © 2026 Invoice Pro Inc. Built for the modern web.
          </div>
          <div className="flex gap-8">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
