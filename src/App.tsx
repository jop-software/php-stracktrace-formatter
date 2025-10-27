import React, { useState, useCallback } from 'react';
import { Copy, RotateCcw, Code, Zap } from 'lucide-react';

function App() {
  const [rawTrace, setRawTrace] = useState('');
  const [formattedTrace, setFormattedTrace] = useState('');
  const [copied, setCopied] = useState(false);

  const formatStackTrace = useCallback((trace: string) => {
    if (!trace.trim()) {
      setFormattedTrace('');
      return;
    }

    // Split on #<number> pattern, but keep the # with the number
    const formatted = trace
      // First, handle cases where # is not at the start of a line
      .replace(/([^\n])\s*#(\d+)/g, '$1\n#$2')
      // Clean up any double newlines
      .replace(/\n\n+/g, '\n')
      // Trim whitespace from each line
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    setFormattedTrace(formatted);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRawTrace(value);
    formatStackTrace(value);
  };

  const handleCopy = async () => {
    if (formattedTrace) {
      await navigator.clipboard.writeText(formattedTrace);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setRawTrace('');
    setFormattedTrace('');
  };

  const renderFormattedTrace = () => {
    if (!formattedTrace) return null;

    return formattedTrace.split('\n').map((line, index) => {
      // Check if line starts with #<number>
      const isStackItem = /^#\d+/.test(line);
      
      if (isStackItem) {
        // Parse different parts of the stack trace line
        const parts = line.match(/^(#\d+)\s*(.*?)(\(.*?\))?\s*:\s*(.*)/);
        if (parts) {
          const [, number, filepath, lineInfo, method] = parts;
          return (
            <div key={index} className="mb-2">
              <span className="text-blue-400 font-bold">{number}</span>
              <span className="text-gray-300 ml-2">{filepath}</span>
              {lineInfo && <span className="text-yellow-400">{lineInfo}</span>}
              {method && (
                <>
                  <span className="text-gray-400">: </span>
                  <span className="text-green-400">{method}</span>
                </>
              )}
            </div>
          );
        }
      }
      
      return (
        <div key={index} className="mb-1">
          <span className="text-gray-300">{line}</span>
        </div>
      );
    });
  };

  const exampleTrace = `#0 /var/www/html/app/Models/User.php(45): PDO->prepare() #1 /var/www/html/app/Controllers/UserController.php(123): App\\Models\\User->findById() #2 /var/www/html/public/index.php(67): App\\Controllers\\UserController->show() #3 {main}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Code size={32} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PHP Stack Trace Formatter
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Paste your raw PHP stack trace below and get a properly formatted, readable version with each stack frame on its own line.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                <Zap size={20} className="text-yellow-400" />
                Raw Stack Trace
              </h2>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
                Clear
              </button>
            </div>
            
            <div className="relative">
              <textarea
                value={rawTrace}
                onChange={handleInputChange}
                placeholder={`Paste your raw PHP stack trace here...

Example:
${exampleTrace}`}
                className="w-full h-80 p-4 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none font-mono text-sm text-gray-200 placeholder-gray-500"
              />
              {rawTrace && (
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {rawTrace.length} characters
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-200">
                Formatted Output
              </h2>
              {formattedTrace && (
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Copy size={16} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <div className="h-80 p-4 bg-gray-800 border border-gray-600 rounded-lg overflow-auto">
              {formattedTrace ? (
                <div className="font-mono text-sm leading-relaxed">
                  {renderFormattedTrace()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Code size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Formatted stack trace will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {formattedTrace && (
              <div className="text-xs text-gray-500 text-center">
                {formattedTrace.split('\n').length} stack frames formatted
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Auto-Format</h3>
            <p className="text-gray-300">Automatically detects and formats stack trace entries as you type.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Syntax Highlighting</h3>
            <p className="text-gray-300">Color-coded output makes it easy to distinguish files, methods, and line numbers.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Copy & Share</h3>
            <p className="text-gray-300">One-click copy functionality to easily share formatted traces with your team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;