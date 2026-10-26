import React, { useState } from 'react';
import { GitPullRequest, Plus, CheckCircle2, Clock, Download, Play, FileCode, Check, Copy } from 'lucide-react';
import { ContributedPatch } from '../types/dosbox';
import { SyntaxHighlight } from '../utils/syntaxHighlight';

interface ContributorHubProps {
  patches: ContributedPatch[];
  onAddPatch: (patch: ContributedPatch) => void;
  onApplyPatchToCompiler: (patch: ContributedPatch) => void;
  activePatchesCount: number;
}

export function ContributorHub({
  patches,
  onAddPatch,
  onApplyPatchToCompiler,
  activePatchesCount,
}: ContributorHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [expandedPatchId, setExpandedPatchId] = useState<string | null>(patches[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New patch form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Video Graphics' as ContributedPatch['category'],
    author: 'retro_developer',
    authorEmail: 'dev@dosbox-contrib.org',
    targetFile: 'src/vga_render.c',
    description: '',
    diff: `--- a/src/vga_render.c
+++ b/src/vga_render.c
@@ -50,6 +50,11 @@
+    /* Custom hardware acceleration hook */
+    #define VGA_CUSTOM_ACCEL 1
+    vga_wait_vsync();
`,
  });

  const categories = ['All', 'Video Graphics', 'Audio DSP', 'C# AOT Runtime', 'Peripheral', 'Memory'];

  const filteredPatches = selectedCategory === 'All'
    ? patches
    : patches.filter((p) => p.category === selectedCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.diff) return;

    const newPatch: ContributedPatch = {
      id: `patch-${Date.now().toString().slice(-4)}`,
      title: formData.title,
      category: formData.category,
      author: formData.author || 'Anonymous Contributor',
      authorEmail: formData.authorEmail || 'contributor@dosbox.local',
      date: new Date().toISOString().split('T')[0],
      status: 'verified',
      targetFile: formData.targetFile,
      description: formData.description || 'Community contributed enhancement for DOSBox Compiler Suite.',
      diff: formData.diff,
      stars: 1,
    };

    onAddPatch(newPatch);
    setExpandedPatchId(newPatch.id);
    setIsSubmitOpen(false);
    setFormData({
      title: '',
      category: 'Video Graphics',
      author: 'retro_developer',
      authorEmail: 'dev@dosbox-contrib.org',
      targetFile: 'src/vga_render.c',
      description: '',
      diff: '',
    });
  };

  const handleCopyDiff = (patchId: string, diffText: string) => {
    navigator.clipboard.writeText(diffText);
    setCopiedId(patchId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadPatchFile = (patch: ContributedPatch) => {
    const blob = new Blob([patch.diff], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patch.id}-${patch.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <GitPullRequest className="w-4 h-4" />
            <span>Community Contributions & Patch Stream</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Custom Modules & Patches
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Anyone can inspect, clone, and contribute hardware drivers, audio DSP pipelines, C# AOT runtime enhancements, and compiler patches to the DOSBox repository.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Active Patches</div>
            <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
              {activePatchesCount} Verified
            </div>
          </div>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Module / Patch</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-mono text-[11px] mr-1">Filter:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Patches List */}
      <div className="space-y-4">
        {filteredPatches.map((patch) => {
          const isExpanded = expandedPatchId === patch.id;
          return (
            <div
              key={patch.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all"
            >
              <div
                onClick={() => setExpandedPatchId(isExpanded ? null : patch.id)}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-amber-400 shrink-0 mt-0.5">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-100 hover:text-amber-400 transition-colors">
                        {patch.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {patch.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span>{patch.author}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="font-mono text-slate-300">{patch.targetFile}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>{patch.category}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="tabular-nums font-mono text-[11px]">{patch.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{patch.status === 'merged' ? 'Merged to main' : 'Ready to Test'}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyPatchToCompiler(patch);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-medium rounded-lg transition-colors"
                    title="Load target file and test this patch in the online compiler"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Apply to Compiler</span>
                  </button>
                </div>
              </div>

              {/* Expanded Diff Preview */}
              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-950 p-4 space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {patch.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span className="font-mono text-[11px] text-slate-400">Unified Diff ({patch.targetFile}):</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyDiff(patch.id, patch.diff)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {copiedId === patch.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === patch.id ? 'Copied' : 'Copy Diff'}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPatchFile(patch)}
                        className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .patch</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg overflow-x-auto max-h-72">
                    <SyntaxHighlight code={patch.diff} language="diff" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Patch Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              Submit Custom Patch or Module
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Share your custom DOSBox patch, hardware driver, or C# runtime enhancement. Verified patches can be tested immediately in the browser compiler.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Patch Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Optimize 16-bit DMA Ring Buffer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ContributedPatch['category'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Video Graphics">Video Graphics</option>
                    <option value="Audio DSP">Audio DSP</option>
                    <option value="C# AOT Runtime">C# AOT Runtime</option>
                    <option value="Peripheral">Peripheral / Hardware</option>
                    <option value="Memory">Memory Manager</option>
                    <option value="Core Patch">Core x86 Patch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target File *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. src/vga_render.c or modules/my_synth.cpp"
                    value={formData.targetFile}
                    onChange={(e) => setFormData({ ...formData, targetFile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Author GitHub / Name
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description & Benchmarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain what the patch fixes or improves and its testing results..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Unified Diff Content (diff -u) *
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Unified diff format</span>
                </div>
                <textarea
                  rows={7}
                  required
                  value={formData.diff}
                  onChange={(e) => setFormData({ ...formData, diff: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
                >
                  Submit & Verify Patch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
