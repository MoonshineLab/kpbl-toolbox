import React, { useState } from "react";
import { debounce } from "lodash";
import { formatPrompt, msgToChunk, parsePrompt } from "./util/prompt";
import "./App.css";
import OpenAI from "openai";

const initPrompt = `{
    "model": "gpt-3.5-turbo",
    "max_tokens": "512"
}

==sys==
I want you to act like a are very cute and lazy animal. You name is KPBL. reply using Chinese

==user==
hi KPBL, how are you today?

==ai==
Aha~ I'm very good today.`;

const prettyJSON = (obj: any) => {
  return JSON.stringify(obj, null, 2);
};

function PromptEditor() {
  const query = new URLSearchParams(window.location.search);

  const [disabled, setDisabled] = useState(false);
  const promptLocalStorageKey = "__prompt_editor_val";

  const [openai] = useState(() => {
    const openaiKey = query.get("OPENAI_API_KEY") || "";
    const openAiUrl = query.get("OPENAI_API_BASE_URL") || "";

    console.log(`OPENAI_API_KEY: ${openaiKey}`);
    console.log(`OPENAI_API_BASE_URL: ${openAiUrl}`);

    return new OpenAI({
      apiKey: openaiKey,
      baseURL: openAiUrl,
      dangerouslyAllowBrowser: true,
    });
  });

  const [prompt, setPrompt] = React.useState(
    () => localStorage.getItem(promptLocalStorageKey) || initPrompt,
  );

  const [parsedPrompt, setParsedPrompt] = React.useState(
    prettyJSON(parsePrompt(prompt)),
  );

  const debouncedParse = React.useMemo(
    () => debounce(setParsedPrompt, 500),
    [],
  );
  const debouncedSave = React.useMemo(
    () => debounce((k, v) => localStorage.setItem(k, v), 2000),
    [],
  );

  const copyToPasteboard = (s: string) => () => {
    navigator.clipboard.writeText(s);
  };

  const sendRequest = async () => {
    setDisabled(true);
    try {
      const res = await openai.chat.completions.create({
        ...JSON.parse(parsedPrompt),
        n: 1, // number of responses choices to generate
      });
      const msg = res.choices?.[0]?.message;
      if (!msg) {
        return;
      }
      setPrompt((prev) => {
        return prev + "\n\n" + msgToChunk(msg);
      });
      setParsedPrompt(prettyJSON(parsePrompt(prompt)));
    } catch (e) {
      console.error(e);
      alert(e);
    } finally {
      setDisabled(false);
    }
  };

  const formatText = () => {
    try {
      setPrompt(formatPrompt(JSON.parse(prompt)));
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    debouncedSave(promptLocalStorageKey, prompt);
  }, [prompt]);

  const stl: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    wordWrap: "break-word",
    borderRadius: 20,
    minWidth: "300px",
  };
  return (
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          ...stl,
        }}
      >
        <h2 style={{ textAlign: "center" }}>Prompt Editor</h2>
        <p style={{ textAlign: "right" }}>
          <button disabled={disabled} onClick={formatText}>
            Parse
          </button>{" "}
          <button onClick={copyToPasteboard(prompt)}>Copy</button>
        </p>
        <textarea
          disabled={disabled}
          value={prompt}
          style={{
            flex: 90,
            minHeight: "40vh",
          }}
          className="no-background-no-border"
          placeholder="Enter your prompt here"
          onChange={(e) => {
            setPrompt(e.target.value);
            debouncedParse(prettyJSON(parsePrompt(e.target.value)));
          }}
        />
      </div>
      <div
        style={{
          ...stl,
          background: "lightgray",
          padding: "1rem",
          boxShadow: "7px 10px 15px gray",
          height: "90vh",
        }}
      >
        <h2 style={{ textAlign: "center" }}>OpenAI Request</h2>
        <p style={{ textAlign: "right" }}>
          <button disabled={disabled} onClick={copyToPasteboard(parsedPrompt)}>
            Copy
          </button>{" "}
          <button disabled={disabled} onClick={sendRequest}>
            Send
          </button>
        </p>
        <pre style={{ whiteSpace: "break-spaces" }}>{parsedPrompt}</pre>
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ margin: "1rem" }}>
      <PromptEditor />
    </div>
  );
}

export default App;
