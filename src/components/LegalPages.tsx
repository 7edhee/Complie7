import React, { useState } from 'react';
import { Shield, FileText, CheckCircle2, Trash2, Printer } from 'lucide-react';

interface LegalPagesProps {
  initialTab?: 'privacy' | 'terms';
}

export function LegalPages({ initialTab = 'privacy' }: LegalPagesProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);
  const [storagePurged, setStoragePurged] = useState(false);

  const handlePurgeData = () => {
    localStorage.clear();
    setStoragePurged(true);
    setTimeout(() => setStoragePurged(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>Legal Compliance & Community Trust</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Last updated: October 25, 2026 · Compliant with GDPR, CCPA, and Open Source Licenses
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'terms'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Terms of Service
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Print document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Legal Content Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed">
        {activeTab === 'privacy' ? (
          /* PRIVACY POLICY */
          <div className="space-y-6">
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                1. Overview and Commitment to Privacy
              </h3>
              <p>
                DOSBox Compiler Studio ("we", "our", or "the Project"), hosted under repository owner <strong className="text-slate-200">adheeexe</strong>, is dedicated to open-source software development and retro-computing education. We respect your personal privacy and handle information with complete transparency. This policy describes our zero-surveillance data practices for visitors, code authors, and contributors.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                2. Data Collection and Local Processing
              </h3>
              <p>
                <strong>Client-Side Compilation:</strong> When you write, edit, or test C, C++, or C# code in the Compiler Studio, compilation and DOSBox emulation are executed within your client browser environment. Your proprietary source code and experimental patches are never stored on external surveillance databases or sold to third-party brokers.
              </p>
              <p>
                <strong>Browser Storage (LocalStorage):</strong> We use standard browser storage strictly to remember:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>Your chosen editor visual theme and font preference</li>
                <li>Your selected compiler optimization levels and target memory flags</li>
                <li>Unsaved editor drafts and locally staged patch submissions</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                3. Cookies and Tracking Technologies
              </h3>
              <p>
                The Project operates with <strong>zero third-party tracking cookies</strong>, zero advertising pixels, and zero behavioral telemetry. Essential session state exists only within your browser window to power the interactive DOSBox canvas and terminal simulator.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                4. Public Contributions and Git Identity
              </h3>
              <p>
                When you submit a module or patch via the Contributor Hub or create a pull request on the repository, your provided name, handle, and commit message become part of the public version control history in accordance with standard Git and open-source practices.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                5. Rights Under GDPR and CCPA
              </h3>
              <p>
                Under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you have the right to inspect, export, or permanently erase any locally stored data. You can perform an instant local purge at any time using the self-service button below:
              </p>

              <div className="pt-2">
                <button
                  onClick={handlePurgeData}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-400 hover:text-rose-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge All Local Editor & Patch Cache</span>
                </button>
                {storagePurged && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Local cache cleared successfully.</span>
                  </span>
                )}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                6. Contact Information
              </h3>
              <p>
                For any privacy questions or requests, please contact the maintainer at: <code className="text-amber-400 font-mono">7e.adithyan@gmail.com</code>.
              </p>
            </section>
          </div>
        ) : (
          /* TERMS OF SERVICE */
          <div className="space-y-6">
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing or using the DOSBox Compiler Studio website, cloning repository assets, or contributing custom modules and patches, you agree to be bound by these Terms of Service and applicable open-source licenses. If you disagree, do not use the application.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                2. Open Source Licensing & Dual Compatibility
              </h3>
              <p>
                The core DOSBox emulator codebase is licensed under the <strong>GNU General Public License v2 (GPL-2.0)</strong>. All user-created custom hardware modules, audio drivers, and C# runtime stubs hosted in this repository are made available under dual GPL-2.0 and MIT compatibility unless explicitly marked otherwise in their source headers.
              </p>
              <p>
                You are free to view, copy, fork, clone, modify, and redistribute the project files according to the terms of the GNU General Public License.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                3. Contributor License Agreement (CLA) & DCO
              </h3>
              <p>
                By submitting any code, patch file, module, or documentation to the Project, you certify that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>You created the contribution in whole or have the necessary intellectual property rights to submit it under the GPL-2.0 / MIT license.</li>
                <li>The submission does not violate any third-party trade secret, copyright, patent, or non-disclosure agreement.</li>
                <li>You grant the maintainers and the community a perpetual, worldwide, non-exclusive license to compile and distribute your contribution.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                4. Acceptable Use Policy
              </h3>
              <p>
                The compiler and emulator tools are provided for lawful educational, reverse-engineering, retro-development, and hobbyist purposes. You agree not to use the service to construct or distribute malware, trojans, ransomware, or to distribute copyrighted game ROMs or proprietary commercial BIOS dumps without proper authorization.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                5. Disclaimer of Warranties
              </h3>
              <p className="font-mono text-[11px] text-slate-400 bg-slate-950 p-3 rounded border border-slate-800">
                THE SERVICE AND SOFTWARE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM THE USE OF THIS SOFTWARE.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                6. Community Moderation & Governance
              </h3>
              <p>
                Maintainers reserve the right to review, reject, or remove any contributed patch or module that does not comply with security standards, code quality conventions, or community conduct guidelines.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
