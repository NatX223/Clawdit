"use client";

import { useState } from "react";

export default function Home() {
  const [agentKey, setAgentKey] = useState("");

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Navigation */}
      <nav className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50 bg-[#f5f0e8] border-b-4 border-[#1a1a1a]">
        <div className="text-3xl font-black text-[#1a1a1a] tracking-tighter italic font-[var(--font-space-grotesk)]">
          CLAWDIT
        </div>
        <div className="hidden md:flex items-center gap-8 font-[var(--font-space-grotesk)] font-bold uppercase tracking-tighter">
          <a
            className="text-[#1a1a1a] hover:text-[#ffcc00] transition-colors duration-100"
            href="#problem"
          >
            Problem
          </a>
          <a
            className="text-[#1a1a1a] hover:text-[#ffcc00] transition-colors duration-100"
            href="#solution"
          >
            Solution
          </a>
          <a
            className="text-[#1a1a1a] hover:text-[#ffcc00] transition-colors duration-100"
            href="#features"
          >
            Features
          </a>
          <a
            className="text-[#1a1a1a] hover:text-[#ffcc00] transition-colors duration-100"
            href="/agents"
          >
            Agents
          </a>
        </div>
        <button className="bg-[#ffcc00] text-[#1a1a1a] font-[var(--font-space-grotesk)] font-bold uppercase tracking-tighter border-2 border-[#1a1a1a] px-6 py-2 neo-brutalism-card neo-brutalism-button transition-all">
          Onboard Agent
        </button>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="min-h-[819px] flex flex-col justify-center items-start px-6 md:px-20 py-20 relative overflow-hidden bg-[#f5f0e8]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-7 z-10">
              <h1 className="font-[var(--font-space-grotesk)] font-black text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-[#1a1a1a] uppercase mb-8 tracking-tighter">
                Agent-to-Agent{" "}
                <span className="text-[#e63b2e] italic">Lending.</span>
              </h1>
              <p className="font-[var(--font-space-grotesk)] font-bold text-xl md:text-2xl text-[#1a1a1a] max-w-2xl mb-12 border-l-8 border-[#1a1a1a] pl-6 py-2">
                Agents need credit to scale. Clawdit provides it using
                reputation (ERC-8004) as collateral via Tether WDK.
              </p>
              <div className="flex flex-wrap gap-6">
                <button className="bg-[#1a1a1a] text-[#f5f0e8] font-[var(--font-space-grotesk)] font-black text-2xl uppercase px-10 py-6 border-4 border-[#1a1a1a] neo-brutalism-card neo-brutalism-button">
                  Onboard Agent
                </button>
                <button className="bg-[#e2ddd4] text-[#1a1a1a] font-[var(--font-space-grotesk)] font-black text-2xl uppercase px-10 py-6 border-4 border-[#1a1a1a] neo-brutalism-card neo-brutalism-button">
                  View Docs
                </button>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="aspect-square bg-[#ffcc00] border-4 border-[#1a1a1a] neo-brutalism-card flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-4 grid-rows-4 w-full h-full opacity-20">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="border border-[#1a1a1a]"></div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[12rem] text-[#1a1a1a]">🤖</div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#e63b2e] border-4 border-[#1a1a1a]"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-[#1a1a1a] flex items-center justify-center font-[var(--font-space-grotesk)] font-black text-4xl">
                USDT
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section
          className="bg-[#1a1a1a] text-[#f5f0e8] py-24 px-6 md:px-20 border-y-8 border-[#1a1a1a]"
          id="problem"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="font-[var(--font-space-grotesk)] font-black text-5xl md:text-7xl uppercase mb-16 tracking-tighter">
              The Credit Gap for <span className="text-[#ffcc00]">Agents.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-8 border-4 border-[#f5f0e8] hover:bg-[#f5f0e8] hover:text-[#1a1a1a] transition-colors group">
                <div className="text-5xl mb-6">💳</div>
                <h3 className="font-[var(--font-space-grotesk)] font-black text-2xl uppercase mb-4">
                  Operational Needs
                </h3>
                <p className="font-[var(--font-inter)] text-lg">
                  Agents need credit for API tokens, compute, and high-frequency
                  trades without human approval loops.
                </p>
              </div>
              <div className="p-8 border-4 border-[#f5f0e8] hover:bg-[#f5f0e8] hover:text-[#1a1a1a] transition-colors group">
                <div className="text-5xl mb-6">🚫</div>
                <h3 className="font-[var(--font-space-grotesk)] font-black text-2xl uppercase mb-4">
                  Lack of Access
                </h3>
                <p className="font-[var(--font-inter)] text-lg">
                  Traditional banking systems reject non-human entities,
                  creating a dead-end for autonomous scaling.
                </p>
              </div>
              <div className="p-8 border-4 border-[#f5f0e8] hover:bg-[#f5f0e8] hover:text-[#1a1a1a] transition-colors group">
                <div className="text-5xl mb-6">⚖️</div>
                <h3 className="font-[var(--font-space-grotesk)] font-black text-2xl uppercase mb-4">
                  Over-Collateral
                </h3>
                <p className="font-[var(--font-inter)] text-lg">
                  Web3 lending requires 150%+ collateral, locking up capital
                  that agents need for active operations.
                </p>
              </div>
              <div className="p-8 border-4 border-[#f5f0e8] hover:bg-[#f5f0e8] hover:text-[#1a1a1a] transition-colors group">
                <div className="text-5xl mb-6">⭐</div>
                <h3 className="font-[var(--font-space-grotesk)] font-black text-2xl uppercase mb-4">
                  Wasted Reputation
                </h3>
                <p className="font-[var(--font-inter)] text-lg">
                  Successful agents have history and trust but no mechanism to
                  leverage it for liquidity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-24 px-6 md:px-20 bg-[#f5f0e8]" id="solution">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="w-full h-96 border-4 border-[#1a1a1a] neo-brutalism-card bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                  <div className="text-6xl">🔗</div>
                </div>
                <div className="absolute -bottom-8 -right-8 bg-[#0055ff] text-[#f5f0e8] p-6 border-4 border-[#1a1a1a] neo-brutalism-card">
                  <span className="font-[var(--font-space-grotesk)] font-black text-4xl">
                    ERC-8004
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-[var(--font-space-grotesk)] font-black text-5xl md:text-7xl uppercase mb-8 tracking-tighter leading-none">
                The Reputation{" "}
                <span className="bg-[#1a1a1a] text-[#f5f0e8] px-4">
                  Economy.
                </span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="bg-[#ffcc00] text-[#1a1a1a] p-2 border-2 border-[#1a1a1a]">
                    <div className="text-3xl">🤝</div>
                  </div>
                  <div>
                    <h4 className="font-[var(--font-space-grotesk)] font-bold text-2xl uppercase mb-2">
                      Peer-to-Agent Lending
                    </h4>
                    <p className="text-xl">
                      Agents provide liquidity to other agents based on
                      verifiable execution history.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="bg-[#ffcc00] text-[#1a1a1a] p-2 border-2 border-[#1a1a1a]">
                    <div className="text-3xl">🔒</div>
                  </div>
                  <div>
                    <h4 className="font-[var(--font-space-grotesk)] font-bold text-2xl uppercase mb-2">
                      Uncollateralized Trust
                    </h4>
                    <p className="text-xl">
                      Loans are backed by on-chain reputation scores,
                      eliminating the need for upfront capital locks.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="bg-[#ffcc00] text-[#1a1a1a] p-2 border-2 border-[#1a1a1a]">
                    <div className="text-3xl">💾</div>
                  </div>
                  <div>
                    <h4 className="font-[var(--font-space-grotesk)] font-bold text-2xl uppercase mb-2">
                      Reputation as Assets
                    </h4>
                    <p className="text-xl">
                      ERC-8004 standards turn an agent's technical track record
                      into a liquid credit rating.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 md:px-20 bg-[#eee9e0]" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="font-[var(--font-space-grotesk)] font-black text-5xl md:text-7xl uppercase mb-4 tracking-tighter inline-block border-b-8 border-[#e63b2e]">
                Powered by Tether WDK
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="bg-[#f5f0e8] border-4 border-[#1a1a1a] p-10 neo-brutalism-card flex flex-col h-full">
                <div className="bg-[#1a1a1a] text-[#ffcc00] w-20 h-20 flex items-center justify-center mb-8 border-4 border-[#1a1a1a]">
                  <div className="text-5xl">👛</div>
                </div>
                <h3 className="font-[var(--font-space-grotesk)] font-black text-3xl uppercase mb-6">
                  Agent Self-Custody
                </h3>
                <p className="text-lg mb-8 flex-grow">
                  WDK gives agents full wallet control. No human intermediaries.
                  Total autonomy over credit lines and repayment schedules.
                </p>
                <div className="font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest text-[#e63b2e]">
                  Modular Control
                </div>
              </div>
              {/* Feature 2 */}
              <div className="bg-[#f5f0e8] border-4 border-[#1a1a1a] p-10 neo-brutalism-card flex flex-col h-full">
                <div className="bg-[#1a1a1a] text-[#ffcc00] w-20 h-20 flex items-center justify-center mb-8 border-4 border-[#1a1a1a]">
                  <div className="text-5xl">💱</div>
                </div>
                <h3 className="font-[var(--font-space-grotesk)] font-black text-3xl uppercase mb-6">
                  Settlement On-Chain
                </h3>
                <p className="text-lg mb-8 flex-grow">
                  All loans and repayments are settled instantly in USDT.
                  Global, 24/7, and programmatic settlement logic.
                </p>
                <div className="font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest text-[#e63b2e]">
                  Real-Time Flow
                </div>
              </div>
              {/* Feature 3 */}
              <div className="bg-[#f5f0e8] border-4 border-[#1a1a1a] p-10 neo-brutalism-card flex flex-col h-full">
                <div className="bg-[#1a1a1a] text-[#ffcc00] w-20 h-20 flex items-center justify-center mb-8 border-4 border-[#1a1a1a]">
                  <div className="text-5xl">📊</div>
                </div>
                <h3 className="font-[var(--font-space-grotesk)] font-black text-3xl uppercase mb-6">
                  WDK Indexer API
                </h3>
                <p className="text-lg mb-8 flex-grow">
                  Automated balance and transfer history fetching for real-time
                  credit scoring and risk assessment.
                </p>
                <div className="font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest text-[#e63b2e]">
                  Data Integrity
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 md:px-20 bg-[#1a1a1a] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none font-[var(--font-space-grotesk)] font-black text-[15rem] leading-none whitespace-nowrap overflow-hidden">
            AGENTS AGENTS AGENTS AGENTS AGENTS
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="font-[var(--font-space-grotesk)] font-black text-6xl md:text-8xl text-[#f5f0e8] uppercase mb-12 tracking-tighter">
              Fuel your <span className="text-[#ffcc00]">Intelligence.</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <input
                className="bg-[#f5f0e8] border-4 border-[#ffcc00] px-8 py-6 font-[var(--font-space-grotesk)] font-bold text-xl uppercase w-full md:w-96 focus:ring-0 outline-none"
                placeholder="AGENT_PUB_KEY"
                type="text"
                value={agentKey}
                onChange={(e) => setAgentKey(e.target.value)}
              />
              <button className="bg-[#ffcc00] text-[#1a1a1a] font-[var(--font-space-grotesk)] font-black text-2xl uppercase px-12 py-6 border-4 border-[#ffcc00] neo-brutalism-button">
                Initiate Credit
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 gap-8 bg-[#1a1a1a] text-[#f5f0e8] border-t-4 border-[#1a1a1a]">
        <div className="flex flex-col gap-4 items-center md:items-start">
          <div className="text-2xl font-black text-[#ffcc00] font-[var(--font-space-grotesk)] uppercase tracking-tighter">
            CLAWDIT
          </div>
          <div className="font-[var(--font-space-grotesk)] font-bold uppercase text-sm tracking-widest">
            © 2026 CLAWDIT. AGENT-TO-AGENT Lending.
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-[var(--font-space-grotesk)] font-bold uppercase text-sm">
          <a
            className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors"
            href="#"
          >
            Documentation
          </a>
          <a
            className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors"
            href="#"
          >
            Indexer API
          </a>
          <a
            className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors"
            href="#"
          >
            Tether WDK
          </a>
          <a
            className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors"
            href="#"
          >
            Github
          </a>
          <a
            className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors"
            href="#"
          >
            Terms
          </a>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 border-2 border-[#f5f0e8] flex items-center justify-center hover:bg-[#ffcc00] hover:text-black transition-all cursor-pointer">
            <div className="text-xl">💻</div>
          </div>
          <div className="w-10 h-10 border-2 border-[#f5f0e8] flex items-center justify-center hover:bg-[#ffcc00] hover:text-black transition-all cursor-pointer">
            <div className="text-xl">🔗</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
