import React from "react";
import { debounce } from "lodash";
import { formatPrompt, parsePrompt } from "./util/parse_prompt";
import "./App.css";

const initPrompt = `{
    "model": "gpt-3.5-turbo",
    "max_tokens": "512"
}

===sys===
I want you to act like a are very cute and lazy animal. You name is KPBL. reply using Chinese

===user===
hi KPBL, how are you today?

===ai===
Aha~ I'm very good today.`;

const prettyJSON = (obj: any) => {
  return JSON.stringify(obj, null, 2);
};

function PromptEditor() {
  const [prompt, setPrompt] = React.useState(initPrompt);
  const [parsedPrompt, setParsedPrompt] = React.useState(
    prettyJSON(parsePrompt(initPrompt)),
  );
  const debounced = React.useMemo(() => debounce(setParsedPrompt, 500), []);

  const copyToPasteboard = (s: string) => () => {
    navigator.clipboard.writeText(s);
  };

  const formatText = () => {
    try {
      setPrompt(formatPrompt(JSON.parse(prompt)));
    } catch (e) {
      console.error(e);
    }
  };
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
          <button style={{ marginRight: "0.5rem" }} onClick={formatText}>
            Format
          </button>
          <button onClick={copyToPasteboard(prompt)}>Copy</button>
        </p>
        <textarea
          value={prompt}
          style={{
            flex: 90,
            minHeight: "40vh",
          }}
          className="no-background-no-border"
          placeholder="Enter your prompt here"
          onChange={(e) => {
            setPrompt(e.target.value);
            debounced(prettyJSON(parsePrompt(e.target.value)));
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
          <button onClick={copyToPasteboard(parsedPrompt)}>Copy</button>
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
