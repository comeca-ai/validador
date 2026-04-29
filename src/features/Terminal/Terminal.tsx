import { useEffect, useRef, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { TerminalSquare } from "lucide-react";
import useTerminalContainer from "./Terminal.container";

const lineClassName = (kind: "input" | "output" | "error" | "system") => {
  switch (kind) {
    case "input":
      return "text-green-400";
    case "error":
      return "text-red-400";
    case "system":
      return "text-slate-400";
    default:
      return "text-slate-100";
  }
};

export default function Terminal() {
  const navigate = useNavigate();
  const { lines, input, setInput, busy, runCommand, onArrowKey, userInfo } =
    useTerminalContainer();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input;
      setInput("");
      runCommand(value, navigate);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onArrowKey("up");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onArrowKey("down");
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runCommand("clear", navigate);
    }
  };

  const promptUser = userInfo?.name?.split(" ")[0]?.toLowerCase() || "user";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Terminal
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Console interativo para operações rápidas via comando.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <TerminalSquare className="h-5 w-5" />
          <span className="text-sm font-mono">refund.ai</span>
        </div>
      </div>

      <div
        className="rounded-lg border border-slate-800 bg-slate-950 shadow-lg overflow-hidden"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-3 text-xs font-mono text-slate-400">
            {promptUser}@refund.ai: ~
          </span>
        </div>

        <div
          ref={scrollRef}
          className="font-mono text-sm p-4 h-[60vh] overflow-y-auto"
        >
          {lines.map((line) => (
            <pre
              key={line.id}
              className={`whitespace-pre-wrap break-words ${lineClassName(line.kind)}`}
            >
              {line.text}
            </pre>
          ))}

          <div className="flex items-center gap-2 mt-1">
            <span className="text-green-400 select-none">
              {promptUser}@refund.ai:~$
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={busy}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              className="flex-1 bg-transparent outline-none text-slate-100 caret-green-400 disabled:opacity-50"
              aria-label="Comando do terminal"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Dica: setas ↑/↓ navegam o histórico, Ctrl+L limpa o terminal, "help"
        lista os comandos.
      </p>
    </div>
  );
}
