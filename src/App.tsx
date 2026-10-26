import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { CompilerStudio } from './components/CompilerStudio';
import { RepositoryShowcase } from './components/RepositoryShowcase';
import { ContributorHub } from './components/ContributorHub';
import { DocumentationView } from './components/DocumentationView';
import { LegalPages } from './components/LegalPages';
import { CloneModal } from './components/CloneModal';
import { Footer } from './components/Footer';
import { INITIAL_PATCHES, REPO_METADATA } from './data/repositoryFiles';
import { ContributedPatch, SupportedLanguage } from './types/dosbox';
import { CheckCircle2, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'compiler' | 'repository' | 'contribute' | 'docs' | 'legal'>('compiler');
  const [patches, setPatches] = useState<ContributedPatch[]>(INITIAL_PATCHES);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);

  // Cross-component communication states for Compiler Studio
  const [compilerCode, setCompilerCode] = useState<string | undefined>(undefined);
  const [compilerLang, setCompilerLang] = useState<SupportedLanguage | undefined>(undefined);
  const [compilerFilename, setCompilerFilename] = useState<string | undefined>(undefined);

  // Feedback notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add custom contributed patch
  const handleAddPatch = (newPatch: ContributedPatch) => {
    setPatches([newPatch, ...patches]);
    showToast(`Patch "${newPatch.title}" submitted to repository patch queue!`);
  };

  // Open file from repository showcase inside compiler
  const handleOpenInCompiler = (filename: string, code: string, lang: 'c' | 'cpp' | 'csharp') => {
    setCompilerCode(code);
    setCompilerLang(lang);
    setCompilerFilename(filename);
    setActiveTab('compiler');
    showToast(`Loaded ${filename} into Compiler Studio workspace.`);
  };

  // Apply custom patch to compiler
  const handleApplyPatchToCompiler = (patch: ContributedPatch) => {
    let lang: SupportedLanguage = 'c';
    if (patch.targetFile.endsWith('.cpp')) lang = 'cpp';
    else if (patch.targetFile.endsWith('.cs')) lang = 'csharp';

    // Wrap the patch as a simulated active test translation unit
    const patchedCode = `/* =========================================================================
 * DOSBOX BUILD: ACTIVE APPLIED PATCH [${patch.id}]
 * Title: ${patch.title}
 * Contributor: ${patch.author}
 * Target: ${patch.targetFile}
 * ========================================================================= */

#include <stdio.h>
#include <stdint.h>

/* --- Unified Patch Applied ---
${patch.diff}
 */

int main(void) {
    printf("[DOSBox Patch Test] Applied patch: ${patch.id}\\n");
    printf("[DOSBox Patch Test] Target: ${patch.targetFile}\\n");
    printf("[DOSBox Patch Test] Hardware driver verification OK.\\n");
    return 0;
}
`;

    setCompilerCode(patchedCode);
    setCompilerLang(lang);
    setCompilerFilename(`test_${patch.id}.c`);
    setActiveTab('compiler');
    showToast(`Patch ${patch.id} loaded into Compiler Studio for live testing.`);
  };

  // Download entire repository archive
  const handleDownloadZip = () => {
    const archiveManifest = `# DOSBOX-COMPILER-SUITE REPOSITORY BUNDLE
Owner: ${REPO_METADATA.owner}
Repository: ${REPO_METADATA.name}
Release: ${REPO_METADATA.releaseTag}
Date: ${new Date().toISOString()}

Included Directories:
/src (core emulator, vga_render.c, sb16_dsp.c, dos_int21.c, cpu_core.c)
/modules (opl3_yamaha.cpp, voodoo_glide.cpp, mt32_synth.cpp, csharp_dos_runtime.cs)
/patches (active community diffs)
/examples (plasma_c.c, wireframe_cpp.cpp, crawler_cs.cs, sound_dsp.c)
dosbox.conf
README.md
CONTRIBUTING.md
LICENSE (GPL-2.0 / MIT)

Compile instructions:
make all
dosbox bin/plasma.com
`;

    const blob = new Blob([archiveManifest], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${REPO_METADATA.name}-main-bundle.zip`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Repository archive bundle downloaded.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar adhering strictly to Top Bar Contract */}
      <TopNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenClone={() => setIsCloneModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'compiler' && (
          <CompilerStudio
            initialCode={compilerCode}
            initialLang={compilerLang}
            initialFilename={compilerFilename}
            activePatchesCount={patches.length}
          />
        )}

        {activeTab === 'repository' && (
          <RepositoryShowcase
            onOpenInCompiler={handleOpenInCompiler}
            onOpenCloneModal={() => setIsCloneModalOpen(true)}
            onDownloadZip={handleDownloadZip}
          />
        )}

        {activeTab === 'contribute' && (
          <ContributorHub
            patches={patches}
            onAddPatch={handleAddPatch}
            onApplyPatchToCompiler={handleApplyPatchToCompiler}
            activePatchesCount={patches.length}
          />
        )}

        {activeTab === 'docs' && <DocumentationView />}

        {activeTab === 'legal' && <LegalPages />}
      </main>

      {/* Footer with legal, open-source and repository links */}
      <Footer onNavigate={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Git Clone & ZIP Modal */}
      <CloneModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onDownloadZip={handleDownloadZip}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
