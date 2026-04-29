import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { listEmployees } from "@/processes/employee";
import { useUserStore } from "@/stores/user.store";

export type TerminalLine = {
  id: number;
  kind: "input" | "output" | "error" | "system";
  text: string;
};

const HELP_TEXT = `Comandos disponíveis:
  help              Lista os comandos disponíveis
  whoami            Exibe o usuário autenticado
  employees         Lista os funcionários cadastrados
  goto <rota>       Navega para uma rota (employees | settings | integrations)
  echo <texto>      Imprime o texto fornecido
  date              Mostra a data e hora atuais
  history           Mostra o histórico de comandos
  clear             Limpa o terminal
  logout            Encerra a sessão`;

const ROUTE_ALIASES: Record<string, string> = {
  employees: "/employees",
  funcionarios: "/employees",
  settings: "/settings",
  configuracoes: "/settings",
  integrations: "/integrations",
  integracoes: "/integrations",
};

const useTerminalContainer = () => {
  const { userInfo, logout } = useUserStore();
  const queryClient = useQueryClient();

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 0,
      kind: "system",
      text: `refund.ai web terminal — digite "help" para começar.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryCursor] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const idRef = useRef(1);
  const nextId = () => idRef.current++;

  const append = useCallback((kind: TerminalLine["kind"], text: string) => {
    setLines((prev) => [...prev, { id: nextId(), kind, text }]);
  }, []);

  const runCommand = useCallback(
    async (raw: string, navigate: (path: string) => void) => {
      const trimmed = raw.trim();
      append("input", `$ ${trimmed}`);
      if (!trimmed) return;

      setHistory((h) => [...h, trimmed]);
      setHistoryCursor(null);

      const [cmd, ...rest] = trimmed.split(/\s+/);
      const args = rest.join(" ");

      try {
        setBusy(true);
        switch (cmd.toLowerCase()) {
          case "help":
            append("output", HELP_TEXT);
            break;
          case "whoami":
            if (!userInfo) {
              append("error", "Nenhum usuário autenticado.");
            } else {
              append(
                "output",
                `${userInfo.name} <${userInfo.email}> (id: ${userInfo.id})`,
              );
            }
            break;
          case "employees": {
            const employees = await queryClient.fetchQuery({
              queryKey: ["employees"],
              queryFn: listEmployees,
            });
            if (!employees?.length) {
              append("output", "Nenhum funcionário encontrado.");
            } else {
              const rows = employees
                .map(
                  (e: { name: string; email: string }) =>
                    `  • ${e.name.padEnd(24)} ${e.email}`,
                )
                .join("\n");
              append(
                "output",
                `${employees.length} funcionário(s):\n${rows}`,
              );
            }
            break;
          }
          case "goto": {
            const target = ROUTE_ALIASES[args.toLowerCase()];
            if (!target) {
              append(
                "error",
                `Rota desconhecida: "${args}". Use employees, settings ou integrations.`,
              );
            } else {
              append("output", `Navegando para ${target}…`);
              navigate(target);
            }
            break;
          }
          case "echo":
            append("output", args);
            break;
          case "date":
            append("output", new Date().toString());
            break;
          case "history":
            append(
              "output",
              history.length
                ? history.map((h, i) => `  ${i + 1}  ${h}`).join("\n")
                : "(vazio)",
            );
            break;
          case "clear":
            setLines([]);
            break;
          case "logout":
            append("output", "Encerrando a sessão…");
            await logout();
            break;
          default:
            append(
              "error",
              `Comando não reconhecido: "${cmd}". Digite "help".`,
            );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro inesperado.";
        append("error", message);
      } finally {
        setBusy(false);
      }
    },
    [append, history, logout, queryClient, userInfo],
  );

  const onArrowKey = useCallback(
    (direction: "up" | "down") => {
      if (history.length === 0) return;
      setHistoryCursor((cursor) => {
        const last = history.length - 1;
        let next: number;
        if (direction === "up") {
          next = cursor === null ? last : Math.max(0, cursor - 1);
        } else {
          if (cursor === null) return null;
          next = cursor + 1;
          if (next > last) {
            setInput("");
            return null;
          }
        }
        setInput(history[next]);
        return next;
      });
    },
    [history],
  );

  useEffect(() => {
    setHistoryCursor(null);
  }, [history.length]);

  return {
    lines,
    input,
    setInput,
    busy,
    runCommand,
    onArrowKey,
    userInfo,
  };
};

export default useTerminalContainer;
