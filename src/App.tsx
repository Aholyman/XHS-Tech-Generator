/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { generatePostData, generateCardImage, PostData, CardData, ApiConfig } from './services/gemini';
import { CardPreview } from './components/CardPreview';
import { toPng } from 'html-to-image';
import { Loader2, Download, Copy, Sparkles, Search, Link as LinkIcon, Settings, X } from 'lucide-react';

export default function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [postData, setPostData] = useState<PostData | null>(null);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem('apiConfig');
    return saved ? JSON.parse(saved) : { provider: 'gemini', openaiBaseUrl: 'https://api.openai.com/v1', openaiModel: 'gpt-4o', openaiKey: '', aliyunKey: '', aliyunModel: 'qwen-max', openclawKey: '', openclawModel: 'openclaw' };
  });

  const saveConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    localStorage.setItem('apiConfig', JSON.stringify(newConfig));
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setError('');
    setPostData(null);

    try {
      const data = await generatePostData(topic, apiConfig);
      setPostData(data);

      // Generate images for cards that need them
      const cardsWithImages = await Promise.all(
        data.cards.map(async (card) => {
          if (card.imagePrompt) {
            try {
              const imageUrl = await generateCardImage(card.imagePrompt);
              return { ...card, imageUrl };
            } catch (e) {
              console.error("Failed to generate image for card", card.title, e);
              return card;
            }
          }
          return card;
        })
      );

      setPostData({ ...data, cards: cardsWithImages });
    } catch (e: any) {
      setError(e.message || 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCard = async (index: number) => {
    const node = document.getElementById(`card-${index}`);
    if (!node) return;

    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 1 });
      const link = document.createElement('a');
      link.download = `xiaohongshu-card-${index + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    }
  };

  const handleDownloadAll = async () => {
    if (!postData) return;
    for (let i = 0; i < postData.cards.length; i++) {
      await handleDownloadCard(i);
      // Small delay to prevent browser blocking multiple downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">XHS Tech Generator</h1>
          </div>
          <button 
            onClick={() => setShowSettings(true)} 
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="API Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">API Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
                  <select
                    value={apiConfig.provider}
                    onChange={(e) => saveConfig({ ...apiConfig, provider: e.target.value as 'gemini' | 'openai' | 'aliyun' | 'openclaw' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="gemini">Google Gemini (Built-in, Free)</option>
                    <option value="aliyun">阿里云百炼 (Qwen / 通义千问)</option>
                    <option value="openclaw">阿里云百炼 (OpenClaw)</option>
                    <option value="openai">Custom API (OpenAI Compatible)</option>
                  </select>
                </div>

                {apiConfig.provider === 'openclaw' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model Name (模型名称)</label>
                      <input
                        type="text"
                        value={apiConfig.openclawModel || 'openclaw'}
                        onChange={(e) => saveConfig({ ...apiConfig, openclawModel: e.target.value })}
                        placeholder="openclaw"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="password"
                        value={apiConfig.openclawKey || ''}
                        onChange={(e) => saveConfig({ ...apiConfig, openclawKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      已自动配置阿里云百炼接口地址 (dashscope.aliyuncs.com)。请确保你填写的模型名称与你在百炼控制台部署的 OpenClaw 模型名称一致。
                    </p>
                  </>
                )}

                {apiConfig.provider === 'aliyun' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model Name (模型名称)</label>
                      <input
                        type="text"
                        value={apiConfig.aliyunModel || 'qwen-max'}
                        onChange={(e) => saveConfig({ ...apiConfig, aliyunModel: e.target.value })}
                        placeholder="qwen-max, qwen-coder-plus..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="password"
                        value={apiConfig.aliyunKey || ''}
                        onChange={(e) => saveConfig({ ...apiConfig, aliyunKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      已自动配置阿里云百炼接口地址 (dashscope.aliyuncs.com)。支持 qwen-max, qwen-plus, qwen-coder-plus 等模型。
                    </p>
                  </>
                )}
                
                {apiConfig.provider === 'openai' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                      <input
                        type="text"
                        value={apiConfig.openaiBaseUrl}
                        onChange={(e) => saveConfig({ ...apiConfig, openaiBaseUrl: e.target.value })}
                        placeholder="https://api.openai.com/v1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                      <input
                        type="text"
                        value={apiConfig.openaiModel}
                        onChange={(e) => saveConfig({ ...apiConfig, openaiModel: e.target.value })}
                        placeholder="gpt-4o"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="password"
                        value={apiConfig.openaiKey}
                        onChange={(e) => saveConfig({ ...apiConfig, openaiKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Note: Custom APIs do not support the built-in Google Search grounding. The AI will rely on its internal knowledge. Image generation will still use the built-in Gemini model.
                    </p>
                  </>
                )}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What's the topic today?</h2>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., OpenAI latest release, SpaceX Starship launch, Elon Musk..."
                className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !topic}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate
            </button>
          </div>
          {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        </div>

        {/* Results Section */}
        {postData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Text Content */}
            <div className="lg:col-span-4 space-y-6">
              {/* Title Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Post Title</h3>
                  <button
                    onClick={() => handleCopy(postData.postTitle, 'Title')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy Title"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {postData.postTitle}
                </div>
                <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                  <span className={`font-medium ${Array.from(postData.postTitle).length > 20 ? 'text-red-500' : 'text-green-600'}`}>
                    {Array.from(postData.postTitle).length}/20 chars
                  </span>
                  <span>(XHS limit)</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Post Content</h3>
                  <button
                    onClick={() => handleCopy(postData.postContent, 'Content')}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy Content"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {postData.postContent}
                  </div>
                </div>
              </div>

              {/* Sources Section */}
              {postData.sources && postData.sources.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-500" />
                    News Sources (Fact Check)
                  </h3>
                  <ul className="space-y-3">
                    {postData.sources.map((source, idx) => (
                      <li key={idx}>
                        <a href={source.uri} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-start gap-2 leading-tight">
                          <span className="mt-0.5 text-gray-400">•</span>
                          <span className="break-words line-clamp-2">{source.title || source.uri}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Image Cards */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Cards</h3>
                  <button
                    onClick={handleDownloadAll}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {postData.cards.map((card, index) => (
                    <div key={index} className="flex flex-col gap-3">
                      {/* Preview Container - Scaled down */}
                      <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group @container">
                        <div className="absolute top-0 left-0 origin-top-left" style={{ transform: 'scale(calc(100cqw / 1080))', width: '1080px', height: '1440px' }}>
                          <CardPreview card={card} index={index + 1} total={postData.cards.length} id={`card-${index}`} />
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDownloadCard(index)}
                            className="px-4 py-2 bg-white text-gray-900 font-medium rounded-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-center text-gray-500 font-medium">Card {index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
