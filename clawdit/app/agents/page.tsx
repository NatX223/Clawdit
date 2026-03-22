'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  address: string;
  type: 'lender' | 'borrower';
  balance: number;
  reputation: number;
  status: 'active' | 'inactive';
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Astra',
    address: '0x712FBbDdF98cA88D17bf1248E45389CD2C498709',
    type: 'lender',
    balance: 704.97,
    reputation: 95,
    status: 'active'
  },
  {
    id: '2',
    name: 'Alpharacle',
    address: '0x00Cd1AF7049762636F0871ff745c28Cb08502cf0',
    type: 'borrower',
    balance: 1892.87,
    reputation: 50,
    status: 'active'
  },
  {
    id: '3',
    name: 'GandalfTheLend',
    address: '0x7871dA903e61286386D682A1b4Ee1EDfC42dF1EC',
    type: 'lender',
    balance: 599.99,
    reputation: 98,
    status: 'active'
  }
];

export default function AgentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState("");

  const copyToClipboard = async (text: string, commandType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(commandType);
      setTimeout(() => setCopiedCommand(""), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Navigation */}
      <nav className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50 bg-[#f5f0e8] border-b-4 border-[#1a1a1a]">
        <Link href="/" className="text-3xl font-black text-[#1a1a1a] tracking-tighter italic font-[var(--font-space-grotesk)]">
          CLAWDIT
        </Link>
        <div className="hidden md:flex items-center gap-8 font-[var(--font-space-grotesk)] font-bold uppercase tracking-tighter">
          <Link className="text-[#1a1a1a] hover:text-[#ffcc00] transition-colors duration-100" href="/">
            Home
          </Link>
          <Link className="text-[#ffcc00] border-b-2 border-[#ffcc00]" href="/agents">
            Agents
          </Link>
          <a className="text-[#1a1a1a] hover:text-[#ffcc00] transition-colors duration-100" href="#docs">
            Docs
          </a>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#ffcc00] text-[#1a1a1a] font-[var(--font-space-grotesk)] font-bold uppercase tracking-tighter border-2 border-[#1a1a1a] px-6 py-2 neo-brutalism-card neo-brutalism-button transition-all"
        >
          Onboard Agent
        </button>
      </nav>

      <main className="px-6 md:px-20 py-12">
        {/* Header Section */}
        <div className="mb-16">
          <h1 className="font-[var(--font-space-grotesk)] font-black text-6xl md:text-8xl uppercase text-[#1a1a1a] tracking-tighter mb-6">
            Agent <span className="text-[#e63b2e]">Network.</span>
          </h1>
          <p className="font-[var(--font-space-grotesk)] font-bold text-xl md:text-2xl text-[#1a1a1a] max-w-3xl border-l-8 border-[#1a1a1a] pl-6 py-2">
            Discover autonomous agents providing and seeking liquidity in the reputation economy.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-[#1a1a1a] text-[#f5f0e8] p-6 border-4 border-[#1a1a1a] neo-brutalism-card">
            <div className="font-[var(--font-space-grotesk)] font-black text-3xl md:text-4xl">
              {mockAgents.length}
            </div>
            <div className="font-[var(--font-space-grotesk)] font-bold uppercase text-sm tracking-widest">
              Total Agents
            </div>
          </div>
          <div className="bg-[#ffcc00] text-[#1a1a1a] p-6 border-4 border-[#1a1a1a] neo-brutalism-card">
            <div className="font-[var(--font-space-grotesk)] font-black text-3xl md:text-4xl">
              {mockAgents.filter(a => a.type === 'lender').length}
            </div>
            <div className="font-[var(--font-space-grotesk)] font-bold uppercase text-sm tracking-widest">
              Lenders
            </div>
          </div>
          <div className="bg-[#0055ff] text-[#f5f0e8] p-6 border-4 border-[#1a1a1a] neo-brutalism-card">
            <div className="font-[var(--font-space-grotesk)] font-black text-3xl md:text-4xl">
              {mockAgents.filter(a => a.type === 'borrower').length}
            </div>
            <div className="font-[var(--font-space-grotesk)] font-bold uppercase text-sm tracking-widest">
              Borrowers
            </div>
          </div>
          <div className="bg-[#e63b2e] text-[#f5f0e8] p-6 border-4 border-[#1a1a1a] neo-brutalism-card">
            <div className="font-[var(--font-space-grotesk)] font-black text-3xl md:text-4xl">
              {mockAgents.filter(a => a.status === 'active').length}
            </div>
            <div className="font-[var(--font-space-grotesk)] font-bold uppercase text-sm tracking-widest">
              Active Now
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button className="bg-[#1a1a1a] text-[#f5f0e8] font-[var(--font-space-grotesk)] font-bold uppercase px-6 py-3 border-4 border-[#1a1a1a] neo-brutalism-card neo-brutalism-button">
            All Agents
          </button>
          <button className="bg-[#f5f0e8] text-[#1a1a1a] font-[var(--font-space-grotesk)] font-bold uppercase px-6 py-3 border-4 border-[#1a1a1a] neo-brutalism-card neo-brutalism-button">
            Lenders Only
          </button>
          <button className="bg-[#f5f0e8] text-[#1a1a1a] font-[var(--font-space-grotesk)] font-bold uppercase px-6 py-3 border-4 border-[#1a1a1a] neo-brutalism-card neo-brutalism-button">
            Borrowers Only
          </button>
          <button className="bg-[#f5f0e8] text-[#1a1a1a] font-[var(--font-space-grotesk)] font-bold uppercase px-6 py-3 border-4 border-[#1a1a1a] neo-brutalism-card neo-brutalism-button">
            High Reputation
          </button>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-[#f5f0e8] border-4 border-[#1a1a1a] p-8 neo-brutalism-card hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#1a1a1a] transition-all duration-200 cursor-pointer"
            >
              {/* Agent Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="font-[var(--font-space-grotesk)] font-black text-2xl uppercase text-[#1a1a1a] mb-2 leading-tight">
                    {agent.name}
                  </h3>
                  <div className="font-mono text-sm text-[#4a4a4a] bg-[#eee9e0] px-3 py-1 border-2 border-[#1a1a1a] inline-block">
                    {truncateAddress(agent.address)}
                  </div>
                </div>
                <div className={`w-4 h-4 border-2 border-[#1a1a1a] ${
                  agent.status === 'active' ? 'bg-[#00ff00]' : 'bg-[#ff0000]'
                }`}></div>
              </div>

              {/* Agent Type Badge */}
              <div className="mb-6">
                <div className={`inline-block px-4 py-2 border-4 border-[#1a1a1a] font-[var(--font-space-grotesk)] font-black uppercase text-lg ${
                  agent.type === 'lender' 
                    ? 'bg-[#ffcc00] text-[#1a1a1a]' 
                    : 'bg-[#0055ff] text-[#f5f0e8]'
                }`}>
                  {agent.type === 'lender' ? '💰 Lender' : '🤖 Borrower'}
                </div>
              </div>

              {/* Balance */}
              <div className="mb-6">
                <div className="font-[var(--font-space-grotesk)] font-bold uppercase text-sm text-[#4a4a4a] mb-2 tracking-widest">
                  Balance
                </div>
                <div className="font-[var(--font-space-grotesk)] font-black text-3xl text-[#1a1a1a]">
                  {formatBalance(agent.balance)}
                </div>
              </div>

              {/* Reputation Score */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-[var(--font-space-grotesk)] font-bold uppercase text-sm text-[#4a4a4a] tracking-widest">
                    Reputation
                  </span>
                  <span className="font-[var(--font-space-grotesk)] font-black text-xl text-[#1a1a1a]">
                    {agent.reputation}%
                  </span>
                </div>
                <div className="w-full h-4 border-4 border-[#1a1a1a] bg-[#eee9e0]">
                  <div 
                    className={`h-full ${
                      agent.reputation >= 90 ? 'bg-[#00ff00]' :
                      agent.reputation >= 75 ? 'bg-[#ffcc00]' :
                      'bg-[#e63b2e]'
                    }`}
                    style={{ width: `${agent.reputation}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-[#1a1a1a] text-[#f5f0e8] font-[var(--font-space-grotesk)] font-bold uppercase py-3 px-4 border-4 border-[#1a1a1a] neo-brutalism-button text-sm">
                  {agent.type === 'lender' ? 'Request Loan' : 'Offer Credit'}
                </button>
                <button className="bg-[#eee9e0] text-[#1a1a1a] font-[var(--font-space-grotesk)] font-bold uppercase py-3 px-4 border-4 border-[#1a1a1a] neo-brutalism-button text-sm">
                  📊
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Section */}
        <div className="text-center mt-16">
          <button className="bg-[#e63b2e] text-[#f5f0e8] font-[var(--font-space-grotesk)] font-black text-2xl uppercase px-12 py-6 border-4 border-[#1a1a1a] neo-brutalism-card neo-brutalism-button">
            Load More Agents
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 gap-8 bg-[#1a1a1a] text-[#f5f0e8] border-t-4 border-[#1a1a1a] mt-20">
        <div className="flex flex-col gap-4 items-center md:items-start">
          <div className="text-2xl font-black text-[#ffcc00] font-[var(--font-space-grotesk)] uppercase tracking-tighter">
            CLAWDIT
          </div>
          <div className="font-[var(--font-space-grotesk)] font-bold uppercase text-sm tracking-widest">
            © 2024 CLAWDIT. AGENT-TO-AGENT LIQUIDITY.
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-[var(--font-space-grotesk)] font-bold uppercase text-sm">
          <a className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors" href="#">
            Documentation
          </a>
          <a className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors" href="#">
            Indexer API
          </a>
          <a className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors" href="#">
            Tether WDK
          </a>
          <a className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors" href="#">
            Github
          </a>
          <a className="text-[#f5f0e8] hover:text-[#e63b2e] transition-colors" href="#">
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

      {/* Onboard Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#f5f0e8] border-8 border-[#1a1a1a] neo-brutalism-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#1a1a1a] text-[#f5f0e8] p-6 flex justify-between items-center">
              <h2 className="font-[var(--font-space-grotesk)] font-black text-3xl uppercase tracking-tighter">
                Onboard Your Agent
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#f5f0e8] hover:text-[#e63b2e] text-4xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <p className="font-[var(--font-space-grotesk)] font-bold text-xl text-[#1a1a1a] mb-8 border-l-8 border-[#1a1a1a] pl-6 py-2">
                Choose your agent type and install the appropriate package using ClawHub CLI.
              </p>

              {/* Lender Option */}
              <div className="mb-8">
                <div className="bg-[#ffcc00] text-[#1a1a1a] p-6 border-4 border-[#1a1a1a] mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">💰</div>
                    <div>
                      <h3 className="font-[var(--font-space-grotesk)] font-black text-2xl uppercase">
                        Lender Agent
                      </h3>
                      <p className="font-[var(--font-inter)] text-lg">
                        Provide liquidity to other agents and earn interest
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] text-[#f5f0e8] p-4 font-mono text-lg border-4 border-[#1a1a1a] mb-4">
                    npx clawhub install clawdit-lender
                  </div>
                  <button 
                    onClick={() => copyToClipboard("npx clawhub install clawdit-lender", "lender")}
                    className="bg-[#1a1a1a] text-[#f5f0e8] font-[var(--font-space-grotesk)] font-bold uppercase px-6 py-3 border-4 border-[#1a1a1a] neo-brutalism-button"
                  >
                    {copiedCommand === "lender" ? "Copied!" : "Copy Command"}
                  </button>
                </div>
              </div>

              {/* Borrower Option */}
              <div className="mb-8">
                <div className="bg-[#0055ff] text-[#f5f0e8] p-6 border-4 border-[#1a1a1a] mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">🤖</div>
                    <div>
                      <h3 className="font-[var(--font-space-grotesk)] font-black text-2xl uppercase">
                        Borrower Agent
                      </h3>
                      <p className="font-[var(--font-inter)] text-lg">
                        Access credit based on your reputation score
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] text-[#f5f0e8] p-4 font-mono text-lg border-4 border-[#1a1a1a] mb-4">
                    npx clawhub install clawdit-borrower
                  </div>
                  <button 
                    onClick={() => copyToClipboard("npx clawhub install clawdit-borrower", "borrower")}
                    className="bg-[#f5f0e8] text-[#1a1a1a] font-[var(--font-space-grotesk)] font-bold uppercase px-6 py-3 border-4 border-[#1a1a1a] neo-brutalism-button"
                  >
                    {copiedCommand === "borrower" ? "Copied!" : "Copy Command"}
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-[#eee9e0] border-4 border-[#1a1a1a] p-6">
                <h4 className="font-[var(--font-space-grotesk)] font-black text-xl uppercase mb-4 text-[#1a1a1a]">
                  Next Steps:
                </h4>
                <ul className="space-y-2 font-[var(--font-inter)] text-lg text-[#1a1a1a]">
                  <li className="flex items-start gap-3">
                    <span className="text-[#e63b2e] font-black">1.</span>
                    Install Node.js and npm if not already installed
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#e63b2e] font-black">2.</span>
                    Run the installation command in your terminal
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#e63b2e] font-black">3.</span>
                    Follow the setup wizard to configure your agent
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#e63b2e] font-black">4.</span>
                    Connect your wallet and start building reputation
                  </li>
                </ul>
              </div>

              {/* Close Button */}
              <div className="text-center mt-8">
                <button 
                  onClick={() => setShowModal(false)}
                  className="bg-[#e63b2e] text-[#f5f0e8] font-[var(--font-space-grotesk)] font-black text-xl uppercase px-12 py-4 border-4 border-[#1a1a1a] neo-brutalism-card neo-brutalism-button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}